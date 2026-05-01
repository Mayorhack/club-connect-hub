import { FormEvent, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { getClubs, getPlayers, Player, Position, setClubs, setPlayers, uid } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PositionBadge } from "@/components/PositionBadge";
import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];

export default function MyClub() {
  const { user } = useAuth();
  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);

  const club = getClubs().find((c) => c.id === user?.clubId);
  const players = club ? getPlayers().filter((p) => p.clubId === club.id).sort((a, b) => a.jerseyNumber - b.jerseyNumber) : [];
  const gkCount = players.filter((p) => p.position === "GK").length;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("MID");
  const [num, setNum] = useState<number>(1);
  const [photo, setPhoto] = useState("");

  // Club info edit
  const [editName, setEditName] = useState(club?.name || "");
  const [editCity, setEditCity] = useState(club?.city || "");
  const [editYear, setEditYear] = useState<number>(club?.foundedYear || new Date().getFullYear());
  const [editLogo, setEditLogo] = useState(club?.logoUrl || "");

  if (!club) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">You're not assigned to a club yet. Ask the super admin to assign you.</p>
        </div>
      </Layout>
    );
  }

  const saveClub = (e: FormEvent) => {
    e.preventDefault();
    setClubs(getClubs().map((c) => c.id === club.id ? { ...c, name: editName.trim(), city: editCity.trim(), foundedYear: editYear, logoUrl: editLogo.trim() || undefined } : c));
    toast.success("Club updated");
    refresh();
  };

  const addPlayer = (e: FormEvent) => {
    e.preventDefault();
    if (players.length >= 25) return toast.error("Squad limit (25) reached");
    if (!name.trim()) return toast.error("Name required");
    if (num < 1 || num > 99) return toast.error("Jersey number must be 1–99");
    if (players.some((p) => p.jerseyNumber === num)) return toast.error(`Jersey #${num} already taken`);
    const p: Player = { id: uid(), clubId: club.id, name: name.trim(), position, jerseyNumber: num, photoUrl: photo.trim() || undefined };
    setPlayers([...getPlayers(), p]);
    toast.success("Player added");
    setOpen(false);
    setName(""); setPosition("MID"); setNum(1); setPhoto("");
    refresh();
  };

  const removePlayer = (id: string) => {
    if (!confirm("Remove this player?")) return;
    setPlayers(getPlayers().filter((p) => p.id !== id));
    refresh();
  };

  const squadFull = players.length >= 25;
  const gkOk = gkCount >= 2;

  return (
    <Layout>
      <div className="container py-10 space-y-10">
        <header>
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <p className="text-sm text-muted-foreground">Manage your squad and club info.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`rounded-xl border p-4 flex items-start gap-3 ${squadFull ? "border-accent/40 bg-accent/10" : "border-border bg-card"}`}>
            {squadFull ? <AlertCircle className="h-5 w-5 text-accent mt-0.5" /> : <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />}
            <div>
              <div className="font-semibold">Squad size</div>
              <div className="text-sm text-muted-foreground">{players.length} of 25 players</div>
            </div>
          </div>
          <div className={`rounded-xl border p-4 flex items-start gap-3 ${gkOk ? "border-border bg-card" : "border-destructive/40 bg-destructive/5"}`}>
            {gkOk ? <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" /> : <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />}
            <div>
              <div className="font-semibold">Goalkeepers</div>
              <div className="text-sm text-muted-foreground">{gkCount} of minimum 2</div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Squad</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button disabled={squadFull}><Plus className="h-4 w-4 mr-1" /> Add player</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add player</DialogTitle></DialogHeader>
                <form onSubmit={addPlayer} className="space-y-4">
                  <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Position</Label>
                      <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Jersey #</Label><Input type="number" value={num} min={1} max={99} onChange={(e) => setNum(Number(e.target.value))} /></div>
                  </div>
                  <div><Label>Photo URL (optional)</Label><Input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://..." /></div>
                  <Button type="submit" className="w-full">Add to squad</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="text-left p-3 w-16">#</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3 w-28">Position</th>
                  <th className="p-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3 font-bold">{p.jerseyNumber}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3"><PositionBadge position={p.position} /></td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => removePlayer(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No players yet — add your first.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Club info</h2>
          <form onSubmit={saveClub} className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border bg-card p-6">
            <div><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><Label>City</Label><Input value={editCity} onChange={(e) => setEditCity(e.target.value)} /></div>
            <div><Label>Founded year</Label><Input type="number" value={editYear} onChange={(e) => setEditYear(Number(e.target.value))} /></div>
            <div><Label>Logo URL</Label><Input value={editLogo} onChange={(e) => setEditLogo(e.target.value)} placeholder="https://..." /></div>
            <div className="sm:col-span-2"><Button type="submit">Save changes</Button></div>
          </form>
        </section>
      </div>
    </Layout>
  );
}