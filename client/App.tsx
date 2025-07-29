import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <Layout>
                <Index />
              </Layout>
            } />
            <Route path="/journal" element={
              <Layout>
                <div className="text-center py-16">
                  <h1 className="text-2xl font-bold mb-4">Journal Coming Soon</h1>
                  <p className="text-muted-foreground">This page will show all family journal entries</p>
                </div>
              </Layout>
            } />
            <Route path="/map" element={
              <Layout>
                <div className="text-center py-16">
                  <h1 className="text-2xl font-bold mb-4">Map Coming Soon</h1>
                  <p className="text-muted-foreground">This page will show the interactive Scotland map</p>
                </div>
              </Layout>
            } />
            <Route path="/calendar" element={
              <Layout>
                <div className="text-center py-16">
                  <h1 className="text-2xl font-bold mb-4">Calendar Coming Soon</h1>
                  <p className="text-muted-foreground">This page will show journal entries by date</p>
                </div>
              </Layout>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
