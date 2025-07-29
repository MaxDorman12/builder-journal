import { JournalEntry, MapPin } from '@shared/api';
import { LocalStorage } from './storage';

export function initializeSampleData() {
  // Check if data already exists
  const existingEntries = LocalStorage.getJournalEntries();
  const existingPins = LocalStorage.getMapPins();
  
  if (existingEntries.length > 0 || existingPins.length > 0) {
    return; // Don't overwrite existing data
  }

  // Sample journal entries
  const sampleEntries: JournalEntry[] = [
    {
      id: '1',
      title: 'Amazing Day at Loch Lomond',
      content: 'What an incredible day exploring Loch Lomond! The weather was perfect - sunny with a gentle breeze. We started our adventure early in the morning, taking the scenic route along the loch shore. The kids were absolutely delighted when we spotted some Highland cattle grazing peacefully near the water. We had a wonderful picnic by the loch, and Oscar tried his hand at skipping stones while Rose and Lola collected pretty pebbles. The views were breathtaking, with the mountains reflected perfectly in the calm water. We ended the day with a lovely boat trip, and everyone agreed it was one of our best family outings yet!',
      location: 'Loch Lomond, Trossachs National Park',
      date: '2024-08-15',
      images: ['/placeholder.svg'],
      videos: [],
      moodRating: 5,
      greatFor: ['family picnics', 'photography', 'boat trips', 'nature walks'],
      isBusy: false,
      areaType: 'loch',
      wouldReturnReason: 'Absolutely! The scenery is stunning and there are so many activities for the whole family. We definitely want to try camping here next time.',
      wouldReturn: true,
      author: 'Charlotte',
      likes: 12,
      comments: [
        {
          id: '1',
          content: 'The boat trip was my favorite part! Can we go back soon?',
          author: 'Rose',
          createdAt: '2024-08-16T10:00:00Z',
          likes: 3
        }
      ],
      tags: ['family', 'loch', 'nature'],
      createdAt: '2024-08-15T20:30:00Z',
      updatedAt: '2024-08-15T20:30:00Z'
    },
    {
      id: '2',
      title: 'Edinburgh Castle Adventure',
      content: 'Our trip to Edinburgh Castle was both educational and exciting! The kids were fascinated by the Crown Jewels and the Stone of Destiny. Max enjoyed the military history exhibits, while I was captivated by the stunning views over Edinburgh from the castle walls. The one o\'clock gun firing was definitely a highlight - Oscar jumped but then couldn\'t stop talking about it! We spent hours exploring the various buildings and learning about Scottish history. The Royal Mile afterwards was bustling with street performers and we treated ourselves to some delicious shortbread.',
      location: 'Edinburgh Castle, Edinburgh',
      date: '2024-07-22',
      images: ['/placeholder.svg'],
      videos: [],
      moodRating: 4,
      greatFor: ['history learning', 'city views', 'cultural experience', 'photography'],
      isBusy: true,
      areaType: 'city',
      wouldReturnReason: 'The history is fascinating and there\'s still so much we didn\'t see. Maybe we\'ll visit during the Festival next time for an even more vibrant experience.',
      wouldReturn: true,
      author: 'Max',
      likes: 8,
      comments: [],
      tags: ['history', 'castle', 'city'],
      createdAt: '2024-07-22T19:15:00Z',
      updatedAt: '2024-07-22T19:15:00Z'
    },
    {
      id: '3',
      title: 'Hiking Ben Nevis - Our Biggest Challenge!',
      content: 'Today we attempted our most challenging hike yet - Ben Nevis! We didn\'t make it all the way to the summit (the weather turned and we prioritized safety), but we got about three-quarters of the way up and the experience was incredible. The kids showed amazing determination and we\'re so proud of how far they went. The views were absolutely spectacular - we could see for miles across the Scottish Highlands. We packed plenty of snacks and hot chocolate which definitely helped keep spirits up. Even though we didn\'t reach the top, we all felt like champions!',
      location: 'Ben Nevis, Fort William',
      date: '2024-06-30',
      images: ['/placeholder.svg'],
      videos: [],
      moodRating: 4,
      greatFor: ['challenging hikes', 'mountain views', 'family bonding', 'adventure'],
      isBusy: false,
      areaType: 'mountain',
      wouldReturnReason: 'We definitely want to complete the summit! Next time we\'ll plan for better weather and maybe split it into a two-day adventure with proper camping gear.',
      wouldReturn: true,
      author: 'Charlotte',
      likes: 15,
      comments: [
        {
          id: '2',
          content: 'I want to reach the top next time! My legs are still tired but it was so cool!',
          author: 'Oscar',
          createdAt: '2024-07-01T08:00:00Z',
          likes: 5
        },
        {
          id: '3',
          content: 'The hot chocolate at the halfway point was the best ever!',
          author: 'Lola',
          createdAt: '2024-07-01T09:00:00Z',
          likes: 4
        }
      ],
      tags: ['hiking', 'mountain', 'challenge'],
      createdAt: '2024-06-30T21:00:00Z',
      updatedAt: '2024-06-30T21:00:00Z'
    }
  ];

  // Sample map pins
  const samplePins: MapPin[] = [
    {
      id: '1',
      lat: 56.1,
      lng: -4.6,
      title: 'Loch Lomond Adventure',
      description: 'Perfect family day by the beautiful loch with Highland cattle spotting!',
      moodRating: 5,
      journalEntryId: '1',
      visitDate: '2024-08-15',
      images: ['/placeholder.svg']
    },
    {
      id: '2',
      lat: 55.9486,
      lng: -3.2008,
      title: 'Edinburgh Castle Visit',
      description: 'Exploring Scottish history and enjoying amazing city views.',
      moodRating: 4,
      journalEntryId: '2',
      visitDate: '2024-07-22',
      images: ['/placeholder.svg']
    },
    {
      id: '3',
      lat: 56.7969,
      lng: -5.0037,
      title: 'Ben Nevis Challenge',
      description: 'Our biggest hiking adventure yet - didn\'t reach the summit but amazing experience!',
      moodRating: 4,
      journalEntryId: '3',
      visitDate: '2024-06-30',
      images: ['/placeholder.svg']
    },
    {
      id: '4',
      lat: 57.4778,
      lng: -4.2247,
      title: 'Inverness Exploration',
      description: 'Lovely day exploring the Highland capital and searching for Nessie!',
      moodRating: 3,
      visitDate: '2024-05-18',
      images: []
    }
  ];

  // Save sample data
  sampleEntries.forEach(entry => LocalStorage.saveJournalEntry(entry));
  samplePins.forEach(pin => LocalStorage.saveMapPin(pin));
}
