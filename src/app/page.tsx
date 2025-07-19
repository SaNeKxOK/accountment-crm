import { redirect } from "next/navigation";
import { getUserServer } from "@/lib/auth-server";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getUserServer();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Клієнти</h3>
            <p className="text-3xl font-bold text-blue-600">8</p>
            <p className="text-gray-500">Всього клієнтів</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Звіти</h3>
            <p className="text-3xl font-bold text-orange-600">15</p>
            <p className="text-gray-500">Очікують подання</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Платежі</h3>
            <p className="text-3xl font-bold text-green-600">25,000₴</p>
            <p className="text-gray-500">Цього місяця</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Швидкі дії
            </h2>
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
              >
                <span className="font-medium text-purple-900">
                  Детальна панель
                </span>
                <p className="text-sm text-purple-700">
                  Статистика та аналітика
                </p>
              </Link>

              <Link
                href="/clients"
                className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <span className="font-medium text-blue-900">
                  Управління клієнтами
                </span>
                <p className="text-sm text-blue-700">
                  Додати, редагувати або переглядати клієнтів
                </p>
              </Link>

              <Link
                href="/reports"
                className="block w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
              >
                <span className="font-medium text-orange-900">Управління звітами</span>
                <p className="text-sm text-orange-700">
                  Переглянути та керувати звітами
                </p>
              </Link>

              <button className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                <span className="font-medium text-green-900">Платежі</span>
                <p className="text-sm text-green-700">
                  Відстежити та записати платежі
                </p>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Останні дії
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    Новий клієнт доданий
                  </p>
                  <p className="text-sm text-gray-500">ТОВ "Успішний Бізнес"</p>
                </div>
                <span className="text-sm text-gray-400">2 години тому</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Звіт ЄСВ поданий</p>
                  <p className="text-sm text-gray-500">Іваненко І.І.</p>
                </div>
                <span className="text-sm text-gray-400">Вчора</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">Платіж отриманий</p>
                  <p className="text-sm text-gray-500">
                    1,500₴ від Петренко П.П.
                  </p>
                </div>
                <span className="text-sm text-gray-400">3 дні тому</span>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
