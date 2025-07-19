'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { 
  getReportTemplatesClient, 
  getClientReportConfigsClient,
  createManualReportClient 
} from '@/lib/reports-client'
import { Plus, X } from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  frequency: string
  deadline_day: number
  description: string | null
}

interface ClientReportConfig {
  id: string
  report_template_id: string
  price: number
  report_template: ReportTemplate
}

interface ManualReportFormProps {
  clientId: string
  onReportCreated?: () => void
}

export default function ManualReportForm({ clientId, onReportCreated }: ManualReportFormProps) {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [clientConfigs, setClientConfigs] = useState<ClientReportConfig[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    report_template_id: '',
    period: '',
    due_date: '',
    price: ''
  })

  useEffect(() => {
    if (showForm) {
      loadData()
    }
  }, [showForm, clientId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [templates, configs] = await Promise.all([
        getReportTemplatesClient(),
        getClientReportConfigsClient(clientId)
      ])
      setReportTemplates(templates)
      setClientConfigs(configs)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.report_template_id || !formData.period || !formData.due_date || !formData.price) {
      return
    }

    setCreating(true)
    try {
      await createManualReportClient(
        clientId,
        formData.report_template_id,
        formData.period,
        formData.due_date,
        parseFloat(formData.price)
      )
      
      // Reset form
      setFormData({
        report_template_id: '',
        period: '',
        due_date: '',
        price: ''
      })
      setShowForm(false)
      onReportCreated?.()
    } catch (error) {
      console.error('Error creating report:', error)
      alert('Помилка при створенні звіту')
    } finally {
      setCreating(false)
    }
  }

  const handleTemplateChange = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId)
    const config = clientConfigs.find(c => c.report_template_id === templateId)
    
    setFormData(prev => ({
      ...prev,
      report_template_id: templateId,
      price: config ? config.price.toString() : ''
    }))
  }

  const generatePeriodSuggestions = () => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const suggestions = []
    
    // Monthly suggestions
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1)
      const monthName = date.toLocaleDateString('uk-UA', { month: 'long' })
      suggestions.push(`${monthName} ${currentYear}`)
    }
    
    // Quarterly suggestions
    for (let i = 1; i <= 4; i++) {
      suggestions.push(`Q${i} ${currentYear}`)
    }
    
    // Annual suggestion
    suggestions.push(`${currentYear}`)
    
    return suggestions
  }

  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Створити звіт вручну
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Створити звіт
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Створіть окремий звіт для клієнта з власним терміном та періодом
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Створити звіт вручну
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowForm(false)
              setFormData({
                report_template_id: '',
                period: '',
                due_date: '',
                price: ''
              })
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Скасувати
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Завантаження...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="template">Тип звіту *</Label>
              <Select
                id="template"
                value={formData.report_template_id}
                onChange={(e) => handleTemplateChange(e.target.value)}
                required
              >
                <option value="">Оберіть тип звіту</option>
                {reportTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Період *</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                placeholder="Наприклад: Березень 2024, Q1 2024, 2024"
                required
              />
              <div className="mt-2 text-xs text-gray-500">
                Приклади: 
                <span className="ml-1">
                  {generatePeriodSuggestions().slice(0, 3).join(', ')}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="due_date">Термін подачі *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Вартість (грн) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={creating || !formData.report_template_id || !formData.period || !formData.due_date || !formData.price}
              >
                {creating ? 'Створення...' : 'Створити звіт'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setFormData({
                    report_template_id: '',
                    period: '',
                    due_date: '',
                    price: ''
                  })
                }}
              >
                Скасувати
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}