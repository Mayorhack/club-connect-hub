import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Role } from "@/lib/storage";

export function ProtectedRoute({ role, children }: { role: Role; children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}