const TRIP_DATA = [
  {
    id: "pre",
    day: "Pre-Trip",
    date: "Mar 29-30",
    weekday: "Sat-Sun",
    city: "Vancouver",
    theme: "Prep & Departure",
    color: "#6366f1",
    center: [49.195, -123.179],
    zoom: 11,
    stops: [
      {
        name: "Vancouver International Airport (YVR)",
        time: "10:30 AM (Mar 30)",
        desc: "Depart for Tokyo Narita. Booking ref: JFM9KK",
        lat: 49.1947,
        lng: -123.1790,
        icon: "flight",
        category: "transport"
      }
    ],
    checklist: [
      "Board Alfie with parents",
      "Buy Nomad eSIM / phone card",
      "Fill out Visit Japan Web QR entry declaration",
      "Set up Suica via Apple Pay (no physical cards available)",
      "Download SmartEX app for Shinkansen",
      "Screenshot QR codes — airport WiFi is slow"
    ]
  },
  {
    id: "day1",
    day: "Day 1",
    date: "Mar 31",
    weekday: "Tuesday",
    city: "Tokyo",
    theme: "Arrival & First Taste",
    color: "#ef4444",
    center: [35.665, 139.770],
    zoom: 13,
    hotel: "Mitsui Garden Hotel Roppongi Tokyo Premier",
    stops: [
      {
        name: "Narita Airport (NRT)",
        time: "12:40 PM",
        desc: "Arrive. Immigration + baggage claim.",
        lat: 35.7647,
        lng: 140.3864,
        icon: "flight",
        category: "transport"
      },
      {
        name: "Mitsui Garden Hotel Roppongi",
        time: "Afternoon",
        desc: "Check in, freshen up",
        lat: 35.6627,
        lng: 139.7310,
        icon: "hotel",
        category: "hotel"
      },
      {
        name: "Cherry Blossom Viewing",
        time: "Afternoon",
        desc: "Nearby cherry blossom spots. Check forecast: n-kishou.com",
        lat: 35.6726,
        lng: 139.7405,
        icon: "nature",
        category: "activity"
      },
      {
        name: "MIHIRO - Uni Rice",
        time: "Evening",
        desc: "Sea urchin bowl. Tsukiji 4-10-5, Chuo City, Tokyo",
        lat: 35.6654,
        lng: 139.7707,
        icon: "food",
        category: "food"
      },
      {
        name: "Itadori (Backup)",
        time: "Evening",
        desc: "Alternative sushi spot near Tsukiji",
        lat: 35.6648,
        lng: 139.7695,
        icon: "food",
        category: "food"
      },
      {
        name: "teamLab Planets",
        time: "7:30 PM",
        desc: "Immersive art museum. ~1.5 hours. Tickets purchased.",
        lat: 35.6426,
        lng: 139.7837,
        icon: "attraction",
        category: "activity"
      }
    ]
  },
  {
    id: "day2",
    day: "Day 2",
    date: "Apr 1",
    weekday: "Wednesday",
    city: "Tokyo",
    theme: "Edo Charm & Akihabara",
    color: "#ef4444",
    center: [35.700, 139.780],
    zoom: 12,
    stops: [
      {
        name: "Tokyo Skytree",
        time: "9:30 AM",
        desc: "Opens 9:30. Panoramic view of the Kanto Plain.",
        lat: 35.7101,
        lng: 139.8107,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Senso-ji Temple",
        time: "Late Morning",
        desc: "Get omamori charms, eat ningyo-yaki on Nakamise-dori. Consider renting kimono nearby.",
        lat: 35.7148,
        lng: 139.7967,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Horyuji Gallery (Tokyo National Museum)",
        time: "Midday",
        desc: "Horyuji Treasures Gallery in Ueno",
        lat: 35.7189,
        lng: 139.7766,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Ueno Park",
        time: "Midday",
        desc: "Stroll, cherry blossoms, street performers",
        lat: 35.7146,
        lng: 139.7732,
        icon: "nature",
        category: "activity"
      },
      {
        name: "Akihabara",
        time: "Afternoon",
        desc: "Anime paradise. Check out Demon Slayer merch.",
        lat: 35.7023,
        lng: 139.7745,
        icon: "shopping",
        category: "activity"
      },
      {
        name: "Shibuya Sky",
        time: "Sunset (~6:02 PM)",
        desc: "Rooftop observation deck. Can see Mt. Fuji. Ticket: 26KK236310004. Current slot: 6:40 PM — may need to rebook for sunset.",
        lat: 35.6584,
        lng: 139.7022,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: "Kabukicho",
        time: "Night",
        desc: "Shinjuku nightlife district",
        lat: 35.6946,
        lng: 139.7030,
        icon: "nightlife",
        category: "activity"
      }
    ]
  },
  {
    id: "day3",
    day: "Day 3",
    date: "Apr 2",
    weekday: "Thursday",
    city: "Tokyo",
    theme: "Art, Architecture & Shibuya",
    color: "#ef4444",
    center: [35.660, 139.710],
    zoom: 13,
    stops: [
      {
        name: "Daikanyama T-Site / Tsutaya Books",
        time: "Morning",
        desc: "Iconic bookstore complex. Great for photos.",
        lat: 35.6498,
        lng: 139.7019,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Fruits and Season",
        time: "Late Morning",
        desc: "Fruit parlor — seasonal fruit desserts",
        lat: 35.6520,
        lng: 139.7050,
        icon: "food",
        category: "food"
      },
      {
        name: "Nezu Museum",
        time: "Midday",
        desc: "Beautiful bamboo garden, matcha tea in the courtyard",
        lat: 35.6607,
        lng: 139.7181,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Omotesando",
        time: "Afternoon",
        desc: "Architecture walk, vintage shops, HARAKADO building",
        lat: 35.6654,
        lng: 139.7121,
        icon: "shopping",
        category: "activity"
      },
      {
        name: "Meiji Shrine",
        time: "Late Afternoon",
        desc: "Walk through old-growth forest to the shrine",
        lat: 35.6764,
        lng: 139.6993,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Shibuya Crossing",
        time: "Sunset (~6 PM)",
        desc: "World's busiest pedestrian crossing. Best photos at dusk.",
        lat: 35.6595,
        lng: 139.7004,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Street Go-Kart Tour",
        time: "~5 PM",
        desc: "1-hour street kart tour. Tickets purchased.",
        lat: 35.6580,
        lng: 139.6990,
        icon: "attraction",
        category: "activity",
        highlight: true
      }
    ],
    food: [
      { name: "Conveyor Belt Sushi", note: "Popular spot, expect a wait" },
      { name: "Juan Bowl & Tea", note: "Backup if sushi line is too long" }
    ]
  },
  {
    id: "day4",
    day: "Day 4",
    date: "Apr 3",
    weekday: "Friday",
    city: "Tokyo",
    theme: "City Life & Tokyo Tower",
    color: "#ef4444",
    center: [35.670, 139.760],
    zoom: 13,
    stops: [
      {
        name: "Imperial Palace",
        time: "Morning",
        desc: "Palace grounds and East Gardens",
        lat: 35.6852,
        lng: 139.7528,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Tokyo Station (First Avenue)",
        time: "Late Morning",
        desc: "Underground shopping — buy Tokyo Banana souvenirs",
        lat: 35.6812,
        lng: 139.7671,
        icon: "shopping",
        category: "activity"
      },
      {
        name: "Ginza — Shiseido Parlour",
        time: "Afternoon",
        desc: "Afternoon tea at the iconic beauty brand's parlor",
        lat: 35.6713,
        lng: 139.7654,
        icon: "food",
        category: "food"
      },
      {
        name: "Sony Park",
        time: "Afternoon",
        desc: "Interactive tech exhibits",
        lat: 35.6733,
        lng: 139.7631,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Tsukiji Market",
        time: "Late Afternoon",
        desc: "Itadori / Oedo — uni rice round 2",
        lat: 35.6654,
        lng: 139.7707,
        icon: "food",
        category: "food"
      },
      {
        name: "Tokyo Tower",
        time: "Sunset",
        desc: "Multiple photo angles and viewpoints",
        lat: 35.6586,
        lng: 139.7454,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: "Roppongi Hills Sky Deck",
        time: "Night",
        desc: "Rooftop night view of illuminated Tokyo Tower",
        lat: 35.6604,
        lng: 139.7292,
        icon: "attraction",
        category: "activity"
      }
    ],
    dinner: "Genshiyaki Hibachi — 7:30 PM. Meet up with friends."
  },
  {
    id: "day5",
    day: "Day 5",
    date: "Apr 4",
    weekday: "Saturday",
    city: "Tokyo → Kyoto",
    theme: "Capybara Cafe & Shinkansen",
    color: "#ef4444",
    center: [35.660, 139.730],
    zoom: 12,
    stops: [
      {
        name: "Cappiness Cafe / Cafe Capyba",
        time: "Morning",
        desc: "Capybara cafe! Cafe Capyba is the cheaper option.",
        lat: 35.6300,
        lng: 139.7150,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Tokyo Station (Shinkansen)",
        time: "Evening",
        desc: "Shinkansen to Kyoto (~2.5 hrs). SmartEX app. Book oversized baggage seat!",
        lat: 35.6812,
        lng: 139.7671,
        icon: "train",
        category: "transport",
        highlight: true
      }
    ]
  },
  {
    id: "day6",
    day: "Day 6",
    date: "Apr 5",
    weekday: "Sunday",
    city: "Kyoto",
    theme: "Eastern Kyoto Landmarks",
    color: "#f59e0b",
    center: [34.980, 135.780],
    zoom: 13,
    hotel: "Onyado Nono Kyoto Shichijo (with onsen!)",
    stops: [
      {
        name: "Fushimi Inari Taisha",
        time: "Early AM",
        desc: "Thousands of vermillion torii gates. Go early to beat crowds.",
        lat: 34.9671,
        lng: 135.7727,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Kiyomizu-dera",
        time: "Morning",
        desc: "Arrive by 6:30 AM for peaceful cherry blossom photos. Gets VERY crowded.",
        lat: 34.9949,
        lng: 135.7850,
        icon: "temple",
        category: "activity",
        highlight: true
      },
      {
        name: "Ninenzaka & Sannenzaka",
        time: "Late Morning",
        desc: "Historic stone-paved lanes, traditional shops and teahouses",
        lat: 34.9960,
        lng: 135.7808,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Gion Matayoshi (Lunch)",
        time: "Midday",
        desc: "Reserve on TableCheck. Traditional Kyoto cuisine.",
        lat: 35.0035,
        lng: 135.7760,
        icon: "food",
        category: "food"
      },
      {
        name: "Yasaka Shrine",
        time: "Afternoon",
        desc: "Gion district's iconic shrine",
        lat: 35.0036,
        lng: 135.7785,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Heian Shrine",
        time: "Late Afternoon",
        desc: "Massive vermillion torii gate and serene zen gardens",
        lat: 35.0160,
        lng: 135.7824,
        icon: "temple",
        category: "activity"
      }
    ]
  },
  {
    id: "day7",
    day: "Day 7",
    date: "Apr 6",
    weekday: "Monday",
    city: "Kyoto",
    theme: "Culture & Market Life",
    color: "#f59e0b",
    center: [34.995, 135.755],
    zoom: 14,
    stops: [
      {
        name: "Toji Temple",
        time: "Morning",
        desc: "Five-story pagoda — Japan's tallest wooden tower",
        lat: 34.9806,
        lng: 135.7478,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Kyoto Tower",
        time: "Late Morning",
        desc: "City views from the observation deck",
        lat: 34.9875,
        lng: 135.7592,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Higashi & Nishi Hongan-ji",
        time: "Late Morning",
        desc: "Twin temple complex, UNESCO World Heritage",
        lat: 34.9915,
        lng: 135.7515,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Nishiki Market",
        time: "Midday",
        desc: "\"Kyoto's Kitchen\" — street food, pickles, matcha everything",
        lat: 35.0050,
        lng: 135.7648,
        icon: "food",
        category: "food",
        highlight: true
      },
      {
        name: "Nijo Castle",
        time: "Afternoon",
        desc: "Famous nightingale floors and Ninomaru Palace",
        lat: 35.0142,
        lng: 135.7481,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Kyoto Imperial Palace",
        time: "Late Afternoon",
        desc: "Imperial park and gardens — peaceful stroll",
        lat: 35.0254,
        lng: 135.7621,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Pontocho Alley",
        time: "Evening",
        desc: "Atmospheric narrow dining alley along the Kamogawa river",
        lat: 35.0065,
        lng: 135.7706,
        icon: "food",
        category: "food"
      }
    ]
  },
  {
    id: "day8",
    day: "Day 8",
    date: "Apr 7",
    weekday: "Tuesday",
    city: "Kyoto → Osaka",
    theme: "Arashiyama & Golden Pavilion",
    color: "#f59e0b",
    center: [35.020, 135.680],
    zoom: 12,
    stops: [
      {
        name: "Otagi Nenbutsu-ji",
        time: "Morning",
        desc: "1200 unique stone rakan statues — each one different",
        lat: 35.0270,
        lng: 135.6510,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Bamboo Grove",
        time: "Morning",
        desc: "Get there EARLY. Extremely crowded during cherry blossom season.",
        lat: 35.0170,
        lng: 135.6713,
        icon: "nature",
        category: "activity",
        highlight: true
      },
      {
        name: "Okochi Sanso Garden",
        time: "Late Morning",
        desc: "Hilltop villa with panoramic views, includes matcha",
        lat: 35.0194,
        lng: 135.6700,
        icon: "nature",
        category: "activity"
      },
      {
        name: "Jojakko-ji & Gio-ji Temples",
        time: "Late Morning",
        desc: "Moss temple trail through western Arashiyama",
        lat: 35.0230,
        lng: 135.6680,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Arashiyama Shopping Street",
        time: "Midday",
        desc: "Lunch + matcha soft serve + souvenirs",
        lat: 35.0140,
        lng: 135.6780,
        icon: "shopping",
        category: "activity"
      },
      {
        name: "Togetsukyo Bridge",
        time: "Afternoon",
        desc: "Iconic bridge with mountain backdrop",
        lat: 35.0100,
        lng: 135.6778,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Tenryu-ji Temple",
        time: "Afternoon",
        desc: "UNESCO World Heritage zen temple with stunning garden",
        lat: 35.0153,
        lng: 135.6743,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Kinkaku-ji (Golden Pavilion)",
        time: "Late Afternoon",
        desc: "Gold-leaf covered pavilion. Optional: Ryoan-ji & Ninna-ji nearby.",
        lat: 35.0394,
        lng: 135.7292,
        icon: "temple",
        category: "activity",
        highlight: true
      },
      {
        name: "Kyoto Station (Shinkansen)",
        time: "Evening",
        desc: "Shinkansen to Osaka (~30 min)",
        lat: 34.9856,
        lng: 135.7588,
        icon: "train",
        category: "transport"
      }
    ],
    note: "Sagano Romantic Train may be sold out (cherry blossom season). Have a backup plan to take JR directly to Arashiyama."
  },
  {
    id: "day9",
    day: "Day 9",
    date: "Apr 8",
    weekday: "Wednesday",
    city: "Osaka",
    theme: "Neon Lights & Street Food",
    color: "#10b981",
    center: [34.660, 135.505],
    zoom: 13,
    hotel: "Centara Grand Hotel Osaka",
    stops: [
      {
        name: "Shitennoji Temple",
        time: "Morning",
        desc: "Japan's oldest Buddhist temple, founded 593 AD",
        lat: 34.6534,
        lng: 135.5163,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Shinsekai & Tsutenkaku Tower",
        time: "Late Morning",
        desc: "Retro district. Kushikatsu (deep-fried skewers), neon signs, shopping street.",
        lat: 34.6525,
        lng: 135.5063,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Namba Yasaka Shrine",
        time: "Afternoon",
        desc: "Giant lion head shrine — pray for victory",
        lat: 34.6598,
        lng: 135.4962,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Dotonbori",
        time: "Afternoon",
        desc: "Neon signs, Glico Running Man, canal walk, takoyaki stands",
        lat: 34.6687,
        lng: 135.5014,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: "Nipponbashi (Den Den Town)",
        time: "Afternoon",
        desc: "Kansai's Akihabara — anime, manga, electronics",
        lat: 34.6596,
        lng: 135.5059,
        icon: "shopping",
        category: "activity"
      },
      {
        name: "Kuromon Market",
        time: "Late Afternoon",
        desc: "Fresh sashimi, wagyu skewers, king crab legs, seafood paradise",
        lat: 34.6622,
        lng: 135.5072,
        icon: "food",
        category: "food"
      },
      {
        name: "Jumbo Tsuribune Tsurikichi",
        time: "6:00 PM",
        desc: "Fishing restaurant — catch your own dinner! Reservation: 3TQW9Y973F",
        lat: 34.6940,
        lng: 135.4970,
        icon: "food",
        category: "food",
        highlight: true
      }
    ]
  },
  {
    id: "day10",
    day: "Day 10",
    date: "Apr 9",
    weekday: "Thursday",
    city: "Osaka",
    theme: "Castle & City Skyline",
    color: "#10b981",
    center: [34.685, 135.510],
    zoom: 13,
    stops: [
      {
        name: "Osaka Castle",
        time: "Morning",
        desc: "Symbol of Osaka — surrounded by cherry blossoms in April",
        lat: 34.6873,
        lng: 135.5262,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: "Osaka Museum of History",
        time: "Late Morning",
        desc: "Optional — right next to the castle",
        lat: 34.6848,
        lng: 135.5221,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Nakanoshima Museum of Art",
        time: "Midday",
        desc: "Futuristic black cube building — optional",
        lat: 34.6913,
        lng: 135.4913,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Hanshin Umeda (Depachika)",
        time: "Afternoon",
        desc: "Department store basement food hall — gourmet heaven",
        lat: 34.6997,
        lng: 135.4974,
        icon: "shopping",
        category: "activity"
      },
      {
        name: "HEP FIVE Ferris Wheel",
        time: "Afternoon",
        desc: "Red ferris wheel perched above the Umeda skyline",
        lat: 34.7044,
        lng: 135.5004,
        icon: "attraction",
        category: "activity"
      },
      {
        name: "Umeda Sky Building",
        time: "Sunset",
        desc: "360° Floating Garden Observatory — stunning night views",
        lat: 34.7052,
        lng: 135.4902,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: "Kani Doraku (Dotonbori Main)",
        time: "6:00 PM",
        desc: "Famous crab restaurant. Reserved via Google. Don't miss it!",
        lat: 34.6686,
        lng: 135.5020,
        icon: "food",
        category: "food",
        highlight: true
      }
    ],
    extras: [
      "Otter Cafe — Loutre (loutre-kyoto.com, walk-in, buy tickets onsite)",
      "Sumo performance (check schedule)"
    ]
  },
  {
    id: "day11",
    day: "Day 11",
    date: "Apr 10",
    weekday: "Friday",
    city: "Osaka",
    theme: "Universal Studios Japan",
    color: "#10b981",
    center: [34.6654, 135.4323],
    zoom: 14,
    stops: [
      {
        name: "Universal Studios Japan",
        time: "All Day",
        desc: "Full day with Express Pass. Super Nintendo World, Wizarding World of Harry Potter. Tickets purchased for 2.",
        lat: 34.6654,
        lng: 135.4323,
        icon: "attraction",
        category: "activity",
        highlight: true
      }
    ]
  },
  {
    id: "day12",
    day: "Day 12",
    date: "Apr 11",
    weekday: "Saturday",
    city: "Nara (Day Trip)",
    theme: "Deer & Ancient Temples",
    color: "#10b981",
    center: [34.685, 135.840],
    zoom: 14,
    stops: [
      {
        name: "Nara Park",
        time: "Morning",
        desc: "Friendly bowing deer! Buy deer crackers (shika senbei) to feed them.",
        lat: 34.6851,
        lng: 135.8430,
        icon: "nature",
        category: "activity"
      },
      {
        name: "Todai-ji Temple",
        time: "Midday",
        desc: "Great Buddha Hall — world's largest wooden building",
        lat: 34.6891,
        lng: 135.8399,
        icon: "temple",
        category: "activity",
        highlight: true
      },
      {
        name: "Kasuga Taisha Shrine",
        time: "Afternoon",
        desc: "3000 stone and bronze lanterns lining the approach",
        lat: 34.6812,
        lng: 135.8498,
        icon: "temple",
        category: "activity"
      },
      {
        name: "Sunset Flight Experience",
        time: "Evening",
        desc: "Scenic sunset activity back in Osaka area",
        lat: 34.6700,
        lng: 135.5000,
        icon: "attraction",
        category: "activity"
      }
    ]
  },
  {
    id: "day13",
    day: "Day 13",
    date: "Apr 12",
    weekday: "Sunday",
    city: "Tokyo",
    theme: "Shopping Day",
    color: "#8b5cf6",
    center: [35.665, 135.710],
    zoom: 13,
    hotel: "Millennium Mitsui Garden Hotel Tokyo / Ginza (AMEX FHR, $200 credit)",
    stops: [
      {
        name: "Shin-Osaka Station",
        time: "Morning",
        desc: "Shinkansen to Tokyo (~2.5 hrs). Book oversized baggage seat!",
        lat: 34.7334,
        lng: 135.5001,
        icon: "train",
        category: "transport"
      },
      {
        name: "Omotesando",
        time: "Afternoon",
        desc: "Fashion, architecture, luxury brands. MoMA Design Store for Noguchi Akari lamp.",
        lat: 35.6654,
        lng: 139.7121,
        icon: "shopping",
        category: "activity"
      },
      {
        name: "Daikanyama",
        time: "Afternoon",
        desc: "Vintage finds, indie shops, T-Site bookstore",
        lat: 35.6498,
        lng: 139.7019,
        icon: "shopping",
        category: "activity"
      },
      {
        name: "Ginza — Itoya",
        time: "Late Afternoon",
        desc: "Iconic stationery store. Also check for Noguchi lamps here.",
        lat: 35.6720,
        lng: 139.7652,
        icon: "shopping",
        category: "activity"
      }
    ],
    note: "Shopping tip: Noguchi Akari lamps are fragile — carry on, don't check!"
  },
  {
    id: "day14",
    day: "Day 14",
    date: "Apr 13",
    weekday: "Monday",
    city: "Tokyo → Vancouver",
    theme: "Departure",
    color: "#8b5cf6",
    center: [35.765, 140.386],
    zoom: 11,
    stops: [
      {
        name: "Hotel Checkout",
        time: "Morning",
        desc: "Millennium Mitsui Garden Hotel",
        lat: 35.6725,
        lng: 139.7658,
        icon: "hotel",
        category: "hotel"
      },
      {
        name: "Narita Airport (NRT)",
        time: "3:55 PM",
        desc: "Depart for Vancouver. Arrive same morning. Pick up Alfie at night!",
        lat: 35.7647,
        lng: 140.3864,
        icon: "flight",
        category: "transport",
        highlight: true
      }
    ]
  }
];
