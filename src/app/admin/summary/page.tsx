import { getUsersWithUploads } from "~/lib/queries/admin";

import AdminPageClient from "./page.client";

export default async function AdminPage() {
  const data = await getUsersWithUploads();
  return <AdminPageClient initialData={data} />;
}
