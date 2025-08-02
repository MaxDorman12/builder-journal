import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  BookOpen,
  Users,
  Camera,
  Heart,
  Calendar,
} from "lucide-react";
import {
  JournalEntry,
  MapPin as MapPinType,
  MOOD_RATINGS,
} from "@shared/api";

interface FamilyStatsProps {
  entries: JournalEntry[];
  pins: MapPinType[];
  showAll?: boolean;
}

export function FamilyStats({
  entries,
  pins,
  showAll = false,
}: FamilyStatsProps) {
  // Calculate basic stats
  const totalEntries = entries.length;
  const totalPins = pins.length;
  const totalPhotos = entries.reduce(
    (sum, entry) => sum + (entry.images?.length || 0),
    0,
  );
  const totalLikes = entries.reduce((sum, entry) => sum + (entry.likes || 0), 0);

  // Average mood
  const averageMood =
    entries.length > 0
      ? Math.round(
          entries.reduce((sum, entry) => sum + (entry.moodRating || 5), 0) /
            entries.length,
        )
      : 5;

  // This year entries
  const currentYear = new Date().getFullYear();
  const thisYearEntries = entries.filter(
    (entry) => new Date(entry.date).getFullYear() === currentYear,
  ).length;

  const getMoodEmoji = (rating: number) => {
    const mood = MOOD_RATINGS.find((r) => r.value === rating);
    return mood?.emoji || "😊";
  };

  const basicStats = [
    {
      icon: BookOpen,
      value: totalEntries,
      label: "📖 Journal Entries",
      color: "from-purple-200 to-purple-300",
      textColor: "text-purple-700",
    },
    {
      icon: MapPin,
      value: totalPins,
      label: "🗺️ Places Visited",
      color: "from-green-200 to-green-300",
      textColor: "text-green-700",
    },
    {
      icon: Camera,
      value: totalPhotos,
      label: "📸 Photos Captured",
      color: "from-blue-200 to-blue-300",
      textColor: "text-blue-700",
    },
    {
      icon: () => (
        <span className="text-xl">
          {getMoodEmoji(averageMood)}
        </span>
      ),
      value: `${averageMood}/5`,
      label: "⭐ Average Rating",
      color: "from-yellow-200 to-yellow-300",
      textColor: "text-yellow-700",
    },
  ];

  const extendedStats = [
    {
      icon: Heart,
      value: totalLikes,
      label: "❤️ Total Likes",
      color: "from-red-200 to-red-300",
      textColor: "text-red-700",
    },
    {
      icon: Calendar,
      value: thisYearEntries,
      label: "📅 This Year",
      color: "from-indigo-200 to-indigo-300",
      textColor: "text-indigo-700",
    },
    {
      icon: Users,
      value: 5,
      label: "👨‍👩‍👧‍👦 Family Members",
      color: "from-pink-200 to-pink-300",
      textColor: "text-pink-700",
    },
  ];

  const statsToShow = showAll ? [...basicStats, ...extendedStats] : basicStats;

  if (totalEntries === 0 && totalPins === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Start Your Adventure Story
          </h3>
          <p className="text-gray-500">
            Create your first journal entry or add a map pin to see your family stats!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsToShow.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`bg-gradient-to-br ${stat.color} border-0`}>
              <CardContent className="flex items-center space-x-3 p-4">
                <div className="p-2 bg-white/60 rounded-lg">
                  <IconComponent className={`h-5 w-5 ${stat.textColor}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${stat.textColor.replace("-700", "-800")}`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs ${stat.textColor.replace("-700", "-600")}`}>
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Summary */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="text-center text-sm text-blue-700">
            <span className="font-medium">
              🏴󠁧󠁢󠁳󠁣󠁴󠁿 Exploring Scotland together • 
              {totalEntries > 0 && ` ${totalEntries} adventures documented`}
              {totalPins > 0 && ` • ${totalPins} special places marked`}
              {totalPhotos > 0 && ` • ${totalPhotos} memories captured`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
