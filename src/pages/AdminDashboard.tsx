import { FormEvent, useState } from "react";
import { Layout } from "@/components/Layout";
import { Club, getClubs, getPlayers, getUsers, setClubs, setPlayers, setUsers, uid } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);

  const clubs = getClubs();
  const users = getUsers();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [logoUrl, setLogoUrl] = useState("");
  const [adminId, setAdminId] = useState<string>("");

  const eligibleAdmins = users.filter((u) => u.role === "user" || (u.role === "club" && !u.clubId));

  const createClub = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return toast.error("Name and city are required");
    const id = uid();
    const club: Club = { id, name: name.trim(), city: city.trim(), foundedYear: year, logoUrl: logoUrl.trim() || undefined, adminId: adminId || undefined };
    setClubs([...getClubs(), club]);
    if (adminId) {
      setUsers(getUsers().map((u) => u.id === adminId ? { ...u, role: "club", clubId: id } : u));
    }
    toast.success("Club created");
    setOpen(false);
    setName(""); setCity(""); setYear(new Date().getFullYear()); setLogoUrl(""); setAdminId("");
    refresh();
  };

  const deleteClub = (id: string) => {
    if (!confirm("Delete this club and all its players?")) return;
    setClubs(getClubs().filter((c) => c.id !== id));
    setPlayers(getPlayers().filter((p) => p.clubId !== id));
    setUsers(getUsers().map((u) => u.clubId === id ? { ...u, role: "user", clubId: undefined } : u));
    toast.success("Club deleted");
    refresh();
  };

  const reassign = (clubId: string, newAdminId: string) => {
    const us = getUsers().map((u) => {
      if (u.clubId === clubId) return { ...u, role: "user" as const, clubId: undefined };
      if (u.id === newAdminId) return { ...u, role: "club" as const, clubId };
      return u;
    });
    setUsers(us);
    setClubs(getClubs().map((c) => c.id === clubId ? { ...c, adminId: newAdminId || undefined } : c));
    toast.success("Admin updated");
    refresh();
  };

  return (
    <Layout>
      <div className="container py-10 space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Super admin</h1>
            <p className="text-sm text-muted-foreground">Create clubs and assign administrators.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New club</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a club</DialogTitle></DialogHeader>
              <form onSubmit={createClub} className="space-y-4">
                <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} required /></div>
                <div><Label>Founded year</Label><Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={1800} max={new Date().getFullYear()} /></div>
                <div><Label>Logo URL (optional)</Label><Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." /></div>
                <div>
                  <Label>Club admin</Label>
                  <Select value={adminId} onValueChange={setAdminId}>
                    <SelectTrigger><SelectValue placeholder="Assign later" /></SelectTrigger>
                    <SelectContent>
                      {eligibleAdmins.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No eligible users. Have someone sign up first.</div>}
                      {eligibleAdmins.map((u) => <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Create club</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <section>
          <h2 className="text-xl font-bold mb-4">Clubs ({clubs.length})</h2>
          <div className="space-y-3">
            {clubs.map((c) => {
              const admin = users.find((u) => u.id === c.adminId);
              const playerCount = getPlayers().filter((p) => p.clubId === c.id).length;
              return (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.city} · est. {c.foundedYear} · {playerCount} players</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={c.adminId || ""} onValueChange={(v) => reassign(c.id, v)}>
                      <SelectTrigger className="w-56"><SelectValue placeholder="No admin" /></SelectTrigger>
                      <SelectContent>
                        {users.filter((u) => u.role !== "super" && (!u.clubId || u.clubId === c.id)).map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => deleteClub(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  {admin && <Badge variant="secondary" className="hidden sm:inline-flex">Admin: {admin.email}</Badge>}
                </div>
              );
            })}
            {clubs.length === 0 && <p className="text-sm text-muted-foreground">No clubs yet — create one above.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <span>{u.email}</span>
                <Badge variant={u.role === "super" ? "default" : u.role === "club" ? "secondary" : "outline"}>
                  {u.role}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}