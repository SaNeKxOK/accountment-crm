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

export async function signUpAndSignIn(email: string, password: string) {
  // First, try to sign up
  const { data: signUpData, error: signUpError } =
    await supabaseBrowser.auth.signUp({
      email,
      password,
    });

  if (signUpError) {
    return { data: null, error: signUpError };
  }

  // If signup was successful, immediately sign in
  if (signUpData.user) {
    const { data: signInData, error: signInError } =
      await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      return { data: signUpData, error: signInError };
    }

    return { data: signInData, error: null };
  }

  return { data: signUpData, error: null };
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
