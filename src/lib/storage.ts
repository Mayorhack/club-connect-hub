export type Role = "super" | "club" | "user";
export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  clubId?: string;
}

export interface Club {
  id: string;
  name: string;
  city: string;
  foundedYear: number;
  logoUrl?: string;
  adminId?: string;
}

export interface Player {
  id: string;
  clubId: string;
  name: string;
  position: Position;
  jerseyNumber: number;
  photoUrl?: string;
}

const KEYS = {
  users: "fm.users",
  session: "fm.session",
  clubs: "fm.clubs",
  players: "fm.players",
  seeded: "fm.seeded",
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Note: NOT a real hash. localStorage-based auth is insecure by design.
export const hash = (s: string) => btoa(unescape(encodeURIComponent("fm:" + s)));

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const getUsers = () => read<User[]>(KEYS.users, []);
export const setUsers = (u: User[]) => write(KEYS.users, u);
export const getClubs = () => read<Club[]>(KEYS.clubs, []);
export const setClubs = (c: Club[]) => write(KEYS.clubs, c);
export const getPlayers = () => read<Player[]>(KEYS.players, []);
export const setPlayers = (p: Player[]) => write(KEYS.players, p);
export const getSession = () => read<{ userId: string } | null>(KEYS.session, null);
export const setSession = (s: { userId: string } | null) => {
  if (s) write(KEYS.session, s);
  else localStorage.removeItem(KEYS.session);
};

export function seedIfNeeded() {
  if (localStorage.getItem(KEYS.seeded)) return;
  const superId = uid();
  const clubAdmin1 = uid();
  const clubAdmin2 = uid();
  const club1 = uid();
  const club2 = uid();

  const users: User[] = [
    { id: superId, email: "admin@demo.com", passwordHash: hash("admin123"), role: "super" },
    { id: clubAdmin1, email: "rovers@demo.com", passwordHash: hash("rovers123"), role: "club", clubId: club1 },
    { id: clubAdmin2, email: "united@demo.com", passwordHash: hash("united123"), role: "club", clubId: club2 },
  ];

  const clubs: Club[] = [
    { id: club1, name: "Riverside Rovers", city: "Manchester", foundedYear: 1903, adminId: clubAdmin1 },
    { id: club2, name: "Coastal United", city: "Brighton", foundedYear: 1921, adminId: clubAdmin2 },
  ];

  const mk = (clubId: string, n: string, position: Position, jerseyNumber: number): Player => ({
    id: uid(), clubId, name: n, position, jerseyNumber,
  });

  const players: Player[] = [
    mk(club1, "James Carter", "GK", 1),
    mk(club1, "Owen Reid", "GK", 22),
    mk(club1, "Marco Diaz", "DEF", 4),
    mk(club1, "Liam Hughes", "DEF", 5),
    mk(club1, "Tom Becker", "MID", 8),
    mk(club1, "Noah Pierce", "MID", 10),
    mk(club1, "Jude Walker", "FWD", 9),
    mk(club2, "Sam Holt", "GK", 1),
    mk(club2, "Eli Banks", "GK", 13),
    mk(club2, "Ravi Shah", "DEF", 3),
    mk(club2, "Kai Mendes", "MID", 6),
    mk(club2, "Theo Vance", "FWD", 11),
  ];

  setUsers(users);
  setClubs(clubs);
  setPlayers(players);
  localStorage.setItem(KEYS.seeded, "1");
}

export function playersByClub(clubId: string) {
  return getPlayers().filter((p) => p.clubId === clubId);
}