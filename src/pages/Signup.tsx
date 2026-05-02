import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const r = await signup(email, password);
    setSubmitting(false);
    if (!r.ok) return toast.error(r.error ?? "Signup failed");
    toast.success("Account created! Check your email to confirm.");
    nav("/");
  };

  return (
    <Layout>
      <div className="container py-16 max-w-md">
        <h1 className="text-3xl font-bold mb-2">Create an account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          A super admin can later assign you as a club administrator.
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
            <Label htmlFor="password">Password (min 6)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Sign up"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
