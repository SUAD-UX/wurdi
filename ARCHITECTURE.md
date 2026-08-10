# WURDI — Architecture & Roadmap

## Build order (agreed)

1. ✅ Next.js project (App Router, TypeScript, src/ dir)
2. ✅ Tailwind v4, ESLint (flat config + eslint-config-prettier), Prettier (+ tailwind class sorting)
3. ✅ Folder structure (components/, features/, hooks/, lib/, services/, utils/, types/, constants/)
4. ✅ Design system (LiquidCard, GlassCard, Button, Badge, IconButton, Avatar)
5. ✅ Dashboard UI from the mockup, placeholder data only — **you are here**
6. ⏳ Authentication
7. ⏳ Wallet connection (real, e.g. wagmi/viem + RainbowKit or ConnectKit)
8. ⏳ Live blockchain data (on-chain balances, tx history)
9. ⏳ PnL engine (real calculation from trade history)
10. ⏳ Savings Vault (auto-save logic, non-custodial vault contract or vault wallet flow)

## Step 5 — Dashboard UI: what shipped

**Goal:** every family, component, and screen from the mockup, wired to typed
placeholder data, with zero business logic — so steps 6–10 slot in without
touching the UI layer.

### Design system decision (flagged before building)

Your spec calls for organic blob shapes on *every* card. I split this into two
families instead, because your own mockup already does this:

- **`LiquidCard`** (`components/ui/LiquidCard.tsx`) — true asymmetric organic
  silhouette via per-corner `border-radius`, aurora glow, floating shadow.
  Used only for the hero portfolio card and the savings-vault icon block —
  the feature moments in your mockup.
- **`GlassCard`** (`components/ui/GlassCard.tsx`) — frosted glass, soft
  ambient shadow, thin translucent border, uniform generous radius. Used for
  everything data-dense: PnL tiles, trade cards, wallet card, insights,
  quick actions — exactly where your mockup uses rounded rectangles, not blobs.

Both share the same glass fill, border opacity (10–20%), liquid motion
(`--ease-liquid`, 320ms), and emerald glow language, so it reads as one
system. If you want true blob edges on the metric grid too, say so and I'll
redo it — but it will cost you baseline alignment across the 4-column tiles.

### Files created

```
src/app/
  layout.tsx            — root layout, system font stack (see note below)
  page.tsx               — dashboard screen, composes everything below
  globals.css             — design tokens, noise texture, aurora glow, liquid easing

src/components/ui/
  LiquidCard.tsx          — organic blob surface (hero/feature moments)
  GlassCard.tsx           — standard glass surface (data-dense cards)
  Button.tsx              — primary/secondary/ghost, soft glow, no gradients
  Badge.tsx               — Profit/Loss/Buy/Sell/status pills
  IconButton.tsx          — circular icon-only actions
  Avatar.tsx              — user avatar w/ initials fallback

src/components/dashboard/
  PortfolioHeroCard.tsx   — total value, 24h delta, mini trend, aurora glow
  PerformanceOverviewCard.tsx — big chart + 24H/7D/30D/90D/1Y/All tabs
  RecentTradesCard.tsx    — 3-up trade cards, buy/sell + profit/loss badges
  QuickActions.tsx        — Deposit/Withdraw/Transfer/Auto Save/Report

src/components/pnl/
  PnLMetricCard.tsx       — Daily/Weekly/Monthly/All-Time tiles w/ sparkline

src/components/wallet/
  ConnectedWalletCard.tsx — address, network, sync status/action

src/components/savings/
  SavingsVaultCard.tsx    — total saved, auto-save %, vault address

src/components/analytics/
  InsightsCard.tsx        — behavioral nudge feed

src/components/charts/
  Sparkline.tsx           — minimal inline trend (PnL tiles)
  PerformanceAreaChart.tsx — full area chart (hero + overview), Recharts

src/components/shared/
  Sidebar.tsx             — brand, nav, upgrade prompt, account switcher
  Topbar.tsx               — greeting, notifications, network selector

src/types/portfolio.ts    — PortfolioSnapshot, PnLSummary, Trade, etc.
src/constants/
  mock-dashboard.ts        — placeholder data matching the mockup exactly
  navigation.ts             — single source of truth for sidebar nav items
src/lib/utils.ts           — cn() class-merge helper
src/utils/format.ts        — currency/percent/address formatters
```

### Why each folder choice

- Components are grouped **by domain** (`pnl/`, `wallet/`, `savings/`) not by
  type, per your architecture — so PnL step 9 only touches `pnl/` and `features/pnl/`.
- `ui/` holds only generic, domain-agnostic primitives (Button, Badge, cards).
  Nothing in `ui/` imports app types — keeps it reusable/testable in isolation.
- `constants/mock-dashboard.ts` is the **only** file that will change when we
  wire real data in step 8 — every component already takes typed props, so
  swapping mock data for a `useQuery` hook touches zero component code.
- `features/*` folders exist but are empty placeholders right now — they're
  reserved for business logic (hooks, server actions, state) as each feature
  ships, per "keep business logic separate from UI."

### Dependencies installed

- `clsx` + `tailwind-merge` → `cn()` helper
- `lucide-react` → stroke icons only, per your spec
- `recharts` → charts (thin line, gradient fill, no TradingView-style grid)
- `zustand`, `@tanstack/react-query` → installed now, unused until step 6+
  (auth/wallet state, live data fetching) so we're not adding deps mid-feature later
- `framer-motion` → installed for step 6+ page transitions; **not used yet** —
  current motion is plain CSS transitions (cheaper, no JS for hover states)
- Dev: `prettier`, `prettier-plugin-tailwindcss`, `eslint-config-prettier`

### One deviation from the plan, and why

`next/font/google` (the default Next.js font loader) can't reach
`fonts.googleapis.com` in this build environment. I removed it and used a
system font stack (`-apple-system, SF Pro Text, Inter...`) instead — which
is arguably more correct anyway, since "Apple + Linear + Stripe" all lean on
native system fonts rather than a webfont. If you later want Geist or a
licensed display face for the marketing/landing pages, it just needs adding
back once you're building outside this sandbox with fonts.googleapis.com reachable.

### Verified

- `npm run build` — compiles clean, 0 TypeScript errors
- `npx eslint src` — 0 errors, 0 warnings
- Dev server responds `200 OK` on `/`
- **Not verified:** pixel-level visual match to the mockup. This sandbox has
  no headless browser available (Playwright's Chromium download is blocked
  by the network allowlist), so I could not screenshot and self-critique
  against the source-of-truth image the way I normally would. Please open it
  locally (`npm run dev`) and tell me what's off — spacing, glow intensity,
  card proportions — and I'll correct it precisely rather than guessing.

### Known limitations (step 5 scope)

- All data is static placeholder data (`constants/mock-dashboard.ts`) — no
  wallet, no chain calls, no persistence yet.
- Sidebar nav links to `/portfolio`, `/trades`, etc. — those routes don't
  exist yet (404). Only `/` is built.
- No auth/route protection — anyone can load the dashboard.
- Not yet tested on real mobile viewports beyond Tailwind's responsive classes.

### Next step

Waiting on your approval before starting **Step 6 — Authentication**. When
you approve, I'll come back with the same format: goal, files, folders,
dependencies, code, testing steps, and what could go wrong.
