import { Player } from "@/lib/storage";
import { PositionBadge } from "./PositionBadge";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 rounded-full bg-secondary overflow-hidden flex items-center justify-center font-bold text-secondary-foreground">
          {player.photoUrl ? (
            <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
          ) : (
            initials(player.name)
          )}
          <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center border-2 border-card">
            {player.jerseyNumber}
          </span>
        </div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight truncate">{player.name}</div>
          <div className="mt-1"><PositionBadge position={player.position} /></div>
        </div>
      </div>
    </div>
  );
}