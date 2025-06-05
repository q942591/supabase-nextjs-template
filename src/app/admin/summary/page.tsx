import { getUsersWithUploads } from "~/lib/queries/admin";

import AdminPageClient from "./page.client";

// 将页面标记为动态渲染
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getUsersWithUploads();
  return <AdminPageClient initialData={data} />;
}
