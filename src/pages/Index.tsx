import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  getClubs,
  getPlayers,
  playersByClub,
  type Club,
  type Player,
} from "@/lib/storage";
import {
  Trophy,
  Users,
  Shield,
  Star,
  ChevronRight,
  ChevronLeft,
  MapPin,
  CalendarDays,
  Flame,
} from "lucide-react";
import { PositionBadge } from "@/components/PositionBadge";

const FEATURES = [
  {
    icon: Shield,
    title: "Structured Squads",
    desc: "Every club maintains a roster of up to 25 players with position tracking across GK, DEF, MID and FWD.",
  },
  {
    icon: Star,
    title: "Player Profiles",
    desc: "Detailed cards with jersey numbers, positions, physical stats, and more — all in one place.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    desc: "Super admins create clubs and assign managers. Club admins control their own rosters.",
  },
];

// ── Mini slider hook ─────────────────────────────────────────────────────────
function useSlider(length: number, auto = true) {
  const [idx, setIdx] = useState(0);
  const prev = useCallback(
    () => setIdx((i) => (i - 1 + length) % length),
    [length],
  );
  const next = useCallback(() => setIdx((i) => (i + 1) % length), [length]);
  useEffect(() => {
    if (!auto || length <= 1) return;
    const t = setInterval(next, 3800);
    return () => clearInterval(t);
  }, [auto, length, next]);
  return { idx, prev, next, setIdx };
}

// ── Player spotlight card ────────────────────────────────────────────────────
function PlayerSpotlight({
  player,
  club,
}: Readonly<{ player: Player; club: Club | undefined }>) {
  const fullName = `${player.firstName} ${player.lastName}`.trim();
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-card to-muted border border-border p-5 flex gap-4 h-full">
      <div className="shrink-0 h-16 w-16 rounded-xl overflow-hidden bg-secondary flex items-center justify-center text-lg font-black text-secondary-foreground shadow">
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-extrabold text-base leading-tight truncate">
          {fullName}
        </div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <PositionBadge position={player.position} />
          <span className="text-xs text-muted-foreground">
            #{player.jerseyNumber}
          </span>
        </div>
        {club && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="h-3 w-3 shrink-0" />
            <span className="truncate">{club.name}</span>
          </div>
        )}
        <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
          {!!player.heightCm && <span>{player.heightCm} cm</span>}
          {!!player.weightKg && <span>{player.weightKg} kg</span>}
          {player.preferredFoot && (
            <span className="capitalize">{player.preferredFoot} foot</span>
          )}
        </div>
      </div>
      {/* big number watermark */}
      <div className="absolute bottom-2 right-3 text-6xl font-black text-foreground/5 select-none leading-none pointer-events-none">
        {player.jerseyNumber}
      </div>
    </div>
  );
}

// ── Club spotlight card ───────────────────────────────────────────────────────
function ClubSpotlight({
  club,
  playerCount,
}: Readonly<{ club: Club; playerCount: number }>) {
  return (
    <Link
      to={`/clubs/${club.id}`}
      className="group block rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-card to-muted hover:border-primary/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 p-5 h-full"
    >
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 shrink-0 rounded-xl flex items-center justify-center shadow"
          style={{ background: "var(--gradient-pitch)" }}
        >
          {club.logoUrl ? (
            <img
              src={club.logoUrl}
              alt={club.name}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <Trophy className="h-7 w-7 text-primary-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-base leading-tight truncate group-hover:text-primary transition-colors">
            {club.name}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3" />
            {club.city}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted px-3 py-2">
          <div className="font-bold text-lg leading-none">{playerCount}</div>
          <div className="text-muted-foreground mt-0.5">Players</div>
        </div>
        <div className="rounded-lg bg-muted px-3 py-2">
          <div className="font-bold text-lg leading-none">
            {club.foundedYear}
          </div>
          <div className="text-muted-foreground mt-0.5">Founded</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min((playerCount / 25) * 100, 100)}%`,
            background: "var(--gradient-pitch)",
          }}
        />
      </div>
    </Link>
  );
}

// ── Generic slider shell ──────────────────────────────────────────────────────
function Slider<T>({
  items,
  renderSlide,
  title,
  subtitle,
  icon: Icon,
  visibleCount = 3,
}: Readonly<{
  items: T[];
  renderSlide: (item: T, index: number) => React.ReactNode;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  visibleCount?: number;
}>) {
  const pages = Math.ceil(items.length / visibleCount);
  const { idx, prev, next, setIdx } = useSlider(pages);

  const visible = items.slice(
    idx * visibleCount,
    idx * visibleCount + visibleCount,
  );

  if (items.length === 0) return null;

  return (
    <section className="container py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon
              className="h-5 w-5"
              style={{ color: "hsl(var(--primary))" }}
            />
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="h-8 w-8 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={`dot-page-${page}`}
                  onClick={() => setIdx(page - 1)}
                  className={`h-1.5 rounded-full transition-all ${page - 1 === idx ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
                  aria-label={`Go to page ${page}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="h-8 w-8 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((item, i) => (
          <div key={idx * visibleCount + i} className="animate-fade-in">
            {renderSlide(item, idx * visibleCount + i)}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const Index = () => {
  const { data: clubs = [] } = useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
  });
  const { data: allPlayers = [] } = useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
  });
  const totalPlayers = allPlayers.length;

  const clubMap = Object.fromEntries(clubs.map((c) => [c.id, c]));

  // "Players to Watch" — spotlight players with the most metadata filled in
  const spotlightPlayers = [...allPlayers]
    .sort((a, b) => {
      const score = (p: Player) =>
        (p.heightCm ? 1 : 0) + (p.weightKg ? 1 : 0) + (p.preferredFoot ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 9);

  return (
    <Layout>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden border-b border-border"
        style={{ background: "var(--gradient-pitch)" }}
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-black/10 blur-2xl" />

        <div className="container relative py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* left — text */}
            <div className="text-primary-foreground">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide uppercase mb-6">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                PIE Cup — Season 2026
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                Football clubs,
                <br />
                all in one place.
              </h1>
              <p className="mt-4 max-w-lg text-base sm:text-lg opacity-85 leading-relaxed">
                Browse registered clubs, explore full squads, and follow your
                favourite players — all without signing in.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#clubs"
                  className="inline-flex items-center gap-2 rounded-lg bg-white text-primary font-semibold px-5 py-2.5 text-sm shadow hover:opacity-90 transition"
                >
                  Browse clubs <ChevronRight className="h-4 w-4" />
                </a>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/15 border border-white/30 text-white font-medium px-5 py-2.5 text-sm hover:bg-white/25 transition"
                >
                  Join as a club admin
                </Link>
              </div>

              {/* quick stats */}
              <div className="mt-10 flex flex-wrap gap-6 sm:gap-10">
                <div>
                  <div className="text-3xl font-extrabold">{clubs.length}</div>
                  <div className="text-xs opacity-70 mt-0.5 uppercase tracking-wide">
                    Clubs
                  </div>
                </div>
                <div className="w-px bg-white/20 hidden sm:block" />
                <div>
                  <div className="text-3xl font-extrabold">{totalPlayers}</div>
                  <div className="text-xs opacity-70 mt-0.5 uppercase tracking-wide">
                    Players
                  </div>
                </div>
                <div className="w-px bg-white/20 hidden sm:block" />
                <div>
                  <div className="text-3xl font-extrabold">17</div>
                  <div className="text-xs opacity-70 mt-0.5 uppercase tracking-wide">
                    Positions tracked
                  </div>
                </div>
              </div>
            </div>

            {/* right — hero image */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* glow ring */}
              <div className="absolute h-72 w-72 rounded-full bg-white/10 blur-2xl" />
              <div className="relative h-80 w-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=640&q=80&auto=format&fit=crop"
                  alt="Football action"
                  className="h-full w-full object-cover object-top scale-110"
                />
                {/* overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* floating badge */}
              <div className="absolute bottom-8 left-4 bg-white/90 dark:bg-black/70 backdrop-blur rounded-xl px-4 py-2.5 shadow-lg">
                <div className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Season 2026
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {clubs.length} active clubs
                </div>
              </div>
              {/* floating stat */}
              <div className="absolute top-6 right-0 bg-white/90 dark:bg-black/70 backdrop-blur rounded-xl px-4 py-2.5 shadow-lg">
                <div className="text-xs font-bold text-foreground uppercase tracking-wide">
                  PIE Cup
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {totalPlayers} players registered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features row ── */}
      <section className="border-b border-border bg-muted/40">
        <div className="container py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div
                  className="shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--gradient-pitch)" }}
                >
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Players to Watch slider ── */}
      {spotlightPlayers.length > 0 && (
        <div className="border-b border-border">
          <Slider
            items={spotlightPlayers}
            title="Players to Watch"
            subtitle="Standout squad members across all clubs this season"
            icon={Flame}
            visibleCount={3}
            renderSlide={(player) => (
              <PlayerSpotlight player={player} club={clubMap[player.clubId]} />
            )}
          />
        </div>
      )}

      {/* ── Teams to Watch slider ── */}
      {clubs.length > 0 && (
        <div className="border-b border-border">
          <Slider
            items={clubs}
            title="Teams to Watch"
            subtitle="All registered clubs competing in the PIE Cup"
            icon={Trophy}
            visibleCount={3}
            renderSlide={(club) => (
              <ClubSpotlight
                club={club}
                playerCount={playersByClub(allPlayers, club.id).length}
              />
            )}
          />
        </div>
      )}

      {/* ── Clubs grid ── */}
      <section id="clubs" className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Registered Clubs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {clubs.length} club{clubs.length === 1 ? "" : "s"} ·{" "}
              {totalPlayers} players total
            </p>
          </div>
        </div>

        {clubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <Trophy className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No clubs yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              A super admin can create the first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubs.map((c) => {
              const cPlayers = playersByClub(allPlayers, c.id);
              const count = cPlayers.length;
              const gkCount = cPlayers.filter(
                (p) => p.position === "GK",
              ).length;
              const isComplete = count >= 2 && gkCount >= 2;

              return (
                <Link
                  key={c.id}
                  to={`/clubs/${c.id}`}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-[var(--shadow-card)] hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className="h-1.5 w-full"
                    style={{ background: "var(--gradient-pitch)" }}
                  />

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-14 w-14 shrink-0 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ background: "var(--gradient-pitch)" }}
                      >
                        {c.logoUrl ? (
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            className="h-full w-full object-cover rounded-xl"
                          />
                        ) : (
                          <Trophy className="h-7 w-7 text-primary-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">
                          {c.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {c.city}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {count} / 25
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />{" "}
                          {c.foundedYear}
                        </span>
                      </div>
                      {!isComplete && count > 0 && (
                        <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 text-[10px] font-semibold">
                          Incomplete
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min((count / 25) * 100, 100)}%`,
                            background: "var(--gradient-pitch)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                    <span>View squad</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
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
