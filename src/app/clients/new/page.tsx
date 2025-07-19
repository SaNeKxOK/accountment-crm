"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientRecordClient } from "@/lib/clients-client";
import { Database } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    tax_id: "",
    type: "" as ClientInsert["type"] | "",
    tax_system: "" as ClientInsert["tax_system"] | "",
    address: "",
    contact_person: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError("Будь ласка, введіть найменування клієнта");
        return;
      }

      if (!formData.tax_id.trim()) {
        setError("Будь ласка, введіть ЄДРПОУ");
        return;
      }

      if (!formData.type) {
        setError("Будь ласка, оберіть тип клієнта");
        return;
      }

      if (!formData.tax_system) {
        setError("Будь ласка, оберіть податкову систему");
        return;
      }

      const clientData: Omit<ClientInsert, "user_id"> = {
        name: formData.name.trim(),
        tax_id: formData.tax_id.trim(),
        type: formData.type as ClientInsert["type"],
        tax_system: formData.tax_system as ClientInsert["tax_system"],
        address: formData.address.trim() || null,
        contact_person: formData.contact_person.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
      };

      console.log("Creating client with data:", clientData);

      const client = await createClientRecordClient(clientData);

      console.log("Client created successfully:", client);
      router.push(`/clients/${client.id}`);
    } catch (error: unknown) {
      console.error("Error creating client:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Помилка при створенні клієнта. Спробуйте ще раз.";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Додати нового клієнта</h1>
        <Link href="/clients">
          <Button variant="outline">Скасувати</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

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
                <option value="ФОП_1">ФОП 1 група</option>
                <option value="ФОП_2">ФОП 2 група</option>
                <option value="ФОП_3">ФОП 3 група</option>
                <option value="ТОВ">ТОВ</option>
                <option value="ПП">ПП (Приватне підприємство)</option>
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
                <option value="загальна">Загальна</option>
                <option value="спрощена">Спрощена</option>
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
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Створення..." : "Створити клієнта"}
          </Button>
          <Link href="/clients">
            <Button type="button" variant="outline">
              Скасувати
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
