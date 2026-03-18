/**
 * Sample location data for Japan Trip Map
 * Contains popular destinations in Tokyo and Kyoto
 */

import type { Location } from '../types/map';

export const sampleLocations: Location[] = [
  // Tokyo Restaurants
  {
    id: 'tokyo-ramen-1',
    name: 'Ichiran Ramen Shibuya',
    nameJa: '一蘭 渋谷店',
    lat: 35.6595,
    lng: 139.7004,
    category: 'restaurant',
    description: 'Famous tonkotsu ramen chain with individual booths',
    address: 'Shibuya, Tokyo',
    rating: 4.5,
  },
  {
    id: 'tokyo-sushi-1',
    name: 'Sushi Dai',
    nameJa: '寿司大',
    lat: 35.6654,
    lng: 139.7707,
    category: 'restaurant',
    description: 'Legendary sushi restaurant at Toyosu Fish Market',
    address: 'Toyosu, Tokyo',
    rating: 4.8,
  },

  // Tokyo Temples & Shrines
  {
    id: 'tokyo-temple-1',
    name: 'Senso-ji Temple',
    nameJa: '浅草寺',
    lat: 35.7148,
    lng: 139.7967,
    category: 'temple',
    description: "Tokyo's oldest and most famous Buddhist temple",
    address: 'Asakusa, Tokyo',
    rating: 4.7,
  },
  {
    id: 'tokyo-temple-2',
    name: 'Meiji Shrine',
    nameJa: '明治神宮',
    lat: 35.6764,
    lng: 139.6993,
    category: 'temple',
    description: 'Shinto shrine dedicated to Emperor Meiji and Empress Shoken',
    address: 'Shibuya, Tokyo',
    rating: 4.6,
  },

  // Tokyo Hotels
  {
    id: 'tokyo-hotel-1',
    name: 'Park Hyatt Tokyo',
    nameJa: 'パークハイアット東京',
    lat: 35.6856,
    lng: 139.6917,
    category: 'hotel',
    description: 'Luxury hotel featured in Lost in Translation',
    address: 'Shinjuku, Tokyo',
    rating: 4.8,
  },

  // Tokyo Attractions
  {
    id: 'tokyo-attraction-1',
    name: 'Tokyo Skytree',
    nameJa: '東京スカイツリー',
    lat: 35.7101,
    lng: 139.8107,
    category: 'attraction',
    description: "World's tallest tower with observation decks",
    address: 'Sumida, Tokyo',
    rating: 4.5,
  },
  {
    id: 'tokyo-attraction-2',
    name: 'Tokyo Tower',
    nameJa: '東京タワー',
    lat: 35.6586,
    lng: 139.7454,
    category: 'attraction',
    description: 'Iconic red observation tower inspired by Eiffel Tower',
    address: 'Minato, Tokyo',
    rating: 4.4,
  },

  // Tokyo Stations
  {
    id: 'tokyo-station-1',
    name: 'Shibuya Station',
    nameJa: '渋谷駅',
    lat: 35.6580,
    lng: 139.7016,
    category: 'station',
    description: 'Major transportation hub with famous Shibuya Crossing',
    address: 'Shibuya, Tokyo',
    rating: 4.3,
  },

  // Kyoto Temples
  {
    id: 'kyoto-temple-1',
    name: 'Kinkaku-ji (Golden Pavilion)',
    nameJa: '金閣寺',
    lat: 35.0394,
    lng: 135.7292,
    category: 'temple',
    description: 'Zen Buddhist temple covered in gold leaf',
    address: 'Kita Ward, Kyoto',
    rating: 4.7,
  },
  {
    id: 'kyoto-temple-2',
    name: 'Fushimi Inari Shrine',
    nameJa: '伏見稲荷大社',
    lat: 34.9671,
    lng: 135.7727,
    category: 'temple',
    description: 'Famous for thousands of vermillion torii gates',
    address: 'Fushimi Ward, Kyoto',
    rating: 4.8,
  },
  {
    id: 'kyoto-temple-3',
    name: 'Kiyomizu-dera',
    nameJa: '清水寺',
    lat: 34.9949,
    lng: 135.7850,
    category: 'temple',
    description: 'Historic temple with wooden stage offering city views',
    address: 'Higashiyama Ward, Kyoto',
    rating: 4.7,
  },

  // Kyoto Restaurants
  {
    id: 'kyoto-restaurant-1',
    name: 'Kikunoi Honten',
    nameJa: '菊乃井 本店',
    lat: 35.0033,
    lng: 135.7800,
    category: 'restaurant',
    description: '3-Michelin-star kaiseki restaurant',
    address: 'Higashiyama Ward, Kyoto',
    rating: 4.9,
  },

  // Kyoto Hotels
  {
    id: 'kyoto-hotel-1',
    name: 'The Ritz-Carlton Kyoto',
    nameJa: 'ザ・リッツ・カールトン京都',
    lat: 35.0058,
    lng: 135.7722,
    category: 'hotel',
    description: 'Luxury riverside hotel in traditional Japanese style',
    address: 'Nakagyo Ward, Kyoto',
    rating: 4.8,
  },

  // Sakura Viewing Spots
  {
    id: 'tokyo-sakura-1',
    name: 'Ueno Park',
    nameJa: '上野公園',
    lat: 35.7148,
    lng: 139.7744,
    category: 'sakura',
    description: 'Famous cherry blossom viewing spot with 1,000+ trees',
    address: 'Ueno, Tokyo',
    rating: 4.6,
  },
  {
    id: 'tokyo-sakura-2',
    name: 'Meguro River',
    nameJa: '目黒川',
    lat: 35.6341,
    lng: 139.6987,
    category: 'sakura',
    description: '4km river lined with cherry blossom trees',
    address: 'Meguro, Tokyo',
    rating: 4.7,
  },
  {
    id: 'kyoto-sakura-1',
    name: 'Philosopher\'s Path',
    nameJa: '哲学の道',
    lat: 35.0251,
    lng: 135.7947,
    category: 'sakura',
    description: 'Scenic walkway lined with hundreds of cherry trees',
    address: 'Sakyo Ward, Kyoto',
    rating: 4.7,
  },
  {
    id: 'kyoto-sakura-2',
    name: 'Maruyama Park',
    nameJa: '円山公園',
    lat: 35.0033,
    lng: 135.7811,
    category: 'sakura',
    description: 'Historic park famous for its weeping cherry tree',
    address: 'Higashiyama Ward, Kyoto',
    rating: 4.6,
  },
];
