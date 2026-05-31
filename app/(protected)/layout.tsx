import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return <AppLayout>{children}</AppLayout>;
}
