import type { User } from "@supabase/supabase-js";

// Use Supabase User type as the main user type
export type UserDbType = User;

// For compatibility with existing code
export type UserType = User;
