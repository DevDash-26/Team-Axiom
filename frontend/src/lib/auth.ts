/** Session helpers around supabase-js. */

import { getSupabase } from "@/lib/supabase";
import { apiGet } from "@/lib/api";
import type { UserPublic } from "@/types";

export { getAccessToken } from "@/lib/supabase";

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}

export async function fetchMe(): Promise<UserPublic> {
  return apiGet<UserPublic>("/api/auth/me");
}
