"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getClientReportsClient,
  getStatusColor,
  isOverdue,
  deleteReportClient,
} from "@/lib/reports-client";
import { Trash2, ExternalLink, Calendar, Clock } from "lucide-react";
import Link from "next/link";

// Use the type from the API instead of local interface
type ClientReport = Awaited<ReturnType<typeof getClientReportsClient>>[0];

interface ClientReportsListProps {
  clientId: string;
  refreshTrigger?: number;
}

export default function ClientReportsList({
  clientId,
  refreshTrigger,
}: ClientReportsListProps) {
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<number>(
    new Date().getFullYear()
  );

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientReportsClient(clientId, {
        status: filter || undefined,
        year: yearFilter,
      });
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }, [clientId, filter, yearFilter]);

  useEffect(() => {
    loadReports();
  }, [clientId, refreshTrigger, loadReports]);

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Видалити цей звіт?")) return;

    try {
      await deleteReportClient(reportId);
      await loadReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Помилка при видаленні звіту");
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "short",
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

  const groupedReports = reports.reduce((acc, report) => {
    const status = report.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(report);
    return acc;
  }, {} as Record<string, ClientReport[]>);

  const statusOrder = ["очікується", "в_роботі", "подано", "сплачено"];
  const statusLabels = {
    очікується: "Очікується",
    в_роботі: "В роботі",
    подано: "Подано",
    сплачено: "Сплачено",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Звіти клієнта
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="">Всі статуси</option>
              <option value="очікується">Очікується</option>
              <option value="в_роботі">В роботі</option>
              <option value="подано">Подано</option>
              <option value="сплачено">Сплачено</option>
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              {Array.from(
                { length: 3 },
                (_, i) => new Date().getFullYear() - 1 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={loadReports}>
              Оновити
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Завантаження...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Звіти не знайдено</p>
            <p className="text-sm">
              Налаштуйте звіти для клієнта або створіть звіт вручну
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {statusOrder.map((status) => {
              const statusReports = groupedReports[status] || [];
              if (statusReports.length === 0) return null;

              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getStatusColor(status)}>
                      {statusLabels[status as keyof typeof statusLabels]}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ({statusReports.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {statusReports
                      .sort(
                        (a, b) =>
                          new Date(a.due_date).getTime() -
                          new Date(b.due_date).getTime()
                      )
                      .map((report) => (
                        <div key={report.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {report.report_template?.name ||
                                    "Невідомий звіт"}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  • {report.period || "Не вказано"}
                                </span>
                                {isOverdue(report.due_date) &&
                                  status !== "подано" &&
                                  status !== "сплачено" && (
                                    <Badge className="bg-red-100 text-red-800 text-xs">
                                      Прострочено
                                    </Badge>
                                  )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {report.report_template?.frequency
                                  ? getFrequencyText(
                                      report.report_template.frequency
                                    )
                                  : "Частота не вказана"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {report.price
                                  ? `${report.price} грн`
                                  : "Не вказано"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Термін: {formatDate(report.due_date)}
                            </div>
                            {report.submitted_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Подано: {formatDate(report.submitted_date)}
                              </div>
                            )}
                          </div>

                          {report.notes && (
                            <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                              <span className="font-medium">Примітки:</span>{" "}
                              {report.notes}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Link href={`/reports/${report.id}`}>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Деталі
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
