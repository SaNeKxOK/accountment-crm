"use client";

import { useState, useEffect, useCallback } from "react";
import { getClientClient } from "@/lib/clients-client";
import { Database } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Client = Database["public"]["Tables"]["clients"]["Row"];
import { Button } from "@/components/ui/button";
import ManualReportForm from "@/components/reports/ManualReportForm";
import ClientReportsList from "@/components/reports/ClientReportsList";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientPage({ params }: PageProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setClientId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const loadClient = useCallback(async () => {
    try {
      const clientData = await getClientClient(clientId);
      setClient(clientData);
    } catch (error) {
      console.error("Error loading client:", error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      loadClient();
    }
  }, [clientId, loadClient]);

  const handleReportCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Завантаження...</div>;
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">Клієнт не знайдений</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{client.name}</h1>
        <div className="flex space-x-2">
          <Link href={`/clients/${client.id}/edit`}>
            <Button>Редагувати</Button>
          </Link>
          <Link href="/clients">
            <Button variant="outline">Назад до списку</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-sm text-gray-600">
                  Найменування:
                </span>
                <p className="text-lg">{client.name}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-gray-600">
                  ЄДРПОУ:
                </span>
                <p>{client.tax_id}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-gray-600">Тип:</span>
                <p>{client.type}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-gray-600">
                  Податкова система:
                </span>
                <p>{client.tax_system}</p>
              </div>
              {client.address && (
                <div>
                  <span className="font-medium text-sm text-gray-600">
                    Адреса:
                  </span>
                  <p>{client.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контактна інформація</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.contact_person && (
                <div>
                  <span className="font-medium text-sm text-gray-600">
                    Контактна особа:
                  </span>
                  <p>{client.contact_person}</p>
                </div>
              )}
              {client.phone && (
                <div>
                  <span className="font-medium text-sm text-gray-600">
                    Телефон:
                  </span>
                  <p>{client.phone}</p>
                </div>
              )}
              {client.email && (
                <div>
                  <span className="font-medium text-sm text-gray-600">
                    Email:
                  </span>
                  <p>{client.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Report Creation */}
      <div className="mt-8">
        <ManualReportForm
          clientId={client.id}
          onReportCreated={handleReportCreated}
        />
      </div>

      {/* Client Reports List */}
      <div className="mt-8">
        <ClientReportsList
          clientId={client.id}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
}
