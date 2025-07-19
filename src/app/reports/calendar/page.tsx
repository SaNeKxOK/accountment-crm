"use client";

import { useState, useEffect } from "react";
import {
  getAllReportsClient,
  getStatusColor,
  isOverdue,
} from "@/lib/reports-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Filter,
  FilterX,
} from "lucide-react";

type Report = Awaited<ReturnType<typeof getAllReportsClient>>[0];

export default function ReportsCalendarPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnsubmittedOnly, setShowUnsubmittedOnly] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const allReports = await getAllReportsClient();
        setReports(allReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter reports based on submission status
  const filteredReports = showUnsubmittedOnly
    ? reports.filter(
        (report) =>
          report.status === "очікується" || report.status === "в_роботі"
      )
    : reports;

  // Count unsubmitted reports
  const unsubmittedCount = reports.filter(
    (report) => report.status === "очікується" || report.status === "в_роботі"
  ).length;

  // Group reports by month
  const reportsByMonth = filteredReports.reduce((acc, report) => {
    const date = new Date(report.due_date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(report);
    return acc;
  }, {} as Record<string, typeof filteredReports>);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "short",
    });
  };

  const formatMonthYear = (monthKey: string): string => {
    const [year, month] = monthKey.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
      "uk-UA",
      {
        year: "numeric",
        month: "long",
      }
    );
  };

  const handleToggleFilter = () => {
    setShowUnsubmittedOnly(!showUnsubmittedOnly);
  };

  // Sort months chronologically
  const sortedMonths = Object.keys(reportsByMonth).sort();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Завантаження звітів...</p>
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
            Назад до звітів
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center">
          <CalendarIcon className="h-8 w-8 mr-3" />
          Календар звітів
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Неподано:{" "}
            <span className="font-semibold text-orange-600">
              {unsubmittedCount}
            </span>
          </div>
          <Button
            variant={showUnsubmittedOnly ? "default" : "outline"}
            size="sm"
            onClick={handleToggleFilter}
            className="flex items-center gap-2"
          >
            {showUnsubmittedOnly ? (
              <>
                <FilterX className="h-4 w-4" />
                Показати всі
              </>
            ) : (
              <>
                <Filter className="h-4 w-4" />
                Тільки неподані
              </>
            )}
          </Button>
        </div>
      </div>

      {showUnsubmittedOnly && (
        <div className="mb-6">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Показано тільки неподані звіти ({filteredReports.length} з{" "}
            {reports.length})
          </Badge>
        </div>
      )}

      {sortedMonths.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {showUnsubmittedOnly
                ? "Неподані звіти не знайдено"
                : "Звіти не знайдено"}
            </p>
            <p className="text-sm text-gray-400">
              {showUnsubmittedOnly
                ? "Всі звіти вже подані або налаштуйте звіти для клієнтів"
                : "Налаштуйте звіти для клієнтів щоб побачити їх у календарі"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map((monthKey) => (
            <Card key={monthKey}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {formatMonthYear(monthKey)}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({reportsByMonth[monthKey].length} звітів)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reportsByMonth[monthKey]
                    .sort(
                      (a, b) =>
                        new Date(a.due_date).getTime() -
                        new Date(b.due_date).getTime()
                    )
                    .map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 border rounded-lg ${
                          isOverdue(report.due_date) &&
                          report.status !== "подано" &&
                          report.status !== "сплачено"
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">
                              {report.client.name}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {report.report_template?.name || "Невідомий звіт"}
                            </p>
                          </div>
                          <Badge
                            className={`${getStatusColor(
                              report.status
                            )} text-xs`}
                          >
                            {report.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-gray-600">
                          <p>Період: {report.period}</p>
                          <p>Термін: {formatDate(report.due_date)}</p>
                          <p>Ціна: {report.price} грн</p>
                          {report.submitted_date && (
                            <p className="text-green-600">
                              Подано: {formatDate(report.submitted_date)}
                            </p>
                          )}
                        </div>

                        <div className="mt-3">
                          <Link href={`/reports/${report.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs"
                            >
                              Деталі
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
