import { FormEvent, useState, useRef, ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
  createFixture,
  createClub as apiCreateClub,
  deleteFixture,
  deleteClub as apiDeleteClub,
  getClubs,
  getFixtures,
  getMatchGoals,
  getPlayers,
  getUsers,
  playersByClub,
  setMatchPlayerGoals,
  updateFixture,
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
import { ChevronDown, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

function badgeVariant(role: string) {
  if (role === "super") return "default" as const;
  if (role === "club") return "secondary" as const;
  return "outline" as const;
}

function readFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
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
  const { data: fixtures = [] } = useQuery({
    queryKey: ["fixtures"],
    queryFn: getFixtures,
  });
  const { data: matchGoals = [] } = useQuery({
    queryKey: ["match-goals"],
    queryFn: getMatchGoals,
  });

  const [open, setOpen] = useState(false);
  const [fixtureOpen, setFixtureOpen] = useState(false);
  const [openMatchdays, setOpenMatchdays] = useState<number[]>([]);
  const [scorersFixtureId, setScorersFixtureId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cciBranch, setCciBranch] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [logoBase64, setLogoBase64] = useState("");
  const [adminId, setAdminId] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingFixture, setSavingFixture] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [fixtureMatchday, setFixtureMatchday] = useState(1);
  const [fixtureDate, setFixtureDate] = useState("");
  const [fixtureHomeClubId, setFixtureHomeClubId] = useState("");
  const [fixtureAwayClubId, setFixtureAwayClubId] = useState("");
  const [fixtureVenue, setFixtureVenue] = useState("");

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
      qc.invalidateQueries({ queryKey: ["fixtures"] }),
      qc.invalidateQueries({ queryKey: ["match-goals"] }),
    ]);
  }

  const sortedFixtures = [...fixtures].sort((a, b) => {
    if (a.matchday !== b.matchday) return a.matchday - b.matchday;
    return a.kickoffDate.localeCompare(b.kickoffDate);
  });

  const fixturesByMatchday = sortedFixtures.reduce<
    Array<{ matchday: number; fixtures: typeof sortedFixtures }>
  >((groups, fixture) => {
    const existing = groups.find(
      (group) => group.matchday === fixture.matchday,
    );
    if (existing) {
      existing.fixtures.push(fixture);
      return groups;
    }
    groups.push({ matchday: fixture.matchday, fixtures: [fixture] });
    return groups;
  }, []);

  function toggleMatchday(matchday: number) {
    setOpenMatchdays((prev) =>
      prev.includes(matchday)
        ? prev.filter((value) => value !== matchday)
        : [...prev, matchday],
    );
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

  async function handleCreateFixture(e: FormEvent) {
    e.preventDefault();
    if (!fixtureDate || !fixtureHomeClubId || !fixtureAwayClubId) {
      toast.error("Matchday, date and both clubs are required");
      return;
    }
    if (fixtureHomeClubId === fixtureAwayClubId) {
      toast.error("Home and away club must be different");
      return;
    }

    setSavingFixture(true);
    try {
      await createFixture({
        matchday: fixtureMatchday,
        kickoffDate: fixtureDate,
        homeClubId: fixtureHomeClubId,
        awayClubId: fixtureAwayClubId,
        venue: fixtureVenue.trim() || undefined,
      });
      toast.success("Fixture created");
      setFixtureOpen(false);
      setFixtureMatchday(1);
      setFixtureDate("");
      setFixtureHomeClubId("");
      setFixtureAwayClubId("");
      setFixtureVenue("");
      await invalidateDashboard();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSavingFixture(false);
    }
  }

  async function handleDeleteFixture(id: string) {
    if (!confirm("Delete this fixture and all recorded goals?")) return;
    try {
      await deleteFixture(id);
      toast.success("Fixture deleted");
      await invalidateDashboard();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function handleSaveFixtureMeta(fixtureId: string, formData: FormData) {
    const matchday = Number(formData.get("matchday"));
    const kickoffDate = readFormString(formData, "kickoffDate");
    const venue = readFormString(formData, "venue").trim();

    if (!kickoffDate || !matchday) {
      toast.error("Matchday and date are required");
      return;
    }

    try {
      await updateFixture(fixtureId, {
        matchday,
        kickoffDate,
        venue: venue || undefined,
      });
      toast.success("Fixture updated");
      await invalidateDashboard();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function handleSaveFixtureResult(
    fixtureId: string,
    homeScoreRaw: string,
    awayScoreRaw: string,
  ) {
    const homeScore = Number(homeScoreRaw);
    const awayScore = Number(awayScoreRaw);
    if (
      Number.isNaN(homeScore) ||
      Number.isNaN(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      toast.error("Scores must be valid numbers");
      return;
    }

    try {
      await updateFixture(fixtureId, { homeScore, awayScore });
      toast.success("Result updated");
      await invalidateDashboard();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function handleSaveScorers(fixtureId: string, formData: FormData) {
    const goalsPayload: Array<{
      playerId: string;
      clubId: string;
      goals: number;
    }> = [];

    formData.forEach((value, key) => {
      if (!key.startsWith("goals_")) return;
      const playerId = key.replace("goals_", "");
      const goals = typeof value === "string" ? Number(value) : 0;
      if (Number.isNaN(goals) || goals <= 0) return;
      const player = allPlayers.find((entry) => entry.id === playerId);
      if (!player) return;
      goalsPayload.push({
        playerId,
        clubId: player.clubId,
        goals,
      });
    });

    try {
      await setMatchPlayerGoals(fixtureId, goalsPayload);
      toast.success("Scorers updated");
      setScorersFixtureId(null);
      await invalidateDashboard();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  const scorerFixture = sortedFixtures.find(
    (fixture) => fixture.id === scorersFixtureId,
  );
  const scorerPlayers = scorerFixture
    ? allPlayers
        .filter(
          (player) =>
            player.clubId === scorerFixture.homeClubId ||
            player.clubId === scorerFixture.awayClubId,
        )
        .sort((a, b) => {
          if (a.clubId !== b.clubId) return a.clubId.localeCompare(b.clubId);
          if (a.jerseyNumber !== b.jerseyNumber)
            return a.jerseyNumber - b.jerseyNumber;
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`,
          );
        })
    : [];

  const scorerMap = new Map(
    matchGoals
      .filter((goal) => goal.matchId === scorersFixtureId)
      .map((goal) => [goal.playerId, goal.goals]),
  );

  return (
    <Layout>
      <div className="container py-10 space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
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

                  <div className="flex items-center gap-2 flex-wrap">
                    <Select
                      value={club.adminId ?? ""}
                      onValueChange={(value) =>
                        void handleReassign(club.id, value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-56">
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
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="truncate min-w-0 flex-1">{user.email}</span>
                <Badge variant={badgeVariant(user.role)} className="shrink-0">
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-bold">Fixtures ({fixtures.length})</h2>

            <Dialog open={fixtureOpen} onOpenChange={setFixtureOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-1 h-4 w-4" /> New fixture
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create fixture</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFixture} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Matchday</Label>
                      <Input
                        type="number"
                        min={1}
                        value={fixtureMatchday}
                        onChange={(e) =>
                          setFixtureMatchday(Number(e.target.value))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={fixtureDate}
                        onChange={(e) => setFixtureDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Home club</Label>
                      <Select
                        value={fixtureHomeClubId}
                        onValueChange={setFixtureHomeClubId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select home club" />
                        </SelectTrigger>
                        <SelectContent>
                          {clubs.map((club) => (
                            <SelectItem key={club.id} value={club.id}>
                              {club.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Away club</Label>
                      <Select
                        value={fixtureAwayClubId}
                        onValueChange={setFixtureAwayClubId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select away club" />
                        </SelectTrigger>
                        <SelectContent>
                          {clubs.map((club) => (
                            <SelectItem key={club.id} value={club.id}>
                              {club.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Venue (optional)</Label>
                    <Input
                      value={fixtureVenue}
                      onChange={(e) => setFixtureVenue(e.target.value)}
                      placeholder="e.g. CCI Main Pitch"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={savingFixture}
                  >
                    {savingFixture ? "Saving..." : "Create fixture"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {fixturesByMatchday.map(
              ({ matchday, fixtures: matchdayFixtures }) => {
                const isOpen = openMatchdays.includes(matchday);

                return (
                  <div
                    key={`matchday-${matchday}`}
                    className="rounded-xl border border-border bg-card"
                  >
                    <button
                      type="button"
                      onClick={() => toggleMatchday(matchday)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          Matchday {matchday}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {matchdayFixtures.length} fixture
                          {matchdayFixtures.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-border p-4 space-y-4">
                        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">
                            How to save this matchday:
                          </p>
                          <p className="mt-1">
                            1) Update fixture details and click Save fixture, 2)
                            Enter scores and click Save result, 3) Open Scorers
                            to record player goals.
                          </p>
                        </div>

                        {matchdayFixtures.map((fixture) => {
                          const home = clubs.find(
                            (club) => club.id === fixture.homeClubId,
                          );
                          const away = clubs.find(
                            (club) => club.id === fixture.awayClubId,
                          );

                          return (
                            <div
                              key={fixture.id}
                              className="rounded-xl border border-border bg-background p-4 space-y-3"
                            >
                              <form
                                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  void handleSaveFixtureMeta(
                                    fixture.id,
                                    new FormData(e.currentTarget),
                                  );
                                }}
                              >
                                <div>
                                  <Label>Matchday</Label>
                                  <Input
                                    name="matchday"
                                    type="number"
                                    min={1}
                                    defaultValue={fixture.matchday}
                                    required
                                  />
                                </div>
                                <div>
                                  <Label>Date</Label>
                                  <Input
                                    name="kickoffDate"
                                    type="date"
                                    defaultValue={fixture.kickoffDate}
                                    required
                                  />
                                </div>
                                <div>
                                  <Label>Venue</Label>
                                  <Input
                                    name="venue"
                                    defaultValue={fixture.venue ?? ""}
                                  />
                                </div>
                                <div className="flex items-end">
                                  <Button
                                    type="submit"
                                    className="w-full"
                                    variant="secondary"
                                  >
                                    Save fixture
                                  </Button>
                                </div>
                              </form>

                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-lg border border-border bg-card px-3 py-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {home?.name ?? "Unknown"} vs{" "}
                                    {away?.name ?? "Unknown"}
                                  </p>
                                </div>

                                <form
                                  className="flex items-center gap-2"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);
                                    void handleSaveFixtureResult(
                                      fixture.id,
                                      readFormString(fd, "homeScore"),
                                      readFormString(fd, "awayScore"),
                                    );
                                  }}
                                >
                                  <Input
                                    name="homeScore"
                                    type="number"
                                    min={0}
                                    className="w-16"
                                    defaultValue={fixture.homeScore ?? 0}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    -
                                  </span>
                                  <Input
                                    name="awayScore"
                                    type="number"
                                    min={0}
                                    className="w-16"
                                    defaultValue={fixture.awayScore ?? 0}
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    variant="outline"
                                  >
                                    Save result
                                  </Button>
                                </form>

                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setScorersFixtureId(fixture.id)
                                    }
                                  >
                                    Scorers
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                      void handleDeleteFixture(fixture.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              },
            )}

            {sortedFixtures.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No fixtures yet. Add the first matchday fixture above.
              </p>
            )}
          </div>

          <Dialog
            open={Boolean(scorersFixtureId)}
            onOpenChange={(isOpen) => {
              if (!isOpen) setScorersFixtureId(null);
            }}
          >
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update scorers</DialogTitle>
              </DialogHeader>

              {scorerFixture ? (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSaveScorers(
                      scorerFixture.id,
                      new FormData(e.currentTarget),
                    );
                  }}
                >
                  {scorerPlayers.map((player) => {
                    const clubName =
                      clubs.find((club) => club.id === player.clubId)?.name ??
                      "Unknown";
                    return (
                      <div
                        key={player.id}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {clubName} · #{player.jerseyNumber}
                          </p>
                        </div>
                        <Input
                          name={`goals_${player.id}`}
                          type="number"
                          min={0}
                          defaultValue={scorerMap.get(player.id) ?? 0}
                          className="w-20"
                        />
                      </div>
                    );
                  })}

                  {scorerPlayers.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No players found for this fixture's clubs.
                    </p>
                  )}

                  <Button type="submit" className="w-full">
                    Save scorers
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a fixture first.
                </p>
              )}
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </Layout>
  );
}
