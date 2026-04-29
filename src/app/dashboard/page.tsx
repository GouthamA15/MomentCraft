import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    templatesActive,
    vendorsCount,
    clientsCount,
    projectsTotal,
    projectsPublished,
    revisionsPending,
  ] = await Promise.all([
    supabase
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("publish_status", true),
    supabase
      .from("revisions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const cards = [
    { label: "Templates Active", value: String(templatesActive.count ?? 0).padStart(2, "0") },
    { label: "Vendors", value: String(vendorsCount.count ?? 0).padStart(2, "0") },
    { label: "Clients", value: String(clientsCount.count ?? 0).padStart(2, "0") },
    { label: "Projects", value: String(projectsTotal.count ?? 0).padStart(2, "0") },
  ];

  const summary = [
    { label: "Published", value: String(projectsPublished.count ?? 0) },
    { label: "Pending Revisions", value: String(revisionsPending.count ?? 0) },
  ];

  return (
    <div className="space-y-4">
      <section className="glass rounded-2xl p-5">
        <h2 className="text-xl font-semibold text-white">Welcome back, Admin</h2>
        <p className="mt-1 text-sm text-slate-300">
          Overview of your workspace and delivery pipeline.
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-100">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="glass rounded-xl p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {summary.map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
