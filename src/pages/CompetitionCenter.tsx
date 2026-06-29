import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
  buildLeagueTable,
  getClubs,
  getFixtures,
  getMatchGoals,
  getTopScorers,
  type MatchFixture,
} from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, MapPin, Trophy } from "lucide-react";

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

  const groupFixtures = useMemo(
    () => fixtures.filter((f) => !f.stage || f.stage === "group"),
    [fixtures],
  );

  const semiFinalFixtures = useMemo(
    () => fixtures.filter((f) => f.stage === "semi-final"),
    [fixtures],
  );

  const finalFixtures = useMemo(
    () => fixtures.filter((f) => f.stage === "final"),
    [fixtures],
  );

  const thirdPlaceFixtures = useMemo(
    () => fixtures.filter((f) => f.stage === "third-place"),
    [fixtures],
  );

  const groupedFixtures = useMemo(() => {
    const byDay = new Map<number, typeof fixtures>();
    fixtures.forEach((fixture) => {
      const list = byDay.get(fixture.matchday) ?? [];
      byDay.set(fixture.matchday, [...list, fixture]);
    });

    return Array.from(byDay.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([matchday, list]) => ({
        matchday,
        fixtures: [...list].sort((a, b) =>
          a.kickoffDate.localeCompare(b.kickoffDate),
        ),
      }));
  }, [fixtures]);

  const table = useMemo(
    () => buildLeagueTable(clubs, groupFixtures),
    [clubs, groupFixtures],
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

  const [venueFixture, setVenueFixture] = useState<MatchFixture | null>(null);

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
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs text-muted-foreground   ">
                            {prettyDate(fixture.kickoffDate)}
                            {fixture.venue ? ` · ${fixture.venue}` : ""}
                          </div>
                          {(fixture.venueMapsUrl ||
                            fixture.venueDirections) && (
                            <button
                              type="button"
                              onClick={() => setVenueFixture(fixture)}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <MapPin className="h-3 w-3" />
                              How to get there
                            </button>
                          )}
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
            <header className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-bold">Knockout Stage</h2>
            </header>

            {readyForSemiFinals ? (
              <div className="space-y-5">

                {/* ── Final ── */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">
                      🏆 Final
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {finalFixtures.length > 0 ? (
                    finalFixtures.map((fixture) => {
                      const home = clubMap.get(fixture.homeClubId)?.name ?? "TBD";
                      const away = clubMap.get(fixture.awayClubId)?.name ?? "TBD";
                      const hasScore =
                        fixture.homeScore !== undefined &&
                        fixture.awayScore !== undefined;
                      return (
                        <div
                          key={fixture.id}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3 flex items-center justify-between gap-3"
                        >
                          <span className="font-semibold text-sm truncate">{home}</span>
                          {hasScore ? (
                            <span className="shrink-0 rounded-md bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 font-black text-amber-600 dark:text-amber-400 tabular-nums">
                              {fixture.homeScore} – {fixture.awayScore}
                            </span>
                          ) : (
                            <span className="shrink-0 text-xs text-muted-foreground font-medium">vs</span>
                          )}
                          <span className="font-semibold text-sm truncate text-right">{away}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-background px-3 py-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span className="truncate">Winner SF 1</span>
                      <span className="shrink-0 text-xs">vs</span>
                      <span className="truncate text-right">Winner SF 2</span>
                    </div>
                  )}
                </div>

                {/* ── Third Place ── */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      🥉 Third Place
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {thirdPlaceFixtures.length > 0 ? (
                    thirdPlaceFixtures.map((fixture) => {
                      const home = clubMap.get(fixture.homeClubId)?.name ?? "TBD";
                      const away = clubMap.get(fixture.awayClubId)?.name ?? "TBD";
                      const hasScore =
                        fixture.homeScore !== undefined &&
                        fixture.awayScore !== undefined;
                      const isDraw = hasScore && fixture.homeScore === fixture.awayScore;
                      const hasPenalties =
                        isDraw &&
                        fixture.homePenaltyScore != null &&
                        fixture.awayPenaltyScore != null;
                      return (
                        <div
                          key={fixture.id}
                          className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="font-medium truncate">{home}</span>
                          {hasScore ? (
                            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-semibold text-center whitespace-nowrap">
                              {fixture.homeScore} – {fixture.awayScore}
                              {hasPenalties && (
                                <span className="block text-[10px] font-normal text-muted-foreground leading-tight">
                                  ({fixture.homePenaltyScore}–{fixture.awayPenaltyScore} pens)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="shrink-0 text-xs text-muted-foreground">vs</span>
                          )}
                          <span className="font-medium truncate text-right">{away}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-background px-3 py-2 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span className="truncate">Loser SF 1</span>
                      <span className="shrink-0 text-xs">vs</span>
                      <span className="truncate text-right">Loser SF 2</span>
                    </div>
                  )}
                </div>

                {/* ── Semi-Finals ── */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Semi-Finals
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-2">
                    {semiFinalFixtures.length > 0 ? (
                      semiFinalFixtures.map((fixture, idx) => {
                        const home = clubMap.get(fixture.homeClubId)?.name ?? "TBD";
                        const away = clubMap.get(fixture.awayClubId)?.name ?? "TBD";
                        const hasScore =
                          fixture.homeScore !== undefined &&
                          fixture.awayScore !== undefined;
                        const isDraw = hasScore && fixture.homeScore === fixture.awayScore;
                        const hasPenalties =
                          isDraw &&
                          fixture.homePenaltyScore != null &&
                          fixture.awayPenaltyScore != null;
                        return (
                          <div key={fixture.id}>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 ml-0.5">
                              SF {idx + 1}
                            </p>
                            <div className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between gap-3 text-sm">
                              <span className="font-medium truncate">{home}</span>
                              {hasScore ? (
                                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-semibold text-center whitespace-nowrap">
                                  {fixture.homeScore} – {fixture.awayScore}
                                  {hasPenalties && (
                                    <span className="block text-[10px] font-normal text-muted-foreground leading-tight">
                                      ({fixture.homePenaltyScore}–{fixture.awayPenaltyScore} pens)
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="shrink-0 text-xs text-muted-foreground">vs</span>
                              )}
                              <span className="font-medium truncate text-right">{away}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        {[
                          [semiFinalOne[0], semiFinalOne[1]],
                          [semiFinalTwo[0], semiFinalTwo[1]],
                        ].map(([a, b], idx) => (
                          <div key={idx}>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 ml-0.5">
                              SF {idx + 1}
                            </p>
                            <div className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between gap-3 text-sm">
                              <span className="font-medium truncate">{a}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">vs</span>
                              <span className="font-medium truncate text-right">{b}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>


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
                  {rankedTable.map((row, idx) => (
                    <tr
                      key={row.clubId}
                      className="border-b border-border/60 last:border-b-0"
                    >
                      <td className="py-2 pr-2">{idx + 1}</td>
                      <td className="py-2 pr-2 font-medium whitespace-nowrap">
                        {clubMap.get(row.clubId)?.name ?? "Unknown"} (
                        {clubMap.get(row.clubId)?.cciBranch ?? "N/A"})
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

            {rankedTable.length === 0 && (
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

      <Dialog
        open={venueFixture !== null}
        onOpenChange={(open) => {
          if (!open) setVenueFixture(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              How to get there
            </DialogTitle>
          </DialogHeader>
          {venueFixture && (
            <div className="space-y-4 text-sm">
              {venueFixture.venue && (
                <p className="font-medium">{venueFixture.venue}</p>
              )}
              {venueFixture.venueDirections && (
                <p className="text-muted-foreground">
                  {venueFixture.venueDirections}
                </p>
              )}
              {venueFixture.venueMapsUrl && (
                <a
                  href={venueFixture.venueMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
