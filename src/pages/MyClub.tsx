import { FormEvent, useState, ChangeEvent, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import {
  ALL_POSITIONS,
  Foot,
  getClubs,
  getPlayersByClub,
  Player,
  Position,
  POSITION_NAME,
  createPlayer,
  deletePlayer,
  updateClub,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
  RefreshCw,
} from "lucide-react";
import { getPlayerRegistrationDeadlineStatus } from "@/lib/registrationDeadline";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";
import { PlayerCard } from "@/components/PlayerCard";

const FEET: Foot[] = ["right", "left", "both"];

const emptyForm = {
  firstName: "",
  lastName: "",
  position: "CM" as Position,
  jerseyNumber: 1,
  mapGroup: "",
  churchUnit: "",
  preferredFoot: "right" as Foot,
  photoUrl: "",
  heightCm: "" as string,
  weightKg: "" as string,
};

function PhotoPreview({
  uploading,
  url,
  alt,
}: Readonly<{
  uploading: boolean;
  url: string;
  alt: string;
}>) {
  if (uploading) return <span className="animate-spin text-base">⏳</span>;
  if (url)
    return <img src={url} alt={alt} className="h-full w-full object-cover" />;
  return <Upload className="h-5 w-5" />;
}

function saveButtonLabel(saving: boolean, uploading: boolean) {
  if (saving) return "Saving…";
  if (uploading) return "Uploading photo…";
  return "Save changes";
}

export default function MyClub() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const deadline = getPlayerRegistrationDeadlineStatus();
  const { data: clubs = [] } = useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
  });
  const club = clubs.find((c) => c.id === user?.clubId);
  const { data: players = [] } = useQuery({
    queryKey: ["players", user?.clubId],
    queryFn: () => getPlayersByClub(user?.clubId ?? ""),
    enabled: !!user?.clubId,
  });

  function handleRefreshSquad() {
    if (!user?.clubId) return;
    qc.invalidateQueries({ queryKey: ["players", user.clubId] });
    toast.success("Squad data refreshed from server.");
  }
  const gkCount = players.filter((p) => p.position === "GK").length;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Club info edit
  const [editName, setEditName] = useState(club?.name ?? "");
  const [editCity, setEditCity] = useState(club?.city ?? "");
  const [editYear, setEditYear] = useState<number>(
    club?.foundedYear ?? new Date().getFullYear(),
  );
  const [editLogo, setEditLogo] = useState(club?.logoUrl ?? "");
  const [editCoachName, setEditCoachName] = useState(club?.coachName ?? "");
  const [editCoachMapGroup, setEditCoachMapGroup] = useState(
    club?.coachMapGroup ?? "",
  );
  const [editCoachServiceUnit, setEditCoachServiceUnit] = useState(
    club?.coachServiceUnit ?? "",
  );
  const [editCoachPhotoUrl, setEditCoachPhotoUrl] = useState(
    club?.coachPhotoUrl ?? "",
  );
  const [editAssistantCoachName, setEditAssistantCoachName] = useState(
    club?.assistantCoachName ?? "",
  );
  const [editAssistantCoachMapGroup, setEditAssistantCoachMapGroup] = useState(
    club?.assistantCoachMapGroup ?? "",
  );
  const [editAssistantCoachServiceUnit, setEditAssistantCoachServiceUnit] =
    useState(club?.assistantCoachServiceUnit ?? "");
  const [editAssistantCoachPhotoUrl, setEditAssistantCoachPhotoUrl] = useState(
    club?.assistantCoachPhotoUrl ?? "",
  );
  const [savingClub, setSavingClub] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!club) return;
    setEditName(club.name);
    setEditCity(club.city);
    setEditYear(club.foundedYear);
    setEditLogo(club.logoUrl ?? "");
    setEditCoachName(club.coachName ?? "");
    setEditCoachMapGroup(club.coachMapGroup ?? "");
    setEditCoachServiceUnit(club.coachServiceUnit ?? "");
    setEditCoachPhotoUrl(club.coachPhotoUrl ?? "");
    setEditAssistantCoachName(club.assistantCoachName ?? "");
    setEditAssistantCoachMapGroup(club.assistantCoachMapGroup ?? "");
    setEditAssistantCoachServiceUnit(club.assistantCoachServiceUnit ?? "");
    setEditAssistantCoachPhotoUrl(club.assistantCoachPhotoUrl ?? "");
  }, [club]);

  if (!club) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">
            You're not assigned to a club yet. Ask the super admin to assign
            you.
          </p>
        </div>
      </Layout>
    );
  }

  const saveClub = (e: FormEvent) => {
    e.preventDefault();
    setSavingClub(true);
    updateClub(club.id, {
      name: editName.trim(),
      city: editCity.trim(),
      foundedYear: editYear,
      logoUrl: editLogo.trim() || undefined,
      coachName: editCoachName.trim() || undefined,
      coachMapGroup: editCoachMapGroup.trim() || undefined,
      coachServiceUnit: editCoachServiceUnit.trim() || undefined,
      coachPhotoUrl: editCoachPhotoUrl || undefined,
      assistantCoachName: editAssistantCoachName.trim() || undefined,
      assistantCoachMapGroup: editAssistantCoachMapGroup.trim() || undefined,
      assistantCoachServiceUnit:
        editAssistantCoachServiceUnit.trim() || undefined,
      assistantCoachPhotoUrl: editAssistantCoachPhotoUrl || undefined,
    })
      .then(() => {
        toast.success("Club updated");
        return qc.invalidateQueries({ queryKey: ["clubs"] });
      })
      .catch((err: Error) => toast.error(err.message))
      .finally(() => setSavingClub(false));
  };

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Image must be under 5MB");
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, photoUrl: url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleCoachImage = async (
    e: ChangeEvent<HTMLInputElement>,
    target: "coach" | "assistant",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (target === "coach") {
        setEditCoachPhotoUrl(url);
      } else {
        setEditAssistantCoachPhotoUrl(url);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const addPlayer = (e: FormEvent) => {
    e.preventDefault();
    if (players.length >= 25) return toast.error("Squad limit (25) reached");
    if (!form.firstName.trim() || !form.lastName.trim())
      return toast.error("First and last name required");
    if (form.jerseyNumber < 1 || form.jerseyNumber > 99)
      return toast.error("Jersey number must be 1–99");
    if (players.some((p) => p.jerseyNumber === form.jerseyNumber))
      return toast.error(`Jersey #${form.jerseyNumber} already taken`);
    if (!form.photoUrl) return toast.error("Player photo is required");
    const newPlayer: Omit<Player, "id"> = {
      clubId: club.id,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      position: form.position,
      jerseyNumber: form.jerseyNumber,
      mapGroup: form.mapGroup.trim() || undefined,
      churchUnit: form.churchUnit.trim() || undefined,
      preferredFoot: form.preferredFoot,
      photoUrl: form.photoUrl || undefined,
      heightCm: form.heightCm ? Number(form.heightCm) : undefined,
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
    };
    createPlayer(newPlayer)
      .then(() => {
        toast.success("Player added");
        setOpen(false);
        setForm(emptyForm);
        return qc.invalidateQueries({ queryKey: ["players", user?.clubId] });
      })
      .catch((err: Error) => toast.error(err.message));
  };

  const removePlayer = (id: string) => {
    if (!confirm("Remove this player?")) return;
    deletePlayer(id)
      .then(() => qc.invalidateQueries({ queryKey: ["players", user?.clubId] }))
      .catch((err: Error) => toast.error(err.message));
  };

  const squadFull = players.length >= 25;
  const gkOk = gkCount >= 1;

  return (
    <Layout>
      <div className="container py-10 space-y-10">
        <header>
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <p className="text-sm text-muted-foreground">
            Manage your squad and club info.
          </p>
        </header>

        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-950">
                Player registration deadline: {deadline.deadlineLabel}
              </p>
              <p className="mt-1 text-sm text-amber-900/90">
                {deadline.message}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={`rounded-xl border p-4 flex items-start gap-3 ${squadFull ? "border-accent/40 bg-accent/10" : "border-border bg-card"}`}
          >
            {squadFull ? (
              <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            )}
            <div>
              <div className="font-semibold">Squad size</div>
              <div className="text-sm text-muted-foreground">
                {players.length} of 25 players
              </div>
            </div>
          </div>
          <div
            className={`rounded-xl border p-4 flex items-start gap-3 ${gkOk ? "border-border bg-card" : "border-destructive/40 bg-destructive/5"}`}
          >
            {gkOk ? (
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            )}
            <div>
              <div className="font-semibold">Goalkeepers</div>
              <div className="text-sm text-muted-foreground">
                {gkCount} of minimum 1
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Squad</h2>
              <button
                onClick={handleRefreshSquad}
                title="Refresh squad from server"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            {deadline.isClosed ? (
              <p className="text-sm text-red-600 font-medium">
                Deadline breached. Please reach out to the admin to pay your
                fine of ₦25,000.
              </p>
            ) : (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button disabled={squadFull}>
                    <Plus className="h-4 w-4 mr-1" /> Add player
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add player</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={addPlayer} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>First name</Label>
                        <Input
                          value={form.firstName}
                          onChange={(e) =>
                            setForm({ ...form, firstName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Last name</Label>
                        <Input
                          value={form.lastName}
                          onChange={(e) =>
                            setForm({ ...form, lastName: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Player number</Label>
                        <Input
                          type="number"
                          value={form.jerseyNumber}
                          min={1}
                          max={99}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              jerseyNumber: Number(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Select
                          value={form.position}
                          onValueChange={(v) =>
                            setForm({ ...form, position: v as Position })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {ALL_POSITIONS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {POSITION_NAME[p]} ({p})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Height (cm)</Label>
                        <Input
                          type="number"
                          min={100}
                          max={230}
                          value={form.heightCm}
                          onChange={(e) =>
                            setForm({ ...form, heightCm: e.target.value })
                          }
                          placeholder="e.g. 180"
                        />
                      </div>
                      <div>
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          min={30}
                          max={150}
                          value={form.weightKg}
                          onChange={(e) =>
                            setForm({ ...form, weightKg: e.target.value })
                          }
                          placeholder="e.g. 75"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Map group</Label>
                        <Input
                          value={form.mapGroup}
                          onChange={(e) =>
                            setForm({ ...form, mapGroup: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Church unit</Label>
                        <Input
                          value={form.churchUnit}
                          onChange={(e) =>
                            setForm({ ...form, churchUnit: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Preferred foot</Label>
                      <Select
                        value={form.preferredFoot}
                        onValueChange={(v) =>
                          setForm({ ...form, preferredFoot: v as Foot })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FEET.map((f) => (
                            <SelectItem
                              key={f}
                              value={f}
                              className="capitalize"
                            >
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Player photo</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="h-14 w-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs text-muted-foreground border border-border">
                          <PhotoPreview
                            uploading={uploading}
                            url={form.photoUrl}
                            alt="preview"
                          />
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImage}
                          className="cursor-pointer"
                          disabled={uploading}
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={uploading}
                    >
                      {uploading ? "Uploading photo…" : "Add to squad"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {players.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No players yet — add your first.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p, i) => {
                return (
                  <div
                    key={p.id}
                    className="group relative animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <PlayerCard player={p} />
                    <button
                      onClick={() => removePlayer(p.id)}
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Club info</h2>
          <form
            onSubmit={saveClub}
            className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border bg-card p-5 sm:p-6"
          >
            <div>
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
              />
            </div>
            <div>
              <Label>Founded year</Label>
              <Input
                type="number"
                value={editYear}
                onChange={(e) => setEditYear(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={editLogo}
                onChange={(e) => setEditLogo(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2 border-t border-border pt-4">
              <h3 className="font-semibold">Coach details</h3>
            </div>
            <div>
              <Label>Coach name</Label>
              <Input
                value={editCoachName}
                onChange={(e) => setEditCoachName(e.target.value)}
                placeholder="Head coach name"
              />
            </div>
            <div>
              <Label>Coach map</Label>
              <Input
                value={editCoachMapGroup}
                onChange={(e) => setEditCoachMapGroup(e.target.value)}
                placeholder="e.g. MAP 4"
              />
            </div>
            <div>
              <Label>Coach service unit</Label>
              <Input
                value={editCoachServiceUnit}
                onChange={(e) => setEditCoachServiceUnit(e.target.value)}
                placeholder="e.g. Ushering"
              />
            </div>
            <div>
              <Label>Coach photo</Label>
              <div className="flex items-center gap-3 mt-1">
                <div className="h-14 w-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs text-muted-foreground border border-border">
                  <PhotoPreview
                    uploading={uploading}
                    url={editCoachPhotoUrl}
                    alt="coach preview"
                  />
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoachImage(e, "coach")}
                  className="cursor-pointer"
                  disabled={uploading}
                />
              </div>
            </div>
            <div className="sm:col-span-2 border-t border-border pt-4">
              <h3 className="font-semibold">Assistant coach details</h3>
            </div>
            <div>
              <Label>Assistant coach name</Label>
              <Input
                value={editAssistantCoachName}
                onChange={(e) => setEditAssistantCoachName(e.target.value)}
                placeholder="Assistant coach name"
              />
            </div>
            <div>
              <Label>Assistant coach map</Label>
              <Input
                value={editAssistantCoachMapGroup}
                onChange={(e) => setEditAssistantCoachMapGroup(e.target.value)}
                placeholder="e.g. MAP 2"
              />
            </div>
            <div>
              <Label>Assistant coach service unit</Label>
              <Input
                value={editAssistantCoachServiceUnit}
                onChange={(e) =>
                  setEditAssistantCoachServiceUnit(e.target.value)
                }
                placeholder="e.g. Media"
              />
            </div>
            <div>
              <Label>Assistant coach photo</Label>
              <div className="flex items-center gap-3 mt-1">
                <div className="h-14 w-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs text-muted-foreground border border-border">
                  <PhotoPreview
                    uploading={uploading}
                    url={editAssistantCoachPhotoUrl}
                    alt="assistant coach preview"
                  />
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoachImage(e, "assistant")}
                  className="cursor-pointer"
                  disabled={uploading}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={savingClub || uploading}
                className="w-full sm:w-auto"
              >
                {saveButtonLabel(savingClub, uploading)}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
