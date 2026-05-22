import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  getClubs,
  getFixtures,
  type MatchFixture,
  type Club,
  getTopScorers,
  TopScorers,
  Position,
} from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
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
import crustMfbWhiteLogo from "@/assets/crust mfb (white).png";
import fruitylifeLogo from "@/assets/fruitylife.png";
import lakeside2 from "@/assets/lakeside2.jpeg";
import lakeside3 from "@/assets/lakeside3.jpeg";
import lakeside4 from "@/assets/lakeside4.jpeg";
import lakeside from "@/assets/lakeside.jpg";
import apostle1 from "@/assets/741A5448.jpg";
import apostle2 from "@/assets/741A5452.jpg";
import apostle3 from "@/assets/741A5456.jpg";
import Logo from "@/components/logo";
import ubiLogo from "@/assets/ubi.png";
import bdiLogo from "@/assets/bdi.jpeg";
import kazoLogo from "@/assets/kazo.jpeg";
import theCaveLogo from "@/assets/the-cave.jpeg";
import landRepublicLogo from "@/assets/land-republic.PNG";

const HERO_SLIDES = [
  {
    image: apostle3,
    title: "Welcome to PIE Football Cup",
    desc: "Celebration Church International's premier football competition. Browse participating clubs, explore full squads, and follow your favourite players.",
    cta1: { text: "Browse clubs", href: "#clubs" },
    cta2: { text: "Join as a club admin", href: "/signup" },
    mobileOnly: true,
  },
  {
    image: apostle2,
    title: "Lead your CCI Football Cup team",
    desc: "Club admins can add players, track positions, and keep everything organized for your PIE Cup squad.",
    cta1: { text: "View clubs", href: "#clubs" },
    cta2: { text: "Register your club", href: "/signup" },
    mobileOnly: false,
  },
  {
    image: lakeside3,
    title: "Discover CCI's finest talent",
    desc: "Explore player profiles from across the PIE Cup with detailed stats, positions, and club information.",
    cta1: { text: "Find players", href: "#clubs" },
    cta2: { text: "Create account", href: "/signup" },
    mobileOnly: false,
  },
  {
    image: lakeside4,
    title: "Compete in the PIE Football Cup",
    desc: "Register your club for Celebration Church International's flagship football competition and showcase your squad's strength.",
    cta1: { text: "View clubs", href: "#clubs" },
    cta2: { text: "Register now", href: "/signup" },
    mobileOnly: false,
  },
  {
    image: lakeside,
    title: "Join the PIE Football Community",
    desc: "Connect with clubs, players, and teams across Celebration Church International's football network.",
    cta1: { text: "Browse clubs", href: "#clubs" },
    cta2: { text: "Get started", href: "/signup" },
    mobileOnly: false,
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

const SPONSORS = [
  {
    name: "Crust Microfinance Bank",
    logo: crustMfbWhiteLogo,
    tier: "gold",
    description: "Official Sponsor",
    appreciation:
      "We acknowledge Crust Microfinance Bank for supporting the PIE Football Cup and helping us create a stronger competition experience for clubs, players, and supporters.",
  },
  {
    name: "FruityLife",
    logo: fruitylifeLogo,
    tier: "silver",
    description: "Silver Partner",
    appreciation:
      "We thank FruityLife for their continued partnership and support of the PIE Football Cup.",
  },
];
const otherSponsors = [
  {
    name: "UBI",
    logo: ubiLogo,
    tier: "bronze",
    description: "Official Sponsor",
    appreciation:
      "We acknowledge UBI for supporting the PIE Football Cup and helping us fuel our athletes and community.",
  },
  {
    name: "BDI",
    logo: bdiLogo,
    tier: "bronze",
    description: "Official Sponsor",
    appreciation:
      "We thank BDI for their exceptional partnership and contribution to the development and success of the PIE Football Cup.",
  },
  {
    name: "Kazo",
    logo: kazoLogo,
    tier: "bronze",
    description: "Official Partner",
    appreciation:
      "We appreciate Kazo for partnering with us to deliver an exciting and energy-packed tournament.",
  },
  {
    name: "The Cave",
    logo: theCaveLogo,
    tier: "bronze",
    description: "Official Partner",
    appreciation:
      "We are grateful to The Cave for their sponsorship and dedication to supporting our local sports community.",
  },
  {
    name: "Land Republic",
    logo: landRepublicLogo,
    tier: "bronze",
    description: "Official Sponsor",
    appreciation:
      "We thank Land Republic for their valuable partnership and support in making the PIE Football Cup a success.",
  },
];

function formatFixtureDate(dateIso: string): string {
  const dt = new Date(`${dateIso}T12:00:00`);
  return dt.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function UpcomingFixtureCard({
  fixture,
  homeName,
  awayName,
}: Readonly<{ fixture: MatchFixture; homeName: string; awayName: string }>) {
  const [venueOpen, setVenueOpen] = useState(false);
  const hasVenueInfo = !!(fixture.venueMapsUrl || fixture.venueDirections);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Matchday {fixture.matchday} · {formatFixtureDate(fixture.kickoffDate)}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold truncate">{homeName}</p>
        <span className="text-xs text-muted-foreground">vs</span>
        <p className="text-sm font-semibold truncate text-right">{awayName}</p>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {fixture.venue && (
          <p className="text-xs text-muted-foreground truncate">
            {fixture.venue}
          </p>
        )}
        {hasVenueInfo && (
          <button
            type="button"
            onClick={() => setVenueOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
          >
            <MapPin className="h-3 w-3" />
            How to get there
          </button>
        )}
      </div>

      <Dialog open={venueOpen} onOpenChange={setVenueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              How to get there
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            {fixture.venue && <p className="font-medium">{fixture.venue}</p>}
            {fixture.venueDirections && (
              <p className="text-muted-foreground">{fixture.venueDirections}</p>
            )}
            {fixture.venueMapsUrl && (
              <a
                href={fixture.venueMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
function PlayerSpotlight({ player }: Readonly<{ player: TopScorers }>) {
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
          <PositionBadge position={player.position as unknown as Position} />
          <span className="text-xs text-muted-foreground">
            #{player.jerseyNumber}
          </span>
        </div>
        {player.clubName && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Logo />
            <span className="truncate">{player.clubName}</span>
          </div>
        )}
        <div className="mt-2 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold">
          {player.goals} goal{player.goals === 1 ? "" : "s"}
        </div>
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
  clubsCount,
  totalPlayers,
}: Readonly<{
  slides: Array<{
    image: string;
    title: string;
    desc: string;
    cta1: { text: string; href: string };
    cta2: { text: string; href: string };
  }>;
  clubsCount: number;
  totalPlayers: number;
}>) {
  const { idx, prev, next, setIdx } = useSlider(slides.length);
  const slide = slides[idx];

  return (
    <div className="relative w-full h-[500px] sm:h-[800px] overflow-hidden">
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
            className="w-full h-full object-cover object-top sm:object-top "
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full container sm:mt-0 mt-8 flex items-center">
        <div key={idx} className="max-w-lg z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide uppercase mb-6 text-white anim-fade-in">
            <div className="h-1.5 w-1.5 rounded-full  bg-white animate-pulse" />
            PIE Cup — Season 2026
          </div>

          <h1 className="text-2xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white anim-fade-up anim-delay-100">
            {slide.title}
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-white/90 leading-relaxed anim-fade-up anim-delay-200">
            {slide.desc}
          </p>

          <div className=" hidden mt-8 md:flex flex-wrap gap-3 anim-fade-up anim-delay-300">
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
                {clubsCount}
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
            <div>
              <div className="text-3xl font-extrabold text-white">11</div>
              <div className="text-xs text-white/70 mt-1 uppercase tracking-wide">
                Matches
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
  goalsScored,
}: Readonly<{ club: Club; playerCount: number; goalsScored: number }>) {
  return (
    <Link
      to={`/clubs/${club.id}`}
      className="group block rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-card to-muted hover:border-primary/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 p-5 h-full"
    >
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 rounded-xl flex items-center justify-center shadow">
          {club.logoUrl ? (
            <img
              src={club.logoUrl}
              alt={club.name}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <Logo />
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
          <div className="font-bold text-lg leading-none">{goalsScored}</div>
          <div className="text-muted-foreground mt-0.5">Goals</div>
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

// ── Sponsor card (full-width) ────────────────────────────────────────────────
function SponsorCard({
  sponsor,
}: Readonly<{
  sponsor: {
    name: string;
    logo: string;
    tier: string;
    description: string;
    appreciation: string;
  };
}>) {
  const isGold = sponsor.tier === "gold";
  return (
    <div
      className={`${
        isGold
          ? "bg-[radial-gradient(circle_at_top_left,_rgba(235,179,66,0.18),_transparent_40%),linear-gradient(135deg,#111827,#0f172a_55%,#1f2937)] text-white"
          : "bg-[radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_40%),linear-gradient(135deg,#1a1a2e,#16213e_55%,#0f3460)] text-white"
      } w-full`}
    >
      <div className="container grid gap-8 py-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.28em] ${
              isGold ? "text-amber-200/90" : "text-purple-300/90"
            }`}
          >
            {sponsor.description}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Proudly supported by {sponsor.name}.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            {sponsor.appreciation}
          </p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/8 p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 p-6">
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="max-h-20 w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Other sponsors auto-scroll strip ─────────────────────────────────────────
function OtherSponsorsStrip({
  sponsors,
}: Readonly<{
  sponsors: Array<{ name: string; logo: string }>;
}>) {
  // Duplicate the list so the strip loops seamlessly
  const doubled = [...sponsors, ...sponsors, ...sponsors];
  return (
    <div className="border-b border-border bg-muted/30 py-5 overflow-hidden">
      <div
        className="flex gap-12 items-center"
        style={{
          width: "max-content",
          animation: `marquee ${sponsors.length * 4}s linear infinite`,
        }}
      >
        {doubled.map((sp, i) => (
          <div
            key={`strip-${sp.name}-${i}`}
            className="flex-shrink-0 h-14 w-28 flex items-center justify-center px-2"
          >
            <img
              src={sp.logo}
              alt={sp.name}
              className="max-h-full max-w-full object-contain  opacity-100 hover:scale-105 transition-all duration-300"
            />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ── Sponsors carousel (endless scroll) ────────────────────────────────────────
function SponsorsCarousel({
  sponsors,
}: Readonly<{
  sponsors: Array<{
    name: string;
    logo: string;
    tier: string;
    description: string;
    appreciation: string;
  }>;
}>) {
  const { idx, prev, next } = useSlider(sponsors.length);
  const sponsor = sponsors[idx];

  return (
    <div className="border-b border-border overflow-hidden">
      <div
        className="transition-all duration-500 ease-out"
        style={{
          transform: `translateX(-${idx * 100}%)`,
        }}
      >
        <div className="flex">
          {sponsors.map((sp) => (
            <div key={`sponsor-${sp.name}`} className="w-full flex-shrink-0">
              <SponsorCard sponsor={sp} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {sponsors.length > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <button
            onClick={prev}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition"
            aria-label="Previous sponsor"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex gap-2">
            {sponsors.map((_, i) => (
              <div
                key={`dot-${i}`}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-5 bg-primary" : "w-2 bg-border"
                }`}
                aria-label={`Sponsor ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition"
            aria-label="Next sponsor"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
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
  icon?: React.ElementType;
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
            {Icon && (
              <Icon
                className="h-5 w-5"
                style={{ color: "hsl(var(--primary))" }}
              />
            )}
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

  const { data: topScorers = [] } = useQuery({
    queryKey: ["top_scorers"],
    queryFn: getTopScorers,
  });
  const { data: fixtures = [] } = useQuery({
    queryKey: ["fixtures"],
    queryFn: getFixtures,
  });
  // const { data: totals = { totalClubs: 0, totalPlayers: 0 } } = useQuery({
  //   queryKey: ["totals"],
  //   queryFn: getTotals,
  // });

  const clubMap = Object.fromEntries(clubs.map((c) => [c.id, c]));
  const featuresContainerRef = useRevealContainer();

  const spotlightPlayers = topScorers;

  const goalsByClubId = fixtures.reduce<Record<string, number>>(
    (acc, fixture) => {
      if (fixture.homeScore !== undefined) {
        acc[fixture.homeClubId] =
          (acc[fixture.homeClubId] ?? 0) + fixture.homeScore;
      }
      if (fixture.awayScore !== undefined) {
        acc[fixture.awayClubId] =
          (acc[fixture.awayClubId] ?? 0) + fixture.awayScore;
      }
      return acc;
    },
    {},
  );

  const teamWatchClubs = [...clubs]
    .sort((a, b) => {
      const goalsA = goalsByClubId[a.id] ?? 0;
      const goalsB = goalsByClubId[b.id] ?? 0;
      if (goalsB !== goalsA) return goalsB - goalsA;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 6);

  const upcomingFixtures = [...fixtures]
    .filter(
      (fixture) =>
        fixture.homeScore === undefined && fixture.awayScore === undefined,
    )
    .sort((a, b) => {
      if (a.matchday !== b.matchday) return a.matchday - b.matchday;
      return a.kickoffDate.localeCompare(b.kickoffDate);
    })
    .slice(0, 3);

  return (
    <Layout>
      {/* ── Hero Carousel ── */}
      <section className="relative overflow-hidden border-b border-border bg-black">
        <HeroCarousel slides={HERO_SLIDES} clubsCount={7} totalPlayers={175} />
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
                <div className="shrink-0 h-10 w-10 rounded-lg flex items-center justify-center">
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

      {/* ── Sponsors carousel (endless scroll) ── */}
      <SponsorsCarousel sponsors={SPONSORS} />

      {/* ── Other sponsors logo strip ── */}
      <OtherSponsorsStrip sponsors={otherSponsors} />

      {/* ── Upcoming fixtures ── */}
      <section className="border-b border-border bg-background">
        <div className="container py-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Upcoming Fixtures</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Next matches to watch in the PIE Cup.
              </p>
            </div>
            <Link
              to="/competition"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all fixtures <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {upcomingFixtures.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No upcoming fixtures yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingFixtures.map((fixture) => (
                <UpcomingFixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  homeName={clubMap[fixture.homeClubId]?.name ?? "Unknown"}
                  awayName={clubMap[fixture.awayClubId]?.name ?? "Unknown"}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Players to Watch slider ── */}
      {spotlightPlayers.length > 0 && (
        <div className="border-b border-border">
          <Slider
            items={spotlightPlayers}
            title="Players to Watch"
            subtitle="Top goal scorers across all clubs this season"
            icon={Flame}
            visibleCount={3}
            renderSlide={(player) => <PlayerSpotlight player={player} />}
          />
        </div>
      )}

      {/* ── Teams to Watch slider ── */}
      {teamWatchClubs.length > 0 && (
        <div className="border-b border-border">
          <Slider
            items={teamWatchClubs}
            title="Teams to Watch"
            subtitle="Clubs with the highest goals scored"
            visibleCount={4}
            renderSlide={(club) => (
              <ClubSpotlight
                club={club}
                playerCount={club.playerCount ?? 0}
                goalsScored={goalsByClubId[club.id] ?? 0}
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
              {clubs.reduce((sum, c) => sum + (c.playerCount ?? 0), 0)} players
              total
            </p>
          </div>
        </div>

        {clubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <Logo />
            <p className="text-muted-foreground font-medium">No clubs yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              A super admin can create the first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubs.map((c, i) => {
              const completePlayerCount = c.playerCount ?? 0;
              const isComplete = completePlayerCount >= 11;

              return (
                <Link
                  key={c.id}
                  to={`/clubs/${c.id}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-[var(--shadow-card)] hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 anim-fade-up"
                >
                  <div className="h-1.5 w-full" />

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-xl flex items-center justify-center shadow-sm">
                        {c.logoUrl ? (
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            className="h-full w-full object-cover rounded-xl"
                          />
                        ) : (
                          <Logo />
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
                          <Users className="h-3.5 w-3.5" />{" "}
                          {completePlayerCount} / 25
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />{" "}
                          {c.foundedYear}
                        </span>
                      </div>
                      {!isComplete && completePlayerCount > 0 && (
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
                            width: `${Math.min((completePlayerCount / 25) * 100, 100)}%`,
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
