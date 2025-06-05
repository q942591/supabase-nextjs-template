"use client";

import type { Session, User } from "@supabase/supabase-js";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "../lib/supabase/client";
import { getURL } from "./utils";

// Auth methods
export const signIn = {
  email: async ({ email, password }: { email: string; password: string }) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  social: async ({ provider }: { provider: "github" | "google" }) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      options: {
        redirectTo: getURL("/auth/callback"),
      },
      provider,
    });
    if (error) throw error;
    return data;
  },
};

export const signUp = async ({ email, password }: { email: string; password: string }) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Hook to get current user data and loading state
export const useSession = () => {
  const [session, setSession] = useState<null | Session>(null);
  const [user, setUser] = useState<null | User>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsPending(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsPending(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    data: { session, user },
    isPending,
  };
};

// Hook to get current user data and loading state
export const useCurrentUser = () => {
  const { data, isPending } = useSession();
  return {
    isPending,
    session: data?.session,
    user: data?.user,
  };
};

// Hook similar to getCurrentUserOrRedirect for client-side use
export const useCurrentUserOrRedirect = (
  forbiddenUrl = "/auth/sign-in",
  okUrl = "",
  ignoreForbidden = false,
) => {
  const { data, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // only perform redirects after loading is complete and router is ready
    if (!isPending && router) {
      // if no user is found
      if (!data?.user) {
        if (!ignoreForbidden) {
          router.push(forbiddenUrl);
        }
      } else {
        // if user is found and okUrl is provided
        if (okUrl) {
          router.push(okUrl);
        }
      }
    }
  }, [data?.user, isPending, router, forbiddenUrl, okUrl, ignoreForbidden]);

  return {
    isPending,
    session: data?.session,
    user: data?.user,
  };
};

// Get current user session (for compatibility)
export const getCurrentUserSession = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Two-factor authentication methods
export const twoFactor = {
  disable: async ({ password }: { password: string }) => {
    const supabase = createClient();
    // Get all factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();

    if (factorsError) throw factorsError;

    // Unenroll all TOTP factors
    for (const factor of factors.totp) {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factor.id
      });

      if (unenrollError) throw unenrollError;
    }

    return { success: true };
  },

  enable: async ({ password }: { password: string }) => {
    const supabase = createClient();
    // Enroll MFA
    const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator App'
    });

    if (enrollError) throw enrollError;

    return {
      data: {
        backupCodes: [], // Supabase doesn't provide backup codes by default
        secret: enrollData.totp.secret,
        totpURI: enrollData.totp.uri
      }
    };
  },

  verifyBackupCode: async ({ code }: { code: string }) => {
    // Supabase doesn't have built-in backup codes
    // This would need to be implemented with custom logic
    throw new Error('Backup codes not implemented for Supabase');
  },

  verifyTotp: async ({ code }: { code: string }) => {
    const supabase = createClient();
    // Get the challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: '' // Will need to get the factor ID
    });

    if (challengeError) throw challengeError;

    // Verify the code
    const { data, error } = await supabase.auth.mfa.verify({
      challengeId: challengeData.id,
      code,
      factorId: challengeData.id
    });

    if (error) throw error;

    return data;
  }
};
