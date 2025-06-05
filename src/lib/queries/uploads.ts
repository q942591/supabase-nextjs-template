import "server-only";
import { desc, eq } from "drizzle-orm";

import type { UserWithUploads } from "~/app/admin/summary/page.types";

import { db } from "~/db";
import { uploadsTable } from "~/db/schema";
import { createClient } from "~/lib/supabase/server";

// Fetch users and their uploads
export async function getUsersWithUploads(): Promise<UserWithUploads[]> {
  try {
    const supabase = await createClient();

    // Get all uploads first
    const uploads = await db.select().from(uploadsTable).orderBy(desc(uploadsTable.createdAt));

    // Get unique user IDs
    const userIds = [...new Set(uploads.map(upload => upload.userId))];

    // Fetch users from Supabase
    const usersWithUploads: UserWithUploads[] = [];

    for (const userId of userIds) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (user) {
        const userUploads = uploads.filter(upload => upload.userId === userId);
        usersWithUploads.push({
          ...user,
          uploads: userUploads
        });
      }
    }

    return usersWithUploads;
  } catch (error) {
    console.error("Failed to fetch users with uploads:", error);
    return [];
  }
}
