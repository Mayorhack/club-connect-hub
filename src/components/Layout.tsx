import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Moon, Sun, Menu, X } from "lucide-react";
import { type User } from "@/lib/storage";

function navLinkClass(isActive: boolean, transparent: boolean) {
  const base = "px-3 py-2 text-sm rounded-md transition-colors";
  if (transparent) {
    return `${base} hover:bg-white/10 ${isActive ? "text-white font-semibold" : "text-white/80"}`;
  }
  return `${base} hover:bg-secondary ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`;
}

function mobileNavLinkClass(isActive: boolean) {
  return `px-3 py-2.5 text-sm rounded-md transition-colors hover:bg-secondary ${isActive ? "text-primary font-semibold" : "text-foreground"}`;
}

type NavProps = Readonly<{
  user: User | null;
  transparent: boolean;
  theme: string;
  toggle: () => void;
  onLogout: () => void;
}>;

function DesktopNav({ user, transparent, theme, toggle, onLogout }: NavProps) {
  const ghostClass = transparent ? "text-white hover:bg-white/10" : "";
  return (
    <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
      <NavLink
        to="/"
        end
        className={({ isActive }) => navLinkClass(isActive, transparent)}
      >
        Clubs
      </NavLink>
      {user?.role === "super" && (
        <NavLink
          to="/admin"
          className={({ isActive }) => navLinkClass(isActive, transparent)}
        >
          Admin
        </NavLink>
      )}
      {user?.role === "club" && (
        <NavLink
          to="/my-club"
          className={({ isActive }) => navLinkClass(isActive, transparent)}
        >
          My Club
        </NavLink>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        aria-label="Toggle theme"
        className={ghostClass}
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
            className={ghostClass}
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" asChild className={ghostClass}>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </>
      )}
    </nav>
  );
}

type MobileMenuProps = Readonly<{
  user: User | null;
  onLogout: () => void;
}>;

function MobileMenu({ user, onLogout }: MobileMenuProps) {
  return (
    <div className="sm:hidden border-t border-border bg-card/95 backdrop-blur-md">
      <nav className="container py-3 flex flex-col gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) => mobileNavLinkClass(isActive)}
        >
          Clubs
        </NavLink>
        {user?.role === "super" && (
          <NavLink
            to="/admin"
            className={({ isActive }) => mobileNavLinkClass(isActive)}
          >
            Admin
          </NavLink>
        )}
        {user?.role === "club" && (
          <NavLink
            to="/my-club"
            className={({ isActive }) => mobileNavLinkClass(isActive)}
          >
            My Club
          </NavLink>
        )}
        <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1">
          {user ? (
            <>
              <div className="px-3 py-1 text-xs text-muted-foreground truncate">
                {user.email}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                asChild
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" className="justify-start" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled && !mobileOpen;
  const handleLogout = () => {
    void logout().then(() => nav("/"));
  };

  const headerClass = [
    isHome
      ? "fixed top-0 left-0 right-0 z-50"
      : "relative border-b border-border",
    "transition-all duration-300",
    transparent
      ? "bg-transparent border-transparent"
      : "bg-card/95 backdrop-blur-md border-b border-border shadow-sm",
  ].join(" ");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className={headerClass}>
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

          <DesktopNav
            user={user}
            transparent={transparent}
            theme={theme}
            toggle={toggle}
            onLogout={handleLogout}
          />

          {/* Mobile controls */}
          <div className="flex sm:hidden items-center gap-1">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              className={transparent ? "text-white hover:bg-white/10" : ""}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileOpen && <MobileMenu user={user} onLogout={handleLogout} />}
      </header>
      <main className={`flex-1${isHome ? " -mt-16" : ""}`}>{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        PIE Cup · Football club & squad manager
      </footer>
    </div>
  );
}
