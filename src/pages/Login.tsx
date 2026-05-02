import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth, roleHome } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const r = await login(email, password);
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Login failed");
    toast.success("Welcome back");
    nav(roleHome(r.role));
  };

  return (
    <Layout>
      <div className="container py-16 max-w-md">
        <h1 className="text-3xl font-bold mb-2">Log in</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Use <code>admin@demo.com / admin123</code> for super admin, or{" "}
          <code>rovers@demo.com / rovers123</code> for a club admin.
        </p>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-border bg-card p-6"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            No account?{" "}
            <Link to="/signup" className="text-primary font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
