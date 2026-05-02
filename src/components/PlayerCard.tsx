import { Player } from "@/lib/storage";
import { PositionBadge } from "./PositionBadge";
import { Footprints } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function PlayerCard({ player }: { player: Player }) {
  const fullName = `${player.firstName} ${player.lastName}`.trim();
  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 rounded-full bg-secondary overflow-hidden flex items-center justify-center font-bold text-secondary-foreground">
          {player.photoUrl ? (
            <img src={player.photoUrl} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            initials(fullName)
          )}
          <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center border-2 border-card">
            {player.jerseyNumber}
          </span>
        </div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight truncate">{fullName}</div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <PositionBadge position={player.position} />
            {player.preferredFoot && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Footprints className="h-3 w-3" /> {player.preferredFoot}
              </span>
            )}
          </div>
        </div>
      </div>
      {(player.mapGroup || player.churchUnit) && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground space-y-0.5">
          {player.mapGroup && <div><span className="font-medium text-foreground">Map group:</span> {player.mapGroup}</div>}
          {player.churchUnit && <div><span className="font-medium text-foreground">Church unit:</span> {player.churchUnit}</div>}
        </div>
      )}
    </div>
  );
}
