# MONETA — Phase 1 Build Prompt

Paste the text below into Claude Code to start the project. Make sure the MONETA-CLAUDE.md file is in your project root first (Claude Code will read it for all the detailed specs).

---

## Prompt

Read the CLAUDE.md file in the project root — it contains the complete build specification for this app including colour palette, typography, component specs, API details, and quality standards. Follow it precisely.

MONETA is a currency converter and rate tracker PWA styled after a split-flap Bureau de Change rate board. Build Phase 1 as described in the CLAUDE.md.

Start by setting up the project foundation:

1. Initialise a new Next.js project with App Router and TypeScript
2. Configure Tailwind CSS with the custom colour palette from CLAUDE.md
3. Load Google Fonts: DM Sans (sans-serif for UI text) and Roboto Mono (monospaced for numbers and currency codes)
4. Set up the root layout with the dark background (#0C0C0C), proper viewport meta (viewport-fit=cover), and safe area padding
5. Create the PWA manifest with standalone display, theme colour matching the background, and placeholder app icons
6. Set up a basic service worker for app shell caching

Then build the split-flap display system — this is the most important visual component in the app:

1. A SplitFlap component that renders a single character as a split-flap element (top half and bottom half separated by a thin dark line). When the character changes, the top half flips forward with a CSS rotateX animation (180ms, ease-out).
2. A SplitFlapGroup component that renders a string as a row of SplitFlap characters with a staggered flip animation (50ms delay between each character, left to right).
3. A SplitFlapDisplay component that combines a currency code label with a SplitFlapGroup showing a formatted amount.

The flap characters should use the warm cream text colour (#F0E6D3) on the flap face background (#1C1C1C) with the split line in #0A0A0A. The font is Roboto Mono.

Then build the converter as the home page (/ route):

1. Source currency row at top: small SVG flag + currency code (tappable to open picker) + numeric input field (right-aligned, inputmode="decimal", minimum 16px font size)
2. Flip/swap button centred between the rows (ArrowUpDown icon from Lucide) — tapping swaps source and target, inverts the amounts
3. Target currency row below: small SVG flag + currency code (tappable) + split-flap display showing the converted result (read-only, not an input)
4. Conversion happens live as the user types, debounced at 100-150ms, with the split-flap digits cascading into the new result
5. Rate info line below in muted text: "1 EUR = 0.8426 GBP / Updated 09:15"
6. Quick amount buttons: 5 / 10 / 20 / 50 / 100 — tapping fills the source input and triggers the flap cascade
7. A small 30-day rate sparkline at the bottom (custom SVG polyline, not Recharts — accent amber line on dark background, no axes or labels, just the trend shape)

Build the currency picker:

1. Opens when tapping either currency code in the converter
2. Searchable list — filter by code or currency name
3. Each row shows: flag + currency code (monospaced) + full name
4. Recently used currencies pinned at top
5. Selecting a currency closes the picker and updates the converter
6. Use whatever UX pattern (bottom sheet, full screen overlay, modal) feels most native on mobile

Build the Frankfurter API client:

1. Create a client module that handles all API calls to https://api.frankfurter.dev/v2/
2. Implement a localStorage caching layer with TTL (1 hour for latest rate, 24 hours for time series, 7 days for currency list)
3. On fetch failure, fall back to cached data and show "Offline — rate from [date]" in muted text
4. 5 second timeout on all requests

Build the rate watcher page (/rates):

1. Currency pair header with both flags and codes
2. Current rate displayed as a large split-flap display
3. Time period selector pills: 7D / 30D / 90D / 6M / 1Y (active pill in accent amber)
4. Line chart using Recharts (LineChart) — amber accent line on dark background, minimal axes
5. High and low points annotated on the chart
6. Rate context text below: "GBP is X% stronger/weaker against EUR than Y days ago" — green text when strengthening, red when weakening
7. Historical reference line: "1 year ago: X / 6 months ago: Y / Today: Z"

Build the settings page (/settings):

1. Home currency selector (defaults to GBP)
2. Default foreign currency selector
3. Next trip section: name (text input), currency (selector), departure date, return date
4. About section with app name and attribution: "Rates from Frankfurter API / European Central Bank"
5. Clear all data button with confirmation

Build the bottom tab navigation:

1. Three tabs: Convert (ArrowLeftRight icon), Rates (TrendingUp), Settings (Settings2)
2. Fixed to bottom with safe-area-inset-bottom padding
3. Active tab in accent amber (#D4A843), inactive in muted (#4A4540)
4. Tab bar background matches primary background with a top border

If a next trip is configured in settings, show a small trip banner on the converter home screen: "Rome — 136 days" in secondary text colour with the trip currency flag.

Throughout the build, follow the quality standards in CLAUDE.md precisely:
- No emoji anywhere
- No pure white — use warm cream (#F0E6D3) and warm greys
- No border-radius above 4px
- All tap targets minimum 44px
- The app must work offline with cached rates
- No layout shift on any page
- Dark backgrounds only (#0C0C0C to #1C1C1C range)

Deploy to Vercel when the build is complete.
