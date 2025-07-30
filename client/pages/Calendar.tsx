import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LocalStorage } from "@/lib/storage";
import { HybridStorage } from "@/lib/hybridStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Camera,
  Heart,
  MapPin,
} from "lucide-react";
import { JournalEntry, MOOD_RATINGS } from "@shared/api";
import { JournalEntryCard } from "@/components/JournalEntryCard";

export default function Calendar() {
  const { isFamilyMember } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    setEntries(HybridStorage.getJournalEntries());
  }, []);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get entries for the current month
  const monthEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getMonth() === currentMonth &&
      entryDate.getFullYear() === currentYear
    );
  });

  // Group entries by date
  const entriesByDate = monthEntries.reduce(
    (acc, entry) => {
      const dateKey = entry.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(entry);
      return acc;
    },
    {} as Record<string, JournalEntry[]>,
  );

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedEntries(entriesByDate[dateStr] || []);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const handleLike = async (entryId: string) => {
    LocalStorage.toggleLike(entryId);
    // Update in cloud if available
    if (HybridStorage.isCloudEnabled()) {
      const entry = HybridStorage.getJournalEntries().find(e => e.id === entryId);
      if (entry) {
        await HybridStorage.saveJournalEntry(entry);
      }
    }
    setEntries(HybridStorage.getJournalEntries());
    // Update selected entries if viewing a specific date
    if (selectedDate) {
      const updatedEntries = HybridStorage.getJournalEntries();
      setSelectedEntries(updatedEntries.filter((e) => e.date === selectedDate));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Adventure Calendar
          </h1>
          <p className="text-muted-foreground">
            Browse our family adventures by date
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{monthEntries.length} adventures this month</span>
          </Badge>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="family-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {monthNames[currentMonth]} {currentYear}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEntries = entriesByDate[dateStr] || [];
                  const isSelected = selectedDate === dateStr;
                  const isToday =
                    new Date().toDateString() ===
                    new Date(currentYear, currentMonth, day).toDateString();

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square p-1 text-sm rounded-lg transition-colors relative ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                            ? "bg-accent text-accent-foreground ring-2 ring-primary"
                            : dayEntries.length > 0
                              ? "bg-muted hover:bg-accent"
                              : "hover:bg-muted"
                      }`}
                    >
                      <span className="block">{day}</span>

                      {dayEntries.length > 0 && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                          {dayEntries.slice(0, 3).map((entry, index) => {
                            const moodData = MOOD_RATINGS.find(
                              (r) => r.value === entry.moodRating,
                            );
                            return (
                              <div
                                key={index}
                                className="w-1 h-1 rounded-full"
                                style={{
                                  backgroundColor: moodData
                                    ? {
                                        1: "#EF4444",
                                        2: "#F97316",
                                        3: "#EAB308",
                                        4: "#22C55E",
                                        5: "#8B5CF6",
                                      }[moodData.value]
                                    : "#6B7280",
                                }}
                              />
                            );
                          })}
                          {dayEntries.length > 3 && (
                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Month Stats */}
          <Card className="family-card">
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-primary" />
                  <span className="text-sm">Adventures</span>
                </div>
                <span className="font-medium">{monthEntries.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Total Likes</span>
                </div>
                <span className="font-medium">
                  {monthEntries.reduce((sum, entry) => sum + entry.likes, 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Places</span>
                </div>
                <span className="font-medium">
                  {new Set(monthEntries.map((e) => e.location)).size}
                </span>
              </div>

              {monthEntries.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    Average Mood
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {
                        MOOD_RATINGS.find(
                          (r) =>
                            r.value ===
                            Math.round(
                              monthEntries.reduce(
                                (sum, e) => sum + e.moodRating,
                                0,
                              ) / monthEntries.length,
                            ),
                        )?.emoji
                      }
                    </span>
                    <span className="font-medium">
                      {(
                        monthEntries.reduce((sum, e) => sum + e.moodRating, 0) /
                        monthEntries.length
                      ).toFixed(1)}
                      /5
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Entries */}
          {monthEntries.length > 0 && (
            <Card className="family-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthEntries
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .slice(0, 3)
                    .map((entry) => {
                      const moodData = MOOD_RATINGS.find(
                        (r) => r.value === entry.moodRating,
                      );
                      return (
                        <div
                          key={entry.id}
                          className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        >
                          <span className="text-lg mt-0.5">
                            {moodData?.emoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {entry.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Selected Date Entries */}
      {selectedDate && selectedEntries.length > 0 && (
        <Card className="family-card">
          <CardHeader>
            <CardTitle>
              Adventures on{" "}
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedEntries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onLike={handleLike}
                  isFamilyMember={isFamilyMember}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedEntries.length === 0 && (
        <Card className="family-card">
          <CardContent className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Adventures This Day
            </h3>
            <p className="text-muted-foreground">
              No family adventures were recorded on{" "}
              {new Date(selectedDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
