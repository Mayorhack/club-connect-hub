import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
  buildLeagueTable,
  getClubs,
  getFixtures,
  getMatchGoals,
  getTopScorers,
} from "@/lib/storage";
import { CalendarDays, Trophy } from "lucide-react";

function prettyDate(dateIso: string): string {
  const dt = new Date(`${dateIso}T12:00:00`);
  return dt.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
  });
}

export default function CompetitionCenter() {
  const { data: clubs = [], isLoading: loadingClubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
  });
  const { data: fixtures = [], isLoading: loadingFixtures } = useQuery({
    queryKey: ["fixtures"],
    queryFn: getFixtures,
  });
  const { data: topScorers = [] } = useQuery({
    queryKey: ["top_scorers"],
    queryFn: getTopScorers,
  });
  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ["match-goals"],
    queryFn: getMatchGoals,
  });

  const clubMap = useMemo(
    () => new Map(clubs.map((club) => [club.id, club])),
    [clubs],
  );

  const groupedFixtures = useMemo(() => {
    const byDay = new Map<number, typeof fixtures>();
    fixtures.forEach((fixture) => {
      const list = byDay.get(fixture.matchday) ?? [];
      byDay.set(fixture.matchday, [...list, fixture]);
    });

    return Array.from(byDay.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([matchday, list]) => ({
        matchday,
        fixtures: [...list].sort((a, b) =>
          a.kickoffDate.localeCompare(b.kickoffDate),
        ),
      }));
  }, [fixtures]);

  const table = useMemo(
    () => buildLeagueTable(clubs, fixtures),
    [clubs, fixtures],
  );

  const rankedTable = useMemo(() => {
    return [...table].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (a.points === 0 && b.points === 0) {
        const aName = (clubMap.get(a.clubId)?.name ?? "").toLowerCase();
        const bName = (clubMap.get(b.clubId)?.name ?? "").toLowerCase();
        if (aName !== bName) return aName.localeCompare(bName);
        return a.clubId.localeCompare(b.clubId);
      }
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      const aName = (clubMap.get(a.clubId)?.name ?? "").toLowerCase();
      const bName = (clubMap.get(b.clubId)?.name ?? "").toLowerCase();
      if (aName !== bName) return aName.localeCompare(bName);
      return a.clubId.localeCompare(b.clubId);
    });
  }, [table, clubMap]);

  const readyForSemiFinals =
    table.length >= 4 && table.every((row) => row.played >= 2);
  const semiFinalists = rankedTable.slice(0, 4);
  const semiFinalOne =
    semiFinalists.length >= 4
      ? [
          clubMap.get(semiFinalists[0].clubId)?.name ?? "TBD",
          clubMap.get(semiFinalists[3].clubId)?.name ?? "TBD",
        ]
      : ["TBD", "TBD"];
  const semiFinalTwo =
    semiFinalists.length >= 4
      ? [
          clubMap.get(semiFinalists[1].clubId)?.name ?? "TBD",
          clubMap.get(semiFinalists[2].clubId)?.name ?? "TBD",
        ]
      : ["TBD", "TBD"];

  if (loadingClubs || loadingFixtures || loadingGoals) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          Loading competition center...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section
        className="border-b border-border"
        style={{ background: "var(--gradient-pitch)" }}
      >
        <div className="container py-12 text-primary-foreground">
          <p className="text-xs uppercase tracking-widest opacity-85">
            PIE Cup
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">
            Fixtures & Table
          </h1>
          <p className="opacity-90 mt-2 max-w-2xl text-sm sm:text-base">
            Follow upcoming matches, latest results, league standings, and top
            scorers.
          </p>
        </div>
      </section>

      <div className="container py-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section className="space-y-6">
          <header className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Match Fixtures</h2>
          </header>

          {groupedFixtures.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Fixtures will appear here once the admin publishes them.
            </div>
          )}

          {groupedFixtures.map((group) => {
            const firstDate = group.fixtures[0]?.kickoffDate;
            return (
              <article
                key={group.matchday}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-lg font-semibold">
                  Matchday {group.matchday}
                  {firstDate ? (
                    <span className="font-normal text-muted-foreground ml-2">
                      ({prettyDate(firstDate)})
                    </span>
                  ) : null}
                </h3>

                <div className="mt-3 space-y-2">
                  {group.fixtures.map((fixture) => {
                    const home =
                      clubMap.get(fixture.homeClubId)?.name ?? "Unknown";
                    const away =
                      clubMap.get(fixture.awayClubId)?.name ?? "Unknown";
                    const hasScore =
                      fixture.homeScore !== undefined &&
                      fixture.awayScore !== undefined;

                    return (
                      <div
                        key={fixture.id}
                        className="rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {prettyDate(fixture.kickoffDate)}
                          {fixture.venue ? ` · ${fixture.venue}` : ""}
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm sm:text-base">
                          <span className="font-medium">{home}</span>
                          {hasScore ? (
                            <span className="rounded-md bg-muted px-2 py-0.5 font-semibold">
                              {fixture.homeScore} - {fixture.awayScore}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">vs</span>
                          )}
                          <span className="font-medium text-right">{away}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-bold mb-3">Knockout Stage</h2>

            {readyForSemiFinals ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Semi-Final 1
                  </p>
                  <div className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium truncate">
                      {semiFinalOne[0]}
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium truncate text-right">
                      {semiFinalOne[1]}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Semi-Final 2
                  </p>
                  <div className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium truncate">
                      {semiFinalTwo[0]}
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium truncate text-right">
                      {semiFinalTwo[1]}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Final
                  </p>
                  <div className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium truncate">Winner SF1</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium truncate text-right">
                      Winner SF2
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Qualified Teams
                  </p>
                </div>

                {semiFinalists.map((row, idx) => (
                  <div
                    key={row.clubId}
                    className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <p className="text-sm font-medium truncate">
                      {idx + 1}. {clubMap.get(row.clubId)?.name ?? "Unknown"}
                    </p>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                      {row.points} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Semi-final spots will be confirmed after every club has played 2
                matches.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <header className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-bold">League Table</h2>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Club</th>
                    <th className="py-2 text-center">P</th>
                    <th className="py-2 text-center">W</th>
                    <th className="py-2 text-center">D</th>
                    <th className="py-2 text-center">L</th>
                    <th className="py-2 text-center">GD</th>
                    <th className="py-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row, idx) => (
                    <tr
                      key={row.clubId}
                      className="border-b border-border/60 last:border-b-0"
                    >
                      <td className="py-2 pr-2">{idx + 1}</td>
                      <td className="py-2 pr-2 font-medium whitespace-nowrap">
                        {clubMap.get(row.clubId)?.name ?? "Unknown"}
                      </td>
                      <td className="py-2 text-center">{row.played}</td>
                      <td className="py-2 text-center">{row.won}</td>
                      <td className="py-2 text-center">{row.drawn}</td>
                      <td className="py-2 text-center">{row.lost}</td>
                      <td className="py-2 text-center">{row.goalDifference}</td>
                      <td className="py-2 text-right font-semibold">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {table.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No clubs available yet.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-bold mb-3">Top Scorers</h2>
            {topScorers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Goal scorers will appear after results are updated.
              </p>
            ) : (
              <div className="space-y-2">
                {topScorers.map((entry, idx) => {
                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {idx + 1}.{" "}
                          {entry.firstName && entry.lastName
                            ? `${entry.firstName} ${entry.lastName}`
                            : "Unknown player"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entry?.clubName ?? "Unknown club"}
                        </p>
                      </div>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-semibold">
                        {entry.goals}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </Layout>
  );
}
