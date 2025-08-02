import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { NetworkStatus } from "@/components/NetworkStatus";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Journal from "./pages/Journal";
import Map from "./pages/Map";
import Wishlist from "./pages/Wishlist";
import Gallery from "./pages/Gallery";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import { SupabaseStorage } from "./lib/supabaseOnly";
import { PhotoStorage } from "./lib/photoStorage";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Global initialization component
const StorageInitializer = () => {
  useEffect(() => {
    console.log("🚀 Setting up Supabase-only storage...");
    SupabaseStorage.setupSubscriptions();
    console.log("✅ SupabaseStorage initialized successfully");

    return () => {
      SupabaseStorage.cleanup();
    };
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <StorageInitializer />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Index />
                </Layout>
              }
            />
            <Route
              path="/journal"
              element={
                <Layout>
                  <Journal />
                </Layout>
              }
            />
            <Route
              path="/map"
              element={
                <Layout>
                  <Map />
                </Layout>
              }
            />
            <Route
              path="/wishlist"
              element={
                <Layout>
                  <Wishlist />
                </Layout>
              }
            />
            <Route
              path="/gallery"
              element={
                <Layout>
                  <Gallery />
                </Layout>
              }
            />
            <Route
              path="/search"
              element={
                <Layout>
                  <Search />
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <Settings />
                </Layout>
              }
            />
            <Route
              path="/calendar"
              element={
                <Layout>
                  <Calendar />
                </Layout>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
          <NetworkStatus />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root")!;

// Store root in global variable to prevent multiple creation
if (!(window as any).__react_root__) {
  (window as any).__react_root__ = createRoot(container);
}
(window as any).__react_root__.render(<App />);
