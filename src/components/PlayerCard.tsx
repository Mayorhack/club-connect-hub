import { Player, POSITION_NAME, POSITION_GROUP, PositionGroup } from "@/lib/storage";
import { Footprints, Ruler, Weight } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const groupLabel: Record<PositionGroup, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
};

export function PlayerCard({ player }: { player: Player }) {
  const fullName = `${player.firstName} ${player.lastName}`.trim();
  const group = POSITION_GROUP[player.position];
  return (
    <div className="group relative rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)] animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-sm font-semibold text-secondary-foreground">
          {player.photoUrl ? (
            <img src={player.photoUrl} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            initials(fullName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground">#{player.jerseyNumber}</span>
            <span className="font-medium leading-tight truncate">{fullName}</span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground truncate">
            {POSITION_NAME[player.position]} <span className="opacity-50">· {groupLabel[group]}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {player.heightCm != null && (
          <span className="inline-flex items-center gap-1"><Ruler className="h-3 w-3" />{player.heightCm} cm</span>
        )}
        {player.weightKg != null && (
          <span className="inline-flex items-center gap-1"><Weight className="h-3 w-3" />{player.weightKg} kg</span>
        )}
        {player.preferredFoot && (
          <span className="inline-flex items-center gap-1 capitalize"><Footprints className="h-3 w-3" />{player.preferredFoot}</span>
        )}
      </div>

      {(player.mapGroup || player.churchUnit) && (
        <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground space-y-0.5">
          {player.mapGroup && <div><span className="text-foreground/80">Map group:</span> {player.mapGroup}</div>}
          {player.churchUnit && <div><span className="text-foreground/80">Church unit:</span> {player.churchUnit}</div>}
        </div>
      )}
    </div>
  );
}
