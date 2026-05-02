import {
  Player,
  POSITION_NAME,
  POSITION_GROUP,
  PositionGroup,
} from "@/lib/storage";
import { Footprints, Ruler, Weight } from "lucide-react";

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

export function PlayerCard({ player }: Readonly<{ player: Player }>) {
  const fullName = `${player.firstName} ${player.lastName}`.trim();
  const group = POSITION_GROUP[player.position];
  const colors = groupColors[group];

  return (
    <div className="group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/30 animate-fade-in">
      {/* coloured top band */}
      <div className={`h-1.5 w-full ${colors.accent}`} />

      {/* header area */}
      <div className={`relative bg-gradient-to-b ${colors.bg} px-4 pt-4 pb-3`}>
        <div className="flex items-center gap-4">
          {/* avatar */}
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

          {/* name + position */}
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

          {/* big jersey number */}
          <div className={`shrink-0 text-right leading-none`}>
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

      {/* stats row */}
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

      {/* extra metadata */}
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
    </div>
  );
}
