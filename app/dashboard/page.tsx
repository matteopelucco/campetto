import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Esci
            </button>
          </form>
        </div>
        <p className="text-zinc-400">
          Benvenuto, <span className="text-white font-medium">{session.user?.name}</span>.
        </p>
        <p className="mt-2 text-zinc-500 text-sm">
          Sprint 1 in corso — layout e CRUD in arrivo.
        </p>
      </div>
    </div>
  );
}
