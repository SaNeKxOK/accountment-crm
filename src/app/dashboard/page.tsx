import { getAllReports, getUpcomingReports } from '@/lib/reports'
import { getClients } from '@/lib/clients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  FileText, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react'

export default async function DashboardPage() {
  const [allReports, upcomingReports, clients] = await Promise.all([
    getAllReports(),
    getUpcomingReports(7), // Next 7 days
    getClients()
  ])

  // Calculate statistics
  const stats = {
    totalClients: clients.length,
    totalReports: allReports.length,
    pendingReports: allReports.filter(r => r.status === 'очікується').length,
    inProgressReports: allReports.filter(r => r.status === 'в_роботі').length,
    submittedReports: allReports.filter(r => r.status === 'подано').length,
    paidReports: allReports.filter(r => r.status === 'сплачено').length,
    overdueReports: allReports.filter(r => {
      const today = new Date()
      const due = new Date(r.due_date)
      return due < today && r.status !== 'подано' && r.status !== 'сплачено'
    }).length,
    upcomingReports: upcomingReports.length,
    totalRevenue: allReports
      .filter(r => r.status === 'сплачено')
      .reduce((sum, r) => sum + (r.price || 0), 0),
    pendingRevenue: allReports
      .filter(r => r.status === 'подано')
      .reduce((sum, r) => sum + (r.price || 0), 0)
  }

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
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Панель керування</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього клієнтів</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього звітів</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прострочено</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">На тижні</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingReports}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отримано доходу</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalRevenue.toLocaleString('uk-UA')} грн
            </div>
            <p className="text-xs text-muted-foreground">
              З {stats.paidReports} оплачених звітів
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Очікується доходу</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pendingRevenue.toLocaleString('uk-UA')} грн
            </div>
            <p className="text-xs text-muted-foreground">
              З {stats.submittedReports} поданих звітів
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Розподіл звітів за статусом</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</div>
              <div className="text-sm text-muted-foreground">Очікується</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressReports}</div>
              <div className="text-sm text-muted-foreground">В роботі</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.submittedReports}</div>
              <div className="text-sm text-muted-foreground">Подано</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.paidReports}</div>
              <div className="text-sm text-muted-foreground">Сплачено</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Звіти на тижні
            </span>
            <Link href="/reports">
              <Button variant="outline" size="sm">
                Переглянути всі
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Немає звітів на найближчий тиждень
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReports.slice(0, 5).map(report => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{report.client.name}</span>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {report.report_template.name} • {report.period}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatDate(report.due_date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {report.price} грн
                    </div>
                  </div>
                </div>
              ))}
              {upcomingReports.length > 5 && (
                <div className="text-center pt-4">
                  <Link href="/reports">
                    <Button variant="outline" size="sm">
                      Переглянути ще {upcomingReports.length - 5} звітів
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}