import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ClubPublic from "./pages/ClubPublic.tsx";
import CompetitionCenter from "./pages/CompetitionCenter.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import MyClub from "./pages/MyClub.tsx";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // treat data as fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // keep unused data in cache for 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/competition" element={<CompetitionCenter />} />
              <Route path="/clubs/:id" element={<ClubPublic />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="super">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-club"
                element={
                  <ProtectedRoute role="club">
                    <MyClub />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
