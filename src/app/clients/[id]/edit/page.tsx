"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClientClient, updateClientClient } from "@/lib/clients-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { generateReportInstancesClient } from "@/lib/reports-client";
import Link from "next/link";

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingReports, setGeneratingReports] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tax_id: "",
    type: "" as "ФОП_1" | "ФОП_2" | "ФОП_3" | "ТОВ" | "ПП" | "",
    tax_system: "" as "загальна" | "спрощена" | "",
    address: "",
    contact_person: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadClient();
  }, [params.id]);

  const loadClient = async () => {
    try {
      const clientData = await getClientClient(params.id);
      if (clientData) {
        setClient(clientData);
        setFormData({
          name: clientData.name || "",
          tax_id: clientData.tax_id || "",
          type: clientData.type || "",
          tax_system: clientData.tax_system || "",
          address: clientData.address || "",
          contact_person: clientData.contact_person || "",
          phone: clientData.phone || "",
          email: clientData.email || "",
        });
      }
    } catch (error) {
      console.error("Error loading client:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter out empty strings for enum fields
      const updateData = {
        ...formData,
        type: formData.type || undefined,
        tax_system: formData.tax_system || undefined,
      };
      await updateClientClient(params.id, updateData);
      router.push(`/clients/${params.id}`);
    } catch (error) {
      console.error("Error updating client:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenerateReports = async () => {
    setGeneratingReports(true);
    try {
      const count = await generateReportInstancesClient(params.id);
      alert(`Згенеровано ${count} звітів`);
    } catch (error) {
      console.error("Error generating reports:", error);
      alert("Помилка при генеруванні звітів");
    } finally {
      setGeneratingReports(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Завантаження...</div>;
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">Клієнт не знайдений</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Редагувати клієнта</h1>
        <Link href={`/clients/${params.id}`}>
          <Button variant="outline">Скасувати</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Найменування *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="tax_id">ЄДРПОУ *</Label>
              <Input
                id="tax_id"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Тип *</Label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Оберіть тип</option>
                <option value="ФОП_1">ФОП 1 група</option>
                <option value="ФОП_2">ФОП 2 група</option>
                <option value="ФОП_3">ФОП 3 група</option>
                <option value="ТОВ">ТОВ</option>
                <option value="ПП">ПП</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="tax_system">Податкова система *</Label>
              <Select
                id="tax_system"
                name="tax_system"
                value={formData.tax_system}
                onChange={handleChange}
                required
              >
                <option value="">Оберіть податкову систему</option>
                <option value="загальна">Загальна</option>
                <option value="спрощена">Спрощена</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="address">Адреса</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контактна інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact_person">Контактна особа</Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Генерування звітів</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Генерування звітів створює автоматичні терміни подачі на
                поточний рік для всіх налаштованих звітів клієнта.
              </p>
              <Button
                type="button"
                onClick={handleGenerateReports}
                disabled={generatingReports}
                variant="outline"
              >
                {generatingReports
                  ? "Генерування..."
                  : "Згенерувати звіти на рік"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Збереження..." : "Зберегти"}
          </Button>
          <Link href={`/clients/${params.id}`}>
            <Button type="button" variant="outline">
              Скасувати
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
