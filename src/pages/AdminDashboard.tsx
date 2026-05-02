import { FormEvent, useState, useRef, ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
  createClub as apiCreateClub,
  deleteClub as apiDeleteClub,
  getClubs,
  getPlayers,
  getUsers,
  playersByClub,
  updateClub,
  updateProfile,
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

function badgeVariant(role: string) {
  if (role === "super") return "default" as const;
  if (role === "club") return "secondary" as const;
  return "outline" as const;
}

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data: clubs = [] } = useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  const { data: allPlayers = [] } = useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cciBranch, setCciBranch] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [logoBase64, setLogoBase64] = useState("");
  const [adminId, setAdminId] = useState("");
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image must be under 1 MB");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setLogoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const eligibleAdmins = users.filter(
    (user) => user.role === "user" || (user.role === "club" && !user.clubId),
  );

  async function invalidateDashboard() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["clubs"] }),
      qc.invalidateQueries({ queryKey: ["users"] }),
      qc.invalidateQueries({ queryKey: ["players"] }),
    ]);
  }

  async function handleCreateClub(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      toast.error("Name and city are required");
      return;
    }

    setSaving(true);
    try {
      const club = await apiCreateClub({
        name: name.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        cciBranch: cciBranch.trim() || undefined,
        foundedYear: year,
        logoUrl: logoBase64 || undefined,
        adminId: adminId || undefined,
      });

      if (adminId) {
        await updateProfile(adminId, { role: "club", clubId: club.id });
      }

      toast.success("Club created");
      setOpen(false);
      setName("");
      setCity("");
      setState("");
      setCciBranch("");
      setYear(new Date().getFullYear());
      setLogoBase64("");
      if (logoInputRef.current) logoInputRef.current.value = "";
      setAdminId("");
      await invalidateDashboard();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteClub(id: string) {
    if (!confirm("Delete this club and all its players?")) return;

    try {
      await apiDeleteClub(id);
      toast.success("Club deleted");
      await invalidateDashboard();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function handleReassign(clubId: string, newAdminId: string) {
    try {
      const club = clubs.find((entry) => entry.id === clubId);

      if (club?.adminId) {
        await updateProfile(club.adminId, { role: "user", clubId: undefined });
      }

      if (newAdminId) {
        await updateProfile(newAdminId, { role: "club", clubId });
      }

      await updateClub(clubId, { adminId: newAdminId || undefined });
      toast.success("Admin updated");
      await invalidateDashboard();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <Layout>
      <div className="container py-10 space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Super admin</h1>
            <p className="text-sm text-muted-foreground">
              Create clubs and assign administrators.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> New club
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a club</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>State</Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Lagos"
                    />
                  </div>
                  <div>
                    <Label>CCI Branch</Label>
                    <Input
                      value={cciBranch}
                      onChange={(e) => setCciBranch(e.target.value)}
                      placeholder="e.g. Ikeja"
                    />
                  </div>
                </div>
                <div>
                  <Label>Founded year</Label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={1800}
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <Label>Club logo (optional, max 1 MB)</Label>
                  <div className="mt-1 flex items-center gap-3">
                    {logoBase64 ? (
                      <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-border">
                        <img
                          src={logoBase64}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoBase64("");
                            if (logoInputRef.current)
                              logoInputRef.current.value = "";
                          }}
                          className="absolute top-0.5 right-0.5 rounded-full bg-black/60 text-white p-0.5 hover:bg-black/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/40">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-secondary/80 cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG, WebP · max 1 MB
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Club admin</Label>
                  <Select value={adminId} onValueChange={setAdminId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign later" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleAdmins.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No eligible users. Have someone sign up first.
                        </div>
                      )}
                      {eligibleAdmins.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Creating..." : "Create club"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <section>
          <h2 className="mb-4 text-xl font-bold">Clubs ({clubs.length})</h2>
          <div className="space-y-3">
            {clubs.map((club) => {
              const admin = users.find((user) => user.id === club.adminId);
              const playerCount = playersByClub(allPlayers, club.id).length;

              return (
                <div
                  key={club.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{club.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {club.city} · est. {club.foundedYear} · {playerCount}{" "}
                      players
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={club.adminId ?? ""}
                      onValueChange={(value) =>
                        void handleReassign(club.id, value)
                      }
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="No admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter(
                            (user) =>
                              user.role !== "super" &&
                              (!user.clubId || user.clubId === club.id),
                          )
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDeleteClub(club.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {admin && (
                    <Badge
                      variant="secondary"
                      className="hidden sm:inline-flex"
                    >
                      Admin: {admin.email}
                    </Badge>
                  )}
                </div>
              );
            })}

            {clubs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No clubs yet — create one above.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">Users ({users.length})</h2>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span>{user.email}</span>
                <Badge variant={badgeVariant(user.role)}>{user.role}</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
