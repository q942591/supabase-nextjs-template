import "server-only";
import { desc, eq } from "drizzle-orm";

import type { UserWithUploads } from "~/app/admin/summary/page.types";

import { getCurrentUser } from "~/lib/auth";
import { createClient } from "~/lib/supabase/server";
import { getUserUploads } from "~/lib/supabase/service";

// Fetch users and their uploads
export async function getUserUploadsQuery() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    return await getUserUploads(user.id);
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return [];
  }
}
