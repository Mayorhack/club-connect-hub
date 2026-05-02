import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Moon, Sun } from "lucide-react";

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  function navLinkClass(isActive: boolean) {
    const base = "px-3 py-2 text-sm rounded-md transition-colors";
    if (transparent) {
      return `${base} hover:bg-white/10 ${isActive ? "text-white font-semibold" : "text-white/80"}`;
    }
    return `${base} hover:bg-secondary ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className={`${isHome ? "fixed top-0 left-0 right-0 z-50" : "relative border-b border-border"} transition-all duration-300 ${
          transparent
            ? "bg-transparent border-transparent"
            : "bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
        }`}
      >
        <div className="container flex items-center justify-between h-16">
          <Link
            to="/"
            className={`flex items-center gap-2 font-bold text-lg ${transparent ? "text-white" : ""}`}
          >
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: "var(--gradient-pitch)" }}
            >
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="tracking-tight">PIE Cup</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) => navLinkClass(isActive)}
            >
              Clubs
            </NavLink>
            {user?.role === "super" && (
              <NavLink
                to="/admin"
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Admin
              </NavLink>
            )}
            {user?.role === "club" && (
              <NavLink
                to="/my-club"
                className={({ isActive }) => navLinkClass(isActive)}
              >
                My Club
              </NavLink>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              aria-label="Toggle theme"
              className={transparent ? "text-white hover:bg-white/10" : ""}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {user ? (
              <>
                <span
                  className={`hidden sm:inline text-xs px-2 ${transparent ? "text-white/70" : "text-muted-foreground"}`}
                >
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={transparent ? "text-white hover:bg-white/10" : ""}
                  onClick={() => {
                    void logout().then(() => nav("/"));
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={transparent ? "text-white hover:bg-white/10" : ""}
                >
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className={`flex-1${isHome ? " -mt-16" : ""}`}>{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        PIE Cup · Football club & squad manager
      </footer>
    </div>
  );
}
