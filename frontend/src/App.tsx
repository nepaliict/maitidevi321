import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Dashboard from "./pages/Dashboard";
import Affiliate from "./pages/Affiliate";
import Deposit from "./pages/Deposit";
import MasterAdminPanel from "./pages/MasterAdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:category" element={<Games />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/sports" element={<Games />} />
            <Route path="/live-casino" element={<Games />} />
            <Route path="/promotions" element={<Index />} />
            <Route path="/master-admin" element={<MasterAdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
