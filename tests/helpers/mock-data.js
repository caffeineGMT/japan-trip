// Mock data for testing
const mockWeatherResponse = {
  list: [
    {
      dt: 1712016000, // Apr 2, 2024
      temp: { max: 18, min: 10 },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }
      ],
      humidity: 65,
      speed: 3.5,
      pop: 0.1
    },
    {
      dt: 1712102400, // Apr 3, 2024
      temp: { max: 20, min: 12 },
      weather: [
        {
          id: 801,
          main: 'Clouds',
          description: 'few clouds',
          icon: '02d'
        }
      ],
      humidity: 70,
      speed: 2.8,
      pop: 0.2
    },
    {
      dt: 1712188800, // Apr 4, 2024
      temp: { max: 17, min: 11 },
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10d'
        }
      ],
      humidity: 85,
      speed: 4.2,
      pop: 0.7
    }
  ]
};

const mockTripData = [
  {
    day: 1,
    date: 'Mar 30',
    city: 'tokyo',
    title: { en: 'Arrival in Tokyo', zh: '抵达东京', ja: '東京到着' },
    activities: [
      {
        time: '15:00',
        name: { en: 'Check-in Hotel', zh: '酒店入住', ja: 'ホテルチェックイン' },
        location: 'Shinjuku',
        coords: [35.6895, 139.6917]
      }
    ]
  },
  {
    day: 2,
    date: 'Mar 31',
    city: 'tokyo',
    title: { en: 'Tokyo Exploration', zh: '探索东京', ja: '東京観光' },
    activities: [
      {
        time: '09:00',
        name: { en: 'Senso-ji Temple', zh: '浅草寺', ja: '浅草寺' },
        location: 'Asakusa',
        coords: [35.7148, 139.7967]
      }
    ]
  }
];

const mockPhrases = [
  {
    category: 'greetings',
    phrases: [
      {
        japanese: 'こんにちは',
        romaji: 'Konnichiwa',
        english: 'Hello',
        chinese: '你好'
      },
      {
        japanese: 'ありがとうございます',
        romaji: 'Arigatou gozaimasu',
        english: 'Thank you',
        chinese: '谢谢'
      }
    ]
  },
  {
    category: 'restaurant',
    phrases: [
      {
        japanese: 'メニューをください',
        romaji: 'Menyuu wo kudasai',
        english: 'Menu please',
        chinese: '请给我菜单'
      }
    ]
  }
];

const mockChecklistItems = [
  { category: 'Documents', item: 'Passport', checked: false },
  { category: 'Documents', item: 'Visa', checked: false },
  { category: 'Documents', item: 'JR Pass', checked: false },
  { category: 'Electronics', item: 'Phone charger', checked: false },
  { category: 'Electronics', item: 'Power adapter', checked: false },
  { category: 'Clothing', item: 'Light jacket', checked: false },
  { category: 'Clothing', item: 'Comfortable shoes', checked: false }
];

const mockReservations = [
  {
    type: 'hotel',
    name: 'Park Hyatt Tokyo',
    date: 'Mar 30-Apr 3',
    confirmationNumber: 'PH-2026-7891',
    address: '3-7-1-2 Nishi Shinjuku, Tokyo',
    phone: '+81-3-5322-1234'
  },
  {
    type: 'restaurant',
    name: 'Sukiyabashi Jiro',
    date: 'Apr 1',
    time: '19:00',
    confirmationNumber: 'SJ-2026-4567',
    address: 'Tsukamoto Sogyo Building B1F, Ginza, Tokyo',
    phone: '+81-3-3535-3600'
  }
];

module.exports = {
  mockWeatherResponse,
  mockTripData,
  mockPhrases,
  mockChecklistItems,
  mockReservations
};
