import { UserRound } from "lucide-react";

type CoachCardProps = Readonly<{
  role: string;
  name?: string;
  mapGroup?: string;
  serviceUnit?: string;
  photoUrl?: string;
}>;

export function CoachCard({
  role,
  name,
  mapGroup,
  serviceUnit,
  photoUrl,
}: CoachCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center border border-border shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name ? `${name} profile` : role}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {role}
          </p>
          <p className="font-semibold truncate">{name || "Not added"}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-secondary/60 px-2 py-1">
          <span className="text-muted-foreground">Map</span>
          <p className="font-medium truncate">{mapGroup || "-"}</p>
        </div>
        <div className="rounded-md bg-secondary/60 px-2 py-1">
          <span className="text-muted-foreground">Service unit</span>
          <p className="font-medium truncate">{serviceUnit || "-"}</p>
        </div>
      </div>
    </article>
  );
}
