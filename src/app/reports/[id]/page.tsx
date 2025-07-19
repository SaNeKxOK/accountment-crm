"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  updateReportStatusClient,
  updateReportNotesClient,
} from "@/lib/reports-client";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, FileText, DollarSign } from "lucide-react";

interface ReportData {
  id: string;
  client_id: string;
  report_template_id: string;
  due_date: string;
  status: string;
  price: number;
  notes: string | null;
  period: string;
  submitted_date: string | null;
  report_template: {
    name: string;
    frequency: string;
    description: string;
    deadline_day: number;
  };
  client: {
    name: string;
    tax_id: string;
    type: string;
  };
}

export default function ReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadReport();
  }, [params.id]);

  const loadReport = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("client_reports")
        .select(
          `
          *,
          report_template:report_templates(*),
          client:clients(name, tax_id, type)
        `
        )
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setReport(data);
      setNotes(data.notes || "");
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!report) return;

    setUpdating(true);
    try {
      const submitted_date =
        newStatus === "подано" ? new Date().toISOString() : undefined;
      await updateReportStatusClient(
        report.id,
        newStatus as any,
        submitted_date
      );
      await loadReport();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesUpdate = async () => {
    if (!report) return;

    setUpdating(true);
    try {
      await updateReportNotesClient(report.id, notes);
      await loadReport();
    } catch (error) {
      console.error("Error updating notes:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "очікується":
        return "bg-yellow-100 text-yellow-800";
      case "в_роботі":
        return "bg-blue-100 text-blue-800";
      case "подано":
        return "bg-green-100 text-green-800";
      case "сплачено":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate: string): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Завантаження...</div>;
  }

  if (!report) {
    return <div className="container mx-auto px-4 py-8">Звіт не знайдено</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/reports">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          {report.report_template.name} • {report.period}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Report Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Інформація про звіт
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Клієнт
              </Label>
              <p className="font-semibold">{report.client.name}</p>
              <p className="text-sm text-gray-500">
                {report.client.type} • ЄДРПОУ: {report.client.tax_id}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Тип звіту
              </Label>
              <p>{report.report_template.name}</p>
              <p className="text-sm text-gray-500">
                {getFrequencyText(report.report_template.frequency)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Період
              </Label>
              <p>{report.period}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Опис</Label>
              <p className="text-sm">{report.report_template.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status and Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Статус і терміни
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Поточний статус
              </Label>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
                {isOverdue(report.due_date) &&
                  report.status !== "подано" &&
                  report.status !== "сплачено" && (
                    <Badge className="bg-red-100 text-red-800">
                      Прострочено
                    </Badge>
                  )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Термін подачі
              </Label>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(report.due_date)}
              </p>
            </div>
            {report.submitted_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Дата подачі
                </Label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(report.submitted_date)}
                </p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Вартість
              </Label>
              <p className="flex items-center gap-2 font-semibold">
                <DollarSign className="h-4 w-4" />
                {report.price} грн
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Зміна статусу</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={report.status === "очікується" ? "default" : "outline"}
              onClick={() => handleStatusChange("очікується")}
              disabled={updating}
            >
              Очікується
            </Button>
            <Button
              variant={report.status === "в_роботі" ? "default" : "outline"}
              onClick={() => handleStatusChange("в_роботі")}
              disabled={updating}
            >
              В роботі
            </Button>
            <Button
              variant={report.status === "подано" ? "default" : "outline"}
              onClick={() => handleStatusChange("подано")}
              disabled={updating}
            >
              Подано
            </Button>
            <Button
              variant={report.status === "сплачено" ? "default" : "outline"}
              onClick={() => handleStatusChange("сплачено")}
              disabled={updating}
            >
              Сплачено
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Примітки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Примітки до звіту</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Додайте примітки до цього звіту..."
              />
            </div>
            <Button
              onClick={handleNotesUpdate}
              disabled={updating || notes === (report.notes || "")}
            >
              {updating ? "Збереження..." : "Зберегти примітки"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
