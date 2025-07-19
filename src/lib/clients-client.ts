import { supabaseBrowser } from "./supabase/browser";
import { Database } from "./supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

// Client-side client functions for use in client components
export async function getClientsClient(): Promise<Client[]> {
  const { data, error } = await supabaseBrowser
    .from("clients")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getClientClient(id: string): Promise<Client | null> {
  const { data, error } = await supabaseBrowser
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createClientRecordClient(
  client: Omit<ClientInsert, "user_id">
): Promise<Client> {
  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabaseBrowser
    .from("clients")
    .insert({ ...client, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClientClient(
  id: string,
  client: ClientUpdate
): Promise<Client> {
  const { data, error } = await supabaseBrowser
    .from("clients")
    .update(client)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClientClient(id: string): Promise<void> {
  const { error } = await supabaseBrowser.from("clients").delete().eq("id", id);

  if (error) throw error;
}
