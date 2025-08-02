import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Button } from "@/components/ui/button";
import { CreateEntryForm } from "@/components/CreateEntryForm";
import { EditEntryForm } from "@/components/EditEntryForm";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus } from "lucide-react";
import { JournalEntry } from "@shared/api";

export default function Journal() {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const allEntries = await SupabaseStorage.getJournalEntries();
      setEntries(allEntries);
      console.log("��� Entries loaded from Supabase:", {
        count: allEntries.length,
        entries: allEntries,
      });
    } catch (error) {
      console.error("❌ Failed to load entries:", error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadEntries();

      // Listen for real-time updates
      const unsubscribe = SupabaseStorage.onUpdate(() => {
        console.log("🔄 Real-time update received, reloading entries...");
        loadEntries();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  const handleLike = async (entryId: string) => {
    try {
      // Get current entry, toggle like, and save back
      const entry = entries.find((e) => e.id === entryId);
      if (entry) {
        const updatedEntry = {
          ...entry,
          likes: (entry.likes || 0) + (entry.isLiked ? -1 : 1),
          isLiked: !entry.isLiked,
          updatedAt: new Date().toISOString(),
        };
        await SupabaseStorage.saveJournalEntry(updatedEntry);
        // Update local state immediately
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? updatedEntry : e))
        );
      }
    } catch (error) {
      console.error("❌ Failed to toggle like:", error);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await SupabaseStorage.deleteJournalEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (error) {
      console.error("❌ Failed to delete entry:", error);
    }
  };

  const handleEntryCreated = async (entry: JournalEntry) => {
    try {
      await SupabaseStorage.saveJournalEntry(entry);
      setEntries((prev) => [entry, ...prev]);
      setIsCreateFormOpen(false);
    } catch (error) {
      console.error("❌ Failed to create entry:", error);
    }
  };

  const handleEntryUpdated = async (updatedEntry: JournalEntry) => {
    try {
      await SupabaseStorage.saveJournalEntry(updatedEntry);
      setEntries((prev) =>
        prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
      );
      setEditingEntry(null);
    } catch (error) {
      console.error("❌ Failed to update entry:", error);
    }
  };

  // Allow guest access to view journal entries

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Family Journal</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-600">
                Capturing our Scottish adventures
              </p>
              {entries.length > 0 && (
                <Badge variant="secondary">
                  {entries.length} entries
                </Badge>
              )}
            </div>
          </div>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setIsCreateFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        )}
        {!isAuthenticated && (
          <div className="text-center">
            <p className="text-sm text-gray-500">View-only mode</p>
            <p className="text-xs text-gray-400">Login to add entries</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journal entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Journal Entries Yet
          </h2>
          <p className="text-gray-500 mb-6">
            Start documenting your family adventures in Scotland!
          </p>
          <Button onClick={() => setIsCreateFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onLike={isAuthenticated ? handleLike : undefined}
              onEdit={isAuthenticated ? setEditingEntry : undefined}
              onDelete={isAuthenticated ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {/* Create Entry Form */}
      {isCreateFormOpen && (
        <CreateEntryForm
          onEntryCreated={handleEntryCreated}
          onCancel={() => setIsCreateFormOpen(false)}
        />
      )}

      {/* Edit Entry Form */}
      {editingEntry && (
        <EditEntryForm
          entry={editingEntry}
          onEntryUpdated={handleEntryUpdated}
          onCancel={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}
