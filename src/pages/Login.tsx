import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth, roleHome } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPlayerRegistrationDeadlineStatus } from "@/lib/registrationDeadline";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const deadline = getPlayerRegistrationDeadlineStatus();
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
      <div className="container py-8 sm:py-16 max-w-md">
        <h1 className="text-3xl font-bold mb-2">Log in</h1>
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950 shadow-sm">
          <p className="font-semibold">Club admins</p>
          <p className="mt-1 text-amber-900/90">{deadline.message}</p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6"
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
