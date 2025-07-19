import { redirect } from "next/navigation";
import { getUserServer } from "@/lib/auth-server";
import { getAllReports, getUpcomingReports } from "@/lib/reports";
import { getClients } from "@/lib/clients";
import Link from "next/link";
import {
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const user = await getUserServer();

  if (!user) {
    redirect("/login");
  }

  // Fetch real data from database
  const [allReports, upcomingReports, clients] = await Promise.all([
    getAllReports(),
    getUpcomingReports(7), // Next 7 days
    getClients(),
  ]);

  // Calculate real statistics
  const stats = {
    totalClients: clients.length,
    pendingReports: allReports.filter(
      (r) => r.status === "очікується" || r.status === "в_роботі"
    ).length,
    overdueReports: allReports.filter((r) => {
      const today = new Date();
      const due = new Date(r.due_date);
      return due < today && r.status !== "подано" && r.status !== "сплачено";
    }).length,
    thisMonthRevenue: allReports
      .filter((r) => {
        const reportDate = new Date(r.due_date);
        const currentMonth = new Date();
        return (
          reportDate.getMonth() === currentMonth.getMonth() &&
          reportDate.getFullYear() === currentMonth.getFullYear() &&
          (r.status === "подано" || r.status === "сплачено")
        );
      })
      .reduce((sum, r) => sum + (r.price || 0), 0),
    upcomingCount: upcomingReports.length,
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      month: "short",
      day: "numeric",
    });
  };

  // Recent activity (latest 3 reports that were submitted)
  const recentActivity = allReports
    .filter((r) => r.submitted_date)
    .sort(
      (a, b) =>
        new Date(b.submitted_date!).getTime() -
        new Date(a.submitted_date!).getTime()
    )
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Вітаємо у вашій CRM системі
        </h1>
        <p className="text-gray-600 mt-2">Огляд поточного стану справ</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Клієнти
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalClients}
              </p>
              <p className="text-gray-500 text-sm">Всього клієнтів</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Звіти</h3>
              <p className="text-3xl font-bold text-orange-600">
                {stats.pendingReports}
              </p>
              <p className="text-gray-500 text-sm">Потребують уваги</p>
            </div>
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Прострочено
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {stats.overdueReports}
              </p>
              <p className="text-gray-500 text-sm">Потребують негайної уваги</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Дохід</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.thisMonthRevenue.toLocaleString("uk-UA")}₴
              </p>
              <p className="text-gray-500 text-sm">Цього місяця</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Швидкі дії
          </h2>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-between w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors group"
            >
              <div>
                <span className="font-medium text-purple-900">
                  Детальна панель
                </span>
                <p className="text-sm text-purple-700">
                  Статистика та аналітика
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/clients"
              className="flex items-center justify-between w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors group"
            >
              <div>
                <span className="font-medium text-blue-900">
                  Управління клієнтами
                </span>
                <p className="text-sm text-blue-700">
                  Додати, редагувати або переглядати клієнтів
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/reports"
              className="flex items-center justify-between w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors group"
            >
              <div>
                <span className="font-medium text-orange-900">
                  Управління звітами
                </span>
                <p className="text-sm text-orange-700">
                  Переглянути та керувати звітами
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/reports/calendar"
              className="flex items-center justify-between w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors group"
            >
              <div>
                <span className="font-medium text-green-900">
                  Календар звітів
                </span>
                <p className="text-sm text-green-700">
                  Перегляд звітів за календарем
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Recent Activity & Upcoming Reports */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Найближчі звіти
            {stats.upcomingCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.upcomingCount}
              </Badge>
            )}
          </h2>

          {upcomingReports.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">
                Немає звітів на найближчий тиждень
              </p>
              <p className="text-sm text-gray-400">Все підконтрольно! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReports.slice(0, 4).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {report.client.name}
                      </span>
                      <Badge
                        className={getStatusColor(report.status)}
                        variant="secondary"
                      >
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {report.report_template?.name || report.custom_report_name} • {report.period}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(report.due_date)}
                    </p>
                    <p className="text-sm text-gray-500">{report.price} грн</p>
                  </div>
                </div>
              ))}

              {upcomingReports.length > 4 && (
                <div className="pt-3">
                  <Link
                    href="/reports"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    Переглянути ще {upcomingReports.length - 4} звітів
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {recentActivity.length > 0 && (
            <>
              <div className="border-t border-gray-200 mt-6 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Останні подані звіти
                </h3>
                <div className="space-y-2">
                  {recentActivity.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {report.report_template?.name || report.custom_report_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.client.name}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(report.submitted_date!)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
