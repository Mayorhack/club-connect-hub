import { UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const displayName = name || "Not added";
  const imageAlt = name ? `${name} profile` : role;

  const avatar = (
    <div className="h-14 w-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center border border-border shrink-0">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
      ) : (
        <UserRound className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <article className="rounded-xl cursor-pointer hover:translate-y-1 border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <button
                type="button"
                className="rounded-full transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`View ${displayName} photo`}
              >
                {avatar}
              </button>
            ) : (
              avatar
            )}

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {role}
              </p>
              <p className="font-semibold truncate">{displayName}</p>
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
      </DialogTrigger>

      {photoUrl && (
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-[minmax(0,400px)_1fr]">
            <div className="bg-secondary/40 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border/60">
              <div className="mx-auto flex w-full max-w-sm items-center justify-center">
                <div className="relative sm:h-80 sm:w-80 overflow-hidden rounded-full border-4 border-white/70 dark:border-white/15 shadow-2xl bg-secondary flex items-center justify-center">
                  <img
                    src={photoUrl}
                    alt={imageAlt}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <DialogHeader className="text-left">
                <DialogTitle>{displayName}</DialogTitle>
                <DialogDescription>{role} profile details.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Role
                  </p>
                  <p className="mt-2 text-lg font-semibold">{role}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Map
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {mapGroup || "Not set"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Service unit
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {serviceUnit || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
