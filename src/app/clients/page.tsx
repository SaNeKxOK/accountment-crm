"use client";

import { useEffect, useState } from 'react'
import { getClientsClient } from '@/lib/clients-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteClientButton } from '@/components/clients/DeleteClientButton'
import Link from 'next/link'
import { Database } from '@/lib/supabase/types'

type Client = Database["public"]["Tables"]["clients"]["Row"];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const loadClients = async () => {
    try {
      const clientsData = await getClientsClient()
      setClients(clientsData)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Клієнти</h1>
          <Link href="/clients/new">
            <Button>Додати клієнта</Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Завантаження...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Клієнти</h1>
        <Link href="/clients/new">
          <Button>Додати клієнта</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle className="text-lg">{client.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ЄДРПОУ:</span> {client.tax_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Тип:</span> {client.type}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Податкова система:</span> {client.tax_system}
                </p>
                {client.contact_person && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Контактна особа:</span> {client.contact_person}
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Телефон:</span> {client.phone}
                  </p>
                )}
                {client.email && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {client.email}
                  </p>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <Link href={`/clients/${client.id}`}>
                  <Button variant="outline" size="sm">
                    Переглянути
                  </Button>
                </Link>
                <Link href={`/clients/${client.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Редагувати
                  </Button>
                </Link>
                <DeleteClientButton 
                  clientId={client.id} 
                  clientName={client.name}
                  variant="outline"
                  size="sm"
                  onDelete={loadClients}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">У вас поки немає клієнтів</p>
          <Link href="/clients/new">
            <Button>Додати першого клієнта</Button>
          </Link>
        </div>
      )}
    </div>
  )
}