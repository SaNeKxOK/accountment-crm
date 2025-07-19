import { supabaseBrowser } from "./supabase/browser";

// Client-side auth functions (for use in client components)
export async function signIn(email: string, password: string) {
  const { data, error } = await supabaseBrowser.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabaseBrowser.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabaseBrowser.auth.signOut();
  return { error };
}

// Client-side user getter
export async function getUser() {
  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();
  return user;
}
