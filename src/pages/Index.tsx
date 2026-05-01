import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { getClubs, playersByClub } from "@/lib/storage";
import { Trophy, Users } from "lucide-react";

const Index = () => {
  const clubs = getClubs();

  return (
    <Layout>
      <section className="border-b border-border" style={{ background: "var(--gradient-pitch)" }}>
        <div className="container py-16 text-primary-foreground">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Football clubs, all in one place</h1>
          <p className="mt-3 max-w-xl opacity-90">Browse registered clubs and explore their squads. Club admins manage rosters of up to 25 players, with at least 2 goalkeepers.</p>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">Clubs</h2>
          <span className="text-sm text-muted-foreground">{clubs.length} registered</span>
        </div>

        {clubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No clubs yet. A super admin can create the first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((c) => {
              const count = playersByClub(c.id).length;
              return (
                <Link key={c.id} to={`/clubs/${c.id}`} className="group rounded-xl border border-border bg-card p-5 hover:shadow-[var(--shadow-card)] transition hover:-translate-y-0.5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-pitch)" }}>
                      {c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="h-full w-full object-cover rounded-lg" /> : <Trophy className="h-7 w-7 text-primary-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-lg leading-tight truncate group-hover:text-primary">{c.name}</div>
                      <div className="text-sm text-muted-foreground">{c.city} · est. {c.foundedYear}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" /> {count} player{count === 1 ? "" : "s"}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
