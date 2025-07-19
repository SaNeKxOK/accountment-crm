"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getReportTemplatesClient,
  getClientReportConfigsClient,
  createClientReportConfigClient,
  updateClientReportConfigClient,
  deleteClientReportConfigClient,
} from "@/lib/reports-client";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  frequency: string;
  deadline_day: number;
  description: string | null;
}

interface ClientReportConfig {
  id: string;
  client_id: string;
  report_template_id: string;
  price: number;
  is_active: boolean | null;
  report_template: ReportTemplate;
}

interface ReportConfigFormProps {
  clientId: string;
  onConfigsChange?: () => void;
}

export default function ReportConfigForm({
  clientId,
  onConfigsChange,
}: ReportConfigFormProps) {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [clientConfigs, setClientConfigs] = useState<ClientReportConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    report_template_id: "",
    price: "",
  });

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      const [templates, configs] = await Promise.all([
        getReportTemplatesClient(),
                  getClientReportConfigsClient(clientId),
      ]);
      setReportTemplates(templates);
      setClientConfigs(configs);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConfig = async () => {
    if (!newConfig.report_template_id || !newConfig.price) return;

    try {
      await createClientReportConfigClient({
        client_id: clientId,
        report_template_id: newConfig.report_template_id,
        price: parseFloat(newConfig.price),
        is_active: true,
      });

      setNewConfig({ report_template_id: "", price: "" });
      setShowAddForm(false);
      await loadData();
      onConfigsChange?.();
    } catch (error) {
      console.error("Error adding report config:", error);
    }
  };

  const handleUpdatePrice = async (configId: string) => {
    if (!editPrice) return;

    try {
      await updateClientReportConfigClient(configId, {
        price: parseFloat(editPrice),
      });

      setEditingId(null);
      setEditPrice("");
      await loadData();
      onConfigsChange?.();
    } catch (error) {
      console.error("Error updating price:", error);
    }
  };

  const handleToggleActive = async (configId: string, isActive: boolean) => {
    try {
      await updateClientReportConfigClient(configId, {
        is_active: !isActive,
      });

      await loadData();
      onConfigsChange?.();
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm("Видалити конфігурацію звіту?")) return;

    try {
      await deleteClientReportConfigClient(configId);
      await loadData();
      onConfigsChange?.();
    } catch (error) {
      console.error("Error deleting config:", error);
    }
  };

  const getFrequencyText = (frequency: string): string => {
    switch (frequency) {
      case "щомісячно":
        return "Щомісячно";
      case "щокварталу":
        return "Щокварталу";
      case "щорічно":
        return "Щорічно";
      default:
        return frequency;
    }
  };

  const getAvailableTemplates = () => {
    const configuredTemplateIds = clientConfigs.map(
      (c) => c.report_template_id
    );
    return reportTemplates.filter((t) => !configuredTemplateIds.includes(t.id));
  };

  if (loading) {
    return <div>Завантаження...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Налаштування звітів
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm || getAvailableTemplates().length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Додати звіт
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">Тип звіту</Label>
                  <select
                    id="template"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={newConfig.report_template_id}
                    onChange={(e) =>
                      setNewConfig((prev) => ({
                        ...prev,
                        report_template_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">Оберіть тип звіту</option>
                    {getAvailableTemplates().map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({getFrequencyText(template.frequency)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="price">Ціна (грн)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newConfig.price}
                    onChange={(e) =>
                      setNewConfig((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleAddConfig}
                    disabled={!newConfig.report_template_id || !newConfig.price}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Додати
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewConfig({ report_template_id: "", price: "" });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Скасувати
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {clientConfigs.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-500">
            Звіти не налаштовані. Додайте перший звіт для автоматичного
            генерування термінів.
          </div>
        )}

        {clientConfigs.map((config) => (
          <Card
            key={config.id}
            className={`${!config.is_active ? "opacity-50" : ""}`}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {config.report_template.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({getFrequencyText(config.report_template.frequency)})
                    </span>
                    {!config.is_active && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Неактивний
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {config.report_template.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    Термін подачі: {config.report_template.deadline_day} число
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === config.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdatePrice(config.id)}
                        disabled={!editPrice}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditPrice("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{config.price} грн</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(config.id);
                          setEditPrice(config.price.toString());
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleToggleActive(config.id, config.is_active || false)
                    }
                  >
                    {config.is_active ? "Деактивувати" : "Активувати"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteConfig(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
