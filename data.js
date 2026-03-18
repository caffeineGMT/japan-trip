const TRIP_DATA = [
  {
    id: "pre",
    day: "Pre-Trip",
    date: "Mar 29-30",
    weekday: "Sat-Sun",
    city: { en: "Vancouver", zh: "温哥华", ja: "バンクーバー" },
    theme: { en: "Prep & Departure", zh: "准备与出发", ja: "準備と出発" },
    color: "#6366f1",
    center: [49.195, -123.179],
    zoom: 11,
    stops: [
      {
        name: { en: "Vancouver International Airport (YVR)", zh: "温哥华国际机场 (YVR)", ja: "バンクーバー国際空港 (YVR)" },
        time: "10:30 AM (Mar 30)",
        desc: { en: "Depart for Tokyo Narita. Booking ref: JFM9KK", zh: "前往东京成田。预订编号：JFM9KK", ja: "成田へ出発。予約番号：JFM9KK" },
        lat: 49.1947,
        lng: -123.1790,
        icon: "flight",
        category: "transport"
      }
    ],
    checklist: [
      { en: "Board Alfie with parents", zh: "将Alfie托付给父母", ja: "Alfieを両親に預ける" },
      { en: "Buy Nomad eSIM / phone card", zh: "购买Nomad eSIM/电话卡", ja: "Nomad eSIM/電話カードを購入" },
      { en: "Fill out Visit Japan Web QR entry declaration", zh: "填写Visit Japan Web二维码入境申报", ja: "Visit Japan WebのQR入国申告を記入" },
      { en: "Set up Suica via Apple Pay (no physical cards available)", zh: "通过Apple Pay设置Suica（无实体卡）", ja: "Apple PayでSuicaを設定（物理カードなし）" },
      { en: "Download SmartEX app for Shinkansen", zh: "下载SmartEX应用程序（新干线）", ja: "新幹線用SmartEXアプリをダウンロード" },
      { en: "Screenshot QR codes — airport WiFi is slow", zh: "截图二维码 — 机场WiFi很慢", ja: "QRコードをスクリーンショット — 空港WiFiは遅い" }
    ]
  },
  {
    id: "day1",
    day: "Day 1",
    date: "Mar 31",
    weekday: "Tuesday",
    city: { en: "Tokyo", zh: "东京", ja: "東京" },
    theme: { en: "Arrival & First Taste", zh: "抵达与初体验", ja: "到着と初めての味" },
    color: "#ef4444",
    center: [35.665, 139.770],
    zoom: 13,
    hotel: { en: "Mitsui Garden Hotel Roppongi Tokyo Premier", zh: "三井花园饭店六本木东京顶级", ja: "三井ガーデンホテル六本木東京プレミア" },
    stops: [
      {
        name: { en: "Narita Airport (NRT)", zh: "成田机场 (NRT)", ja: "成田空港 (NRT)" },
        time: "12:40 PM",
        desc: { en: "Arrive. Immigration + baggage claim.", zh: "抵达。入境+行李提取。", ja: "到着。入国審査+手荷物受取。" },
        lat: 35.7647,
        lng: 140.3864,
        icon: "flight",
        category: "transport"
      },
      {
        name: { en: "Mitsui Garden Hotel Roppongi", zh: "三井花园饭店六本木", ja: "三井ガーデンホテル六本木" },
        time: "Afternoon",
        desc: { en: "Check in, freshen up", zh: "办理入住，休息整理", ja: "チェックイン、身支度" },
        lat: 35.6627,
        lng: 139.7310,
        icon: "hotel",
        category: "hotel"
      },
      {
        name: { en: "Cherry Blossom Viewing", zh: "赏樱花", ja: "桜鑑賞" },
        time: "Afternoon",
        desc: { en: "Nearby cherry blossom spots. Check forecast: n-kishou.com", zh: "附近的樱花景点。查看预报：n-kishou.com", ja: "近くの桜スポット。予報を確認：n-kishou.com" },
        lat: 35.6726,
        lng: 139.7405,
        icon: "nature",
        category: "activity"
      },
      {
        name: { en: "MIHIRO - Uni Rice", zh: "MIHIRO - 海胆饭", ja: "MIHIRO - ウニ丼" },
        time: "Evening",
        desc: { en: "Sea urchin bowl. Tsukiji 4-10-5, Chuo City, Tokyo", zh: "海胆盖饭。东京中央区筑地4-10-5", ja: "ウニ丼。東京都中央区築地4-10-5" },
        lat: 35.6654,
        lng: 139.7707,
        icon: "food",
        category: "food"
      },
      {
        name: { en: "Itadori (Backup)", zh: "Itadori（备选）", ja: "Itadori（予備）" },
        time: "Evening",
        desc: { en: "Alternative sushi spot near Tsukiji", zh: "筑地附近的备选寿司店", ja: "築地近くの代替寿司店" },
        lat: 35.6648,
        lng: 139.7695,
        icon: "food",
        category: "food"
      },
      {
        name: { en: "teamLab Planets", zh: "teamLab Planets", ja: "チームラボプラネッツ" },
        time: "7:30 PM",
        desc: { en: "Immersive art museum. ~1.5 hours. Tickets purchased.", zh: "沉浸式艺术博物馆。约1.5小时。已购票。", ja: "没入型アート美術館。約1.5時間。チケット購入済み。" },
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
    city: { en: "Tokyo", zh: "东京", ja: "東京" },
    theme: { en: "Edo Charm & Akihabara", zh: "江户魅力与秋叶原", ja: "江戸の魅力と秋葉原" },
    color: "#ef4444",
    center: [35.700, 139.780],
    zoom: 12,
    stops: [
      {
        name: { en: "Tokyo Skytree", zh: "东京晴空塔", ja: "東京スカイツリー" },
        time: "9:30 AM",
        desc: { en: "Opens 9:30. Panoramic view of the Kanto Plain.", zh: "9:30开放。关东平原全景。", ja: "9:30開館。関東平野のパノラマビュー。" },
        lat: 35.7101,
        lng: 139.8107,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Senso-ji Temple", zh: "浅草寺", ja: "浅草寺" },
        time: "Late Morning",
        desc: { en: "Get omamori charms, eat ningyo-yaki on Nakamise-dori. Consider renting kimono nearby.", zh: "购买御守护身符，在仲见世通吃人形烧。考虑附近租和服。", ja: "お守りを買い、仲見世通りで人形焼きを食べる。近くで着物レンタルも検討。" },
        lat: 35.7148,
        lng: 139.7967,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Horyuji Gallery (Tokyo National Museum)", zh: "法隆寺宝物馆（东京国立博物馆）", ja: "法隆寺宝物館（東京国立博物館）" },
        time: "Midday",
        desc: { en: "Horyuji Treasures Gallery in Ueno", zh: "上野的法隆寺宝物馆", ja: "上野の法隆寺宝物館" },
        lat: 35.7189,
        lng: 139.7766,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Ueno Park", zh: "上野公园", ja: "上野公園" },
        time: "Midday",
        desc: { en: "Stroll, cherry blossoms, street performers", zh: "漫步、赏樱、街头表演", ja: "散策、桜、ストリートパフォーマー" },
        lat: 35.7146,
        lng: 139.7732,
        icon: "nature",
        category: "activity"
      },
      {
        name: { en: "Akihabara", zh: "秋叶原", ja: "秋葉原" },
        time: "Afternoon",
        desc: { en: "Anime paradise. Check out Demon Slayer merch.", zh: "动漫天堂。看看《鬼灭之刃》周边。", ja: "アニメの聖地。鬼滅の刃グッズをチェック。" },
        lat: 35.7023,
        lng: 139.7745,
        icon: "shopping",
        category: "activity"
      },
      {
        name: { en: "Shibuya Sky", zh: "涩谷天空", ja: "渋谷スカイ" },
        time: "Sunset (~6:02 PM)",
        desc: { en: "Rooftop observation deck. Can see Mt. Fuji. Ticket: 26KK236310004. Current slot: 6:40 PM — may need to rebook for sunset.", zh: "屋顶观景台。可看到富士山。门票：26KK236310004。当前时段：6:40 PM — 可能需要重新预订日落时段。", ja: "屋上展望台。富士山が見える。チケット：26KK236310004。現在の時間帯：6:40 PM — 日没のために予約変更が必要かも。" },
        lat: 35.6584,
        lng: 139.7022,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Kabukicho", zh: "歌舞伎町", ja: "歌舞伎町" },
        time: "Night",
        desc: { en: "Shinjuku nightlife district", zh: "新宿夜生活区", ja: "新宿の歓楽街" },
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
    city: { en: "Tokyo", zh: "东京", ja: "東京" },
    theme: { en: "Art, Architecture & Shibuya", zh: "艺术、建筑与涩谷", ja: "アート、建築と渋谷" },
    color: "#ef4444",
    center: [35.660, 139.710],
    zoom: 13,
    stops: [
      {
        name: { en: "Daikanyama T-Site / Tsutaya Books", zh: "代官山T-Site / 茑屋书店", ja: "代官山T-Site / 蔦屋書店" },
        time: "Morning",
        desc: { en: "Iconic bookstore complex. Great for photos.", zh: "标志性书店综合体。适合拍照。", ja: "象徴的な書店複合施設。写真撮影に最適。" },
        lat: 35.6498,
        lng: 139.7019,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Fruits and Season", zh: "Fruits and Season", ja: "フルーツアンドシーズン" },
        time: "Late Morning",
        desc: { en: "Fruit parlor — seasonal fruit desserts", zh: "水果店 — 季节性水果甜点", ja: "フルーツパーラー — 季節のフルーツデザート" },
        lat: 35.6520,
        lng: 139.7050,
        icon: "food",
        category: "food"
      },
      {
        name: { en: "Nezu Museum", zh: "根津美术馆", ja: "根津美術館" },
        time: "Midday",
        desc: { en: "Beautiful bamboo garden, matcha tea in the courtyard", zh: "美丽的竹园，庭院里的抹茶", ja: "美しい竹庭園、中庭で抹茶" },
        lat: 35.6607,
        lng: 139.7181,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Omotesando", zh: "表参道", ja: "表参道" },
        time: "Afternoon",
        desc: { en: "Architecture walk, vintage shops, HARAKADO building", zh: "建筑漫步、复古商店、HARAKADO大楼", ja: "建築散策、ヴィンテージショップ、HARAKADO ビル" },
        lat: 35.6654,
        lng: 139.7121,
        icon: "shopping",
        category: "activity"
      },
      {
        name: { en: "Meiji Shrine", zh: "明治神宫", ja: "明治神宮" },
        time: "Late Afternoon",
        desc: { en: "Walk through old-growth forest to the shrine", zh: "穿过原始森林前往神社", ja: "原生林を通って神社へ" },
        lat: 35.6764,
        lng: 139.6993,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Shibuya Crossing", zh: "涩谷十字路口", ja: "渋谷スクランブル交差点" },
        time: "Sunset (~6 PM)",
        desc: { en: "World's busiest pedestrian crossing. Best photos at dusk.", zh: "世界上最繁忙的人行横道。黄昏时分拍照最佳。", ja: "世界一忙しい交差点。夕暮れ時の写真が最高。" },
        lat: 35.6595,
        lng: 139.7004,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Street Go-Kart Tour", zh: "街头卡丁车之旅", ja: "ストリートカートツアー" },
        time: "~5 PM",
        desc: { en: "1-hour street kart tour. Tickets purchased.", zh: "1小时街头卡丁车游览。已购票。", ja: "1時間のストリートカートツアー。チケット購入済み。" },
        lat: 35.6580,
        lng: 139.6990,
        icon: "attraction",
        category: "activity",
        highlight: true
      }
    ],
    food: [
      { name: { en: "Conveyor Belt Sushi", zh: "回转寿司", ja: "回転寿司" }, note: { en: "Popular spot, expect a wait", zh: "热门地点，需要等待", ja: "人気スポット、待ち時間あり" } },
      { name: { en: "Juan Bowl & Tea", zh: "Juan Bowl & Tea", ja: "Juan Bowl & Tea" }, note: { en: "Backup if sushi line is too long", zh: "如果寿司排队太长的备选", ja: "寿司の行列が長い場合の予備" } }
    ]
  },
  {
    id: "day4",
    day: "Day 4",
    date: "Apr 3",
    weekday: "Friday",
    city: { en: "Tokyo", zh: "东京", ja: "東京" },
    theme: { en: "City Life & Tokyo Tower", zh: "城市生活与东京塔", ja: "都会生活と東京タワー" },
    color: "#ef4444",
    center: [35.670, 139.760],
    zoom: 13,
    stops: [
      {
        name: { en: "Imperial Palace", zh: "皇居", ja: "皇居" },
        time: "Morning",
        desc: { en: "Palace grounds and East Gardens", zh: "皇宫场地和东御苑", ja: "皇居敷地と東御苑" },
        lat: 35.6852,
        lng: 139.7528,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Tokyo Station (First Avenue)", zh: "东京站（First Avenue）", ja: "東京駅（First Avenue）" },
        time: "Late Morning",
        desc: { en: "Underground shopping — buy Tokyo Banana souvenirs", zh: "地下购物 — 购买东京香蕉纪念品", ja: "地下ショッピング — 東京ばな奈のお土産を購入" },
        lat: 35.6812,
        lng: 139.7671,
        icon: "shopping",
        category: "activity"
      },
      {
        name: { en: "Ginza — Shiseido Parlour", zh: "银座 — 资生堂Parlour", ja: "銀座 — 資生堂パーラー" },
        time: "Afternoon",
        desc: { en: "Afternoon tea at the iconic beauty brand's parlor", zh: "在标志性美容品牌的茶室享用下午茶", ja: "象徴的な美容ブランドのパーラーでアフタヌーンティー" },
        lat: 35.6713,
        lng: 139.7654,
        icon: "food",
        category: "food"
      },
      {
        name: { en: "Sony Park", zh: "索尼公园", ja: "ソニーパーク" },
        time: "Afternoon",
        desc: { en: "Interactive tech exhibits", zh: "互动科技展览", ja: "インタラクティブな技術展示" },
        lat: 35.6733,
        lng: 139.7631,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Tsukiji Market", zh: "筑地市场", ja: "築地市場" },
        time: "Late Afternoon",
        desc: { en: "Itadori / Oedo — uni rice round 2", zh: "Itadori / Oedo — 海胆饭第二轮", ja: "Itadori / Oedo — ウニ丼ラウンド2" },
        lat: 35.6654,
        lng: 139.7707,
        icon: "food",
        category: "food"
      },
      {
        name: { en: "Tokyo Tower", zh: "东京塔", ja: "東京タワー" },
        time: "Sunset",
        desc: { en: "Multiple photo angles and viewpoints", zh: "多个拍照角度和观景点", ja: "複数の撮影アングルと展望台" },
        lat: 35.6586,
        lng: 139.7454,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Roppongi Hills Sky Deck", zh: "六本木之丘天空甲板", ja: "六本木ヒルズスカイデッキ" },
        time: "Night",
        desc: { en: "Rooftop night view of illuminated Tokyo Tower", zh: "屋顶夜景，观赏灯光东京塔", ja: "ライトアップされた東京タワーの屋上夜景" },
        lat: 35.6604,
        lng: 139.7292,
        icon: "attraction",
        category: "activity"
      }
    ],
    dinner: { en: "Genshiyaki Hibachi — 7:30 PM. Meet up with friends.", zh: "Genshiyaki Hibachi — 晚上7:30。与朋友见面。", ja: "源氏焼き鉄板焼き — 19:30。友達と会う。" }
  },
  {
    id: "day5",
    day: "Day 5",
    date: "Apr 4",
    weekday: "Saturday",
    city: { en: "Tokyo → Kyoto", zh: "东京 → 京都", ja: "東京 → 京都" },
    theme: { en: "Capybara Cafe & Shinkansen", zh: "水豚咖啡馆与新干线", ja: "カピバラカフェと新幹線" },
    color: "#ef4444",
    center: [35.660, 139.730],
    zoom: 12,
    stops: [
      {
        name: { en: "Cappiness Cafe / Cafe Capyba", zh: "Cappiness咖啡馆 / Cafe Capyba", ja: "カッピネスカフェ / カフェカピバ" },
        time: "Morning",
        desc: { en: "Capybara cafe! Cafe Capyba is the cheaper option.", zh: "水豚咖啡馆！Cafe Capyba是更便宜的选择。", ja: "カピバラカフェ！カフェカピバの方が安い。" },
        lat: 35.6300,
        lng: 139.7150,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Tokyo Station (Shinkansen)", zh: "东京站（新干线）", ja: "東京駅（新幹線）" },
        time: "Evening",
        desc: { en: "Shinkansen to Kyoto (~2.5 hrs). SmartEX app. Book oversized baggage seat!", zh: "乘新干线前往京都（约2.5小时）。使用SmartEX应用。预订超大行李座位！", ja: "京都へ新幹線（約2.5時間）。SmartEXアプリ。特大荷物座席を予約！" },
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
    city: { en: "Kyoto", zh: "京都", ja: "京都" },
    theme: { en: "Eastern Kyoto Landmarks", zh: "京都东部地标", ja: "京都東部の名所" },
    color: "#f59e0b",
    center: [34.980, 135.780],
    zoom: 13,
    hotel: { en: "Onyado Nono Kyoto Shichijo (with onsen!)", zh: "御宿野乃京都七条（带温泉！）", ja: "お宿野乃京都七条（温泉付き！）" },
    stops: [
      {
        name: { en: "Fushimi Inari Taisha", zh: "伏见稻荷大社", ja: "伏見稲荷大社" },
        time: "Early AM",
        desc: { en: "Thousands of vermillion torii gates. Go early to beat crowds.", zh: "数千个朱红色鸟居。早点去避开人群。", ja: "数千の朱色の鳥居。混雑を避けるため早めに行く。" },
        lat: 34.9671,
        lng: 135.7727,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Kiyomizu-dera", zh: "清水寺", ja: "清水寺" },
        time: "Morning",
        desc: { en: "Arrive by 6:30 AM for peaceful cherry blossom photos. Gets VERY crowded.", zh: "早上6:30前到达，拍摄宁静的樱花照片。会非常拥挤。", ja: "6:30までに到着し、静かな桜の写真を撮る。非常に混雑する。" },
        lat: 34.9949,
        lng: 135.7850,
        icon: "temple",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Ninenzaka & Sannenzaka", zh: "二年坂与三年坂", ja: "二年坂と三年坂" },
        time: "Late Morning",
        desc: { en: "Historic stone-paved lanes, traditional shops and teahouses", zh: "历史悠久的石板路，传统商店和茶馆", ja: "歴史的な石畳の小道、伝統的な店と茶屋" },
        lat: 34.9960,
        lng: 135.7808,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Gion Matayoshi (Lunch)", zh: "祇园又吉（午餐）", ja: "祇園又吉（ランチ）" },
        time: "Midday",
        desc: { en: "Reserve on TableCheck. Traditional Kyoto cuisine.", zh: "在TableCheck预订。传统京都料理。", ja: "TableCheckで予約。伝統的な京料理。" },
        lat: 35.0035,
        lng: 135.7760,
        icon: "food",
        category: "food"
      },
      {
        name: { en: "Yasaka Shrine", zh: "八坂神社", ja: "八坂神社" },
        time: "Afternoon",
        desc: { en: "Gion district's iconic shrine", zh: "祇园区的标志性神社", ja: "祇園の象徴的な神社" },
        lat: 35.0036,
        lng: 135.7785,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Heian Shrine", zh: "平安神宫", ja: "平安神宮" },
        time: "Late Afternoon",
        desc: { en: "Massive vermillion torii gate and serene zen gardens", zh: "巨大的朱红色鸟居和宁静的禅意花园", ja: "巨大な朱色の鳥居と静かな禅庭園" },
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
    city: { en: "Kyoto", zh: "京都", ja: "京都" },
    theme: { en: "Culture & Market Life", zh: "文化与市场生活", ja: "文化と市場生活" },
    color: "#f59e0b",
    center: [34.995, 135.755],
    zoom: 14,
    stops: [
      {
        name: { en: "Toji Temple", zh: "东寺", ja: "東寺" },
        time: "Morning",
        desc: { en: "Five-story pagoda — Japan's tallest wooden tower", zh: "五层塔 — 日本最高的木塔", ja: "五重塔 — 日本一高い木造塔" },
        lat: 34.9806,
        lng: 135.7478,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Kyoto Tower", zh: "京都塔", ja: "京都タワー" },
        time: "Late Morning",
        desc: { en: "City views from the observation deck", zh: "从观景台俯瞰城市", ja: "展望台からの市街地の眺め" },
        lat: 34.9875,
        lng: 135.7592,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Higashi & Nishi Hongan-ji", zh: "东本愿寺与西本愿寺", ja: "東本願寺と西本願寺" },
        time: "Late Morning",
        desc: { en: "Twin temple complex, UNESCO World Heritage", zh: "双寺建筑群，联合国教科文组织世界遗产", ja: "双子寺院複合体、ユネスコ世界遺産" },
        lat: 34.9915,
        lng: 135.7515,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Nishiki Market", zh: "锦市场", ja: "錦市場" },
        time: "Midday",
        desc: { en: "\"Kyoto's Kitchen\" — street food, pickles, matcha everything", zh: "\"京都的厨房\" — 街头小吃、腌菜、抹茶一切", ja: "「京の台所」 — 屋台料理、漬物、抹茶尽くし" },
        lat: 35.0050,
        lng: 135.7648,
        icon: "food",
        category: "food",
        highlight: true
      },
      {
        name: { en: "Nijo Castle", zh: "二条城", ja: "二条城" },
        time: "Afternoon",
        desc: { en: "Famous nightingale floors and Ninomaru Palace", zh: "著名的夜莺地板和二之丸御殿", ja: "有名な鴬張りの床と二の丸御殿" },
        lat: 35.0142,
        lng: 135.7481,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Kyoto Imperial Palace", zh: "京都御所", ja: "京都御所" },
        time: "Late Afternoon",
        desc: { en: "Imperial park and gardens — peaceful stroll", zh: "皇家公园和花园 — 宁静漫步", ja: "御苑と庭園 — 静かな散策" },
        lat: 35.0254,
        lng: 135.7621,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Pontocho Alley", zh: "先斗町小巷", ja: "先斗町通り" },
        time: "Evening",
        desc: { en: "Atmospheric narrow dining alley along the Kamogawa river", zh: "沿鸭川河的狭窄用餐小巷，氛围优雅", ja: "鴨川沿いの雰囲気ある狭い飲食街" },
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
    city: { en: "Kyoto → Osaka", zh: "京都 → 大阪", ja: "京都 → 大阪" },
    theme: { en: "Arashiyama & Golden Pavilion", zh: "岚山与金阁寺", ja: "嵐山と金閣寺" },
    color: "#f59e0b",
    center: [35.020, 135.680],
    zoom: 12,
    stops: [
      {
        name: { en: "Otagi Nenbutsu-ji", zh: "爱宕念佛寺", ja: "愛宕念仏寺" },
        time: "Morning",
        desc: { en: "1200 unique stone rakan statues — each one different", zh: "1200尊独特的石罗汉像 — 每一尊都不同", ja: "1200体のユニークな石像羅漢 — それぞれ異なる" },
        lat: 35.0270,
        lng: 135.6510,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Bamboo Grove", zh: "竹林小径", ja: "竹林の道" },
        time: "Morning",
        desc: { en: "Get there EARLY. Extremely crowded during cherry blossom season.", zh: "早点到达。樱花季节非常拥挤。", ja: "早めに到着。桜の季節は非常に混雑。" },
        lat: 35.0170,
        lng: 135.6713,
        icon: "nature",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Okochi Sanso Garden", zh: "大河内山庄庭园", ja: "大河内山荘庭園" },
        time: "Late Morning",
        desc: { en: "Hilltop villa with panoramic views, includes matcha", zh: "山顶别墅，全景视野，包含抹茶", ja: "パノラマビューの山荘、抹茶付き" },
        lat: 35.0194,
        lng: 135.6700,
        icon: "nature",
        category: "activity"
      },
      {
        name: { en: "Jojakko-ji & Gio-ji Temples", zh: "常寂光寺与祇王寺", ja: "常寂光寺と祇王寺" },
        time: "Late Morning",
        desc: { en: "Moss temple trail through western Arashiyama", zh: "穿过岚山西部的苔藓寺庙小径", ja: "嵐山西部の苔寺トレイル" },
        lat: 35.0230,
        lng: 135.6680,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Arashiyama Shopping Street", zh: "岚山商业街", ja: "嵐山商店街" },
        time: "Midday",
        desc: { en: "Lunch + matcha soft serve + souvenirs", zh: "午餐 + 抹茶冰淇淋 + 纪念品", ja: "ランチ + 抹茶ソフトクリーム + お土産" },
        lat: 35.0140,
        lng: 135.6780,
        icon: "shopping",
        category: "activity"
      },
      {
        name: { en: "Togetsukyo Bridge", zh: "渡月桥", ja: "渡月橋" },
        time: "Afternoon",
        desc: { en: "Iconic bridge with mountain backdrop", zh: "标志性的桥梁，背景是山脉", ja: "山を背景にした象徴的な橋" },
        lat: 35.0100,
        lng: 135.6778,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Tenryu-ji Temple", zh: "天龙寺", ja: "天龍寺" },
        time: "Afternoon",
        desc: { en: "UNESCO World Heritage zen temple with stunning garden", zh: "联合国教科文组织世界遗产禅寺，花园惊艳", ja: "ユネスコ世界遺産の禅寺、美しい庭園" },
        lat: 35.0153,
        lng: 135.6743,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Kinkaku-ji (Golden Pavilion)", zh: "金阁寺", ja: "金閣寺" },
        time: "Late Afternoon",
        desc: { en: "Gold-leaf covered pavilion. Optional: Ryoan-ji & Ninna-ji nearby.", zh: "金箔覆盖的亭阁。可选：附近的龙安寺和仁和寺。", ja: "金箔で覆われた楼閣。オプション：近くの龍安寺と仁和寺。" },
        lat: 35.0394,
        lng: 135.7292,
        icon: "temple",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Kyoto Station (Shinkansen)", zh: "京都站（新干线）", ja: "京都駅（新幹線）" },
        time: "Evening",
        desc: { en: "Shinkansen to Osaka (~30 min)", zh: "乘新干线前往大阪（约30分钟）", ja: "大阪へ新幹線（約30分）" },
        lat: 34.9856,
        lng: 135.7588,
        icon: "train",
        category: "transport"
      }
    ],
    note: { en: "Sagano Romantic Train may be sold out (cherry blossom season). Have a backup plan to take JR directly to Arashiyama.", zh: "嵯峨野浪漫小火车可能售罄（樱花季）。准备好备用方案，直接乘JR前往岚山。", ja: "嵯峨野トロッコ列車は売り切れの可能性（桜の季節）。嵐山へJRで直接行く予備プランを用意。" }
  },
  {
    id: "day9",
    day: "Day 9",
    date: "Apr 8",
    weekday: "Wednesday",
    city: { en: "Osaka", zh: "大阪", ja: "大阪" },
    theme: { en: "Neon Lights & Street Food", zh: "霓虹灯与街头美食", ja: "ネオンライトとストリートフード" },
    color: "#10b981",
    center: [34.660, 135.505],
    zoom: 13,
    hotel: { en: "Centara Grand Hotel Osaka", zh: "大阪诗塔拉大饭店", ja: "センタラグランドホテル大阪" },
    stops: [
      {
        name: { en: "Shitennoji Temple", zh: "四天王寺", ja: "四天王寺" },
        time: "Morning",
        desc: { en: "Japan's oldest Buddhist temple, founded 593 AD", zh: "日本最古老的佛教寺庙，建于公元593年", ja: "日本最古の仏教寺院、593年創建" },
        lat: 34.6534,
        lng: 135.5163,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Shinsekai & Tsutenkaku Tower", zh: "新世界与通天阁", ja: "新世界と通天閣" },
        time: "Late Morning",
        desc: { en: "Retro district. Kushikatsu (deep-fried skewers), neon signs, shopping street.", zh: "复古街区。串炸、霓虹灯、商业街。", ja: "レトロ地区。串カツ、ネオンサイン、商店街。" },
        lat: 34.6525,
        lng: 135.5063,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Namba Yasaka Shrine", zh: "难波八坂神社", ja: "難波八阪神社" },
        time: "Afternoon",
        desc: { en: "Giant lion head shrine — pray for victory", zh: "巨大狮子头神社 — 祈求胜利", ja: "巨大なライオンヘッドの神社 — 勝利を祈る" },
        lat: 34.6598,
        lng: 135.4962,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Dotonbori", zh: "道顿堀", ja: "道頓堀" },
        time: "Afternoon",
        desc: { en: "Neon signs, Glico Running Man, canal walk, takoyaki stands", zh: "霓虹灯、格力高跑步人、运河漫步、章鱼烧摊位", ja: "ネオンサイン、グリコの看板、運河沿い、たこ焼き屋台" },
        lat: 34.6687,
        lng: 135.5014,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Nipponbashi (Den Den Town)", zh: "日本桥（电电町）", ja: "日本橋（でんでんタウン）" },
        time: "Afternoon",
        desc: { en: "Kansai's Akihabara — anime, manga, electronics", zh: "关西的秋叶原 — 动漫、漫画、电子产品", ja: "関西の秋葉原 — アニメ、マンガ、電気街" },
        lat: 34.6596,
        lng: 135.5059,
        icon: "shopping",
        category: "activity"
      },
      {
        name: { en: "Kuromon Market", zh: "黑门市场", ja: "黒門市場" },
        time: "Late Afternoon",
        desc: { en: "Fresh sashimi, wagyu skewers, king crab legs, seafood paradise", zh: "新鲜刺身、和牛串、帝王蟹腿、海鲜天堂", ja: "新鮮な刺身、和牛串、タラバガニ、海鮮パラダイス" },
        lat: 34.6622,
        lng: 135.5072,
        icon: "food",
        category: "food"
      },
      {
        name: { en: "Jumbo Tsuribune Tsurikichi", zh: "Jumbo Tsuribune Tsurikichi", ja: "ジャンボ釣船つりきち" },
        time: "6:00 PM",
        desc: { en: "Fishing restaurant — catch your own dinner! Reservation: 3TQW9Y973F", zh: "钓鱼餐厅 — 自己钓晚餐！预订：3TQW9Y973F", ja: "釣り船レストラン — 自分で夕食を釣る！予約：3TQW9Y973F" },
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
    city: { en: "Osaka", zh: "大阪", ja: "大阪" },
    theme: { en: "Castle & City Skyline", zh: "城堡与城市天际线", ja: "城と街並み" },
    color: "#10b981",
    center: [34.685, 135.510],
    zoom: 13,
    stops: [
      {
        name: { en: "Osaka Castle", zh: "大阪城", ja: "大阪城" },
        time: "Morning",
        desc: { en: "Symbol of Osaka — surrounded by cherry blossoms in April", zh: "大阪的象征 — 四月樱花环绕", ja: "大阪のシンボル — 4月は桜に囲まれる" },
        lat: 34.6873,
        lng: 135.5262,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Osaka Museum of History", zh: "大阪历史博物馆", ja: "大阪歴史博物館" },
        time: "Late Morning",
        desc: { en: "Optional — right next to the castle", zh: "可选 — 就在城堡旁边", ja: "オプション — 城のすぐ隣" },
        lat: 34.6848,
        lng: 135.5221,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Nakanoshima Museum of Art", zh: "中之岛美术馆", ja: "中之島美術館" },
        time: "Midday",
        desc: { en: "Futuristic black cube building — optional", zh: "未来主义黑色立方体建筑 — 可选", ja: "未来的な黒いキューブの建物 — オプション" },
        lat: 34.6913,
        lng: 135.4913,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Hanshin Umeda (Depachika)", zh: "阪神梅田（Depachika）", ja: "阪神梅田（デパ地下）" },
        time: "Afternoon",
        desc: { en: "Department store basement food hall — gourmet heaven", zh: "百货公司地下美食街 — 美食天堂", ja: "デパ地下 — グルメ天国" },
        lat: 34.6997,
        lng: 135.4974,
        icon: "shopping",
        category: "activity"
      },
      {
        name: { en: "HEP FIVE Ferris Wheel", zh: "HEP FIVE摩天轮", ja: "HEP FIVE観覧車" },
        time: "Afternoon",
        desc: { en: "Red ferris wheel perched above the Umeda skyline", zh: "梅田天际线上方的红色摩天轮", ja: "梅田のスカイラインの上にある赤い観覧車" },
        lat: 34.7044,
        lng: 135.5004,
        icon: "attraction",
        category: "activity"
      },
      {
        name: { en: "Umeda Sky Building", zh: "梅田蓝天大厦", ja: "梅田スカイビル" },
        time: "Sunset",
        desc: { en: "360° Floating Garden Observatory — stunning night views", zh: "360°空中庭园展望台 — 惊艳夜景", ja: "360°空中庭園展望台 — 見事な夜景" },
        lat: 34.7052,
        lng: 135.4902,
        icon: "attraction",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Kani Doraku (Dotonbori Main)", zh: "蟹道乐（道顿堀本店）", ja: "かに道楽（道頓堀本店）" },
        time: "6:00 PM",
        desc: { en: "Famous crab restaurant. Reserved via Google. Don't miss it!", zh: "著名的蟹料理餐厅。通过Google预订。不要错过！", ja: "有名なカニ料理店。Google予約済み。見逃すな！" },
        lat: 34.6686,
        lng: 135.5020,
        icon: "food",
        category: "food",
        highlight: true
      }
    ],
    extras: [
      { en: "Otter Cafe — Loutre (loutre-kyoto.com, walk-in, buy tickets onsite)", zh: "水獭咖啡馆 — Loutre（loutre-kyoto.com，无需预约，现场购票）", ja: "カワウソカフェ — Loutre（loutre-kyoto.com、予約不要、現地でチケット購入）" },
      { en: "Sumo performance (check schedule)", zh: "相扑表演（查看时间表）", ja: "相撲公演（スケジュールを確認）" }
    ]
  },
  {
    id: "day11",
    day: "Day 11",
    date: "Apr 10",
    weekday: "Friday",
    city: { en: "Osaka", zh: "大阪", ja: "大阪" },
    theme: { en: "Universal Studios Japan", zh: "日本环球影城", ja: "ユニバーサルスタジオジャパン" },
    color: "#10b981",
    center: [34.6654, 135.4323],
    zoom: 14,
    stops: [
      {
        name: { en: "Universal Studios Japan", zh: "日本环球影城", ja: "ユニバーサルスタジオジャパン" },
        time: "All Day",
        desc: { en: "Full day with Express Pass. Super Nintendo World, Wizarding World of Harry Potter. Tickets purchased for 2.", zh: "全天游玩，持快速通行证。超级任天堂世界、哈利波特魔法世界。已购2人票。", ja: "エクスプレスパス付きで終日。スーパーニンテンドーワールド、ハリーポッター。2名分チケット購入済み。" },
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
    city: { en: "Nara (Day Trip)", zh: "奈良（一日游）", ja: "奈良（日帰り）" },
    theme: { en: "Deer & Ancient Temples", zh: "鹿与古寺", ja: "鹿と古寺" },
    color: "#10b981",
    center: [34.685, 135.840],
    zoom: 14,
    stops: [
      {
        name: { en: "Nara Park", zh: "奈良公园", ja: "奈良公園" },
        time: "Morning",
        desc: { en: "Friendly bowing deer! Buy deer crackers (shika senbei) to feed them.", zh: "友好的鞠躬鹿！购买鹿饼干（鹿煎饼）喂它们。", ja: "お辞儀する鹿！鹿せんべいを買って餌をあげよう。" },
        lat: 34.6851,
        lng: 135.8430,
        icon: "nature",
        category: "activity"
      },
      {
        name: { en: "Todai-ji Temple", zh: "东大寺", ja: "東大寺" },
        time: "Midday",
        desc: { en: "Great Buddha Hall — world's largest wooden building", zh: "大佛殿 — 世界上最大的木造建筑", ja: "大仏殿 — 世界最大の木造建築" },
        lat: 34.6891,
        lng: 135.8399,
        icon: "temple",
        category: "activity",
        highlight: true
      },
      {
        name: { en: "Kasuga Taisha Shrine", zh: "春日大社", ja: "春日大社" },
        time: "Afternoon",
        desc: { en: "3000 stone and bronze lanterns lining the approach", zh: "3000盏石灯笼和青铜灯笼排列在参道两旁", ja: "参道に並ぶ3000基の石灯籠と青銅灯籠" },
        lat: 34.6812,
        lng: 135.8498,
        icon: "temple",
        category: "activity"
      },
      {
        name: { en: "Sunset Flight Experience", zh: "日落飞行体验", ja: "サンセットフライト体験" },
        time: "Evening",
        desc: { en: "Scenic sunset activity back in Osaka area", zh: "返回大阪地区的日落风景活动", ja: "大阪エリアに戻る夕日のアクティビティ" },
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
    city: { en: "Tokyo", zh: "东京", ja: "東京" },
    theme: { en: "Shopping Day", zh: "购物日", ja: "ショッピングデー" },
    color: "#8b5cf6",
    center: [35.665, 135.710],
    zoom: 13,
    hotel: { en: "Millennium Mitsui Garden Hotel Tokyo / Ginza (AMEX FHR, $200 credit)", zh: "千禧三井花园饭店东京/银座（AMEX FHR，$200积分）", ja: "ミレニアム三井ガーデンホテル東京/銀座（AMEX FHR、$200クレジット）" },
    stops: [
      {
        name: { en: "Shin-Osaka Station", zh: "新大阪站", ja: "新大阪駅" },
        time: "Morning",
        desc: { en: "Shinkansen to Tokyo (~2.5 hrs). Book oversized baggage seat!", zh: "乘新干线前往东京（约2.5小时）。预订超大行李座位！", ja: "東京へ新幹線（約2.5時間）。特大荷物座席を予約！" },
        lat: 34.7334,
        lng: 135.5001,
        icon: "train",
        category: "transport"
      },
      {
        name: { en: "Omotesando", zh: "表参道", ja: "表参道" },
        time: "Afternoon",
        desc: { en: "Fashion, architecture, luxury brands. MoMA Design Store for Noguchi Akari lamp.", zh: "时尚、建筑、奢侈品牌。MoMA设计店购买野口明灯。", ja: "ファッション、建築、高級ブランド。MoMAデザインストアで野口明のランプ。" },
        lat: 35.6654,
        lng: 139.7121,
        icon: "shopping",
        category: "activity"
      },
      {
        name: { en: "Daikanyama", zh: "代官山", ja: "代官山" },
        time: "Afternoon",
        desc: { en: "Vintage finds, indie shops, T-Site bookstore", zh: "复古淘宝、独立商店、T-Site书店", ja: "ヴィンテージ品、インディーショップ、T-Site書店" },
        lat: 35.6498,
        lng: 139.7019,
        icon: "shopping",
        category: "activity"
      },
      {
        name: { en: "Ginza — Itoya", zh: "银座 — 伊东屋", ja: "銀座 — 伊東屋" },
        time: "Late Afternoon",
        desc: { en: "Iconic stationery store. Also check for Noguchi lamps here.", zh: "标志性的文具店。也可以在这里查看野口明灯。", ja: "象徴的な文房具店。ここでも野口のランプを確認。" },
        lat: 35.6720,
        lng: 139.7652,
        icon: "shopping",
        category: "activity"
      }
    ],
    note: { en: "Shopping tip: Noguchi Akari lamps are fragile — carry on, don't check!", zh: "购物提示：野口明灯易碎 — 随身携带，不要托运！", ja: "ショッピングのヒント：野口明のランプは壊れやすい — 機内持ち込み、預けないこと！" }
  },
  {
    id: "day14",
    day: "Day 14",
    date: "Apr 13",
    weekday: "Monday",
    city: { en: "Tokyo → Vancouver", zh: "东京 → 温哥华", ja: "東京 → バンクーバー" },
    theme: { en: "Departure", zh: "返程", ja: "帰国" },
    color: "#8b5cf6",
    center: [35.765, 140.386],
    zoom: 11,
    stops: [
      {
        name: { en: "Hotel Checkout", zh: "酒店退房", ja: "ホテルチェックアウト" },
        time: "Morning",
        desc: { en: "Millennium Mitsui Garden Hotel", zh: "千禧三井花园饭店", ja: "ミレニアム三井ガーデンホテル" },
        lat: 35.6725,
        lng: 139.7658,
        icon: "hotel",
        category: "hotel"
      },
      {
        name: { en: "Narita Airport (NRT)", zh: "成田机场 (NRT)", ja: "成田空港 (NRT)" },
        time: "3:55 PM",
        desc: { en: "Depart for Vancouver. Arrive same morning. Pick up Alfie at night!", zh: "返回温哥华。同一天早上抵达。晚上接Alfie！", ja: "バンクーバーへ出発。同日朝到着。夜にAlfieをピックアップ！" },
        lat: 35.7647,
        lng: 140.3864,
        icon: "flight",
        category: "transport",
        highlight: true
      }
    ]
  }
];
