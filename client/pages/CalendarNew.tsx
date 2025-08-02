import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Heart } from "lucide-react";
import { JournalEntry } from "@shared/api";

export default function Calendar() {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const allEntries = await SupabaseStorage.getJournalEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error("❌ Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadEntries();

      // Listen for real-time updates
      const unsubscribe = SupabaseStorage.onUpdate(() => {
        console.log("🔄 Real-time update received, reloading calendar...");
        loadEntries();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setSelectedEntries(entriesByDate[date] || []);
  };

  const handleLike = async (entryId: string) => {
    try {
      await SupabaseStorage.toggleLike(entryId);
      // Update local state
      setEntries((prev) =>
        prev.map((e) => 
          e.id === entryId 
            ? { ...e, likes: (e.likes || 0) + (e.isLiked ? -1 : 1), isLiked: !e.isLiked }
            : e
        )
      );
      // Update selected entries if viewing a specific date
      if (selectedDate) {
        const updatedEntries = entries.map((e) => 
          e.id === entryId 
            ? { ...e, likes: (e.likes || 0) + (e.isLiked ? -1 : 1), isLiked: !e.isLiked }
            : e
        );
        setSelectedEntries(updatedEntries.filter((e) => e.date === selectedDate));
      }
    } catch (error) {
      console.error("❌ Failed to toggle like:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Calendar</h1>
          <p className="text-gray-600">Please log in to view the calendar.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const dates = Object.keys(entriesByDate).sort().reverse();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <CalendarIcon className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-gray-600">
            View your adventures by date
            {entries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {dates.length} dates with entries
              </Badge>
            )}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Date List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Entry Dates</h2>
          {dates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No journal entries yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start creating entries to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dates.map((date) => (
                <Card
                  key={date}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedDate === date ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {entriesByDate[date].length} entr{entriesByDate[date].length === 1 ? "y" : "ies"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {entriesByDate[date].length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Selected Date Entries */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedDate ? 
              `Entries for ${new Date(selectedDate).toLocaleDateString()}` : 
              "Select a date"
            }
          </h2>
          {selectedDate ? (
            <div className="space-y-4">
              {selectedEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{entry.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(entry.id)}
                        className={`gap-1 ${entry.isLiked ? "text-red-600" : "text-gray-400"}`}
                      >
                        <Heart className={`h-4 w-4 ${entry.isLiked ? "fill-current" : ""}`} />
                        {entry.likes || 0}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2 line-clamp-3">{entry.content}</p>
                    {entry.location && (
                      <p className="text-sm text-gray-500">📍 {entry.location}</p>
                    )}
                    {entry.images && entry.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {entry.images.slice(0, 2).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${entry.title} ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select a date to view entries</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
