"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  getReportClient,
  updateReportStatusClient,
  updateReportNotesClient,
} from "@/lib/reports-client";
import { getStatusColor, isOverdue } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, FileText, DollarSign } from "lucide-react";

type ReportData = Awaited<ReturnType<typeof getReportClient>>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: PageProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [reportId, setReportId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setReportId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const loadReport = useCallback(async () => {
    if (!reportId) return;

    try {
      setError("");
      const data = await getReportClient(reportId);
      setReport(data);
      setNotes(data?.notes || "");
    } catch (error) {
      console.error("Error loading report:", error);
      setError("Помилка завантаження звіту");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId, loadReport]);

  const handleStatusChange = async (newStatus: string) => {
    if (!report) return;

    setUpdating(true);
    try {
      const submitted_date =
        newStatus === "подано" ? new Date().toISOString() : undefined;
      await updateReportStatusClient(
        report.id,
        newStatus as "очікується" | "в_роботі" | "подано" | "сплачено",
        submitted_date
      );
      await loadReport();
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Помилка оновлення статусу");
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
      setError("Помилка оновлення приміток");
    } finally {
      setUpdating(false);
    }
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/reports">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад до звітів
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Звіт не знайдено</p>
          <p className="text-sm text-gray-400 mb-4">
            Можливо, цей звіт не існує або у вас немає доступу до нього
          </p>
          <Link href="/reports">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад до звітів
            </Button>
          </Link>
        </div>
      </div>
    );
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
          {report.report_template?.name ||
            report.custom_report_name ||
            "Невідомий звіт"}{" "}
          • {report.period}
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
              <p>{report.report_template?.name || report.custom_report_name || "Невідомий звіт"}</p>
              {report.report_template?.frequency && (
                <p className="text-sm text-gray-500">
                  {getFrequencyText(report.report_template.frequency)}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Період
              </Label>
              <p>{report.period}</p>
            </div>
            {report.report_template?.description && (
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Опис
                </Label>
                <p className="text-sm">{report.report_template.description}</p>
              </div>
            )}
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
                {report.price ? `${report.price} грн` : "Не вказано"}
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
