# CLAUDE.md — MONETA Build Instructions

## Project Overview

MONETA is a currency converter and rate tracker PWA styled after a classic Bureau de Change split-flap rate board. The converter is the primary feature — it must be the first thing the user sees and the fastest thing to use. Built with Next.js, Tailwind CSS, deployed on Vercel. All data stored locally in the browser.

## Critical Rules

1. **No emoji** — not in the UI, not in code comments, not as flags, not anywhere. Country flags are SVG elements only.
2. **No gradients** — flat colours only from the defined palette.
3. **Dark theme only** — no light mode toggle. The app is a black Bureau de Change panel.
4. **Mobile-first** — designed for 375px width. This is a phone app used one-handed.
5. **Split-flap aesthetic** — numbers and currency values must render as split-flap display characters with a flip animation on change. This is the defining visual feature.
6. **Warm palette** — text is warm cream (#F0E6D3), not pure white. Accents are warm amber (#D4A843), not cold blue or gold. The palette draws from Bureau de Change environments.
7. **Monospaced numbers** — all rates, amounts, and currency codes use the monospaced font. Body text and labels use the sans-serif font.
8. **Converter is the home screen** — the converter must be the default route (/). No dashboard, no splash screen, no onboarding between the user and conversion.
9. **Maximum 4px border radius** — this is a mechanical display aesthetic, not a soft UI. Rectangles, not bubbles.

## Colour Palette (Tailwind Config)

```javascript
colors: {
  bg: {
    primary: '#0C0C0C',    // Black panel background
    surface: '#161616',     // Card/input surfaces
    raised: '#1C1C1C',      // Flap face, elevated elements
  },
  flap: {
    face: '#1C1C1C',        // Front of the flap
    shadow: '#111111',      // Underside/shadow of flap
    split: '#0A0A0A',       // The thin line between top and bottom halves
  },
  border: {
    subtle: '#2A2A2A',      // Standard dividers
    warm: '#2A2520',        // Warm-tinted row dividers
  },
  text: {
    primary: '#F0E6D3',    // Warm cream — flap character colour
    secondary: '#8A8070',   // Warm muted labels
    muted: '#4A4540',       // Disabled, placeholders
  },
  accent: {
    DEFAULT: '#D4A843',     // Warm amber
    dim: '#9B7A30',         // Hover/secondary accent
  },
  positive: '#6BBF6B',      // Rate trending in your favour
  negative: '#D45B5B',      // Rate trending against you
}
```

## Typography

```css
/* Numbers, rates, amounts, currency codes — the split-flap characters */
font-family: 'Roboto Mono', monospace;

/* Everything else — labels, headings, body text, navigation */
font-family: 'DM Sans', sans-serif;
```

Import both from Google Fonts in the root layout. Currency codes (GBP, EUR, USD) are always uppercase, monospaced, with slight letter-spacing (tracking-wider in Tailwind).

## The Split-Flap Component

This is the most important UI component in the app. It must be built as a reusable React component.

### SplitFlap Component

**Props:**
```typescript
interface SplitFlapProps {
  value: string;           // The string to display (e.g. "1,234.56")
  prevValue?: string;      // Previous value (for animation)
  size?: 'sm' | 'md' | 'lg';  // Font size variant
  align?: 'left' | 'right';   // Text alignment
}
```

**Visual structure per character:**
```
+------------------+
|                  |  <- top half (shows top of character)
|     4            |
+--- split line ---+  <- thin dark gap (#0A0A0A, 1-2px)
|     4            |
|                  |  <- bottom half (shows bottom of character)
+------------------+
```

Each character is a separate element. The background of each character cell is the flap face colour (#1C1C1C). Characters are rendered in the warm cream text colour (#F0E6D3).

**Animation (CSS):**
When a character changes:
1. Top half rotates forward from 0 to -90deg on the X axis (transform: rotateX(-90deg)) with perspective
2. Duration: 150-200ms per flap, ease-out timing
3. Behind it, the new top half is already in place
4. Stagger: each character starts 40-60ms after the previous one (left to right)
5. Total cascade for 6-8 characters: ~400ms
6. A subtle box-shadow shift on the flap edge during rotation sells the 3D effect

**CSS approach:**
```css
.flap-container {
  perspective: 300px;
}

.flap-top {
  transform-origin: bottom center;
  backface-visibility: hidden;
}

.flap-flip {
  animation: flipDown 180ms ease-out forwards;
}

@keyframes flipDown {
  from { transform: rotateX(0deg); }
  to { transform: rotateX(-90deg); }
}
```

The component should handle: digits (0-9), decimal point, comma (thousand separator), currency symbols, spaces, and dash/minus.

### SplitFlapGroup Component

A wrapper that manages the staggered animation of multiple SplitFlap characters:

```typescript
interface SplitFlapGroupProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  staggerMs?: number;     // Default: 50ms
}
```

## API Integration

### Frankfurter API

Base: `https://api.frankfurter.dev/v2/`

No auth. No rate limits.

**Endpoints and response shapes:**

```javascript
// Latest rate
// GET /v2/rates?base=GBP&quotes=EUR
// Response:
[
  {
    "date": "2026-04-01",
    "base": "GBP",
    "quote": "EUR",
    "rate": 1.1893
  }
]

// Historical range (for charts)
// GET /v2/rates?base=GBP&quotes=EUR&from=2026-03-01&to=2026-04-01
// Response: array of objects, one per day (weekdays only — no weekends)
[
  { "date": "2026-03-02", "base": "GBP", "quote": "EUR", "rate": 1.1845 },
  { "date": "2026-03-03", "base": "GBP", "quote": "EUR", "rate": 1.1862 },
  // ... one entry per business day
]

// Weekly grouped (for longer charts — fewer data points)
// GET /v2/rates?base=GBP&quotes=EUR&from=2025-04-01&to=2026-04-01&group=week
// Response: same shape, one entry per week

// Monthly grouped (for 1Y+ charts)
// GET /v2/rates?base=GBP&quotes=EUR&from=2025-04-01&to=2026-04-01&group=month
// Response: same shape, one entry per month

// Full currency list
// GET /v2/currencies
// Response:
[
  {
    "iso_code": "EUR",
    "iso_numeric": "978",
    "name": "Euro",
    "symbol": "€",
    // ... other fields
  },
  {
    "iso_code": "USD",
    "iso_numeric": "840",
    "name": "US Dollar",
    "symbol": "$",
    // ...
  }
  // ... 160+ currencies
]
```

**Caching rules:**
- Latest rate: localStorage, 1 hour TTL
- Time series: localStorage, 24 hour TTL
- Currency list: localStorage, 7 day TTL
- All caches keyed by currency pair + period (e.g. `rate_GBP_EUR`, `series_GBP_EUR_30D`)
- Cache structure: `{ data: <response>, fetchedAt: <timestamp> }`
- Check TTL: `Date.now() - cache.fetchedAt > TTL_MS`

**Offline handling:**
- If fetch fails, use cached rate
- Show below converter in muted text: "Offline — rate from [date]"
- Converter must always work, even without network
- If no cache exists at all (first load, no network): show dashes in flap display and a message

**Chart data strategy:**
- 7D and 30D: fetch daily data (no grouping)
- 90D: fetch daily data (still manageable volume)
- 6M: fetch with `group=week`
- 1Y: fetch with `group=week` or `group=month`

### Rest Countries (optional, for currency picker enrichment)

```
GET https://restcountries.com/v3.1/currency/EUR
```

No auth. Cache indefinitely.

## Country Flags

Use the **circle-flags** or **flag-icons** npm package for SVG flags. If neither works well, use small rectangular flag SVGs sourced from an open set like flagcdn.com (`https://flagcdn.com/w40/{countryCode}.png` as a fallback).

Rules:
- Flags are displayed as small rectangles (e.g. 24x16px or 20x14px), not circles, not squares
- Never use emoji flags (they render differently per OS and break the aesthetic)
- Map currency codes to country codes for flag lookup (EUR -> EU, USD -> US, GBP -> GB, etc.)
- Store a static mapping of currency-to-country code in the app for the most common currencies
- Some currencies map to multiple countries (USD is used in many places) — just pick the primary one

## Sparkline (Home Screen)

The 30-day sparkline on the home screen should be a **lightweight custom SVG**, not Recharts. Recharts is overkill for a 30-point line with no axes, no labels, no tooltips.

Implementation:
- Fetch the 30-day time series from the cache (same data as the rates page)
- Map the rates to SVG polyline points scaled to a viewBox (e.g. 200x40)
- Single `<polyline>` element with stroke in accent amber (#D4A843), no fill
- Optionally: a subtle gradient fill beneath the line (accent amber at 10% opacity) — this is the one exception to the "no gradients" rule, as it's a data visualisation technique not a decorative gradient
- No axes, no labels, no dots — just the shape of the trend
- Wrap in a fixed-size container (e.g. 100% width, 40px height)

## Currency Picker

The currency picker UX (modal, bottom sheet, full screen overlay) is left to Claude Code's judgement. Choose whatever pattern feels most native and app-like on mobile. The requirements are:

- Searchable: text input at top that filters the list by code or name
- Each row: flag (SVG rectangle) + currency code (monospaced) + full name
- Recently used currencies (stored in settings) pinned to top of list, separated by a subtle divider
- Tapping a currency selects it, closes the picker, and updates the converter
- Must not cause layout shift on the converter page when opening/closing

## App Structure

```
/app
  /layout.tsx              — Root layout, fonts, metadata, PWA head tags
  /page.tsx                — Converter (this IS the home screen)
  /rates/page.tsx          — Rate trend charts
  /settings/page.tsx       — Settings and trip setup
/components
  /split-flap
    /SplitFlap.tsx         — Single character flap
    /SplitFlapGroup.tsx    — Staggered group of flaps
    /SplitFlapDisplay.tsx  — Full display row (currency code + amount)
  /converter
    /ConverterPanel.tsx    — The main converter UI
    /CurrencySelector.tsx  — Currency picker (searchable list)
    /FlipButton.tsx        — Swap source/target currencies
    /QuickAmounts.tsx      — 5, 10, 20, 50, 100 quick-tap buttons
    /RateInfo.tsx          — "1 EUR = 0.84 GBP / Updated today"
  /rates
    /RateChart.tsx         — Line chart with Recharts
    /TimePeriodPills.tsx   — 7D / 30D / 90D / 6M / 1Y selector
    /RateContext.tsx       — "GBP is 1.8% stronger than 30 days ago"
    /HighLowMarkers.tsx    — Chart annotations for period high/low
  /trip
    /TripBanner.tsx        — "Rome — 136 days" banner on home screen
  /shared
    /CountryFlag.tsx       — SVG flag rectangle (NEVER emoji)
    /BottomNav.tsx         — Tab bar navigation
/lib
  /api
    /frankfurter.ts        — API client with caching layer
    /countries.ts          — Rest Countries client
  /cache.ts                — localStorage cache helpers (get/set/isExpired)
  /format.ts               — Currency formatting (locale-aware, thousand separators)
  /rates.ts                — Rate math (% change, high/low in range, context text)
  /dates.ts                — Countdown, date formatting helpers
/types
  /index.ts                — TypeScript interfaces
```

## Navigation

Bottom tab bar — 3 tabs only in Phase 1:

| Icon (Lucide)     | Label     | Route      |
|-------------------|-----------|------------|
| ArrowLeftRight    | Convert   | /          |
| TrendingUp        | Rates     | /rates     |
| Settings2         | Settings  | /settings  |

- Active tab: accent colour (#D4A843) on icon and label
- Inactive tab: muted colour (#4A4540)
- Tab bar background: bg-primary (#0C0C0C) with a top border in border-subtle (#2A2A2A)
- Tab bar is fixed to bottom, does not scroll

## Page Specifications

### / (Converter — Home Screen)

Top to bottom:
1. **Trip banner** (if next trip is set) — small, dismissable, shows "Rome — 136 days" in secondary text
2. **Source currency row** — flag (SVG) + currency code + input field. Input is right-aligned, large monospaced text. Tapping the currency code opens the picker.
3. **Flip button** — centred between the two rows. Lucide `ArrowUpDown` icon. On tap: swap currencies, invert amounts, flap animation fires on both rows.
4. **Target currency row** — flag (SVG) + currency code + split-flap display showing the converted result. This is NOT an input — it's a read-only display. Digits flip as the user types above.
5. **Rate info line** — muted text: "1 EUR = 0.8426 GBP / Updated 09:15"
6. **Quick amounts** — row of pill buttons: 5 / 10 / 20 / 50 / 100. Tapping fills the source input with that value and triggers the flap cascade.
7. **Rate sparkline** — a tiny 30-day inline chart (no axes, no labels) showing the rate trend. Just the shape. Accent amber line on dark background.

### /rates (Rate Watcher)

1. **Currency pair header** — "GBP / EUR" in large monospaced text with both flags
2. **Current rate** — split-flap display showing the current rate, large
3. **Time period pills** — 7D / 30D / 90D / 6M / 1Y. Active pill uses accent colour.
4. **Line chart** — Recharts LineChart. Amber accent line (#D4A843). Dark grid. No heavy labels. Date axis at bottom (minimal), rate axis on right.
5. **High / Low markers** — annotated on the chart with values and dates
6. **Rate context** — "The pound is X% stronger/weaker against the euro than Y days ago" using positive/negative colours
7. **Historical reference** — "1 year ago: 1.14 / 6 months ago: 1.17 / Today: 1.19"

### /settings

1. **Home currency** — dropdown/selector, defaults to GBP
2. **Default foreign currency** — dropdown/selector
3. **Next trip** — form fields: Name (text), Currency (selector), Depart date, Return date. Only one trip in Phase 1.
4. **About** — app name, version, "Rates from Frankfurter API / European Central Bank"
5. **Clear all data** — destructive action with confirmation

## Key TypeScript Types

```typescript
interface CachedRate {
  base: string;
  quote: string;
  rate: number;
  date: string;          // "2026-04-01"
  fetchedAt: number;     // Unix timestamp
}

interface TimeSeriesPoint {
  date: string;
  rate: number;
}

interface CachedTimeSeries {
  base: string;
  quote: string;
  period: string;        // "7D" | "30D" | "90D" | "6M" | "1Y"
  data: TimeSeriesPoint[];
  fetchedAt: number;
}

interface NextTrip {
  name: string;
  currency: string;
  departDate: string;
  returnDate: string;
}

interface AppSettings {
  homeCurrency: string;
  defaultForeignCurrency: string;
  nextTrip: NextTrip | null;
  recentCurrencies: string[];
}

interface Currency {
  code: string;          // "EUR"
  name: string;          // "Euro"
  symbol: string;        // "EUR"
  flagUrl?: string;      // SVG flag URL
  countryCode?: string;  // "EU"
}
```

## Formatting Rules

- Amounts always show 2 decimal places: "1,234.56"
- Rates show 4 decimal places: "0.8426"
- Use locale-appropriate thousand separators
- Currency codes are always 3-letter uppercase: GBP, EUR, USD
- No currency symbols in the converter display — use the code only (avoids ambiguity)
- Negative percentage changes prefixed with a down arrow (Lucide TrendingDown icon), positive with up arrow (Lucide TrendingUp icon) — no +/- symbols

## Animation Guidelines

- Split-flap flip: 180ms per flap, ease-out, 50ms stagger between characters
- Currency flip (swap button): 200ms crossfade on both rows simultaneously
- Quick amount tap: 100ms delay then flap cascade
- Chart line: draw-in animation on initial load (SVG stroke-dashoffset)
- Page transitions: none (instant tab switches — no sliding, no fading)
- Scroll: native, no custom scroll physics

## Production Polish — App Quality Standard

This app must feel like a native app installed from an app store, not a website saved to the home screen. Every detail matters. The reference standard is Oystr — if something would feel janky or "webby" compared to Oystr, fix it.

### PWA Configuration

- **display:** `standalone` (no browser chrome)
- **orientation:** `portrait`
- **theme_color:** `#0C0C0C` (matches app background — status bar blends in)
- **background_color:** `#0C0C0C` (splash screen background)
- **App icons:** Generate full icon set (72, 96, 128, 144, 152, 192, 384, 512px) — simple "M" monogram in warm cream on dark background, or a minimal split-flap motif
- **Apple-specific meta tags:**
  - `apple-mobile-web-app-capable: yes`
  - `apple-mobile-web-app-status-bar-style: black-translucent`
  - Apple touch icon (180px)
  - Apple splash screen images for common iPhone sizes
- **Viewport:** `width=device-width, initial-scale=1, viewport-fit=cover` — the `viewport-fit=cover` is critical for edge-to-edge on notched iPhones
- **Safe areas:** Use `env(safe-area-inset-bottom)` on the bottom tab bar so it clears the home indicator on Face ID iPhones. Apply `env(safe-area-inset-top)` to the top of the page.

### Service Worker & Offline

- **Strategy:** App shell cached on install (HTML, CSS, JS, fonts). Runtime caching for API responses with stale-while-revalidate.
- **Offline converter:** Must work fully offline. If no cached rate exists at all (first ever load with no network), show a clear "Connect to the internet to fetch your first rate" message instead of a broken state.
- **Offline indicator:** When offline and using a cached rate, show a subtle line below the converter in muted text: "Offline — rate from 1 Apr". No modal, no banner, no alarm — just information.
- **Background sync:** When the app comes back online, silently refresh the cached rate.
- **Cache fonts:** Google Fonts must be cached by the service worker so typography doesn't break offline.

### Loading States

- **Initial app load:** Show the app shell immediately (cached). Rate data loads in the background. The split-flap display should show placeholder flaps (blank/dashes) that flip to the real values once loaded. This makes the loading feel intentional and on-brand.
- **Rate fetch:** No spinner. The split-flap digits show their last known value. When fresh data arrives, they flip to the new value. If nothing has changed, nothing flips.
- **Chart loading:** Show the chart container at full size with a subtle pulsing line (skeleton) in the accent colour until data loads. No layout shift when data arrives.
- **Currency picker:** The full list should be available instantly (cached). Search filtering is client-side, instant, no loading state needed.
- **Never show a blank white screen.** Ever. The dark background and app shell must be visible within 100ms.

### Touch & Interaction

- **Tap targets:** Minimum 44x44px for all interactive elements (Apple HIG). The quick amount buttons, tab bar icons, currency selectors, and flip button must all meet this.
- **Active states:** All tappable elements should have a visible active/pressed state. Use a subtle background colour shift (bg-raised to bg-surface, or accent-dim) on press. Duration: 100ms.
- **No hover-only interactions.** Everything must work with touch. Hover states are allowed as enhancement on desktop but must not be required.
- **Input handling:**
  - The converter input should auto-focus on app open (but only if it won't trigger the keyboard unexpectedly on iOS)
  - Use `inputmode="decimal"` on the amount input to show the numeric keypad with a decimal point on mobile
  - Prevent zoom on input focus: set font-size to at least 16px on inputs (iOS zooms if smaller)
  - Handle paste gracefully — strip non-numeric characters
- **Pull to refresh:** Not needed. Rates update on a cache schedule, not on demand.
- **Haptics:** Not available in PWAs, but the split-flap animation provides visual "haptic" feedback.

### Performance

- **First Contentful Paint:** Under 1 second on a cached load
- **Lighthouse PWA score:** 100
- **Lighthouse Performance score:** 95+
- **No layout shift:** All elements must have defined dimensions. The split-flap display, chart container, and tab bar should never cause content to jump.
- **Font loading:** Use `font-display: swap` so text is visible immediately with a fallback font, then swaps to the custom font when loaded. The flash should be minimal because the fonts are cached by the service worker after first load.
- **Image optimisation:** SVG flags are tiny. No raster images needed in Phase 1. If any are added later, use Next.js Image component with proper sizing.
- **Bundle size:** Keep it lean. Recharts is the heaviest dependency — only import the specific chart components used (LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer). Tree-shake everything else.

### Error Handling

- **API failure:** Never show a raw error. If Frankfurter is unreachable:
  - If cached rate exists: use it silently, show "Offline" indicator
  - If no cached rate: show the converter UI with dashes in the flap display and a message: "Waiting for rate data — check your connection"
- **Invalid input:** Silently ignore non-numeric characters. Don't show error messages for typing mistakes.
- **Network timeout:** 5 second timeout on all API calls. Fall back to cache.
- **Empty states:** If no trip is set, the trip banner simply doesn't appear (no "Set up your first trip!" prompt). The app works perfectly without any trip configured.

### Visual Consistency Checks

- All text should be warm cream (#F0E6D3) or warm grey (#8A8070 / #4A4540). If you see pure white (#FFFFFF) anywhere in the app, it's wrong.
- All backgrounds should be in the #0C0C0C to #1C1C1C range. If you see anything lighter than #1C1C1C as a background, it's wrong.
- The accent amber (#D4A843) should appear in at most 3-4 places on any given screen. If it's everywhere, it's lost its impact.
- No element should have a border-radius greater than 4px.
- The split-flap split line (the gap between top and bottom halves) must be visible on every flap character. It's the detail that sells the illusion.

---

## Build Phases

### Phase 1 — Ship This (Current Focus)

**Foundation:**
- [ ] Next.js project with App Router and Tailwind configured
- [ ] Custom colour palette in tailwind.config
- [ ] Google Fonts loaded (DM Sans + Roboto Mono) with font-display: swap
- [ ] Root layout with dark background, safe area padding, viewport-fit cover
- [ ] PWA manifest with full icon set, theme colour, standalone display
- [ ] Service worker with app shell caching and stale-while-revalidate for API
- [ ] Deploy to Vercel (deploy early, deploy often)

**Split-Flap System:**
- [ ] SplitFlap single character component with flip animation (CSS transforms)
- [ ] SplitFlapGroup component with staggered cascade timing
- [ ] SplitFlapDisplay component (currency code + formatted amount)
- [ ] Handles digits, decimal point, comma, dash, and space characters
- [ ] Placeholder/loading state (blank flaps or dashes)

**Converter (Home Screen):**
- [ ] Converter page as the default route (/)
- [ ] Source currency row: flag (SVG) + code + numeric input
- [ ] Target currency row: flag (SVG) + code + split-flap result display
- [ ] Input uses inputmode="decimal", min 16px font, debounced at 100-150ms
- [ ] Flip/swap button between rows (ArrowUpDown icon, 200ms crossfade)
- [ ] Quick amount buttons (5 / 10 / 20 / 50 / 100)
- [ ] Rate info line: "1 EUR = 0.8426 GBP / Updated 09:15"
- [ ] Currency selector with searchable list and SVG flags
- [ ] Recently used currencies pinned to top of selector
- [ ] 30-day sparkline below converter (minimal, no axes)

**Rate Watcher:**
- [ ] Rate chart page (/rates) with Recharts LineChart
- [ ] Time period selector pills: 7D / 30D / 90D / 6M / 1Y
- [ ] Accent amber chart line on dark background
- [ ] High/low annotations on chart
- [ ] Rate context text: "GBP is X% stronger/weaker than Y days ago"
- [ ] Historical reference: "1 year ago: X / 6 months ago: Y / Today: Z"
- [ ] Chart skeleton loading state (pulsing line)

**API & Caching:**
- [ ] Frankfurter API client (latest rate, time series, currency list)
- [ ] localStorage cache layer with TTL (1hr rate, 24hr series, 7d currencies)
- [ ] Offline fallback with "Offline — rate from [date]" indicator
- [ ] 5 second timeout with graceful fallback

**Navigation & Settings:**
- [ ] Bottom tab bar (3 tabs: Convert, Rates, Settings)
- [ ] Fixed to bottom with safe-area-inset-bottom padding
- [ ] Active tab: accent amber, inactive: muted
- [ ] Settings page: home currency, default foreign currency, next trip fields
- [ ] Trip banner on home screen when trip is set
- [ ] About section with attribution

**Polish:**
- [ ] No layout shift on any page
- [ ] All tap targets 44px minimum
- [ ] Active/pressed states on all interactive elements
- [ ] Offline-first: converter works with no network
- [ ] No pure white anywhere — warm cream and warm greys only
- [ ] Lighthouse PWA: 100, Performance: 95+
- [ ] Test on iPhone Safari, Android Chrome, desktop Chrome

### Phase 2 — Trips (Future)

- [ ] IndexedDB setup (Dexie.js) for persistent trip storage
- [ ] Multi-trip management (create, edit, delete)
- [ ] Trip list page + new "Trips" tab in nav (4 tabs)
- [ ] Trip detail page with dedicated rate chart
- [ ] Per-trip currency auto-selection
- [ ] Automatic "You're there" detection from trip dates
- [ ] Past trips archive

### Phase 3 — Spending (Future)

- [ ] Expense logging with < 5 second entry flow
- [ ] Category tagging (tappable chips: Food, Drink, Transport, Stay, Shopping, Activities, Other)
- [ ] Rate snapshot per expense (day's rate at time of entry)
- [ ] Running totals in both currencies per trip
- [ ] Daily breakdown grouped by date
- [ ] Budget progress bar (if budget set)
- [ ] Category breakdown visualisation
- [ ] CSV export of trip expenses
- [ ] New "Spending" tab in nav (5 tabs)
