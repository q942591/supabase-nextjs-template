import "server-only";
import type { User } from "@supabase/supabase-js";

import { createClient } from "~/lib/supabase/server";

/**
 * Fetches a user from Supabase auth by their ID.
 * @param userId - The ID of the user to fetch.
 * @returns The user object or null if not found.
 */
export async function getUserById(userId: string): Promise<null | User> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}
