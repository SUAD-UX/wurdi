# WURDI

WURDI is a single-application Next.js product that keeps the browser as a UI layer and uses the same project for server-side auth, database access, and protected financial logic.

## Product constraints

- Keep the current UI/UX intact.
- Do not create a separate frontend/backend split.
- Do not implement custodial wallet behavior.
- Do not request private keys or seed phrases.
- Do not fabricate balances, prices, PnL, or transaction confirmations.
- Use the server session as the source of truth for user identity.
- Treat browser-supplied wallet and financial values as untrusted input.

## Required environment variables

Copy `.env.example` to `.env.local` or `.env` for local development and set real values before running Prisma or the app.

- `DATABASE_URL`: PostgreSQL connection string for Prisma and server-side data access.
- `AUTH_SECRET`: minimum 32 characters; used to sign and verify server sessions.
- `NEXT_PUBLIC_APP_URL`: public base URL used by the app and any callback URLs.
- `SESSION_TTL_SECONDS`: expiration for user sessions in seconds. Defaults to 7 days.
- `BLOCKCHAIN_PROVIDER`: `none`, `rpc`, `indexer`, or `hybrid` depending on the configured source.
- `CHAIN_ID`: network identifier for the configured chain, defaults to `1`.
- `RPC_URL`: blockchain JSON-RPC endpoint for provider-backed balance or transaction lookups.
- `INDEXER_URL`: optional indexer endpoint used for normalized blockchain event or transaction data.

## Production readiness notes

- PostgreSQL must be running before Prisma can push to or query a live database.
- `AUTH_SECRET` must be set in every non-local production environment.
- WURDI must fail safely when database connectivity or blockchain providers are unavailable.
- Any live blockchain fetch must validate chain, wallet ownership, timestamps, transaction identifiers, and asset metadata server-side before persisting records.

## Local development

```bash
cp .env.example .env.local
npm install
npx prisma generate
npx prisma validate
npm run dev
```

## Cloudflare deployment

WURDI is configured for the OpenNext + Wrangler Cloudflare deployment path. The repository includes the required adapter and runtime configuration, but actual deployment still requires a real Cloudflare account and project credentials.

```bash
npm install
npm run cloudflare:build
npm run preview
npm run deploy
```

## Verification commands

```bash
npx prisma generate
npx prisma validate
npm run lint
npx tsc --noEmit
npx tsx --test src/lib/pnl.test.ts src/lib/transactions.test.ts
npm run build
npm run cloudflare:build
npx prisma db push
```

When PostgreSQL or the blockchain provider is unavailable, the app should report a clear unavailable state instead of pretending the service is live.
