import { JournalEntry, MapPin, WishlistItem } from "@shared/api";
import { LocalStorage } from "./storage";

export function initializeSampleData() {
  // Check if data already exists
  const existingEntries = LocalStorage.getJournalEntries();
  const existingPins = LocalStorage.getMapPins();
  const existingWishlist = LocalStorage.getWishlistItems();

  if (existingEntries.length > 0 || existingPins.length > 0 || existingWishlist.length > 0) {
    return; // Don't overwrite existing data
  }

  // Sample journal entries
  const sampleEntries: JournalEntry[] = [
    {
      id: "1",
      title: "Amazing Day at Loch Lomond",
      content:
        "What an incredible day exploring Loch Lomond! The weather was perfect - sunny with a gentle breeze. We started our adventure early in the morning, taking the scenic route along the loch shore. The kids were absolutely delighted when we spotted some Highland cattle grazing peacefully near the water. We had a wonderful picnic by the loch, and Oscar tried his hand at skipping stones while Rose and Lola collected pretty pebbles. The views were breathtaking, with the mountains reflected perfectly in the calm water. We ended the day with a lovely boat trip, and everyone agreed it was one of our best family outings yet!",
      location: "Loch Lomond, Trossachs National Park",
      date: "2024-08-15",
      images: ["/placeholder.svg"],
      videos: [],
      moodRating: 5,
      greatFor: ["family picnics", "photography", "boat trips", "nature walks"],
      isBusy: false,
      areaType: "loch",
      wouldReturnReason:
        "Absolutely! The scenery is stunning and there are so many activities for the whole family. We definitely want to try camping here next time.",
      wouldReturn: true,
      hasFreeParkingAvailable: true,
      parkingCost: "",
      author: "Charlotte",
      likes: 18,
      comments: [
        {
          id: "1",
          content: "The boat trip was my favorite part! Can we go back soon?",
          author: "Rose",
          createdAt: "2024-08-16T10:00:00Z",
          likes: 3,
        },
        {
          id: "2",
          content: "What a beautiful place! We visited last summer and loved it too. The Highland cattle are so cute! 🐄",
          author: "Sarah from Edinburgh",
          createdAt: "2024-08-17T14:30:00Z",
          likes: 0,
        },
        {
          id: "3",
          content: "Thanks for sharing this! Adding Loch Lomond to our family bucket list now 😍",
          author: "Mike & Family",
          createdAt: "2024-08-18T09:15:00Z",
          likes: 0,
        },
      ],
      tags: ["family", "loch", "nature"],
      createdAt: "2024-08-15T20:30:00Z",
      updatedAt: "2024-08-15T20:30:00Z",
    },
    {
      id: "2",
      title: "Edinburgh Castle Adventure",
      content:
        "Our trip to Edinburgh Castle was both educational and exciting! The kids were fascinated by the Crown Jewels and the Stone of Destiny. Max enjoyed the military history exhibits, while I was captivated by the stunning views over Edinburgh from the castle walls. The one o'clock gun firing was definitely a highlight - Oscar jumped but then couldn't stop talking about it! We spent hours exploring the various buildings and learning about Scottish history. The Royal Mile afterwards was bustling with street performers and we treated ourselves to some delicious shortbread.",
      location: "Edinburgh Castle, Edinburgh",
      date: "2024-07-22",
      images: ["/placeholder.svg"],
      videos: [],
      moodRating: 4,
      greatFor: [
        "history learning",
        "city views",
        "cultural experience",
        "photography",
      ],
      isBusy: true,
      areaType: "city",
      wouldReturnReason:
        "The history is fascinating and there's still so much we didn't see. Maybe we'll visit during the Festival next time for an even more vibrant experience.",
      wouldReturn: true,
      hasFreeParkingAvailable: false,
      parkingCost: "£8 per day",
      author: "Max",
      likes: 8,
      comments: [],
      tags: ["history", "castle", "city"],
      createdAt: "2024-07-22T19:15:00Z",
      updatedAt: "2024-07-22T19:15:00Z",
    },
    {
      id: "3",
      title: "Hiking Ben Nevis - Our Biggest Challenge!",
      content:
        "Today we attempted our most challenging hike yet - Ben Nevis! We didn't make it all the way to the summit (the weather turned and we prioritized safety), but we got about three-quarters of the way up and the experience was incredible. The kids showed amazing determination and we're so proud of how far they went. The views were absolutely spectacular - we could see for miles across the Scottish Highlands. We packed plenty of snacks and hot chocolate which definitely helped keep spirits up. Even though we didn't reach the top, we all felt like champions!",
      location: "Ben Nevis, Fort William",
      date: "2024-06-30",
      images: ["/placeholder.svg"],
      videos: [],
      moodRating: 4,
      greatFor: [
        "challenging hikes",
        "mountain views",
        "family bonding",
        "adventure",
      ],
      isBusy: false,
      areaType: "mountain",
      wouldReturnReason:
        "We definitely want to complete the summit! Next time we'll plan for better weather and maybe split it into a two-day adventure with proper camping gear.",
      wouldReturn: true,
      hasFreeParkingAvailable: true,
      parkingCost: "",
      author: "Charlotte",
      likes: 15,
      comments: [
        {
          id: "2",
          content:
            "I want to reach the top next time! My legs are still tired but it was so cool!",
          author: "Oscar",
          createdAt: "2024-07-01T08:00:00Z",
          likes: 5,
        },
        {
          id: "3",
          content: "The hot chocolate at the halfway point was the best ever!",
          author: "Lola",
          createdAt: "2024-07-01T09:00:00Z",
          likes: 4,
        },
      ],
      tags: ["hiking", "mountain", "challenge"],
      createdAt: "2024-06-30T21:00:00Z",
      updatedAt: "2024-06-30T21:00:00Z",
    },
  ];

  // Sample map pins
  const samplePins: MapPin[] = [
    {
      id: "1",
      lat: 56.1,
      lng: -4.6,
      title: "Loch Lomond Adventure",
      description:
        "Perfect family day by the beautiful loch with Highland cattle spotting!",
      moodRating: 5,
      journalEntryId: "1",
      visitDate: "2024-08-15",
      images: ["/placeholder.svg"],
    },
    {
      id: "2",
      lat: 55.9486,
      lng: -3.2008,
      title: "Edinburgh Castle Visit",
      description:
        "Exploring Scottish history and enjoying amazing city views.",
      moodRating: 4,
      journalEntryId: "2",
      visitDate: "2024-07-22",
      images: ["/placeholder.svg"],
    },
    {
      id: "3",
      lat: 56.7969,
      lng: -5.0037,
      title: "Ben Nevis Challenge",
      description:
        "Our biggest hiking adventure yet - didn't reach the summit but amazing experience!",
      moodRating: 4,
      journalEntryId: "3",
      visitDate: "2024-06-30",
      images: ["/placeholder.svg"],
    },
    {
      id: "4",
      lat: 57.4778,
      lng: -4.2247,
      title: "Inverness Exploration",
      description:
        "Lovely day exploring the Highland capital and searching for Nessie!",
      moodRating: 3,
      visitDate: "2024-05-18",
      images: [],
    },
  ];

  // Sample wishlist items
  const sampleWishlistItems: WishlistItem[] = [
    {
      id: '1',
      title: 'Isle of Skye Fairy Pools',
      description: 'Crystal clear pools and waterfalls in the heart of Skye - perfect for a magical family adventure!',
      location: 'Isle of Skye, Inner Hebrides',
      priority: 'high',
      category: 'nature',
      estimatedCost: '£150-200',
      bestTimeToVisit: 'Late Spring/Summer',
      notes: 'Bring waterproof boots and camera. Check weather conditions before going.',
      isCompleted: false,
      addedBy: 'Charlotte',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Edinburgh Castle at Christmas',
      description: 'Experience the magic of Edinburgh Castle during the festive season with Christmas markets.',
      location: 'Edinburgh, Scotland',
      priority: 'medium',
      category: 'historic',
      estimatedCost: '£80-120',
      bestTimeToVisit: 'December',
      notes: 'Book tickets in advance. Christmas market gets very busy.',
      isCompleted: false,
      addedBy: 'Max',
      createdAt: '2024-02-10T14:30:00Z',
      updatedAt: '2024-02-10T14:30:00Z'
    },
    {
      id: '3',
      title: 'Whisky Tasting in Speyside',
      description: 'Adults-only whisky tour while kids enjoy local activities - family day out with something for everyone.',
      location: 'Speyside, Scottish Highlands',
      priority: 'low',
      category: 'food',
      estimatedCost: '£200-300',
      bestTimeToVisit: 'Autumn',
      notes: 'Need to find child-friendly activities nearby. Designated driver required.',
      isCompleted: false,
      addedBy: 'Max',
      createdAt: '2024-03-05T16:45:00Z',
      updatedAt: '2024-03-05T16:45:00Z'
    },
    {
      id: '4',
      title: 'Orkney Islands Adventure',
      description: 'Explore ancient stone circles, dramatic cliffs, and unique wildlife on these magical islands.',
      location: 'Orkney Islands, Scotland',
      priority: 'high',
      category: 'adventure',
      estimatedCost: '£400-500',
      bestTimeToVisit: 'Summer',
      notes: 'Multi-day trip required. Ferry bookings essential. Pack warm clothes.',
      isCompleted: false,
      addedBy: 'Charlotte',
      createdAt: '2024-03-20T11:15:00Z',
      updatedAt: '2024-03-20T11:15:00Z'
    },
    {
      id: '5',
      title: 'Glasgow Science Centre',
      description: 'Interactive science museum perfect for curious kids and adults alike!',
      location: 'Glasgow, Scotland',
      priority: 'medium',
      category: 'culture',
      estimatedCost: '£40-60',
      bestTimeToVisit: 'Any time',
      notes: 'Great for rainy days. Check for special exhibitions.',
      isCompleted: true,
      completedDate: '2024-01-28T00:00:00Z',
      addedBy: 'Rose',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-28T15:30:00Z'
    }
  ];

  // Save sample data
  sampleEntries.forEach((entry) => LocalStorage.saveJournalEntry(entry));
  samplePins.forEach((pin) => LocalStorage.saveMapPin(pin));
  sampleWishlistItems.forEach((item) => LocalStorage.saveWishlistItem(item));
}
