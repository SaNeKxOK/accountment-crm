import { getAllReports, getUpcomingReports } from '@/lib/reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'

export default async function ReportsPage() {
  const [allReports, upcomingReports] = await Promise.all([
    getAllReports({ limit: 50 }),
    getUpcomingReports(30)
  ])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'очікується':
        return 'bg-yellow-100 text-yellow-800'
      case 'в_роботі':
        return 'bg-blue-100 text-blue-800'
      case 'подано':
        return 'bg-green-100 text-green-800'
      case 'сплачено':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string): boolean => {
    const today = new Date()
    const due = new Date(dueDate)
    return due < today
  }

  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Звіти</h1>
        <div className="flex space-x-2">
          <Link href="/reports/calendar">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Календар
            </Button>
          </Link>
          <Link href="/clients">
            <Button variant="outline">
              Клієнти
            </Button>
          </Link>
        </div>
      </div>

      {/* Upcoming Reports */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Найближчі звіти (30 днів)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Немає звітів на найближчі 30 днів
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReports.map(report => {
                const daysUntil = getDaysUntilDue(report.due_date)
                const overdue = isOverdue(report.due_date)
                
                return (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{report.client.name}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        {overdue && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Прострочено
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {report.report_template.name} • {report.period}
                      </p>
                      <p className="text-sm text-gray-500">
                        Термін: {formatDate(report.due_date)}
                        {!overdue && (
                          <span className="ml-2">
                            ({daysUntil} {daysUntil === 1 ? 'день' : daysUntil < 5 ? 'дні' : 'днів'})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{report.price} грн</p>
                      <Link href={`/reports/${report.id}`}>
                        <Button size="sm" variant="outline">
                          Переглянути
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Всі звіти</CardTitle>
        </CardHeader>
        <CardContent>
          {allReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">Звіти не знайдено</p>
              <p className="text-sm">
                Налаштуйте звіти для клієнтів та згенеруйте терміни подачі
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allReports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{report.client.name}</h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      {isOverdue(report.due_date) && report.status !== 'подано' && report.status !== 'сплачено' && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Прострочено
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {report.report_template.name} • {report.period}
                    </p>
                    <p className="text-sm text-gray-500">
                      Термін: {formatDate(report.due_date)}
                      {report.submitted_date && (
                        <span className="ml-2">
                          • Подано: {formatDate(report.submitted_date)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{report.price} грн</p>
                    <Link href={`/reports/${report.id}`}>
                      <Button size="sm" variant="outline">
                        Переглянути
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}