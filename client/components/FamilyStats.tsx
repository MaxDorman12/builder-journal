import React, { useState, useEffect } from "react";
import { LocalStorage } from "@/lib/storage";
import { HybridStorage } from "@/lib/hybridStorage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  BookOpen,
  Users,
  Heart,
  Camera,
  Calendar,
  TrendingUp,
  Clock,
  Banknote,
  Mountain,
  Target,
  Award,
  Star,
  MessageCircle,
  Navigation,
  ChevronRight,
  BarChart3,
  X,
  ChevronUp,
} from "lucide-react";
import {
  JournalEntry,
  MapPin as MapPinType,
  AREA_TYPES,
  MOOD_RATINGS,
} from "@shared/api";

interface FamilyStatsProps {
  showAll?: boolean;
  onViewAll?: () => void;
  onClose?: () => void;
}

interface StatsData {
  totalEntries: number;
  totalPins: number;
  totalPhotos: number;
  totalLikes: number;
  totalComments: number;
  averageMood: number;
  mostActiveAuthor: { name: string; count: number };
  favoriteAreaType: { type: string; count: number };
  totalCostSpent: number;
  paidActivitiesCount: number;
  freeActivitiesCount: number;
  busyLocationsCount: number;
  currentStreak: number;
  bestRatedEntry: { title: string; rating: number } | null;
  mostLovedEntry: { title: string; likes: number } | null;
  monthlyBreakdown: { [month: string]: number };
  thisYearEntries: number;
  adventuresByMood: { [mood: number]: number };
}

export function FamilyStats({
  showAll = false,
  onViewAll,
  onClose,
}: FamilyStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    try {
      const entries = HybridStorage.getJournalEntries();
      const pins = HybridStorage.getMapPins();

      // Basic counts
      const totalEntries = entries.length;
      const totalPins = pins.length;
      const totalPhotos = entries.reduce(
        (sum, entry) => sum + entry.images.length,
        0,
      );
      const totalLikes = entries.reduce((sum, entry) => sum + entry.likes, 0);
      const totalComments = entries.reduce(
        (sum, entry) => sum + entry.comments.length,
        0,
      );

      // Average mood
      const averageMood =
        entries.length > 0
          ? Math.round(
              entries.reduce((sum, entry) => sum + entry.moodRating, 0) /
                entries.length,
            )
          : 0;

      // Most active author
      const authorCounts: { [key: string]: number } = {};
      entries.forEach((entry) => {
        authorCounts[entry.author] = (authorCounts[entry.author] || 0) + 1;
      });
      const mostActiveAuthor = Object.entries(authorCounts).reduce(
        (max, [name, count]) => (count > max.count ? { name, count } : max),
        { name: "No entries", count: 0 },
      );

      // Favorite area type
      const areaCounts: { [key: string]: number } = {};
      entries.forEach((entry) => {
        areaCounts[entry.areaType] = (areaCounts[entry.areaType] || 0) + 1;
      });
      const favoriteAreaType = Object.entries(areaCounts).reduce(
        (max, [type, count]) => (count > max.count ? { type, count } : max),
        { type: "None", count: 0 },
      );

      // Cost calculations
      const totalCostSpent = entries.reduce((sum, entry) => {
        let cost = 0;
        // Parse activity cost
        if (entry.isPaidActivity && entry.activityCost) {
          const match = entry.activityCost.match(/£(\d+)/);
          if (match) cost += parseInt(match[1]);
        }
        // Parse parking cost
        if (!entry.hasFreeParkingAvailable && entry.parkingCost) {
          const match = entry.parkingCost.match(/£(\d+)/);
          if (match) cost += parseInt(match[1]);
        }
        return sum + cost;
      }, 0);

      const paidActivitiesCount = entries.filter(
        (e) => e.isPaidActivity,
      ).length;
      const freeActivitiesCount = entries.filter(
        (e) => !e.isPaidActivity,
      ).length;
      const busyLocationsCount = entries.filter((e) => e.isBusy).length;

      // Adventure streak calculation (consecutive months with entries)
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      let streak = 0;
      for (let i = 0; i <= currentMonth; i++) {
        const monthEntries = entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return (
            entryDate.getFullYear() === currentYear &&
            entryDate.getMonth() === currentMonth - i
          );
        });
        if (monthEntries.length > 0) {
          streak++;
        } else {
          break;
        }
      }

      // Best rated and most loved entries
      const bestRatedEntry =
        entries.length > 0
          ? entries.reduce(
              (best, entry) =>
                entry.moodRating > best.rating
                  ? { title: entry.title, rating: entry.moodRating }
                  : best,
              { title: entries[0].title, rating: entries[0].moodRating },
            )
          : null;

      const mostLovedEntry =
        entries.length > 0
          ? entries.reduce(
              (most, entry) =>
                entry.likes > most.likes
                  ? { title: entry.title, likes: entry.likes }
                  : most,
              { title: entries[0].title, likes: entries[0].likes },
            )
          : null;

      // Monthly breakdown
      const monthlyBreakdown: { [month: string]: number } = {};
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      entries.forEach((entry) => {
        const date = new Date(entry.date);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + 1;
      });

      // This year entries
      const thisYearEntries = entries.filter(
        (entry) => new Date(entry.date).getFullYear() === currentYear,
      ).length;

      // Adventures by mood
      const adventuresByMood: { [mood: number]: number } = {};
      entries.forEach((entry) => {
        adventuresByMood[entry.moodRating] =
          (adventuresByMood[entry.moodRating] || 0) + 1;
      });

      setStats({
        totalEntries,
        totalPins,
        totalPhotos,
        totalLikes,
        totalComments,
        averageMood,
        mostActiveAuthor,
        favoriteAreaType,
        totalCostSpent,
        paidActivitiesCount,
        freeActivitiesCount,
        busyLocationsCount,
        currentStreak: streak,
        bestRatedEntry,
        mostLovedEntry,
        monthlyBreakdown,
        thisYearEntries,
        adventuresByMood,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  if (!stats) return null;

  const getMoodEmoji = (rating: number) => {
    const mood = MOOD_RATINGS.find((r) => r.value === rating);
    return mood?.emoji || "😊";
  };

  const getAreaTypeLabel = (type: string) => {
    const area = AREA_TYPES.find((a) => a.value === type);
    return area?.label || type;
  };

  const basicStats = [
    {
      icon: MapPin,
      value: stats.totalPins,
      label: "🗺️✨ Places Visited",
      color: "from-pink-200 to-pink-300",
      textColor: "text-pink-700",
    },
    {
      icon: BookOpen,
      value: stats.totalEntries,
      label: "📚 Journal Entries",
      color: "from-purple-200 to-purple-300",
      textColor: "text-purple-700",
    },
    {
      icon: Users,
      value: 5,
      label: "👨‍👩‍👧‍👦 Family Members",
      color: "from-blue-200 to-blue-300",
      textColor: "text-blue-700",
    },
    {
      icon: () => (
        <span className="text-2xl bouncy">
          {getMoodEmoji(stats.averageMood)}
        </span>
      ),
      value: `${stats.averageMood}/5`,
      label: "⭐ Average Trip Rating",
      color: "from-green-200 to-green-300",
      textColor: "text-green-700",
    },
  ];

  const extendedStats = [
    {
      icon: Camera,
      value: stats.totalPhotos,
      label: "📸 Photos Captured",
      color: "from-rose-200 to-red-300",
      textColor: "text-rose-700",
    },
    {
      icon: Heart,
      value: stats.totalLikes,
      label: "❤️ Total Likes",
      color: "from-red-200 to-pink-300",
      textColor: "text-red-700",
    },
    {
      icon: MessageCircle,
      value: stats.totalComments,
      label: "💬 Comments Shared",
      color: "from-indigo-200 to-blue-300",
      textColor: "text-indigo-700",
    },
    {
      icon: Banknote,
      value: `£${stats.totalCostSpent}`,
      label: "💰 Adventure Budget",
      color: "from-emerald-200 to-green-300",
      textColor: "text-emerald-700",
    },
    {
      icon: TrendingUp,
      value: stats.currentStreak,
      label: "🔥 Monthly Streak",
      color: "from-orange-200 to-yellow-300",
      textColor: "text-orange-700",
    },
    {
      icon: Calendar,
      value: stats.thisYearEntries,
      label: "📅 This Year",
      color: "from-cyan-200 to-blue-300",
      textColor: "text-cyan-700",
    },
    {
      icon: Target,
      value: `${stats.paidActivitiesCount}/${stats.totalEntries}`,
      label: "🎫 Paid Activities",
      color: "from-violet-200 to-purple-300",
      textColor: "text-violet-700",
    },
    {
      icon: Clock,
      value: stats.busyLocationsCount,
      label: "🏃 Busy Locations",
      color: "from-amber-200 to-orange-300",
      textColor: "text-amber-700",
    },
  ];

  const statsToShow = showAll ? [...basicStats, ...extendedStats] : basicStats;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div
        className={`grid grid-cols-2 ${showAll ? "lg:grid-cols-4" : "md:grid-cols-4"} gap-3 md:gap-4`}
      >
        {statsToShow.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`pastel-stat-card ${stat.color}`}>
              <CardContent className="flex items-center space-x-3 p-4">
                <div className="p-2 bg-white/60 rounded-lg">
                  <IconComponent className={`h-5 w-5 ${stat.textColor}`} />
                </div>
                <div>
                  <p
                    className={`text-lg font-bold ${stat.textColor.replace("text-", "text-").replace("-700", "-800")}`}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs ${stat.textColor.replace("-700", "-600")}`}
                  >
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Close Button */}
      {showAll && onClose && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="group hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50"
          >
            <ChevronUp className="h-4 w-4 mr-2" />
            Show Less Stats
            <X className="h-4 w-4 ml-2 group-hover:rotate-90 transition-transform" />
          </Button>
        </div>
      )}

      {/* View All Button */}
      {!showAll && onViewAll && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onViewAll}
            className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View All Family Stats
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}

      {/* Extended Stats Section - only show when showAll is true */}
      {showAll && (
        <div className="space-y-6">
          {/* Achievements Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="family-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold">🏆 Top Achievements</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Most Active Explorer:</span>
                    <Badge variant="secondary">
                      {stats.mostActiveAuthor.name} (
                      {stats.mostActiveAuthor.count})
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Favorite Adventure Type:</span>
                    <Badge variant="secondary">
                      {getAreaTypeLabel(stats.favoriteAreaType.type)}
                    </Badge>
                  </div>
                  {stats.bestRatedEntry && (
                    <div className="flex justify-between">
                      <span>Best Rated Adventure:</span>
                      <Badge variant="secondary">
                        {getMoodEmoji(stats.bestRatedEntry.rating)}{" "}
                        {stats.bestRatedEntry.rating}/5
                      </Badge>
                    </div>
                  )}
                  {stats.mostLovedEntry && (
                    <div className="flex justify-between">
                      <span>Most Loved Entry:</span>
                      <Badge variant="secondary">
                        ❤️ {stats.mostLovedEntry.likes} likes
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="family-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Star className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">😊 Mood Breakdown</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(stats.adventuresByMood)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .map(([mood, count]) => {
                      const moodData = MOOD_RATINGS.find(
                        (r) => r.value === parseInt(mood),
                      );
                      return (
                        <div
                          key={mood}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{moodData?.emoji}</span>
                            <span>{moodData?.label}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Breakdown */}
          <Card className="family-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Navigation className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">🎯 Adventure Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.freeActivitiesCount}
                  </p>
                  <p className="text-muted-foreground">🆓 Free Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.paidActivitiesCount}
                  </p>
                  <p className="text-muted-foreground">🎫 Paid Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.busyLocationsCount}
                  </p>
                  <p className="text-muted-foreground">🏃 Busy Places</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalEntries - stats.busyLocationsCount}
                  </p>
                  <p className="text-muted-foreground">😌 Peaceful Places</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
