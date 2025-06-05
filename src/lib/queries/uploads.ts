import "server-only";

import { getCurrentUser } from "~/lib/auth";
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
