
# Football Management Tool

A simple football club & squad manager. Super admin creates clubs and assigns a club admin. Each club admin manages a roster (max 25 players, at least 2 goalkeepers required to "publish"). Anyone can browse a public directory of clubs and view rosters.

> Heads-up: You chose email/password stored in localStorage. This is insecure — anyone can open browser devtools and grant themselves super-admin. It's fine for a demo, but not for real use. We can swap to Lovable Cloud auth later with minimal changes.

## Roles

- **Super Admin** — seeded account (`admin@demo.com` / `admin123`). Creates clubs, assigns club admins, can delete clubs/users.
- **Club Admin** — manages exactly one club's roster and basic club info.
- **Visitor** — no login needed; browses clubs and rosters.

## Pages & Flows

1. **Public home `/`** — Grid of all clubs (logo, name, city, player count). Click → public club page.
2. **Public club page `/clubs/:id`** — Club header (logo, name, founded, city) + roster grouped by position (GK / DEF / MID / FWD), each card showing photo, jersey #, name, position.
3. **Auth `/login`, `/signup`** — Email + password forms. Signup creates a regular user (no club). Login routes by role.
4. **Super admin dashboard `/admin`**
   - List all clubs → create / edit / delete.
   - Create club form: name, city, founded year, logo (image URL or upload), assign club admin (dropdown of registered users without a club).
   - User list with role badges.
5. **Club admin dashboard `/my-club`**
   - Edit club info (name, city, founded, logo).
   - Roster table with add/edit/delete player.
   - Counters: `Players X/25` and `Goalkeepers X (min 2)`.
   - Add player form: name, position (GK/DEF/MID/FWD), jersey number (1–99, unique within club), photo.
   - Validation: block adding a 26th player; warn if jersey # taken; warn if fewer than 2 GKs.

## Rules & Validation

- Max 25 players per club (hard stop).
- At least 2 goalkeepers required — shown as a warning banner; club still visible publicly but flagged "Squad incomplete".
- Jersey numbers unique per club, 1–99.
- A user can be admin of only one club.
- Deleting a club removes its players and frees its admin.

## Data Model (localStorage keys)

- `fm.users` — `[{ id, email, passwordHash, role: 'super'|'club'|'user', clubId? }]`
- `fm.session` — `{ userId }` for current login
- `fm.clubs` — `[{ id, name, city, foundedYear, logoUrl, adminId }]`
- `fm.players` — `[{ id, clubId, name, position, jerseyNumber, photoUrl }]`
- Seeded on first load: one super admin + 2 demo clubs with sample players.

## Design

- Clean sports-app feel: white background, bold dark headings, single accent color (deep green), rounded cards, subtle shadows.
- Position color chips: GK amber, DEF blue, MID green, FWD red.
- Roster cards in responsive grid (1 col mobile → 4 col desktop).
- Use existing shadcn components (Card, Button, Dialog, Input, Select, Table, Badge, Toast).

## Technical Notes

- React Router routes: `/`, `/clubs/:id`, `/login`, `/signup`, `/admin`, `/my-club`, `*`.
- `AuthContext` wraps app; reads/writes `fm.session`; exposes `currentUser`, `login`, `logout`, `signup`.
- `ProtectedRoute` component checks role; redirects unauthorized users to `/login`.
- Password "hashing" via simple hash (e.g., btoa + salt) — explicitly noted as not secure.
- Image uploads: store as data URLs in localStorage (with size warning > 500KB) or accept URL input. Default to URL input + small avatar fallback (initials).
- Update design tokens in `src/index.css` (HSL accent green) and extend `tailwind.config.ts`.
- Files to add: `src/lib/storage.ts` (CRUD helpers), `src/lib/auth.tsx` (context), `src/components/ProtectedRoute.tsx`, `src/components/PlayerCard.tsx`, `src/components/ClubCard.tsx`, pages under `src/pages/` for `Login`, `Signup`, `AdminDashboard`, `MyClub`, `ClubPublic`, plus a shared `Layout` with header/nav.
- Replace `src/pages/Index.tsx` with the public clubs grid.
