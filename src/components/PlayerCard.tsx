import {
  Player,
  POSITION_NAME,
  POSITION_GROUP,
  PositionGroup,
} from "@/lib/storage";
import { Footprints, Ruler, Weight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const groupColors: Record<
  PositionGroup,
  { bg: string; text: string; badge: string; accent: string }
> = {
  GK: {
    bg: "from-amber-500/20 to-amber-400/5",
    text: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500 text-white",
    accent: "bg-amber-500",
  },
  DEF: {
    bg: "from-blue-600/20 to-blue-500/5",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-600 text-white",
    accent: "bg-blue-600",
  },
  MID: {
    bg: "from-emerald-600/20 to-emerald-500/5",
    text: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-600 text-white",
    accent: "bg-emerald-600",
  },
  FWD: {
    bg: "from-rose-600/20 to-rose-500/5",
    text: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-600 text-white",
    accent: "bg-rose-600",
  },
};

const groupLabel: Record<PositionGroup, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
};

export function PlayerCard({
  player,
  inactive = false,
}: Readonly<{ player: Player; inactive?: boolean }>) {
  const fullName = `${player.firstName} ${player.lastName}`.trim();
  const group = POSITION_GROUP[player.position];
  const colors = groupColors[group];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`group relative block w-full rounded-2xl border border-border bg-card overflow-hidden text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in${
            inactive
              ? " opacity-60 grayscale pointer-events-none"
              : " hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/30"
          }`}
        >
          {inactive && (
            <div className="absolute top-2 right-2 z-10 rounded-full bg-muted border border-border text-muted-foreground text-[10px] font-semibold px-2 py-0.5 leading-none flex items-center">
              Inactive
            </div>
          )}
          <div className={`h-1.5 w-full ${colors.accent}`} />

          <div
            className={`relative bg-gradient-to-b ${colors.bg} px-4 pt-4 pb-3`}
          >
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="h-14 w-14 rounded-full border-2 border-white/60 dark:border-white/20 shadow bg-secondary overflow-hidden flex items-center justify-center text-base font-bold text-secondary-foreground">
                  {player.photoUrl ? (
                    <img
                      src={player.photoUrl}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(fullName)
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm leading-tight truncate">
                  {fullName}
                </div>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${colors.badge}`}
                  >
                    {player.position}
                  </span>
                  <span className={`text-[11px] font-medium ${colors.text}`}>
                    {groupLabel[group]}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {POSITION_NAME[player.position]}
                </div>
              </div>

              <div className="shrink-0 text-right leading-none">
                <div
                  className={`text-4xl font-black tabular-nums ${colors.text} opacity-90`}
                >
                  {player.jerseyNumber}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                  No.
                </div>
              </div>
            </div>
          </div>
          {(player.heightCm != null ||
            player.weightKg != null ||
            player.preferredFoot) && (
            <div className="px-4 py-2.5 flex items-center gap-4 text-[11px] text-muted-foreground border-t border-border bg-muted/20">
              {player.heightCm != null && (
                <span className="inline-flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {player.heightCm} cm
                </span>
              )}
              {player.weightKg != null && (
                <span className="inline-flex items-center gap-1">
                  <Weight className="h-3 w-3" />
                  {player.weightKg} kg
                </span>
              )}
              {player.preferredFoot && (
                <span className="inline-flex items-center gap-1 capitalize">
                  <Footprints className="h-3 w-3" />
                  {player.preferredFoot} foot
                </span>
              )}
            </div>
          )}

          {(player.mapGroup || player.churchUnit) && (
            <div className="px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              {player.mapGroup && (
                <span>
                  <span className="text-foreground/70 font-medium">Group:</span>{" "}
                  {player.mapGroup}
                </span>
              )}
              {player.churchUnit && (
                <span>
                  <span className="text-foreground/70 font-medium">Unit:</span>{" "}
                  {player.churchUnit}
                </span>
              )}
            </div>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <div className={`h-1.5 w-full ${colors.accent}`} />
        <div className="grid lg:grid-cols-[minmax(0,320px)_1fr]">
          <div
            className={`bg-gradient-to-b ${colors.bg} p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-border/60`}
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.25em] ${colors.text}`}
                >
                  Player profile
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {fullName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {POSITION_NAME[player.position]} · {groupLabel[group]}
                </p>
              </div>
              <div className={`text-right leading-none ${colors.text}`}>
                <div className="text-6xl font-black tabular-nums opacity-90">
                  {player.jerseyNumber}
                </div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mt-1">
                  Jersey No.
                </div>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[240px] items-center justify-center">
              <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-white/70 dark:border-white/15 shadow-2xl bg-secondary flex items-center justify-center text-5xl font-black text-secondary-foreground">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(fullName)
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <DialogHeader className="text-left">
              <DialogTitle className="sr-only">{fullName}</DialogTitle>
              <DialogDescription>
                Full squad details for {fullName}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Position
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {POSITION_NAME[player.position]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {groupLabel[group]} group
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Preferred foot
                </p>
                <p className="mt-2 text-lg font-semibold capitalize">
                  {player.preferredFoot ?? "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Physical
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {player.heightCm == null
                    ? "Height not set"
                    : `${player.heightCm} cm`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {player.weightKg == null
                    ? "Weight not set"
                    : `${player.weightKg} kg`}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Map group
                </p>
                <p className="mt-2 text-base font-medium">
                  {player.mapGroup || "Not provided"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Church unit
                </p>
                <p className="mt-2 text-base font-medium">
                  {player.churchUnit || "Not provided"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Summary
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {fullName} wears jersey {player.jerseyNumber} and is registered
                as a {POSITION_NAME[player.position].toLowerCase()}.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
