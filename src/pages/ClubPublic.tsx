import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
  getClubs,
  getPlayersByClub,
  POSITION_GROUP,
  PositionGroup,
} from "@/lib/storage";
import { PlayerCard } from "@/components/PlayerCard";
import { CoachCard } from "@/components/CoachCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, Trophy } from "lucide-react";

const GROUPS: { key: PositionGroup; label: string }[] = [
  { key: "GK", label: "Goalkeepers" },
  { key: "DEF", label: "Defenders" },
  { key: "MID", label: "Midfielders" },
  { key: "FWD", label: "Forwards" },
];

export default function ClubPublic() {
  const { id } = useParams();
  const { data: clubs = [], isLoading: loadingClubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
  });
  const club = clubs.find((c) => c.id === id);
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ["players", id],
    queryFn: () => getPlayersByClub(id ?? ""),
    enabled: !!id,
  });

  if (loadingClubs) {
    return (
      <Layout>
        <section
          className="border-b border-border"
          style={{ background: "var(--gradient-pitch)" }}
        >
          <div className="container py-10 text-primary-foreground">
            <Skeleton className="mb-4 h-4 w-28 bg-card/20" />
            <div className="flex flex-wrap items-center gap-5">
              <Skeleton className="h-16 w-16 rounded-xl bg-card/20 sm:h-20 sm:w-20" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-56 bg-card/20 sm:h-10 sm:w-72" />
                <Skeleton className="h-4 w-40 bg-card/20" />
                <Skeleton className="h-4 w-44 bg-card/20" />
              </div>
            </div>
          </div>
        </section>

        <section className="container py-10 space-y-8">
          <div>
            <Skeleton className="mb-3 h-6 w-36" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {["coach", "assistant-coach"].map((slot) => (
                <div
                  key={`coach-skeleton-${slot}`}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Skeleton className="h-16 rounded-md" />
                    <Skeleton className="h-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {loadingPlayers &&
            GROUPS.map((group) => (
              <div key={`loading-${group.key}`}>
                <Skeleton className="mb-3 h-6 w-40" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {["one", "two", "three", "four"].map((slot) => (
                    <div
                      key={`${group.key}-player-skeleton-${slot}`}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <Skeleton className="h-1.5 w-full rounded-none" />
                      <div className="space-y-4 px-4 pb-3 pt-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-14 w-14 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <div className="space-y-2 text-right">
                            <Skeleton className="ml-auto h-8 w-10" />
                            <Skeleton className="ml-auto h-2 w-6" />
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border px-4 py-2.5">
                        <Skeleton className="h-3 w-full" />
                      </div>
                      <div className="border-t border-border px-4 py-2.5">
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>
      </Layout>
    );
  }

  if (!club) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Club not found.</p>
          <Link to="/" className="text-primary underline mt-3 inline-block">
            Back to clubs
          </Link>
        </div>
      </Layout>
    );
  }

  const sortedPlayers = [...players]
    .filter((p) => p.mapGroup && p.photoUrl)
    .sort((a, b) => a.jerseyNumber - b.jerseyNumber);
  const gkCount = sortedPlayers.filter((p) => p.position === "GK").length;

  return (
    <Layout>
      <section
        className="border-b border-border"
        style={{ background: "var(--gradient-pitch)" }}
      >
        <div className="container py-10 text-primary-foreground">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> All clubs
          </Link>
          <div className="flex flex-wrap items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-card/10 backdrop-blur flex items-center justify-center border border-card/20 shrink-0">
              {club.logoUrl ? (
                <img
                  src={club.logoUrl}
                  alt={club.name}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <Trophy className="h-10 w-10" />
              )}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {club.name}
              </h1>
              <p className="opacity-90 mt-1">
                {club.city} · founded {club.foundedYear}
              </p>
              {loadingPlayers ? (
                <Skeleton className="mt-2 h-4 w-44 bg-card/20" />
              ) : (
                <p className="opacity-90 text-sm mt-1">
                  {players.length}/25 players · {gkCount} goalkeeper
                  {gkCount === 1 ? "" : "s"}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10 space-y-8">
        <div>
          <h2 className="text-lg font-bold mb-3">Technical crew</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CoachCard
              role="Coach"
              name={club.coachName}
              mapGroup={club.coachMapGroup}
              serviceUnit={club.coachServiceUnit}
              photoUrl={club.coachPhotoUrl}
            />
            <CoachCard
              role="Assistant Coach"
              name={club.assistantCoachName}
              mapGroup={club.assistantCoachMapGroup}
              serviceUnit={club.assistantCoachServiceUnit}
              photoUrl={club.assistantCoachPhotoUrl}
            />
          </div>
        </div>

        {!loadingPlayers && gkCount < 1 && (
          <div className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Squad incomplete</p>
              <p className="text-muted-foreground">
                A registered squad needs at least 1 goalkeepers. This club
                currently has {gkCount}.
              </p>
            </div>
          </div>
        )}

        {loadingPlayers
          ? GROUPS.map((group) => (
              <div key={`loading-${group.key}`}>
                <Skeleton className="mb-3 h-6 w-40" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {["one", "two", "three", "four"].map((slot) => (
                    <div
                      key={`${group.key}-player-skeleton-${slot}`}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <Skeleton className="h-1.5 w-full rounded-none" />
                      <div className="space-y-4 px-4 pb-3 pt-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-14 w-14 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <div className="space-y-2 text-right">
                            <Skeleton className="ml-auto h-8 w-10" />
                            <Skeleton className="ml-auto h-2 w-6" />
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border px-4 py-2.5">
                        <Skeleton className="h-3 w-full" />
                      </div>
                      <div className="border-t border-border px-4 py-2.5">
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          : GROUPS.map((g) => {
              const list = sortedPlayers.filter(
                (p) => POSITION_GROUP[p.position] === g.key,
              );
              if (list.length === 0) return null;
              return (
                <div key={g.key}>
                  <h2 className="text-lg font-bold mb-3">
                    {g.label}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({list.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {list.map((p) => (
                      <PlayerCard key={p.id} player={p} />
                    ))}
                  </div>
                </div>
              );
            })}

        {!loadingPlayers && sortedPlayers.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No players have been added to this squad yet.
          </div>
        )}
      </section>
    </Layout>
  );
}
