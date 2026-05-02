import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Moon, Sun } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--gradient-pitch)" }}>
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="tracking-tight">PIE Cup</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" end className={({ isActive }) => `px-3 py-2 text-sm rounded-md hover:bg-secondary ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              Clubs
            </NavLink>
            {user?.role === "super" && (
              <NavLink to="/admin" className={({ isActive }) => `px-3 py-2 text-sm rounded-md hover:bg-secondary ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                Admin
              </NavLink>
            )}
            {user?.role === "club" && (
              <NavLink to="/my-club" className={({ isActive }) => `px-3 py-2 text-sm rounded-md hover:bg-secondary ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                My Club
              </NavLink>
            )}
            <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user ? (
              <>
                <span className="hidden sm:inline text-xs text-muted-foreground px-2">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => { logout(); nav("/"); }}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild><Link to="/login">Log in</Link></Button>
                <Button size="sm" asChild><Link to="/signup">Sign up</Link></Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        PIE Cup · Football club & squad manager
      </footer>
    </div>
  );
}