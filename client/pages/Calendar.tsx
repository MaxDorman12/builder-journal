import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Heart,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Camera,
} from "lucide-react";
import { JournalEntry } from "@shared/api";

export default function Calendar() {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    // Load data for all users (guests and authenticated)
    loadEntries();

    // Only set up real-time updates for authenticated users
    if (isAuthenticated) {
      const unsubscribe = SupabaseStorage.onUpdate(() => {
        console.log("🔄 Real-time update received, reloading calendar...");
        loadEntries();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  // Group entries by date
  const entriesByDate = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    },
    {} as Record<string, JournalEntry[]>,
  );

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
            ? {
                ...e,
                likes: (e.likes || 0) + (e.isLiked ? -1 : 1),
                isLiked: !e.isLiked,
              }
            : e,
        ),
      );
      // Update selected entries if viewing a specific date
      if (selectedDate) {
        const updatedEntries = entries.map((e) =>
          e.id === entryId
            ? {
                ...e,
                likes: (e.likes || 0) + (e.isLiked ? -1 : 1),
                isLiked: !e.isLiked,
              }
            : e,
        );
        setSelectedEntries(
          updatedEntries.filter((e) => e.date === selectedDate),
        );
      }
    } catch (error) {
      console.error("❌ Failed to toggle like:", error);
    }
  };

  const dates = Object.keys(entriesByDate).sort().reverse();

  // Helper functions for calendar
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthDays = getMonthDays(currentMonth);
  const totalAdventures = entries.length;
  const totalPhotos = entries.reduce(
    (count, entry) => count + (entry.images?.length || 0),
    0,
  );
  const totalLikes = entries.reduce(
    (sum, entry) => sum + (entry.likes || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <CalendarIcon className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium text-gray-700">
              Loading our adventure timeline...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              📅 Gathering memories by date
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300 px-4 py-2 text-sm font-medium mb-6">
              📅 Journey through our Scottish timeline
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Adventure Calendar
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6">
            Our Family Timeline
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Explore our Scottish adventures through time. Each date tells a
            story of discovery, wonder, and family memories across the beautiful
            highlands.
          </p>

          {!isAuthenticated && (
            <div className="inline-block p-4 bg-purple-100 border border-purple-200 rounded-lg mb-8">
              <p className="text-purple-800">
                👁️ <strong>View-only mode</strong> - Explore our adventure
                timeline
              </p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-purple-700" />
              <p className="text-2xl font-bold text-purple-800">
                {dates.length}
              </p>
              <p className="text-sm text-purple-600">Adventure Days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-700" />
              <p className="text-2xl font-bold text-blue-800">
                {totalAdventures}
              </p>
              <p className="text-sm text-blue-600">Total Adventures</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Camera className="h-8 w-8 mx-auto mb-2 text-green-700" />
              <p className="text-2xl font-bold text-green-800">{totalPhotos}</p>
              <p className="text-sm text-green-600">Photos Captured</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-700" />
              <p className="text-2xl font-bold text-pink-800">{totalLikes}</p>
              <p className="text-sm text-pink-600">Love Reactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6" />
                    <span className="text-xl">
                      {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-600 p-2"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2"></div>;
                    }

                    const dayKey = formatDateKey(day);
                    const hasEntries = entriesByDate[dayKey];
                    const isSelected = selectedDate === dayKey;

                    return (
                      <button
                        key={dayKey}
                        onClick={() => hasEntries && handleDateClick(dayKey)}
                        className={`p-3 text-sm rounded-lg transition-all relative ${
                          hasEntries
                            ? isSelected
                              ? "bg-purple-600 text-white shadow-lg scale-105"
                              : "bg-purple-100 text-purple-800 hover:bg-purple-200 hover:scale-105"
                            : "text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {day.getDate()}
                        {hasEntries && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-400 rounded-full text-xs text-white flex items-center justify-center">
                            {hasEntries.length}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Adventure Timeline */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-6 w-6" />
                  🏴󠁧󠁢󠁳󠁣󠁴󠁿 Adventure Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {dates.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No Adventures Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start documenting your Scottish journeys to see them here
                    </p>
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                      📝 Create First Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {dates.map((date, index) => {
                      const dateEntries = entriesByDate[date];
                      const colors = [
                        "from-purple-100 to-purple-200 border-purple-300",
                        "from-blue-100 to-blue-200 border-blue-300",
                        "from-green-100 to-green-200 border-green-300",
                        "from-pink-100 to-pink-200 border-pink-300",
                        "from-yellow-100 to-yellow-200 border-yellow-300",
                        "from-indigo-100 to-indigo-200 border-indigo-300",
                      ];
                      const colorClass = colors[index % colors.length];

                      return (
                        <Card
                          key={date}
                          className={`bg-gradient-to-r ${colorClass} cursor-pointer hover:scale-105 transition-all duration-200 ${
                            selectedDate === date
                              ? "ring-2 ring-purple-500 shadow-lg"
                              : ""
                          }`}
                          onClick={() => handleDateClick(date)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-gray-800">
                                  {new Date(date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {dateEntries.length} adventure
                                  {dateEntries.length === 1 ? "" : "s"} •
                                  {dateEntries.reduce(
                                    (sum, e) => sum + (e.likes || 0),
                                    0,
                                  )}{" "}
                                  likes
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-white/50 text-gray-700 font-bold">
                                  {dateEntries.length}
                                </Badge>
                                {dateEntries.some((e) => e.images?.length) && (
                                  <Camera className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div>
            <Card className="sticky top-4">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="h-6 w-6" />
                  {selectedDate
                    ? `${new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} Adventures`
                    : "Select a Date"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedDate && selectedEntries.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <p className="text-2xl font-bold text-gray-800 mb-1">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <Badge className="bg-green-100 text-green-700">
                        {selectedEntries.length} adventure
                        {selectedEntries.length === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    {selectedEntries.map((entry, index) => (
                      <Card
                        key={entry.id}
                        className="bg-gradient-to-br from-white to-gray-50 border-gray-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                index % 4 === 0
                                  ? "bg-purple-500"
                                  : index % 4 === 1
                                    ? "bg-blue-500"
                                    : index % 4 === 2
                                      ? "bg-green-500"
                                      : "bg-pink-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">
                                {entry.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                {entry.content}
                              </p>

                              {entry.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                  <MapPin className="h-3 w-3" />
                                  {entry.location}
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {entry.images && entry.images.length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      📸 {entry.images.length} photo
                                      {entry.images.length === 1 ? "" : "s"}
                                    </Badge>
                                  )}
                                </div>

                                {isAuthenticated ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLike(entry.id)}
                                    className={`gap-1 ${entry.isLiked ? "text-red-600" : "text-gray-400"}`}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${entry.isLiked ? "fill-current" : ""}`}
                                    />
                                    {entry.likes || 0}
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-1 text-gray-400">
                                    <Heart className="h-4 w-4" />
                                    {entry.likes || 0}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {entry.images && entry.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {entry.images
                                .slice(0, 2)
                                .map((image, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={image}
                                    alt={`${entry.title} ${imgIndex + 1}`}
                                    className="w-full h-20 object-cover rounded border"
                                  />
                                ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No adventures on this date</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Choose a Date
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Click on any highlighted date to see the adventures from
                      that day
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Made with ❤️ by the Dorman Family Adventures
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-2 h-2 bg-purple-300 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
