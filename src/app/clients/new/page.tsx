'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientRecordClient } from '@/lib/clients-client'
import { Database } from '@/lib/supabase/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    type: '' as ClientInsert['type'] | '',
    tax_system: '' as ClientInsert['tax_system'] | '',
    address: '',
    contact_person: '',
    phone: '',
    email: '',
    website: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Filter out empty strings for enum fields and ensure required fields are set
      if (!formData.type || !formData.tax_system) {
        alert('Будь ласка, оберіть тип та податкову систему');
        return;
      }
      
      const clientData = {
        ...formData,
        type: formData.type as ClientInsert['type'],
        tax_system: formData.tax_system as ClientInsert['tax_system'],
      }
      const client = await createClientRecordClient(clientData)
      router.push(`/clients/${client.id}`)
    } catch (error) {
      console.error('Error creating client:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Додати нового клієнта</h1>
        <Link href="/clients">
          <Button variant="outline">Скасувати</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Найменування *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Введіть найменування клієнта"
              />
            </div>
            <div>
              <Label htmlFor="tax_id">ЄДРПОУ *</Label>
              <Input
                id="tax_id"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                required
                placeholder="Введіть ЄДРПОУ"
              />
            </div>
            <div>
              <Label htmlFor="type">Тип *</Label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Оберіть тип</option>
                <option value="ТОВ">ТОВ</option>
                <option value="ПАТ">ПАТ</option>
                <option value="ПрАТ">ПрАТ</option>
                <option value="ФОП">ФОП</option>
                <option value="КТ">КТ</option>
                <option value="ПТ">ПТ</option>
                <option value="Інше">Інше</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="tax_system">Податкова система *</Label>
              <Select
                id="tax_system"
                name="tax_system"
                value={formData.tax_system}
                onChange={handleChange}
                required
              >
                <option value="">Оберіть податкову систему</option>
                <option value="Загальна">Загальна</option>
                <option value="Спрощена">Спрощена</option>
                <option value="Єдиний податок">Єдиний податок</option>
                <option value="ПДВ">ПДВ</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="address">Адреса</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Введіть адресу"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контактна інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact_person">Контактна особа</Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="ПІБ контактної особи"
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+380 XX XXX XX XX"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="website">Веб-сайт</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Примітки</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="notes">Примітки</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Додаткова інформація про клієнта"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Створення...' : 'Створити клієнта'}
          </Button>
          <Link href="/clients">
            <Button type="button" variant="outline">
              Скасувати
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}