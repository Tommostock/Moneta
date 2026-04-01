# MONETA

## Currency Converter and Rate Tracker

**One-line pitch:** A split-flap Bureau de Change in your pocket — convert currencies instantly, watch rate trends before a trip, and know exactly what your money is worth abroad.

---

## The Name

Moneta. From Juno Moneta, the Roman goddess whose temple on the Capitoline Hill housed the first Roman mint. The word "money" itself derives from her name. Short, clean, memorable, and rooted in the literal origin of currency. You'll be using this app for the first time in the city where money was invented.

---

## The Problem

Currency converter apps are either bloated fintech dashboards built for forex traders, or throwaway calculators plastered with ads that do one sum and nothing else. Neither is built for a normal person who's got a trip coming up and wants to answer two simple questions:

1. Is the rate good right now compared to recently?
2. How much is this thing in front of me in pounds?

Moneta answers both, instantly, in an app that looks and feels like the split-flap rate boards you see in airports and bureau de change windows across Europe.

---

## Who Is This For

Someone with a trip on the horizon. You open Moneta when you've booked the flights and want to start keeping an eye on the rate. You check it a few times in the weeks before departure. Then when you land, it becomes the app you reach for every time you see a price tag, a restaurant menu, or a taxi meter and think "what's that in pounds?"

This is not a daily finance app. It's not for traders. It lives on your home screen from the moment you book a trip until you're back home.

---

## Core Concept

Moneta is a **converter-first** app with rate intelligence built in. The converter is the hero — it's the first thing you see when you open the app. Everything else (rate trends, trip context, and eventually spending tracking) supports the core act of quickly converting a number.

All data is stored locally on your device. No accounts, no cloud sync, no sign-up. Install it, pick your currencies, and go.

---

## The Aesthetic

### Bureau de Change meets Split-Flap Board

The visual identity is inspired by two things:

1. **The classic Bureau de Change** — those black-panelled rate boards in airport terminals and high street exchange windows, with currency codes in neat columns and glowing numbers displaying buy/sell rates. Institutional, warm, trustworthy.

2. **Solari split-flap displays** — the mechanical departure boards found in train stations across Europe. Characters printed on hinged flaps that flip and click into place with a satisfying cascade. Each digit flips independently, top half falling forward to reveal the new character beneath.

The result should feel like a physical object — something with weight and texture, not a flat software interface. When a rate updates or you type a new number, the digits should flip into place like a mechanical board cycling through values.

### Colour Palette

The palette comes directly from the Bureau de Change environment: black panels, warm amber/cream numbers, brass fixtures, and the muted tones of an exchange window.

| Role            | Value       | Usage                                      |
|-----------------|-------------|---------------------------------------------|
| Background      | #0C0C0C     | The black panel behind the rate board      |
| Surface         | #161616     | Card backgrounds, input areas              |
| Surface raised  | #1C1C1C     | The flap face — slightly lighter than bg   |
| Flap dark       | #111111     | The shadow/underside of a flap             |
| Border          | #2A2A2A     | Divider lines between currency rows        |
| Text primary    | #F0E6D3     | Warm cream — the colour of flap characters |
| Text secondary  | #8A8070     | Muted warm grey for labels                 |
| Text muted      | #4A4540     | Disabled states, placeholders              |
| Accent          | #D4A843     | Warm amber — rate highlights, active states|
| Accent dim      | #9B7A30     | Hover states, secondary accent             |
| Positive        | #6BBF6B     | Rate trending in your favour               |
| Negative        | #D45B5B     | Rate trending against you                  |
| Divider line    | #2A2520     | Warm-tinted border for rate board rows     |

### Why Warm Cream, Not White

Real split-flap boards don't use pure white text. The characters are printed on slightly aged, warm-toned flaps — a creamy off-white that feels physical rather than digital. This warmth is what separates the aesthetic from a generic dark theme.

### Typography

- **Flap digits (rates, amounts, converted values):** A monospaced font that echoes the mechanical board look. Use **Roboto Mono** or **IBM Plex Mono** — clean, slightly industrial, good digit alignment. Rates and amounts are ALWAYS in this font.
- **UI text (labels, navigation, headings):** **DM Sans** — clean and geometric but not cold. Used for everything that isn't a number.
- **Currency codes:** Monospaced, slightly letter-spaced, uppercase. GBP, EUR, USD should look like they're printed on a board.

### The Split-Flap Animation

This is the signature interaction. When a number changes (new conversion result, rate update, digit entry), each character flips independently:

1. The top half of the current flap hinges forward and falls
2. It reveals the bottom half of the new character behind it
3. The top half of the new character is already in place above
4. The flap lands with a subtle CSS ease-out (no bounce)
5. Digits flip in sequence left-to-right with a 40-60ms stagger between each
6. The whole cascade should take about 300-400ms total

The animation should be CSS-only where possible (transform: rotateX with perspective). A subtle shadow shift on the flap edge sells the 3D illusion. The gap between top and bottom halves of each character (the "split line") is a thin dark line that's always visible — this is what makes it look like a real split-flap display.

### Iconography

- No emoji — ever, anywhere, for any reason
- Country flags rendered as small rectangular SVG elements with correct proportions (not emoji flags)
- Minimal line icons from Lucide for navigation and UI elements
- Currency symbols ($, EUR, GBP) displayed in the monospaced flap font, not as icons

### Layout Principles

- Mobile-first, single-column, designed for one-handed use
- The converter dominates the screen — it's the first and largest element
- Rate board rows are left-aligned currency codes, right-aligned numbers (like a real exchange board)
- Generous vertical spacing between rows (these are physical flaps, they need room)
- A thin horizontal divider between each currency row, slightly warm-tinted
- No rounded corners beyond 4px — split-flap boards are rectangular mechanical objects
- Cards and panels should feel like physical board modules, not floating UI cards

---

## Features — Phase 1 (Launch)

### The Converter

The hero of the app. Takes up the majority of the home screen.

**Layout:**
- Top row: Source currency code (e.g. EUR) + flag + amount input
- Centre: A flip/swap button that reverses the direction
- Bottom row: Target currency code (e.g. GBP) + flag + converted result
- The converted result displays in split-flap style — digits flip into place as you type

**Behaviour:**
- Converts as you type — no submit button, no "convert" action
- Debounce input by 100-150ms so flaps don't stutter
- Flip button swaps source and target currencies. The amounts invert (if you had 50 EUR = 42.13 GBP, flipping shows 42.13 GBP = 50.00 EUR)
- Default direction: foreign currency at top (input), GBP at bottom (result) — but flippable
- Quick amount buttons below: 5, 10, 20, 50, 100 in the source currency. Tapping one fills the input and the flaps cascade
- Below the converter: a single line showing the rate used and when it was last updated: "1 EUR = 0.8426 GBP / Updated today at 09:15"

**Currency selection:**
- Tapping either currency code opens a searchable list
- List shows: flag (SVG) + code + full name (e.g. "EUR — Euro")
- Recently used currencies pinned at the top
- Search filters by code or name

### Rate Trend

Below the converter on the home screen, or accessible via a tab.

**Layout:**
- A line chart showing the exchange rate between your two selected currencies over time
- Time period selector: 7D / 30D / 90D / 6M / 1Y (tappable pills)
- The chart line uses the accent amber colour
- Current rate marked with a dot on the line
- High and low points in the period labelled with their values
- Below the chart: context line — "GBP is 1.8% stronger against EUR than 30 days ago"

**Behaviour:**
- Defaults to 30-day view
- Chart data comes from Frankfurter API time series endpoint
- Cached for 24 hours (rates update daily from ECB)
- Rate context text uses positive colour (green) when GBP is strengthening, negative (red) when weakening, relative to the selected timeframe
- The high/low markers help answer "is now a good time to exchange?"

### Trip Banner (Lightweight)

Even though full trip management comes later, Phase 1 should be trip-aware.

- In settings, you can set a "Next trip" with a destination name, currency, and departure date
- This shows as a banner on the home screen: "Rome — 136 days" with the trip currency auto-selected as the default in the converter
- When the trip date range is current: "Rome — You're there"
- When the trip is past: "Rome — Ended 3 days ago"
- This is just a single trip stored in localStorage — no trip list, no trip management. That comes later.

### Navigation

Bottom tab bar, but only the tabs needed for Phase 1:

| Icon              | Label     | Route      |
|-------------------|-----------|------------|
| ArrowLeftRight    | Convert   | /          |
| TrendingUp        | Rates     | /rates     |
| Settings          | Settings  | /settings  |

Three tabs only at launch. The converter IS the home screen — it's what you see when you open the app. Trips and Spending tabs get added in later phases.

### Settings

- **Default currencies:** Set your home currency (GBP) and preferred foreign currency
- **Next trip:** Name, currency, departure date, return date
- **About:** App name, version, data attribution (Frankfurter API, ECB)
- **Clear data:** Reset everything

---

## Features — Phase 2 (Trips)

- Full trip management: create, edit, delete multiple trips
- Trip list view showing upcoming, current, and past trips
- Each trip has its own rate chart history
- Trip detail page with dedicated converter pre-set to that trip's currency
- Trip countdown on dashboard
- Automatic currency switching when trip dates indicate you're currently travelling

---

## Features — Phase 3 (Spending)

- Per-trip expense logging
- Quick-entry flow: tap amount, pick category, done (must be completable in under 5 seconds)
- Categories: Food, Drink, Transport, Stay, Shopping, Activities, Other
- Each expense captured with the day's rate for accurate GBP conversion
- Running totals per trip in both currencies
- Daily breakdown grouped by date
- Simple category breakdown visualisation
- Optional daily budget with progress tracking

---

## Data Architecture

### Local Storage Only (No Backend)

All data stored client-side using IndexedDB (via Dexie.js or idb-keyval). No Supabase, no accounts, no server.

```
settings: {
  homeCurrency: "GBP",
  defaultForeignCurrency: "EUR",
  nextTrip: {
    name: "Rome",
    currency: "EUR",
    departDate: "2026-08-15",
    returnDate: "2026-08-22"
  }
}

recentCurrencies: ["EUR", "USD", "IDR", "THB"]

cachedRates: {
  "GBP_EUR": {
    rate: 1.1893,
    date: "2026-04-01",
    fetchedAt: 1743520000000
  }
}

cachedTimeSeries: {
  "GBP_EUR_30D": {
    data: [...],
    fetchedAt: 1743520000000
  }
}
```

Phase 2 adds:
```
trips: [{ id, name, currency, countryCode, departDate, returnDate, ... }]
```

Phase 3 adds:
```
expenses: [{ id, tripId, amount, currency, amountGBP, rateUsed, category, note, date, ... }]
```

---

## API Integration

### Frankfurter API (Primary)

- **Base URL:** `https://api.frankfurter.dev/v2/`
- **Auth:** None
- **Rate limits:** None
- **Endpoints used:**
  - Latest rate: `GET /v2/rates?base=GBP&quotes=EUR`
  - Historical range: `GET /v2/rates?base=GBP&quotes=EUR&from=2026-01-01&to=2026-04-01`
  - Weekly grouped: `GET /v2/rates?base=GBP&quotes=EUR&from=2025-04-01&to=2026-04-01&group=week`
  - Currency list: `GET /v2/currencies`
- **Caching:**
  - Latest rate: cache for 1 hour (ECB updates daily, but we want reasonable freshness)
  - Time series: cache for 24 hours
  - Currency list: cache for 7 days (rarely changes)
- **Offline fallback:** If API unreachable, use last cached rate. Show "Offline — using rate from [date]" in muted text below the converter.

### Gov.uk Bank Holidays (Secondary — Phase 2+)

- **URL:** `https://www.gov.uk/bank-holidays.json`
- **Usage:** In trip planning phase, show upcoming long weekends as trip prompts

### Rest Countries (Optional — Flag/Country Resolution)

- **URL:** `https://restcountries.com/v3.1/currency/{code}`
- **Usage:** Resolve currency code to country flag and name for the currency picker

---

## Tech Stack

| Layer           | Technology        | Cost   |
|-----------------|-------------------|--------|
| Framework       | Next.js (App Router) | Free  |
| Styling         | Tailwind CSS      | Free   |
| Local storage   | Dexie.js          | Free   |
| Charts          | Recharts          | Free   |
| Icons           | Lucide React      | Free   |
| Fonts           | Google Fonts (DM Sans + Roboto Mono or IBM Plex Mono) | Free |
| Flags           | flag-icons CSS or custom SVGs | Free |
| PWA             | next-pwa or manual service worker | Free |
| Hosting         | Vercel            | Free   |

**Total cost: Zero.**

---

## PWA Behaviour

Moneta must feel like a native app, not a website. The standard is Oystr — if it feels "webby" or janky compared to Oystr, it's not finished.

- Installable to home screen on iOS and Android
- Runs in standalone mode — no browser chrome, no address bar, no navigation buttons
- Status bar blends with the app background (black-translucent on iOS)
- Offline-capable: converter works fully offline using the last cached rate
- Service worker caches the app shell, fonts, and rate data
- App loads instantly from cache on subsequent opens — the split-flap display shows cached values immediately, then silently refreshes in the background
- Splash screen matches the app (dark background, warm cream monogram)
- No blank white flash on load — ever
- All touch targets sized for fingers (44px minimum)
- Numeric keypad appears when tapping the converter input (not a full keyboard)
- No layout jumps, no content shifting, no janky transitions
- Lighthouse PWA score of 100

---

## What Makes This Different

- **Split-flap display** — no other currency app looks or feels like this. The mechanical digit animation makes every conversion feel tactile and satisfying.
- **Bureau de Change identity** — a real-world design language that people instinctively associate with currency exchange, not generic fintech UI.
- **Converter-first** — the thing you need most is the first thing you see. No dashboard to scroll past, no onboarding, no sign-up.
- **Rate context** — instead of just showing "1.19", Moneta tells you whether that's good or bad relative to recent history.
- **Trip-aware** — knows when you're travelling and adapts accordingly, without requiring complex trip management.
- **Zero cost, zero tracking, zero accounts** — install it and use it. Nothing else.
