import { redirect } from "next/navigation";
import { isAdmin } from "@/core/utils/adminAuth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  
  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <AdminShell activeItem="home">
      {children}
    </AdminShell>
  );
}

