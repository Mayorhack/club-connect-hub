import { Position, POSITION_GROUP, PositionGroup } from "@/lib/storage";

const colors: Record<PositionGroup, string> = {
  GK: "bg-[hsl(var(--pos-gk))] text-[hsl(var(--foreground))]",
  DEF: "bg-[hsl(var(--pos-def))] text-white",
  MID: "bg-[hsl(var(--pos-mid))] text-white",
  FWD: "bg-[hsl(var(--pos-fwd))] text-white",
};

export function PositionBadge({ position }: { position: Position }) {
  const group = POSITION_GROUP[position];
  return (
    <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wide ${colors[group]}`}>
      {position}
    </span>
  );
}