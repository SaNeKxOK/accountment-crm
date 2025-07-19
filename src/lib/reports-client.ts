import { supabaseBrowser } from "./supabase/browser";
import { Database } from "./supabase/types";

type ReportTemplate = Database["public"]["Tables"]["report_templates"]["Row"];
type ClientReport = Database["public"]["Tables"]["client_reports"]["Row"];
type ClientReportUpdate =
  Database["public"]["Tables"]["client_reports"]["Update"];
type ClientReportConfigInsert =
  Database["public"]["Tables"]["client_report_configs"]["Insert"];
type ClientReportConfigUpdate =
  Database["public"]["Tables"]["client_report_configs"]["Update"];

// Client-side report functions for use in client components
export async function getReportTemplatesClient(): Promise<ReportTemplate[]> {
  const { data, error } = await supabaseBrowser
    .from("report_templates")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getClientReportsClient(
  clientId: string,
  options?: {
    status?: string;
    year?: number;
    limit?: number;
  }
): Promise<(ClientReport & { report_template: ReportTemplate | null })[]> {
  let query = supabaseBrowser
    .from("client_reports")
    .select(
      `
      *,
      report_template:report_templates(*)
    `
    )
    .eq("client_id", clientId);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.year) {
    query = query
      .gte("due_date", `${options.year}-01-01`)
      .lt("due_date", `${options.year + 1}-01-01`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order("due_date", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAllReportsClient(options?: {
  status?: string;
  year?: number;
  limit?: number;
}): Promise<
  (ClientReport & {
    report_template: ReportTemplate | null;
    client: { name: string };
  })[]
> {
  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  let query = supabaseBrowser
    .from("client_reports")
    .select(
      `
      *,
      report_template:report_templates(*),
      client:clients!inner(name)
    `
    )
    .eq("client.user_id", user.id);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.year) {
    query = query
      .gte("due_date", `${options.year}-01-01`)
      .lt("due_date", `${options.year + 1}-01-01`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order("due_date", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateReportStatusClient(
  id: string,
  status: "очікується" | "в_роботі" | "подано" | "сплачено",
  submitted_date?: string
): Promise<ClientReport> {
  const updateData: ClientReportUpdate = { status };

  if (submitted_date && status === "подано") {
    updateData.submitted_date = submitted_date;
  }

  const { data, error } = await supabaseBrowser
    .from("client_reports")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReportNotesClient(
  id: string,
  notes: string
): Promise<ClientReport> {
  const { data, error } = await supabaseBrowser
    .from("client_reports")
    .update({ notes })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Client-side report generation - use RPC function
export async function generateReportInstancesClient(
  clientId: string,
  year: number = new Date().getFullYear()
): Promise<number> {
  const { data, error } = await supabaseBrowser.rpc(
    "generate_report_instances",
    {
      p_client_id: clientId,
      p_year: year,
    }
  );

  if (error) throw error;
  return data || 0;
}

// Utility functions (these are pure functions, no server dependency)
export function formatPeriod(period: string): string {
  if (period.includes("Q")) {
    return period;
  }

  if (period.match(/^\d{4}$/)) {
    return period;
  }

  return period;
}

export function getStatusColor(status: string): string {
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
}

export function isOverdue(dueDate: string): boolean {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Additional client-side functions for ReportConfigForm
export async function getClientReportConfigsClient(clientId: string) {
  const { data, error } = await supabaseBrowser
    .from("client_report_configs")
    .select(
      `
      *,
      report_template:report_templates(*)
    `
    )
    .eq("client_id", clientId)
    .order("created_at");

  if (error) throw error;
  return data || [];
}

export async function createClientReportConfigClient(
  config: ClientReportConfigInsert
) {
  const { data, error } = await supabaseBrowser
    .from("client_report_configs")
    .insert(config)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClientReportConfigClient(
  id: string,
  config: ClientReportConfigUpdate
) {
  const { data, error } = await supabaseBrowser
    .from("client_report_configs")
    .update(config)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClientReportConfigClient(id: string) {
  const { error } = await supabaseBrowser
    .from("client_report_configs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Manual Report Creation with template
export async function createManualReportClient(
  clientId: string,
  reportTemplateId: string,
  period: string,
  dueDate: string,
  price: number
): Promise<ClientReport> {
  const { data, error } = await supabaseBrowser
    .from("client_reports")
    .insert({
      client_id: clientId,
      report_template_id: reportTemplateId,
      custom_report_name: null,
      period,
      due_date: dueDate,
      price,
      status: "очікується",
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Manual Report Creation with custom type
export async function createCustomReportClient(
  clientId: string,
  customReportName: string,
  period: string,
  dueDate: string,
  price: number
): Promise<ClientReport> {
  const { data, error } = await supabaseBrowser
    .from("client_reports")
    .insert({
      client_id: clientId,
      report_template_id: null,
      custom_report_name: customReportName,
      period,
      due_date: dueDate,
      price,
      status: "очікується",
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReportClient(id: string): Promise<void> {
  const { error } = await supabaseBrowser
    .from("client_reports")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
