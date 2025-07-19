import { createClient as createSupabaseClient } from "./supabase/server";
import { Database } from "./supabase/types";

type ReportTemplate = Database["public"]["Tables"]["report_templates"]["Row"];
type ClientReportConfig =
  Database["public"]["Tables"]["client_report_configs"]["Row"];
type ClientReportConfigInsert =
  Database["public"]["Tables"]["client_report_configs"]["Insert"];
type ClientReportConfigUpdate =
  Database["public"]["Tables"]["client_report_configs"]["Update"];
type ClientReport = Database["public"]["Tables"]["client_reports"]["Row"];
type ClientReportUpdate =
  Database["public"]["Tables"]["client_reports"]["Update"];

// Report Templates
export async function getReportTemplates(): Promise<ReportTemplate[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("report_templates")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getReportTemplate(
  id: string
): Promise<ReportTemplate | null> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("report_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Client Report Configurations
export async function getClientReportConfigs(
  clientId: string
): Promise<(ClientReportConfig & { report_template: ReportTemplate })[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
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

export async function createClientReportConfig(
  config: Omit<ClientReportConfigInsert, "id">
): Promise<ClientReportConfig> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("client_report_configs")
    .insert(config)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClientReportConfig(
  id: string,
  config: ClientReportConfigUpdate
): Promise<ClientReportConfig> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("client_report_configs")
    .update(config)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClientReportConfig(id: string): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("client_report_configs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Client Reports (Instances)
export async function getClientReports(
  clientId: string,
  options?: {
    status?: string;
    year?: number;
    limit?: number;
  }
): Promise<(ClientReport & { report_template: ReportTemplate | null })[]> {
  const supabase = await createSupabaseClient();
  let query = supabase
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

export async function getAllReports(options?: {
  status?: string;
  year?: number;
  limit?: number;
}): Promise<
  (ClientReport & {
    report_template: ReportTemplate | null;
    client: { name: string };
  })[]
> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  let query = supabase
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

export async function getUpcomingReports(
  days: number = 30
): Promise<
  (ClientReport & {
    report_template: ReportTemplate | null;
    client: { name: string };
  })[]
> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const today = new Date().toISOString().split("T")[0];
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("client_reports")
    .select(
      `
      *,
      report_template:report_templates(*),
      client:clients!inner(name)
    `
    )
    .eq("client.user_id", user.id)
    .gte("due_date", today)
    .lte("due_date", futureDate)
    .in("status", ["очікується", "в_роботі"])
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateReportStatus(
  id: string,
  status: "очікується" | "в_роботі" | "подано" | "сплачено",
  submitted_date?: string
): Promise<ClientReport> {
  const supabase = await createSupabaseClient();
  const updateData: ClientReportUpdate = { status };

  if (submitted_date && status === "подано") {
    updateData.submitted_date = submitted_date;
  }

  const { data, error } = await supabase
    .from("client_reports")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReportNotes(
  id: string,
  notes: string
): Promise<ClientReport> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("client_reports")
    .update({ notes })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Generate Report Instances
export async function generateReportInstances(
  clientId: string,
  year: number = new Date().getFullYear()
): Promise<number> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.rpc("generate_report_instances", {
    p_client_id: clientId,
    p_year: year,
  });

  if (error) throw error;
  return data || 0;
}

// Utility functions
export function formatPeriod(period: string): string {
  // Handle different period formats
  if (period.includes("Q")) {
    return period; // Already formatted like "Q1 2024"
  }

  if (period.match(/^\d{4}$/)) {
    return period; // Year format like "2024"
  }

  // Month format like "March 2024"
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
