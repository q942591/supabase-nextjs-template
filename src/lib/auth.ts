import type { User } from "@supabase/supabase-js";

import { redirect } from "next/navigation";

import { SYSTEM_CONFIG } from "~/app";
import { createClient } from "~/lib/supabase/server";

// Get current user from server-side
export const getCurrentUser = async (): Promise<null | User> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get current user or redirect
export const getCurrentUserOrRedirect = async (
  forbiddenUrl?: string,
  okUrl?: string,
  ignoreForbidden = false,
): Promise<null | User> => {
  const user = await getCurrentUser();

  if (!user) {
    if (!ignoreForbidden) {
      redirect(forbiddenUrl || "/auth/sign-in");
    }
    return null;
  }

  if (okUrl) {
    redirect(okUrl);
  }

  return user;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

// Get user session
export const getSession = async () => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Sign out (server action)
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
};

// Types for compatibility
export type UserDbType = User;
