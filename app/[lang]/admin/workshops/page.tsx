import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/config";
import { getAdminUser } from "@/lib/supabase/server";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminWorkshops } from "@/components/admin/AdminWorkshops";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workshops — Admin · Contraste Atelier",
  robots: { index: false, follow: false },
};

export default async function AdminWorkshopsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="adm">
        <div className="adm__login">
          <h1>Admin</h1>
          <p className="adm__msg">
            Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY and
            ADMIN_EMAIL_ALLOWLIST to activate workshop administration.
          </p>
        </div>
      </main>
    );
  }

  const admin = await getAdminUser();
  if (!admin) {
    return (
      <main className="adm">
        <AdminLogin />
      </main>
    );
  }

  return (
    <main className="adm">
      <AdminWorkshops adminEmail={admin.email} />
    </main>
  );
}
