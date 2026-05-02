import { useState, useEffect, useCallback, useRef } from "react";
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
import lakeside2 from "@/assets/lakeside2.jpeg";
import lakeside3 from "@/assets/lakeside3.jpeg";
import lakeside4 from "@/assets/lakeside4.jpeg";
import lakeside from "@/assets/lakeside.jpg";

const HERO_SLIDES = [
  {
    image: lakeside,
    title: "Welcome to PIE Football Cup",
    desc: "Celebration Church International's premier football competition. Browse participating clubs, explore full squads, and follow your favourite players.",
    cta1: { text: "Browse clubs", href: "#clubs" },
    cta2: { text: "Join as a club admin", href: "/signup" },
  },
  {
    image: lakeside2,
    title: "Lead your CCI Football Cup team",
    desc: "Club admins can add players, track positions, and keep everything organized for your PIE Cup squad.",
    cta1: { text: "View clubs", href: "#clubs" },
    cta2: { text: "Register your club", href: "/signup" },
  },
  {
    image: lakeside3,
    title: "Discover CCI's finest talent",
    desc: "Explore player profiles from across the PIE Cup with detailed stats, positions, and club information.",
    cta1: { text: "Find players", href: "#clubs" },
    cta2: { text: "Create account", href: "/signup" },
  },
  {
    image: lakeside4,
    title: "Compete in the PIE Football Cup",
    desc: "Register your club for Celebration Church International's flagship football competition and showcase your squad's strength.",
    cta1: { text: "View clubs", href: "#clubs" },
    cta2: { text: "Register now", href: "/signup" },
  },
  {
    image: lakeside,
    title: "Join the PIE Football Community",
    desc: "Connect with clubs, players, and teams across Celebration Church International's football network.",
    cta1: { text: "Browse clubs", href: "#clubs" },
    cta2: { text: "Get started", href: "/signup" },
  },
];

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

// ── Scroll-reveal hooks ──────────────────────────────────────────────────────
function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.classList.add("visible");
    // Immediately visible on load (e.g. after refresh)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      show();
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          show();
          obs.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useRevealContainer() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const showAll = () =>
      container
        .querySelectorAll<HTMLElement>(".reveal")
        .forEach((el) => el.classList.add("visible"));
    // Immediately visible on load (e.g. after refresh)
    const rect = container.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      showAll();
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          showAll();
          obs.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(container);
    return () => obs.disconnect();
  }, []);
  return ref;
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

// ── Hero Carousel Component ──────────────────────────────────────────────────
function HeroCarousel({
  slides,
  clubs,
  totalPlayers,
}: Readonly<{
  slides: Array<{
    image: string;
    title: string;
    desc: string;
    cta1: { text: string; href: string };
    cta2: { text: string; href: string };
  }>;
  clubs: Club[];
  totalPlayers: number;
}>) {
  const { idx, prev, next, setIdx } = useSlider(slides.length);
  const slide = slides[idx];

  return (
    <div className="relative w-full h-[500px] sm:h-[720px] overflow-hidden">
      {/* Background image with overlay */}
      {slides.map((s, i) => (
        <div
          key={`slide-${i}-${s.title}`}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full container flex items-center">
        <div key={idx} className="max-w-lg z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide uppercase mb-6 text-white anim-fade-in">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            PIE Cup — Season 2026
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white anim-fade-up anim-delay-100">
            {slide.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/90 leading-relaxed anim-fade-up anim-delay-200">
            {slide.desc}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 anim-fade-up anim-delay-300">
            <a
              href={slide.cta1.href}
              className="inline-flex items-center gap-2 rounded-lg bg-white text-black font-semibold px-5 py-2.5 text-sm shadow hover:opacity-90 transition"
            >
              {slide.cta1.text} <ChevronRight className="h-4 w-4" />
            </a>
            <Link
              to={slide.cta2.href}
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 border border-white/30 text-white font-medium px-5 py-2.5 text-sm hover:bg-white/25 transition"
            >
              {slide.cta2.text}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 hidden sm:flex flex-wrap gap-8 anim-fade-up anim-delay-500">
            <div>
              <div className="text-3xl font-extrabold text-white">
                {clubs.length}
              </div>
              <div className="text-xs text-white/70 mt-1 uppercase tracking-wide">
                Clubs
              </div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-3xl font-extrabold text-white">
                {totalPlayers}
              </div>
              <div className="text-xs text-white/70 mt-1 uppercase tracking-wide">
                Players
              </div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-3xl font-extrabold text-white">17</div>
              <div className="text-xs text-white/70 mt-1 uppercase tracking-wide">
                Positions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((slide) => (
            <button
              key={`dot-${slide.title}`}
              onClick={() => setIdx(slides.indexOf(slide))}
              className={`h-2 rounded-full transition-all ${
                slides.indexOf(slide) === idx
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to ${slide.title} slide`}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="ml-2 flex gap-2">
          <button
            onClick={prev}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
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
  const sectionRef = useReveal<HTMLElement>();

  const visible = items.slice(
    idx * visibleCount,
    idx * visibleCount + visibleCount,
  );

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className="container py-12 reveal">
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
  const featuresContainerRef = useRevealContainer();

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
      {/* ── Hero Carousel ── */}
      <section className="relative overflow-hidden border-b border-border bg-black">
        <HeroCarousel
          slides={HERO_SLIDES}
          clubs={clubs}
          totalPlayers={totalPlayers}
        />
      </section>

      {/* ── Features row ── */}
      <section className="border-b border-border bg-muted/40">
        <div className="container py-10">
          <div
            ref={featuresContainerRef}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex gap-4 reveal"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
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
        <div className="flex items-end justify-between mb-8 anim-fade-up">
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
            {clubs.map((c, i) => {
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
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-[var(--shadow-card)] hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 anim-fade-up"
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
