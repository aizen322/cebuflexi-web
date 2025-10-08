import { Tour, Vehicle, Testimonial, BlogPost } from "@/types";

export const featuredTours: Tour[] = [
  {
    id: "beach-escape",
    title: "Cebu Beach Escape",
    category: "Beach",
    description: "Experience the pristine beaches and crystal-clear waters of Cebu with our exclusive 3-day beach getaway.",
    shortDescription: "3 days of paradise across Cebu's best beaches",
    price: 4250,
    duration: 3,
    location: "Mactan, Moalboal",
    groupSize: { min: 2, max: 15 },
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Mactan Island",
        activities: ["Hotel check-in", "Mactan beach tour", "Sunset viewing"],
        meals: ["Welcome dinner"]
      },
      {
        day: 2,
        title: "Island Hopping Adventure",
        activities: ["Boat to Hilutungan Island", "Snorkeling", "Nalusuan Island lunch", "Caohagan Island"],
        meals: ["Breakfast", "Island lunch", "Dinner"]
      },
      {
        day: 3,
        title: "Moalboal & Kawasan Falls",
        activities: ["Sardine run snorkeling", "Kawasan Falls canyoneering", "Beach relaxation"],
        meals: ["Breakfast", "Lunch"]
      }
    ],
    inclusions: ["Professional guide", "Boat transfers", "Entrance fees", "Snorkeling gear", "Meals as indicated", "Hotel pickup"],
    available: true,
    featured: true
  },
  {
    id: "historical-cebu",
    title: "Historical Cebu Tour",
    category: "Cultural",
    description: "Journey through 500 years of Philippine history in Cebu City, visiting iconic landmarks and heritage sites.",
    shortDescription: "Discover Cebu's rich Spanish colonial heritage",
    price: 3500,
    duration: 1,
    location: "Cebu City",
    groupSize: { min: 4, max: 20 },
    images: [
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Heritage City Tour",
        activities: [
          "Magellan's Cross",
          "Basilica del Santo Niño",
          "Fort San Pedro",
          "Heritage of Cebu Monument",
          "Yap-Sandiego Ancestral House",
          "Taoist Temple"
        ],
        meals: ["Lunch at local restaurant"]
      }
    ],
    inclusions: ["Expert local guide", "Air-conditioned transport", "Entrance fees", "Lunch", "Hotel pickup"],
    available: true,
    featured: true
  },
  {
    id: "adventure-tour",
    title: "Cebu Adventure Experience",
    category: "Adventure",
    description: "Get your adrenaline pumping with canyoneering, cliff jumping, and waterfall exploration in Cebu's wilderness.",
    shortDescription: "Extreme adventure for thrill-seekers",
    price: 4800,
    duration: 1,
    location: "Badian",
    groupSize: { min: 2, max: 12 },
    images: [
      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Kawasan Canyoneering",
        activities: [
          "Safety briefing & gear up",
          "Trek through jungle trails",
          "Cliff jumping (5m-15m)",
          "Swimming through gorges",
          "Kawasan Falls finale",
          "Beach relaxation"
        ],
        meals: ["Breakfast", "Packed lunch", "Snacks"]
      }
    ],
    inclusions: ["Professional guide", "Safety equipment", "Life vest & helmet", "Waterproof bag", "Meals", "Transport"],
    available: true,
    featured: true
  },
  {
    id: "food-tour",
    title: "Cebu Food & Culture Tour",
    category: "Food",
    description: "Taste your way through Cebu's culinary heritage with lechon, street food, and local delicacies.",
    shortDescription: "A gastronomic journey through Cebuano cuisine",
    price: 2800,
    duration: 1,
    location: "Cebu City",
    groupSize: { min: 4, max: 15 },
    images: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Culinary Adventure",
        activities: [
          "Carbon Market tour",
          "Street food tasting",
          "Famous lechon lunch",
          "Taboan Market dried goods",
          "Traditional kakanin desserts",
          "Sutukil seafood dinner"
        ],
        meals: ["Multiple food tastings throughout the day"]
      }
    ],
    inclusions: ["Food guide", "All food tastings", "Transport", "Bottled water", "Market tours"],
    available: true,
    featured: true
  }
];

export const allTours: Tour[] = [
  ...featuredTours,
  {
    id: "whale-shark-adventure",
    title: "Oslob Whale Shark Experience",
    category: "Adventure",
    description: "Swim alongside gentle giants in their natural habitat. This once-in-a-lifetime experience includes professional guides, safety briefing, and underwater photography.",
    shortDescription: "Swim with whale sharks in Oslob",
    price: 5500,
    duration: 1,
    location: "Oslob",
    groupSize: { min: 1, max: 10 },
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Whale Shark Encounter",
        activities: ["Early morning pickup", "Arrive at Oslob", "Safety briefing", "Whale shark snorkeling (30 min)", "Breakfast", "Tumalog Falls visit", "Return to Cebu City"],
        meals: ["Breakfast"]
      }
    ],
    inclusions: ["Hotel transfers", "Life vest & snorkeling gear", "Professional guide", "Entrance fees", "Breakfast", "Underwater photos"],
    available: true,
    featured: false
  },
  {
    id: "mountain-highlands-tour",
    title: "Cebu Mountain Highlands Tour",
    category: "Adventure",
    description: "Escape the heat and explore Cebu's cool mountain areas. Visit flower gardens, temples, and enjoy panoramic city views.",
    shortDescription: "Cool mountain retreat with scenic views",
    price: 3200,
    duration: 1,
    location: "Cebu Highlands",
    groupSize: { min: 2, max: 15 },
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Highland Adventures",
        activities: ["Sirao Flower Garden", "Temple of Leah", "Tops Lookout", "Mountain restaurant lunch", "Taoist Temple", "Return to city"],
        meals: ["Lunch"]
      }
    ],
    inclusions: ["Air-conditioned transport", "English-speaking guide", "Entrance fees", "Lunch", "Hotel pickup"],
    available: true,
    featured: false
  },
  {
    id: "bohol-day-trip",
    title: "Bohol Island Day Trip",
    category: "Beach",
    description: "Cross to neighboring Bohol Island to see the famous Chocolate Hills, tarsiers, and pristine beaches.",
    shortDescription: "Explore Bohol's wonders in one day",
    price: 6800,
    duration: 1,
    location: "Bohol",
    groupSize: { min: 4, max: 20 },
    images: [
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Bohol Highlights",
        activities: ["Ferry to Bohol", "Chocolate Hills viewing", "Tarsier sanctuary", "Loboc River cruise lunch", "Man-made Forest", "Baclayon Church", "Ferry return"],
        meals: ["Lunch on river cruise"]
      }
    ],
    inclusions: ["Ferry tickets", "Land transfers", "Tour guide", "Entrance fees", "Lunch", "Hotel pickup from Cebu"],
    available: true,
    featured: false
  },
  {
    id: "cebu-city-street-food",
    title: "Cebu City Street Food Tour",
    category: "Food",
    description: "Experience authentic Cebuano street food culture with a local foodie guide. From barbecue to balut, taste it all!",
    shortDescription: "Authentic street food adventure",
    price: 1800,
    duration: 1,
    location: "Cebu City",
    groupSize: { min: 2, max: 8 },
    images: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Street Food Journey",
        activities: ["Meet at Carbon Market", "BBQ street stalls", "Puso and pork belly", "Larsian BBQ area", "Traditional desserts", "Night market visit"],
        meals: ["Multiple street food tastings"]
      }
    ],
    inclusions: ["Food guide", "All food tastings (10+ items)", "Bottled water", "Transportation between spots"],
    available: true,
    featured: false
  },
  {
    id: "camotes-islands",
    title: "Camotes Islands Escape",
    category: "Beach",
    description: "Discover the hidden paradise of Camotes Islands with white sand beaches, caves, and peaceful island life.",
    shortDescription: "Hidden island paradise getaway",
    price: 12500,
    duration: 2,
    location: "Camotes Islands",
    groupSize: { min: 2, max: 12 },
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=1200&h=800&fit=crop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Camotes Exploration",
        activities: ["Ferry to Camotes", "Santiago Bay beach", "Timubo Cave swimming", "Lake Danao", "Hotel check-in", "Sunset at beach"],
        meals: ["Lunch", "Dinner"]
      },
      {
        day: 2,
        title: "Beach & Return",
        activities: ["Mangodlong Beach", "Bukilat Cave", "Local market visit", "Ferry back to Cebu"],
        meals: ["Breakfast", "Lunch"]
      }
    ],
    inclusions: ["Ferry tickets", "Accommodation (1 night)", "All meals", "Island transport", "Guide", "Entrance fees"],
    available: true,
    featured: false
  }
];

export const vehicles: Vehicle[] = [
  {
    id: "toyota-vios",
    name: "Toyota Vios",
    type: "Sedan",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
    pricePerDay: 2000,
    capacity: 5,
    transmission: "Automatic",
    fuelType: "Gasoline",
    withDriver: true,
    luggage: 2,
    features: ["Air Conditioning", "Bluetooth Stereo", "GPS Navigation"],
    available: true,
  },
  {
    id: "toyota-fortuner",
    name: "Toyota Fortuner",
    type: "SUV",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop",
    pricePerDay: 3500,
    capacity: 7,
    transmission: "Automatic",
    fuelType: "Diesel",
    withDriver: true,
    luggage: 4,
    features: ["Air Conditioning", "Leather Seats", "4x4 Capability", "Sunroof"],
    available: true,
  },
  {
    id: "toyota-hiace",
    name: "Toyota Hiace Van",
    type: "Van",
    image: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&h=600&fit=crop",
    pricePerDay: 4500,
    capacity: 15,
    transmission: "Manual",
    fuelType: "Diesel",
    withDriver: false,
    luggage: 10,
    features: ["Dual Air Conditioning", "Spacious Interior", "Sliding Doors"],
    available: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    location: "California, USA",
    rating: 5,
    text: "Our Cebu beach escape was absolutely incredible! The guides were knowledgeable and friendly, and every beach we visited was more beautiful than the last. Highly recommend!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    tourId: "beach-escape"
  },
  {
    id: "2",
    name: "Miguel Santos",
    location: "Manila, Philippines",
    rating: 5,
    text: "The historical tour was eye-opening! Our guide brought Cebu's rich history to life. Perfect for anyone wanting to understand Filipino heritage.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    tourId: "historical-cebu"
  },
  {
    id: "3",
    name: "Emma Chen",
    location: "Singapore",
    rating: 5,
    text: "Canyoneering at Kawasan Falls was the highlight of my trip! The adrenaline rush was amazing, and the guides made sure everyone felt safe. A must-do adventure!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    tourId: "adventure-tour"
  },
  {
    id: "4",
    name: "David Park",
    location: "Seoul, South Korea",
    rating: 5,
    text: "Renting a car with a driver was the best decision. We explored Cebu at our own pace and our driver knew all the hidden gems. Very professional service!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"
  },
  {
    id: "5",
    name: "Lisa Anderson",
    location: "Sydney, Australia",
    rating: 5,
    text: "The food tour was a delicious journey through Cebuano culture. From lechon to street food, every bite was authentic and amazing. Our guide's passion for local cuisine made it even better!",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    tourId: "food-tour"
  }
];

export const cebuHotspots = [
  { name: "Kawasan Falls", lat: 9.8147, lng: 123.3745 },
  { name: "Oslob Whale Sharks", lat: 9.4833, lng: 123.3833 },
  { name: "Magellan's Cross", lat: 10.2935, lng: 123.9015 },
  { name: "Basilica del Santo Niño", lat: 10.2944, lng: 123.9022 },
  { name: "Tops Lookout", lat: 10.3167, lng: 123.8833 },
  { name: "Mactan Island", lat: 10.3167, lng: 124.0167 }
];

export const blogPosts: BlogPost[] = [
  {
    id: "top-10-cebu-hidden-gems",
    title: "Top 10 Hidden Gems in Cebu You Must Visit in 2025",
    slug: "top-10-cebu-hidden-gems",
    excerpt: "Discover Cebu's best-kept secrets beyond the usual tourist spots. From secluded beaches to mountain retreats, explore places locals love.",
    content: `<p>While Cebu is famous for its beaches and historical sites, there are countless hidden gems waiting to be discovered. Here are our top 10 off-the-beaten-path destinations that will make your Cebu trip truly unforgettable.</p>

<h2>1. Moalboal's Sardine Run</h2>
<p>Experience swimming through millions of sardines in their natural habitat. This underwater spectacle happens daily just meters from Panagsama Beach. Best time to visit is early morning when visibility is at its peak.</p>

<h2>2. Sirao Flower Farm</h2>
<p>Often called "Little Amsterdam," this vibrant flower garden in the mountains offers stunning Instagram-worthy shots with celosia flowers. The cool climate makes it a perfect escape from the coastal heat.</p>

<h2>3. Cambais Falls</h2>
<p>A less crowded alternative to Kawasan Falls, Cambais offers crystal-clear turquoise waters and a peaceful atmosphere. Perfect for families and those seeking tranquility.</p>

<h2>4. Osmeña Peak</h2>
<p>Cebu's highest point offers breathtaking 360-degree views and dramatic jagged hills. The hike is relatively easy and perfect for sunrise or sunset viewing.</p>

<h2>5. Malapascua Island</h2>
<p>Famous for thresher shark diving, this small island north of Cebu offers pristine beaches and a laid-back atmosphere. Excellent for diving enthusiasts and beach lovers alike.</p>

<h2>6. Temple of Leah</h2>
<p>This magnificent temple inspired by the Parthenon was built as a symbol of undying love. Located in the mountains, it offers stunning architecture and panoramic city views.</p>

<h2>7. Inambakan Falls</h2>
<p>Often called the "mini Kawasan," these turquoise waterfalls in Ginatilan offer a more peaceful experience without the crowds. The bamboo raft rides are a highlight.</p>

<h2>8. Sumilon Island</h2>
<p>This marine sanctuary near Oslob features a stunning sandbar that changes shape with the tides. Crystal-clear waters make it perfect for snorkeling and swimming.</p>

<h2>9. Lantawan Cliff</h2>
<p>A hidden viewpoint in Argao offering spectacular coastal views. It's becoming popular on social media but remains relatively uncrowded.</p>

<h2>10. Simala Shrine</h2>
<p>This castle-like church in Sibonga is an architectural marvel. Even non-religious visitors appreciate its stunning beauty and peaceful atmosphere.</p>

<h2>Planning Your Visit</h2>
<p>Most of these locations are best explored with a local guide who knows the routes and can provide cultural context. Consider booking a customized tour that includes several of these hidden gems for the ultimate Cebu experience.</p>`,
    author: "Maria Santos",
    publishedAt: new Date("2025-01-15"),
    readTime: 8,
    image: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=1200&h=800&fit=crop",
    keywords: ["Cebu hidden gems", "secret spots Cebu", "off the beaten path Cebu", "Cebu travel guide", "undiscovered Cebu"],
    category: "Travel Tips"
  },
  {
    id: "best-time-visit-cebu",
    title: "Best Time to Visit Cebu: A Month-by-Month Guide",
    slug: "best-time-visit-cebu",
    excerpt: "Plan your perfect Cebu vacation with our comprehensive guide to weather, festivals, and seasonal highlights throughout the year.",
    content: `<p>Choosing the right time to visit Cebu can make or break your vacation. Here's everything you need to know about Cebu's seasons, weather patterns, and best times for different activities.</p>

<h2>Weather Overview</h2>
<p>Cebu has a tropical climate with two main seasons: dry (December to May) and wet (June to November). However, rain in Cebu is typically brief and shouldn't deter your travel plans.</p>

<h2>December to February: Peak Season</h2>
<p><strong>Weather:</strong> Cool and dry, temperatures 24-30°C</p>
<p><strong>Pros:</strong> Perfect beach weather, calm seas for island hopping, Sinulog Festival in January</p>
<p><strong>Cons:</strong> Higher prices, crowded attractions, advance booking required</p>
<p><strong>Best for:</strong> First-time visitors, beach lovers, festival enthusiasts</p>

<h2>March to May: Summer Season</h2>
<p><strong>Weather:</strong> Hot and dry, temperatures 26-33°C</p>
<p><strong>Pros:</strong> Best diving visibility, perfect for water activities, summer festivals</p>
<p><strong>Cons:</strong> Very hot, especially April-May, can be crowded during Holy Week</p>
<p><strong>Best for:</strong> Divers, water sports enthusiasts, sun worshippers</p>

<h2>June to August: Early Wet Season</h2>
<p><strong>Weather:</strong> Warm with afternoon rain showers, 25-31°C</p>
<p><strong>Pros:</strong> Lower prices, fewer tourists, lush landscapes, waterfalls at their best</p>
<p><strong>Cons:</strong> Occasional rain, some boat trips may be cancelled</p>
<p><strong>Best for:</strong> Budget travelers, waterfall chasers, cultural experiences</p>

<h2>September to November: Late Wet Season</h2>
<p><strong>Weather:</strong> More frequent rain, 24-30°C, possible typhoons</p>
<p><strong>Pros:</strong> Best deals, very few tourists, green landscapes</p>
<p><strong>Cons:</strong> Weather unpredictability, some outdoor activities limited</p>
<p><strong>Best for:</strong> Flexible travelers, indoor activities, cultural tours</p>

<h2>Festival Calendar</h2>
<p><strong>January:</strong> Sinulog Festival - Cebu's biggest celebration</p>
<p><strong>April:</strong> Aliwan Festival, various town fiestas</p>
<p><strong>December:</strong> Christmas season with spectacular decorations</p>

<h2>Activity-Specific Best Times</h2>
<p><strong>Whale Shark Watching:</strong> Year-round, but best December-May</p>
<p><strong>Diving:</strong> March-June for best visibility</p>
<p><strong>Canyoneering:</strong> December-May when water levels are safe</p>
<p><strong>Island Hopping:</strong> December-May for calm seas</p>
<p><strong>Mountain Activities:</strong> Year-round, waterfalls better during wet season</p>

<h2>Our Recommendation</h2>
<p>For the best overall experience, visit between January and April. You'll enjoy great weather, calm seas, and the option to experience Sinulog if you come in January. However, don't rule out the wet season - you'll save money and see a greener, less crowded Cebu.</p>`,
    author: "Carlos Reyes",
    publishedAt: new Date("2025-02-01"),
    readTime: 7,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop",
    keywords: ["best time visit Cebu", "Cebu weather", "when to go Cebu", "Cebu seasons", "Cebu travel planning"],
    category: "Travel Planning"
  },
  {
    id: "cebu-food-guide",
    title: "The Ultimate Cebu Food Guide: Must-Try Dishes and Where to Find Them",
    slug: "cebu-food-guide",
    excerpt: "From world-famous lechon to street food favorites, explore Cebu's incredible culinary scene with our comprehensive food guide.",
    content: `<p>Cebu is a food lover's paradise, with a unique culinary heritage that blends Spanish, Chinese, and native Visayan influences. Here's your guide to the best dishes and where to eat them.</p>

<h2>1. Lechon (Roasted Pig)</h2>
<p>Cebu lechon is world-famous and considered the best in the Philippines. The skin is incredibly crispy while the meat is tender and flavorful.</p>
<p><strong>Where to try:</strong> Rico's Lechon, Zubuchon, CNT Lechon</p>
<p><strong>Price range:</strong> ₱500-800 per kilo</p>

<h2>2. Puso (Hanging Rice)</h2>
<p>Rice wrapped and boiled in woven coconut leaves, puso is the perfect accompaniment to grilled meats and is uniquely Cebuano.</p>
<p><strong>Where to try:</strong> Larsian BBQ, any street BBQ vendor</p>
<p><strong>Price:</strong> ₱10-15 per piece</p>

<h2>3. Sutukil (Su-Tukil)</h2>
<p>Named after three cooking methods: Sugba (grill), Tuwa (soup), Kilaw (ceviche). Choose fresh seafood and have it cooked your way.</p>
<p><strong>Where to try:</strong> Mactan Island seafood markets, Lantaw Floating Native Restaurant</p>
<p><strong>Price:</strong> Market price, typically ₱400-1500 depending on seafood choice</p>

<h2>4. Ngohiong (Spring Rolls)</h2>
<p>Cebuano-style spring rolls with a unique blend of pork, shrimp, and vegetables, served with a sweet sauce and puso.</p>
<p><strong>Where to try:</strong> Downtown Cebu street vendors, local carinderias</p>
<p><strong>Price:</strong> ₱30-50 per roll</p>

<h2>5. Tuslob Buwa</h2>
<p>A unique Cebuano experience: bubbling pig brains and liver served with puso for dipping. Sounds adventurous, tastes amazing!</p>
<p><strong>Where to try:</strong> Azul Bar & Restaurant, various spots around Mabolo</p>
<p><strong>Price:</strong> ₱150-250 per order</p>

<h2>6. Dried Mangoes</h2>
<p>Cebu's dried mangoes are exported worldwide. Sweet, chewy, and addictive - perfect as pasalubong (gifts).</p>
<p><strong>Where to buy:</strong> Taboan Public Market, 7D Dried Mangoes stores</p>
<p><strong>Price:</strong> ₱150-300 per pack</p>

<h2>Best Food Destinations</h2>

<h3>Larsian BBQ</h3>
<p>The ultimate street food experience. Grilled pork, chicken, and seafood served with puso and spicy vinegar.</p>
<p><strong>Location:</strong> Fuente Osmeña Circle</p>
<p><strong>Best time:</strong> Evening, around 7-11 PM</p>

<h3>Carbon Market</h3>
<p>Cebu's largest public market offers authentic local food at incredibly low prices. Perfect for adventurous eaters.</p>
<p><strong>Location:</strong> M.C. Briones Street, Cebu City</p>
<p><strong>Best time:</strong> Early morning for freshest produce</p>

<h3>Sugbo Mercado</h3>
<p>A night market featuring various food stalls from local restaurants and chefs. Clean, modern, and tourist-friendly.</p>
<p><strong>Location:</strong> IT Park (Thursday-Sunday)</p>
<p><strong>Price range:</strong> ₱100-300 per meal</p>

<h2>Food Tour Recommendations</h2>
<p>Consider joining our Cebu Food & Culture Tour for a guided experience that includes tastings of all these dishes plus insider knowledge about Cebuano culinary traditions. Our local foodie guides know the best hidden spots!</p>`,
    author: "Ana Cruz",
    publishedAt: new Date("2025-02-10"),
    readTime: 9,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop",
    keywords: ["Cebu food guide", "what to eat in Cebu", "Cebu lechon", "Cebuano cuisine", "best restaurants Cebu"],
    category: "Food & Dining"
  },
  {
    id: "cebu-diving-guide",
    title: "Diving in Cebu: Complete Guide to the Best Dive Sites",
    slug: "cebu-diving-guide",
    excerpt: "Discover why Cebu is one of the Philippines' top diving destinations, with our guide to the best dive sites, marine life, and diving tips.",
    content: `<p>Cebu offers some of the world's best diving, from colorful coral gardens to thrilling encounters with marine megafauna. Whether you're a beginner or advanced diver, Cebu has something special for you.</p>

<h2>Best Dive Sites</h2>

<h3>1. Moalboal - Panagsama Beach</h3>
<p><strong>Highlight:</strong> The famous sardine run - swim through millions of sardines just meters from shore</p>
<p><strong>Level:</strong> All levels</p>
<p><strong>Best time:</strong> Year-round, early morning for best visibility</p>
<p><strong>Marine life:</strong> Sardines, turtles, sea snakes, macro life</p>

<h3>2. Malapascua Island</h3>
<p><strong>Highlight:</strong> Only place in the world with regular thresher shark sightings</p>
<p><strong>Level:</strong> Advanced (deep dives to 30m)</p>
<p><strong>Best time:</strong> Year-round, dawn dives at Monad Shoal</p>
<p><strong>Marine life:</strong> Thresher sharks, manta rays, hammerheads, macro critters</p>

<h3>3. Pescador Island</h3>
<p><strong>Highlight:</strong> Cathedral cave and incredible biodiversity</p>
<p><strong>Level:</strong> Intermediate to advanced</p>
<p><strong>Best time:</strong> December to May</p>
<p><strong>Marine life:</strong> Barracudas, jacks, sea turtles, nudibranchs, pygmy seahorses</p>

<h3>4. Oslob - Whale Sharks</h3>
<p><strong>Highlight:</strong> Guaranteed whale shark encounters</p>
<p><strong>Level:</strong> Snorkeling and freediving</p>
<p><strong>Best time:</strong> Year-round, early morning</p>
<p><strong>Marine life:</strong> Whale sharks, reef fish</p>

<h3>5. Sumilon Island</h3>
<p><strong>Highlight:</strong> Protected marine sanctuary with pristine reefs</p>
<p><strong>Level:</strong> All levels</p>
<p><strong>Best time:</strong> December to May</p>
<p><strong>Marine life:</strong> Abundant reef fish, turtles, occasional dolphins</p>

<h3>6. Mactan Island Dive Sites</h3>
<p><strong>Highlights:</strong> Easy access from resorts, good for beginners</p>
<p><strong>Level:</strong> All levels</p>
<p><strong>Popular sites:</strong> Kontiki, Marigondon Cave, Olango Marine Sanctuary</p>
<p><strong>Marine life:</strong> Reef fish, macro life, turtles</p>

<h2>Best Time to Dive</h2>
<p><strong>Peak season:</strong> March to June - best visibility (20-30m), calm seas, ideal conditions</p>
<p><strong>Good season:</strong> December to February - good visibility, cooler water</p>
<p><strong>Off-season:</strong> July to November - reduced visibility, but fewer divers and good deals</p>

<h2>Water Temperature & What to Wear</h2>
<p><strong>Temperature:</strong> 26-30°C year-round</p>
<p><strong>Recommended:</strong> 3mm wetsuit or rash guard sufficient for most divers</p>

<h2>Certification & Courses</h2>
<p>Many dive shops in Cebu offer PADI courses from Open Water to Divemaster. Popular training sites include:</p>
<ul>
<li>Shangri-La Mactan house reef</li>
<li>Moalboal for Open Water</li>
<li>Malapascua for advanced courses</li>
</ul>

<h2>Diving Safety Tips</h2>
<ul>
<li>Always dive with certified operators</li>
<li>Check equipment before every dive</li>
<li>Never dive alone</li>
<li>Be aware of currents, especially at Pescador</li>
<li>Maintain proper buoyancy to protect reefs</li>
<li>Don't touch marine life or coral</li>
</ul>

<h2>Conservation</h2>
<p>Cebu's marine ecosystems face threats from overfishing and climate change. Support sustainable tourism by:</p>
<ul>
<li>Choosing eco-certified dive operators</li>
<li>Never touching or standing on coral</li>
<li>Taking only photos, leaving only bubbles</li>
<li>Avoiding single-use plastics</li>
<li>Participating in reef cleanup dives</li>
</ul>

<h2>Booking Your Dive Trip</h2>
<p>We partner with certified, eco-conscious dive operators throughout Cebu. Our dive packages include equipment, guides, and transportation. Contact us to customize your diving adventure!</p>`,
    author: "Diego Mendoza",
    publishedAt: new Date("2025-01-20"),
    readTime: 10,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop",
    keywords: ["Cebu diving", "best dive sites Cebu", "Malapascua diving", "thresher sharks Cebu", "scuba diving Philippines"],
    category: "Adventure & Activities"
  },
  {
    id: "cebu-budget-travel-guide",
    title: "How to Experience Cebu on a Budget: Complete Money-Saving Guide",
    slug: "cebu-budget-travel-guide",
    excerpt: "Explore Cebu without breaking the bank. Our comprehensive budget guide covers affordable accommodations, food, transportation, and activities.",
    content: `<p>Cebu doesn't have to be expensive. With smart planning and local knowledge, you can experience this beautiful island on a shoestring budget. Here's how to make the most of your money.</p>

<h2>Budget Breakdown</h2>
<p><strong>Ultra Budget:</strong> ₱800-1,200 per day</p>
<p><strong>Budget Traveler:</strong> ₱1,500-2,500 per day</p>
<p><strong>Mid-Range:</strong> ₱3,000-5,000 per day</p>

<h2>Accommodation</h2>

<h3>Ultra Budget (₱200-500/night)</h3>
<ul>
<li>Dorm beds in hostels: ₱200-350</li>
<li>Basic guesthouses: ₱350-500</li>
<li>Couchsurfing: Free (if you're lucky)</li>
</ul>
<p><strong>Best areas:</strong> IT Park area, Mabolo, Lahug</p>

<h3>Budget (₱500-1,200/night)</h3>
<ul>
<li>Private room in hostel: ₱600-800</li>
<li>Budget hotels: ₱800-1,200</li>
<li>Airbnb private rooms: ₱700-1,000</li>
</ul>

<h2>Food</h2>

<h3>Street Food & Local Eateries</h3>
<p><strong>Breakfast:</strong> ₱50-80 (pandesal, coffee, local breakfast)</p>
<p><strong>Lunch/Dinner:</strong> ₱60-120 per meal at carinderias</p>
<p><strong>Street BBQ:</strong> ₱10-15 per stick, ₱10 for puso</p>
<p><strong>Best cheap eats:</strong> Larsian BBQ, Carbon Market, local carinderias</p>

<h3>Money-Saving Food Tips</h3>
<ul>
<li>Eat where locals eat</li>
<li>Try "turo-turo" (point-point) restaurants</li>
<li>Skip tourist restaurants near attractions</li>
<li>Buy snacks and water at 7-Eleven or sari-sari stores</li>
<li>Sample fruits at public markets</li>
</ul>

<h2>Transportation</h2>

<h3>Getting Around Cebu City</h3>
<p><strong>Jeepney:</strong> ₱9-15 per ride (cheapest option)</p>
<p><strong>Bus:</strong> ₱25-50 depending on distance</p>
<p><strong>Taxi:</strong> ₱40 flag-down + ₱13.50/km</p>
<p><strong>Grab/taxi apps:</strong> Usually 10-20% more than regular taxis</p>
<p><strong>Habal-habal (motorcycle):</strong> ₱20-100 depending on distance</p>

<h3>Long-Distance Travel</h3>
<p><strong>Ceres Bus:</strong> ₱100-250 to south/north Cebu</p>
<p><strong>V-Hire vans:</strong> ₱150-300 (faster than bus)</p>
<p><strong>Ferry to nearby islands:</strong> ₱100-500</p>

<h2>Free & Cheap Activities</h2>

<h3>Free Activities</h3>
<ul>
<li>Magellan's Cross (free)</li>
<li>Basilica del Santo Niño (free, donations welcome)</li>
<li>Fort San Pedro (₱30 entrance)</li>
<li>Beach hopping in Moalboal (free if you DIY)</li>
<li>Hiking Osmeña Peak (₱30 entrance)</li>
<li>Temple of Leah viewing from outside (free)</li>
<li>Carbon Market exploration (free)</li>
</ul>

<h3>Budget Activities (₱100-500)</h3>
<ul>
<li>Tops Lookout: ₱100 entrance</li>
<li>Sirao Flower Garden: ₱50-100</li>
<li>Public beaches: Free to ₱50 entrance</li>
<li>Snorkeling gear rental: ₱150-250/day</li>
</ul>

<h2>Tour Alternatives</h2>

<h3>DIY vs. Organized Tours</h3>
<p><strong>Kawasan Falls DIY:</strong> ₱40 entrance + ₱200 transport = ₱240</p>
<p><strong>Organized tour:</strong> ₱1,500-2,500</p>

<p><strong>Island hopping DIY:</strong> ₱500-1,000 (boat rental split among group)</p>
<p><strong>Organized tour:</strong> ₱1,500-2,500 per person</p>

<p><em>Note: DIY requires more effort but saves money. Join our budget-friendly group tours to get the best of both worlds!</em></p>

<h2>Money-Saving Tips</h2>

<h3>Before You Go</h3>
<ul>
<li>Book flights on Tuesday/Wednesday (cheapest days)</li>
<li>Travel during off-season (June-November) for 30-50% savings</li>
<li>Book accommodations with free breakfast</li>
<li>Download offline maps (Maps.me, Google Maps)</li>
</ul>

<h3>While There</h3>
<ul>
<li>Use water refill stations (₱5-10 vs ₱20+ for bottled)</li>
<li>Negotiate prices at markets and with habal-habal drivers</li>
<li>Share tours and transportation with other travelers</li>
<li>Eat major meal at lunch (lunch menus are cheaper)</li>
<li>Bring reusable water bottle and bags</li>
<li>Use ATMs at banks (lower fees than convenience stores)</li>
<li>Join free walking tours (tip-based)</li>
</ul>

<h2>What NOT to Skimp On</h2>
<ul>
<li>Travel insurance</li>
<li>Safety gear for activities (helmets, life vests)</li>
<li>Reputable tour operators for risky activities</li>
<li>Sun protection (cheaper to buy in Cebu than treat sunburn)</li>
</ul>

<h2>Sample Budget Itinerary (3 Days, ₱3,500 total)</h2>
<p><strong>Day 1: Cebu City</strong></p>
<ul>
<li>Accommodation: ₱400</li>
<li>Food: ₱250</li>
<li>Transport: ₱100</li>
<li>Activities (historical sites): ₱100</li>
<li>Total: ₱850</li>
</ul>

<p><strong>Day 2: Moalboal</strong></p>
<ul>
<li>Transport to Moalboal: ₱150</li>
<li>Accommodation: ₱500</li>
<li>Food: ₱300</li>
<li>Snorkeling gear: ₱200</li>
<li>Total: ₱1,150</li>
</ul>

<p><strong>Day 3: Kawasan Falls</strong></p>
<ul>
<li>Transport: ₱200</li>
<li>Entrance: ₱40</li>
<li>Food: ₱250</li>
<li>Return to Cebu: ₱150</li>
<li>Total: ₱640</li>
</ul>

<h2>Conclusion</h2>
<p>With smart planning and willingness to explore like a local, Cebu can be incredibly affordable. Don't let budget constraints stop you from experiencing this beautiful island!</p>`,
    author: "Maria Santos",
    publishedAt: new Date("2025-02-15"),
    readTime: 11,
    image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=1200&h=800&fit=crop",
    keywords: ["Cebu budget travel", "cheap Cebu trip", "backpacking Cebu", "Cebu on a budget", "affordable Cebu travel"],
    category: "Travel Planning"
  }
];
