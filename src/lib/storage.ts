import { supabase } from "./supabase";
import { getPlayerRegistrationDeadlineStatus } from "./registrationDeadline";

// ── Types & Constants ─────────────────────────────────────────────────────────

export type Role = "super" | "club" | "user";
export type Position =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "LWB"
  | "RWB"
  | "SW"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "CF"
  | "ST";

export type PositionGroup = "GK" | "DEF" | "MID" | "FWD";
export type Foot = "right" | "left" | "both";

export const POSITION_GROUP: Record<Position, PositionGroup> = {
  GK: "GK",
  CB: "DEF",
  LB: "DEF",
  RB: "DEF",
  LWB: "DEF",
  RWB: "DEF",
  SW: "DEF",
  CDM: "MID",
  CM: "MID",
  CAM: "MID",
  LM: "MID",
  RM: "MID",
  LW: "FWD",
  RW: "FWD",
  CF: "FWD",
  ST: "FWD",
};

export const ALL_POSITIONS: Position[] = [
  "GK",
  "SW",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "CF",
  "ST",
];

export const POSITION_NAME: Record<Position, string> = {
  GK: "Goalkeeper",
  SW: "Sweeper",
  CB: "Centre Back",
  LB: "Left Back",
  RB: "Right Back",
  LWB: "Left Wing Back",
  RWB: "Right Wing Back",
  CDM: "Defensive Midfielder",
  CM: "Central Midfielder",
  CAM: "Attacking Midfielder",
  LM: "Left Midfielder",
  RM: "Right Midfielder",
  LW: "Left Winger",
  RW: "Right Winger",
  CF: "Centre Forward",
  ST: "Striker",
};

export interface User {
  id: string;
  email: string;
  role: Role;
  clubId?: string;
}

export interface Club {
  id: string;
  name: string;
  city: string;
  state?: string;
  cciBranch?: string;
  playerCount?: number;
  foundedYear: number;
  logoUrl?: string;
  adminId?: string;
  coachName?: string;
  coachMapGroup?: string;
  coachServiceUnit?: string;
  coachPhotoUrl?: string;
  assistantCoachName?: string;
  assistantCoachMapGroup?: string;
  assistantCoachServiceUnit?: string;
  assistantCoachPhotoUrl?: string;
  canRegisterPlayer: boolean;
}

export interface Player {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  position: Position;
  jerseyNumber: number;
  photoUrl?: string;
  mapGroup?: string;
  churchUnit?: string;
  preferredFoot?: Foot;
  /** Height in centimetres */
  heightCm?: number;
  /** Weight in kilograms */
  weightKg?: number;
}
export interface TopScorers {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  position: string;
  jerseyNumber: number;
  heightCm: number;
  weightKg: number;
  preferredFoot: string;
  goals: number;
  clubName: string;
}

export interface MatchFixture {
  id: string;
  matchday: number;
  kickoffDate: string;
  homeClubId: string;
  awayClubId: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
}

export interface MatchGoal {
  id: string;
  matchId: string;
  playerId: string;
  clubId: string;
  goals: number;
}

export interface LeagueTableRow {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
type TopScorerRow = {
  player_id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  position: string | null;
  jersey_number: number;
  height_cm: number | null;
  weight_kg: number | null;
  preferred_foot: string | null;
  club_id: string | null;
  club_name: string | null;
  total_goals: number;
};

// ── Row types (Supabase returns snake_case) ───────────────────────────────────

interface ProfileRow {
  id: string;
  email: string;
  role: string;
  club_id: string | null;
}
interface ClubRow {
  id: string;
  name: string;
  city: string;
  state: string | null;
  cci_branch: string | null;
  founded_year: number;
  logo_url: string | null;
  admin_id: string | null;
  coach_name: string | null;
  coach_map_group: string | null;
  coach_service_unit: string | null;
  coach_photo_url: string | null;
  assistant_coach_name: string | null;
  assistant_coach_map_group: string | null;
  assistant_coach_service_unit: string | null;
  assistant_coach_photo_url: string | null;
  can_register_player: boolean;
  players?: { count: number }[];
}
interface PlayerRow {
  id: string;
  club_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
  photo_url: string | null;
  map_group: string | null;
  church_unit: string | null;
  preferred_foot: string | null;
  height_cm: number | null;
  weight_kg: number | null;
}

interface MatchFixtureRow {
  id: string;
  matchday: number;
  kickoff_date: string;
  home_club_id: string;
  away_club_id: string;
  home_score: number | null;
  away_score: number | null;
  venue: string | null;
}

interface MatchGoalRow {
  id: string;
  match_id: string;
  player_id: string;
  club_id: string;
  goals: number;
}

type SupabaseLikeError = {
  code?: string;
  message?: string;
} | null;

function isMissingTableError(
  error: SupabaseLikeError,
  tableName: string,
): boolean {
  if (error?.code !== "PGRST205") return false;

  const msg = error.message ?? "";
  if (!msg) return true;

  return (
    msg.includes(`public.${tableName}`) ||
    msg.includes(`'public.${tableName}'`) ||
    msg.includes(`"public.${tableName}"`)
  );
}

function missingTableMessage(tableName: string): string {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
  const host = url ? new URL(url).host : "unknown-host";
  return `Database table public.${tableName} is missing in the active Supabase project (${host}). Run supabase/schema.sql in that same project, then retry.`;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToUser(r: ProfileRow): User {
  return {
    id: r.id,
    email: r.email,
    role: r.role as Role,
    clubId: r.club_id ?? undefined,
  };
}
function rowToClub(r: ClubRow): Club {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    state: r.state ?? undefined,
    cciBranch: r.cci_branch ?? undefined,
    foundedYear: r.founded_year,
    logoUrl: r.logo_url ?? undefined,
    adminId: r.admin_id ?? undefined,
    coachName: r.coach_name ?? undefined,
    coachMapGroup: r.coach_map_group ?? undefined,
    coachServiceUnit: r.coach_service_unit ?? undefined,
    coachPhotoUrl: r.coach_photo_url ?? undefined,
    assistantCoachName: r.assistant_coach_name ?? undefined,
    assistantCoachMapGroup: r.assistant_coach_map_group ?? undefined,
    assistantCoachServiceUnit: r.assistant_coach_service_unit ?? undefined,
    assistantCoachPhotoUrl: r.assistant_coach_photo_url ?? undefined,
    canRegisterPlayer: r.can_register_player,
    playerCount: r.players?.[0]?.count ?? 0,
  };
}
function rowToTopScorer(r: TopScorerRow): TopScorers {
  return {
    id: r.player_id,
    firstName: r.first_name,
    lastName: r.last_name,
    photoUrl: r.photo_url ?? undefined,
    position: r.position ?? undefined,
    jerseyNumber: r.jersey_number,
    heightCm: r.height_cm ?? undefined,
    weightKg: r.weight_kg ?? undefined,
    preferredFoot: r.preferred_foot ?? undefined,

    clubName: r.club_name,

    goals: r.total_goals,
  };
}
function rowToPlayer(r: PlayerRow): Player {
  return {
    id: r.id,
    clubId: r.club_id,
    firstName: r.first_name,
    lastName: r.last_name,
    position: r.position as Position,
    jerseyNumber: r.jersey_number,
    photoUrl: r.photo_url ?? undefined,
    mapGroup: r.map_group ?? undefined,
    churchUnit: r.church_unit ?? undefined,
    preferredFoot: (r.preferred_foot ?? undefined) as Foot | undefined,
    heightCm: r.height_cm ?? undefined,
    weightKg: r.weight_kg ?? undefined,
  };
}

function rowToFixture(r: MatchFixtureRow): MatchFixture {
  return {
    id: r.id,
    matchday: r.matchday,
    kickoffDate: r.kickoff_date,
    homeClubId: r.home_club_id,
    awayClubId: r.away_club_id,
    homeScore: r.home_score ?? undefined,
    awayScore: r.away_score ?? undefined,
    venue: r.venue ?? undefined,
  };
}

function rowToGoal(r: MatchGoalRow): MatchGoal {
  return {
    id: r.id,
    matchId: r.match_id,
    playerId: r.player_id,
    clubId: r.club_id,
    goals: r.goals,
  };
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("email");
  if (error) throw error;
  return ((data ?? []) as ProfileRow[]).map(rowToUser);
}

export async function getClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from("clubs")
    .select("*, players(count)")
    .order("name");
  if (error) throw error;
  return ((data ?? []) as ClubRow[]).map(rowToClub);
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from("players").select("*");
  if (error) throw error;
  return ((data ?? []) as PlayerRow[]).map(rowToPlayer);
}

export async function getPlayersByClub(clubId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("club_id", clubId)
    .order("jersey_number");
  if (error) throw error;
  return ((data ?? []) as PlayerRow[]).map(rowToPlayer);
}

export async function getFixtures(): Promise<MatchFixture[]> {
  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .order("matchday")
    .order("kickoff_date")
    .order("created_at");
  if (error) {
    if (isMissingTableError(error, "fixtures")) return [];
    throw error;
  }
  return ((data ?? []) as MatchFixtureRow[]).map(rowToFixture);
}
export async function getTopScorers() {
  const { data, error } = await supabase.rpc("get_top_scorers", {
    limit_count: 15,
  });

  if (error) {
    if (isMissingTableError(error, "top_scorers")) return [];
    throw error;
  }
  return (data?.map(rowToTopScorer) ?? []) as unknown as TopScorers[];
}
export async function getTotals(): Promise<{
  totalClubs: number;
  totalPlayers: number;
}> {
  const [{ count: totalClubs }, { count: totalPlayers }] = await Promise.all([
    supabase.from("clubs").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),
  ]);
  return {
    totalClubs: totalClubs ?? 0,
    totalPlayers: totalPlayers ?? 0,
  };
}
export async function getMatchGoals(): Promise<MatchGoal[]> {
  const { data, error } = await supabase
    .from("match_goals")
    .select("*")
    .order("goals", { ascending: false });
  if (error) {
    if (isMissingTableError(error, "match_goals")) return [];
    throw error;
  }
  return ((data ?? []) as MatchGoalRow[]).map(rowToGoal);
}

/** Sync helper — filter an already-loaded players array by club. */
export function playersByClub(players: Player[], clubId: string): Player[] {
  return players.filter((p) => p.clubId === clubId);
}

// ── Club mutations ────────────────────────────────────────────────────────────

export async function createClub(club: Omit<Club, "id">): Promise<Club> {
  const { data, error } = await supabase
    .from("clubs")
    .insert({
      name: club.name,
      city: club.city,
      state: club.state ?? null,
      cci_branch: club.cciBranch ?? null,
      founded_year: club.foundedYear,
      logo_url: club.logoUrl ?? null,
      admin_id: club.adminId ?? null,
      coach_name: club.coachName ?? null,
      coach_map_group: club.coachMapGroup ?? null,
      coach_service_unit: club.coachServiceUnit ?? null,
      coach_photo_url: club.coachPhotoUrl ?? null,
      assistant_coach_name: club.assistantCoachName ?? null,
      assistant_coach_map_group: club.assistantCoachMapGroup ?? null,
      assistant_coach_service_unit: club.assistantCoachServiceUnit ?? null,
      assistant_coach_photo_url: club.assistantCoachPhotoUrl ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToClub(data as ClubRow);
}

export async function updateClub(
  id: string,
  updates: Partial<Omit<Club, "id">>,
): Promise<void> {
  const row: Record<string, unknown> = {};

  const setValue = (
    dbColumn: string,
    value: unknown,
    nullable: boolean = false,
  ) => {
    if (value === undefined) return;
    row[dbColumn] = nullable ? (value ?? null) : value;
  };

  setValue("name", updates.name);
  setValue("city", updates.city);
  setValue("state", updates.state, true);
  setValue("cci_branch", updates.cciBranch, true);
  setValue("founded_year", updates.foundedYear);
  setValue("logo_url", updates.logoUrl, true);
  setValue("admin_id", updates.adminId, true);
  setValue("coach_name", updates.coachName, true);
  setValue("coach_map_group", updates.coachMapGroup, true);
  setValue("coach_service_unit", updates.coachServiceUnit, true);
  setValue("coach_photo_url", updates.coachPhotoUrl, true);
  setValue("assistant_coach_name", updates.assistantCoachName, true);
  setValue("assistant_coach_map_group", updates.assistantCoachMapGroup, true);
  setValue(
    "assistant_coach_service_unit",
    updates.assistantCoachServiceUnit,
    true,
  );
  setValue("assistant_coach_photo_url", updates.assistantCoachPhotoUrl, true);
  if (updates.canRegisterPlayer !== undefined)
    row["can_register_player"] = updates.canRegisterPlayer;

  const { error } = await supabase.from("clubs").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteClub(id: string): Promise<void> {
  await supabase
    .from("profiles")
    .update({ role: "user", club_id: null })
    .eq("club_id", id);
  const { error } = await supabase.from("clubs").delete().eq("id", id);
  if (error) throw error;
}

// ── Player mutations ──────────────────────────────────────────────────────────

export async function createPlayer(
  player: Omit<Player, "id">,
): Promise<Player> {
  const deadline = getPlayerRegistrationDeadlineStatus();
  if (deadline.isClosed) {
    throw new Error("Player registration is closed. The deadline has passed.");
  }
  const { data, error } = await supabase
    .from("players")
    .insert({
      club_id: player.clubId,
      first_name: player.firstName,
      last_name: player.lastName,
      position: player.position,
      jersey_number: player.jerseyNumber,
      photo_url: player.photoUrl ?? null,
      map_group: player.mapGroup ?? null,
      church_unit: player.churchUnit ?? null,
      preferred_foot: player.preferredFoot ?? null,
      height_cm: player.heightCm ?? null,
      weight_kg: player.weightKg ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToPlayer(data as PlayerRow);
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw error;
}

export async function updatePlayer(
  id: string,
  updates: Partial<Omit<Player, "id" | "clubId">>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.firstName !== undefined) row.first_name = updates.firstName;
  if (updates.lastName !== undefined) row.last_name = updates.lastName;
  if (updates.position !== undefined) row.position = updates.position;
  if (updates.jerseyNumber !== undefined)
    row.jersey_number = updates.jerseyNumber;
  if (updates.photoUrl !== undefined) row.photo_url = updates.photoUrl ?? null;
  if (updates.mapGroup !== undefined) row.map_group = updates.mapGroup ?? null;
  if (updates.churchUnit !== undefined)
    row.church_unit = updates.churchUnit ?? null;
  if (updates.preferredFoot !== undefined)
    row.preferred_foot = updates.preferredFoot ?? null;
  if (updates.heightCm !== undefined) row.height_cm = updates.heightCm ?? null;
  if (updates.weightKg !== undefined) row.weight_kg = updates.weightKg ?? null;
  const { error } = await supabase.from("players").update(row).eq("id", id);
  if (error) throw error;
}

export async function getCompletePlayerCountsByClub(): Promise<
  Record<string, number>
> {
  const { data, error } = await supabase
    .from("players")
    .select("club_id")
    .not("photo_url", "is", null)
    .not("map_group", "is", null);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { club_id: string }[]) {
    counts[row.club_id] = (counts[row.club_id] ?? 0) + 1;
  }
  return counts;
}

// ── Fixture mutations ─────────────────────────────────────────────────────────

export async function createFixture(
  fixture: Omit<MatchFixture, "id" | "homeScore" | "awayScore"> & {
    homeScore?: number;
    awayScore?: number;
  },
): Promise<MatchFixture> {
  const { data, error } = await supabase
    .from("fixtures")
    .insert({
      matchday: fixture.matchday,
      kickoff_date: fixture.kickoffDate,
      home_club_id: fixture.homeClubId,
      away_club_id: fixture.awayClubId,
      home_score: fixture.homeScore ?? null,
      away_score: fixture.awayScore ?? null,
      venue: fixture.venue ?? null,
    })
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error, "fixtures")) {
      throw new Error(missingTableMessage("fixtures"));
    }
    throw error;
  }
  return rowToFixture(data as MatchFixtureRow);
}

export async function updateFixture(
  id: string,
  updates: Partial<Omit<MatchFixture, "id">>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.matchday !== undefined) row.matchday = updates.matchday;
  if (updates.kickoffDate !== undefined) row.kickoff_date = updates.kickoffDate;
  if (updates.homeClubId !== undefined) row.home_club_id = updates.homeClubId;
  if (updates.awayClubId !== undefined) row.away_club_id = updates.awayClubId;
  if (updates.homeScore !== undefined) row.home_score = updates.homeScore;
  if (updates.awayScore !== undefined) row.away_score = updates.awayScore;
  if (updates.venue !== undefined) row.venue = updates.venue ?? null;
  const { error } = await supabase.from("fixtures").update(row).eq("id", id);
  if (error) {
    if (isMissingTableError(error, "fixtures")) {
      throw new Error(missingTableMessage("fixtures"));
    }
    throw error;
  }
}

export async function deleteFixture(id: string): Promise<void> {
  const { error } = await supabase.from("fixtures").delete().eq("id", id);
  if (error) {
    if (isMissingTableError(error, "fixtures")) {
      throw new Error(missingTableMessage("fixtures"));
    }
    throw error;
  }
}

export async function setMatchPlayerGoals(
  matchId: string,
  goals: Array<{ playerId: string; clubId: string; goals: number }>,
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("match_goals")
    .delete()
    .eq("match_id", matchId);
  if (deleteError) {
    if (isMissingTableError(deleteError, "match_goals")) {
      throw new Error(missingTableMessage("match_goals"));
    }
    throw deleteError;
  }

  const cleaned = goals.filter((entry) => entry.goals > 0);
  if (cleaned.length === 0) return;

  const { error: insertError } = await supabase.from("match_goals").insert(
    cleaned.map((entry) => ({
      match_id: matchId,
      player_id: entry.playerId,
      club_id: entry.clubId,
      goals: entry.goals,
    })),
  );
  if (insertError) {
    if (isMissingTableError(insertError, "match_goals")) {
      throw new Error(missingTableMessage("match_goals"));
    }
    throw insertError;
  }
}

// ── Profile mutations ─────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, "role" | "clubId">>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.role !== undefined) row.role = updates.role;
  if ("clubId" in updates) row.club_id = updates.clubId ?? null;
  const { error } = await supabase
    .from("profiles")
    .update(row)
    .eq("id", userId);
  if (error) throw error;
}

// ── Competition helpers ───────────────────────────────────────────────────────

export function buildLeagueTable(
  clubs: Club[],
  fixtures: MatchFixture[],
): LeagueTableRow[] {
  const map = new Map<string, LeagueTableRow>();
  const clubNameMap = new Map(
    clubs.map((club) => [club.id, club.name.toLowerCase()]),
  );

  clubs.forEach((club) => {
    map.set(club.id, {
      clubId: club.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  fixtures.forEach((fixture) => {
    if (fixture.homeScore === undefined || fixture.awayScore === undefined) {
      return;
    }

    const home = map.get(fixture.homeClubId);
    const away = map.get(fixture.awayClubId);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.goalsFor += fixture.homeScore;
    home.goalsAgainst += fixture.awayScore;
    away.goalsFor += fixture.awayScore;
    away.goalsAgainst += fixture.homeScore;

    if (fixture.homeScore > fixture.awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (fixture.homeScore < fixture.awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
    }))
    .sort((a, b) => {
      const aName = clubNameMap.get(a.clubId) ?? "";
      const bName = clubNameMap.get(b.clubId) ?? "";
      if (aName !== bName) return aName.localeCompare(bName);
      return a.clubId.localeCompare(b.clubId);
    });
}
