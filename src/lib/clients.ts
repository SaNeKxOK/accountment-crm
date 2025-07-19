import { createClient as createSupabaseClient } from "./supabase/server";
import { Database } from "./supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export async function getClients(): Promise<Client[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createClientRecord(
  client: Omit<ClientInsert, "user_id">
): Promise<Client> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...client, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClient(
  id: string,
  client: ClientUpdate
): Promise<Client> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .update(client)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) throw error;
}
