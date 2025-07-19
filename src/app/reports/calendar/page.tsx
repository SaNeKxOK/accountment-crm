import { getAllReports } from '@/lib/reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'

export default async function ReportsCalendarPage() {
  const reports = await getAllReports()
  
  // Group reports by month
  const reportsByMonth = reports.reduce((acc, report) => {
    const date = new Date(report.due_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(report)
    return acc
  }, {} as Record<string, typeof reports>)

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatMonthYear = (monthKey: string): string => {
    const [year, month] = monthKey.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long'
    })
  }

  const isOverdue = (dueDate: string): boolean => {
    const today = new Date()
    const due = new Date(dueDate)
    return due < today
  }

  // Sort months chronologically
  const sortedMonths = Object.keys(reportsByMonth).sort()

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
      </div>

      {sortedMonths.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Звіти не знайдено</p>
            <p className="text-sm text-gray-400">
              Налаштуйте звіти для клієнтів щоб побачити їх у календарі
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map(monthKey => (
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
                    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                    .map(report => (
                      <div
                        key={report.id}
                        className={`p-4 border rounded-lg ${
                          isOverdue(report.due_date) && 
                          report.status !== 'подано' && 
                          report.status !== 'сплачено' 
                            ? 'border-red-200 bg-red-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{report.client.name}</h3>
                            <p className="text-xs text-gray-600">{report.report_template.name}</p>
                          </div>
                          <Badge className={`${getStatusColor(report.status)} text-xs`}>
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
                            <Button size="sm" variant="outline" className="w-full text-xs">
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
  )
}