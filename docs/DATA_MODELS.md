## Content Collections Data Model

This reference defines the Firestore shapes for content currently sourced from `src/lib/mockData.ts`. Use it when validating requests, writing security rules, or migrating seed data.

### Collection: `tours`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Deterministic document ID used for seeding/idempotency. |
| `title` | `string (≤200 chars)` | Sanitized plain text. |
| `category` | `"Beach" \| "Adventure" \| "Cultural" \| "Food"` | Matches `Tour["category"]`. |
| `description` | `string (≤2000 chars)` | Rich description. |
| `shortDescription` | `string (≤300 chars)` | Used on cards/search. |
| `price` | `number (0–1,000,000)` | Stored in PHP. |
| `duration` | `number (1–30)` | Unit: days. |
| `location` | `string (≤100 chars)` | City/area list. |
| `groupSize` | `map { min: number (1–100), max: number (≥min ≤100) }` | |
| `images` | `string[] (1–10 items)` | HTTPS URLs. |
| `itinerary` | `array<map>` | Each entry: `{ day: number (≥1), title: string, activities: string[], meals: string[] }`. |
| `inclusions` | `string[] (≤20 items)` | Marketing copy. |
| `available` | `boolean` | Controls booking UI. |
| `featured` | `boolean` | Flag for hero/featured sections. |
| `createdAt` | `timestamp` | Defaults to server timestamp. |
| `updatedAt` | `timestamp` | Updated on edits. |

**Indexes**: `["featured" ASC, "price" ASC]` (optional for catalog sorting), `["category" ASC, "price" ASC]` for filters.

### Collection: `vehicles`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Deterministic doc ID. |
| `name` | `string (≤150 chars)` | |
| `type` | `"Sedan" \| "SUV" \| "Van"` | Extend when new types are added. |
| `image` | `string (URL)` | Required. |
| `pricePerDay` | `number (0–100,000)` | PHP. |
| `capacity` | `number (1–20)` | Passenger count. |
| `transmission` | `"Automatic" \| "Manual"` | |
| `fuelType` | `"Gasoline" \| "Diesel" \| "Hybrid" \| "Electric"` | Expanded for future models. |
| `withDriver` | `boolean` | Defaults to `true`. |
| `luggage` | `number (0–20)` | Bags. |
| `features` | `string[] (≤15 items)` | Amenities list. |
| `available` | `boolean` | Controls booking UI. |
| `stockCount` | `number (0–100)` | Fleet size. |
| `createdAt`, `updatedAt` | `timestamp` | Standard metadata. |

### Collection: `blogPosts`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Matches slug. |
| `title` | `string (≤200 chars)` | |
| `slug` | `string (kebab-case)` | Unique. |
| `excerpt` | `string (≤500 chars)` | Used in cards/meta. |
| `content` | `string (HTML)` | Sanitized via `DOMPurify` before display. |
| `author` | `string (≤100 chars)` | |
| `publishedAt` | `timestamp` | Derived from Date. |
| `readTime` | `number (1–60)` | Minutes. |
| `image` | `string (URL)` | Hero image. |
| `keywords` | `string[] (≤25 items)` | Lowercase terms. |
| `category` | `string (≤50 chars)` | e.g., Travel Tips, Food & Dining. |
| `createdAt`, `updatedAt` | `timestamp` | Metadata. |

Indexes: `["category" ASC, "publishedAt" DESC]` and `["slug" ASC]` (built-in by doc ID, but explicit unique constraint recommended).

### Collection: `landmarks`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Deterministic. |
| `name` | `string (≤150 chars)` | |
| `description` | `string (≤1000 chars)` | |
| `location` | `map { lat: number (-90–90), lng: number (-180–180) }` | |
| `estimatedDuration` | `number (minutes 15–600)` | Visit duration. |
| `image` | `string (URL)` | |
| `category` | `"Historical" \| "Religious" \| "Cultural" \| "Nature"` | |
| `tourType` | `"cebu-city" \| "mountain"` | |
| `createdAt`, `updatedAt` | `timestamp` | Metadata. |

### Collection: `testimonials`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Provided in seed. |
| `name` | `string (≤100 chars)` | |
| `location` | `string (≤100 chars)` | |
| `rating` | `number (1–5)` | Integers only. |
| `text` | `string (≤1000 chars)` | |
| `avatar` | `string (URL)` | |
| `tourId` | `string` | Optional reference to `tours/{id}`. |
| `createdAt`, `updatedAt` | `timestamp` | Metadata. |

### Security & Validation Checklist

- Update `firestore.rules` to validate the new fields (short descriptions, itineraries, vehicle metadata, blog keywords, etc.).
- Use `sanitizeUserInput` helpers during seeding to prevent unsafe HTML or URLs.
- Ensure future writes (admin UI) reuse the same validation to keep Firestore + UI aligned.

### Migration & Indexing Notes

- Seed operations should be idempotent: use deterministic IDs (`doc(db, 'tours', tour.id)`), and prefer `set` with `{ merge: true }`.
- For collections exposed to public queries (tours, blogPosts), define indexes matching UI filters (category, featured, publishedAt).
- Record seeding + verification steps in `docs/INSTALLATION_GUIDE.md` after running the scripts.


