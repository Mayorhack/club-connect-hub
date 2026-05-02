import { supabase } from "./supabase";

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
  foundedYear: number;
  logoUrl?: string;
  adminId?: string;
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
    .select("*")
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
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.city !== undefined) row.city = updates.city;
  if (updates.state !== undefined) row.state = updates.state ?? null;
  if (updates.cciBranch !== undefined)
    row.cci_branch = updates.cciBranch ?? null;
  if (updates.foundedYear !== undefined) row.founded_year = updates.foundedYear;
  if (updates.logoUrl !== undefined) row.logo_url = updates.logoUrl ?? null;
  if (updates.adminId !== undefined) row.admin_id = updates.adminId ?? null;
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
