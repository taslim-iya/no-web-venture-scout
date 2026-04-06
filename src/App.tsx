import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { LayoutDashboard, Search, Users, Upload, Globe } from "lucide-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Outreach from "./pages/Outreach";
import BatchUpload from "./pages/BatchUpload";
import MockBuilder from "./pages/MockBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function TopNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <span className="text-lg font-bold text-foreground mr-6">Venture Scout</span>
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </NavLink>
        <NavLink to="/" end className={linkClass}>
          <Search className="w-4 h-4" /> Search
        </NavLink>
        <NavLink to="/outreach" className={linkClass}>
          <Users className="w-4 h-4" /> Outreach
        </NavLink>
        <NavLink to="/upload" className={linkClass}>
          <Upload className="w-4 h-4" /> Batch Upload
        </NavLink>
        <NavLink to="/mockup" className={linkClass}>
          <Globe className="w-4 h-4" /> Mock Website
        </NavLink>
      </div>
    </nav>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TopNav />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/upload" element={<BatchUpload />} />
          <Route path="/mockup" element={<MockBuilder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
