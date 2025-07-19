import { createClient } from "./supabase/server";

// Server-side auth functions (for use in server components only)
export async function getUserServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionServer() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
