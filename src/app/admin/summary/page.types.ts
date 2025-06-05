import type { User } from "@supabase/supabase-js";

import type { MediaUpload } from "~/lib/supabase/service";

// The shape of the data expected by the table
// Includes user details and their uploads
export type UserWithUploads = User & {
  uploads: MediaUpload[];
};
