/**
 * Shared types between client and server for the Family Journal
 */

export interface DemoResponse {
  message: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: "parent" | "child";
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  location: string;
  images: string[];
  videos: string[];
  moodRating: 1 | 2 | 3 | 4 | 5;
  greatFor: string[];
  isBusy: boolean;
  areaType:
    | "town"
    | "city"
    | "loch"
    | "mountain"
    | "hike"
    | "beach"
    | "forest"
    | "village";
  wouldReturnReason: string;
  wouldReturn: boolean;
  hasFreeParkingAvailable: boolean;
  parkingCost: string;
  isPaidActivity: boolean;
  activityCost: string;
  author: string;
  likes: number;
  comments: Comment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  moodRating: 1 | 2 | 3 | 4 | 5;
  journalEntryId?: string;
  visitDate: string;
  images: string[];
}

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: "low" | "medium" | "high";
  category: "adventure" | "culture" | "food" | "nature" | "city" | "historic";
  estimatedCost: string;
  bestTimeToVisit: string;
  notes: string;
  isCompleted: boolean;
  completedDate?: string;
  journalEntryId?: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isFamilyMember: boolean;
  currentUser: string | null;
}

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: "max", name: "Max", role: "parent" },
  { id: "charlotte", name: "Charlotte", role: "parent" },
  { id: "oscar", name: "Oscar", role: "child" },
  { id: "rose", name: "Rose", role: "child" },
  { id: "lola", name: "Lola", role: "child" },
];

export const AREA_TYPES = [
  { value: "town", label: "🏘️ Town", emoji: "🏘️" },
  { value: "city", label: "🏙️ City", emoji: "🏙️" },
  { value: "loch", label: "🌊 Loch", emoji: "🌊" },
  { value: "mountain", label: "⛰️ Mountain", emoji: "⛰️" },
  { value: "hike", label: "🥾 Hiking Trail", emoji: "🥾" },
  { value: "beach", label: "🏖️ Beach", emoji: "🏖️" },
  { value: "forest", label: "🌲 Forest", emoji: "🌲" },
  { value: "village", label: "🏡 Village", emoji: "🏡" },
] as const;

export const MOOD_RATINGS = [
  { value: 1, label: "Poor", emoji: "😞", color: "bg-red-100 text-red-700" },
  {
    value: 2,
    label: "Fair",
    emoji: "😐",
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: 3,
    label: "Good",
    emoji: "🙂",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: 4,
    label: "Great",
    emoji: "😊",
    color: "bg-green-100 text-green-700",
  },
  {
    value: 5,
    label: "Amazing!",
    emoji: "🤩",
    color: "bg-purple-100 text-purple-700",
  },
] as const;

export const WISHLIST_CATEGORIES = [
  { value: "adventure", label: "🏔️ Adventure", emoji: "🏔️" },
  { value: "culture", label: "🎭 Culture", emoji: "🎭" },
  { value: "food", label: "🍽️ Food & Drink", emoji: "🍽️" },
  { value: "nature", label: "🌿 Nature", emoji: "🌿" },
  { value: "city", label: "🏙️ City Experience", emoji: "🏙️" },
  { value: "historic", label: "🏰 Historic Sites", emoji: "🏰" },
] as const;

export const WISHLIST_PRIORITIES = [
  {
    value: "low",
    label: "Low",
    emoji: "🟢",
    color: "bg-green-100 text-green-700",
  },
  {
    value: "medium",
    label: "Medium",
    emoji: "🟡",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "high",
    label: "High",
    emoji: "🔴",
    color: "bg-red-100 text-red-700",
  },
] as const;
