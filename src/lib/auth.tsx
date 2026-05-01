import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getSession, getUsers, hash, Role, setSession, setUsers, uid, User, seedIfNeeded } from "./storage";

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  refresh: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refresh = () => {
    const s = getSession();
    if (!s) return setUser(null);
    const u = getUsers().find((x) => x.id === s.userId) || null;
    setUser(u);
  };

  useEffect(() => {
    seedIfNeeded();
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login: AuthCtx["login"] = (email, password) => {
    const users = getUsers();
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase().trim());
    if (!u) return { ok: false, error: "No account with that email" };
    if (u.passwordHash !== hash(password)) return { ok: false, error: "Incorrect password" };
    setSession({ userId: u.id });
    setUser(u);
    return { ok: true };
  };

  const signup: AuthCtx["signup"] = (email, password) => {
    const e = email.toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: "Invalid email" };
    if (password.length < 6) return { ok: false, error: "Password must be 6+ characters" };
    const users = getUsers();
    if (users.some((x) => x.email.toLowerCase() === e)) return { ok: false, error: "Email already registered" };
    const newUser: User = { id: uid(), email: e, passwordHash: hash(password), role: "user" };
    setUsers([...users, newUser]);
    setSession({ userId: newUser.id });
    setUser(newUser);
    return { ok: true };
  };

  const logout = () => {
    setSession(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, signup, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}

export function roleHome(role?: Role) {
  if (role === "super") return "/admin";
  if (role === "club") return "/my-club";
  return "/";
}