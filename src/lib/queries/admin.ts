import type { UserWithUploads } from "~/app/admin/summary/page.types";

import { createClient } from "~/lib/supabase/server";
import { getUserUploads } from "~/lib/supabase/service";

// Fetch users and their uploads
export async function getUsersWithUploads(): Promise<UserWithUploads[]> {
  try {
    const supabase = await createClient();

    // Get all users from Supabase
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }

    // For each user, get their uploads
    const usersWithUploads: UserWithUploads[] = [];

    for (const user of users.users) {
      if (user.id) {
        const uploads = await getUserUploads(user.id);
        usersWithUploads.push({
          ...user,
          uploads
        });
      }
    }

    return usersWithUploads;
  } catch (error) {
    console.error("Failed to fetch users with uploads:", error);
    return [];
  }
}