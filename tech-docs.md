# Technical Documentation — Personal Finance & Wealth OS

Stack: **Next.js (App Router) + Prisma + PostgreSQL + Docker Compose**

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────┐
│                Docker Compose                │
│                                               │
│  ┌──────────────┐      ┌──────────────────┐ │
│  │   Next.js    │      │    PostgreSQL     │ │
│  │  (app + api) │◄────►│   (data + volume) │ │
│  │  Port 3000   │      │   Port 5432       │ │
│  └──────┬───────┘      └──────────────────┘ │
│         │                                    │
│  ┌──────▼───────┐                            │
│  │   Prisma     │  (ORM layer, migrations)   │
│  └──────────────┘                            │
└─────────────────────────────────────────────┘
```

- **Next.js App Router** serves both the UI (React Server Components) and the API (Route Handlers under `app/api/`).
- **Prisma** is the single source of truth for schema + migrations, and the query layer for all API routes.
- **PostgreSQL** stores everything; `DECIMAL(12,2)` (via Prisma `Decimal`) for all money fields — never floats.
- Local-first / offline mode is **not** in this version — this doc targets a server-persisted Phase 1 (per brief §5.3, decide sync/local-first separately; this architecture assumes server-side persistence with the option to add a sync layer later).

### 1.1 Folder Structure

```
myfin/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── ledger/page.tsx
│   │   │   ├── accounts/page.tsx
│   │   │   ├── accounts/[id]/page.tsx
│   │   │   ├── recurring/page.tsx
│   │   │   ├── fixed-deposits/page.tsx
│   │   │   ├── investments/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── api/
│   │   │   ├── accounts/route.ts
│   │   │   ├── accounts/[id]/route.ts
│   │   │   ├── accounts/[id]/reconcile/route.ts
│   │   │   ├── transactions/route.ts
│   │   │   ├── transactions/[id]/route.ts
│   │   │   ├── transfers/route.ts
│   │   │   ├── recurring/route.ts
│   │   │   ├── recurring/[id]/route.ts
│   │   │   ├── recurring/[id]/run/route.ts
│   │   │   ├── recurring/forecast/route.ts
│   │   │   ├── fixed-deposits/route.ts
│   │   │   ├── fixed-deposits/[id]/route.ts
│   │   │   ├── fixed-deposits/[id]/renew/route.ts
│   │   │   ├── investments/route.ts
│   │   │   ├── investments/[id]/valuation/route.ts
│   │   │   ├── reports/net-worth/route.ts
│   │   │   ├── reports/cash-flow/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── prisma.ts                   # Prisma client singleton
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── validators/                 # Zod schemas per resource
│   │   ├── services/
│   │   │   ├── forecast.service.ts     # 30/60/90-day forecasting logic
│   │   │   ├── interest.service.ts     # FDR interest calculation
│   │   │   ├── networth.service.ts     # net worth aggregation
│   │   │   └── recurring.service.ts    # cron-triggered auto-log
│   │   └── utils/money.ts              # Decimal helpers, currency formatting
│   └── components/                     # UI components (per UI spec doc)
└── package.json
```

---

## 2. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ────────────────────────────────
// ENUMS
// ────────────────────────────────

enum AccountTier {
  LIQUID
  LOCKED
  GROWTH
}

enum AccountSubtype {
  CHECKING
  SAVINGS
  CASH
  WALLET
  FDR
  DPS
  CERTIFICATE_OF_DEPOSIT
  EQUITY
  MUTUAL_FUND
  COMMODITY
  INDEX
}

enum TransactionType {
  INCOME
  EXPENSE
}

enum RecurrenceFrequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  ANNUAL
  CUSTOM
}

enum CompoundFrequency {
  SIMPLE
  MONTHLY
  QUARTERLY
  AT_MATURITY
}

enum FixedDepositStatus {
  ACTIVE
  MATURED
  RENEWED
  WITHDRAWN
}

enum InvestmentTxnType {
  BUY
  SELL
}

// ────────────────────────────────
// CORE MODELS
// ────────────────────────────────

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  passwordHash  String?
  baseCurrency  String   @default("BDT")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  accounts            Account[]
  categories          Category[]
  transactions        Transaction[]
  transfers           Transfer[]
  recurringSchedules  RecurringSchedule[]
  fixedDeposits       FixedDeposit[]
  investmentPositions InvestmentPosition[]
}

model Account {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  tier        AccountTier
  subtype     AccountSubtype
  institution String?
  currency    String         @default("BDT")
  // Cached balance for fast dashboard reads; source of truth is the sum of
  // ledger entries, recomputed on write via a service-layer transaction.
  currentBalance Decimal     @db.Decimal(12, 2) @default(0)
  openingBalance Decimal     @db.Decimal(12, 2) @default(0)
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  transactions      Transaction[]
  transfersFrom     Transfer[]         @relation("TransferFrom")
  transfersTo       Transfer[]         @relation("TransferTo")
  recurringSchedule RecurringSchedule[]
  fixedDeposit      FixedDeposit?      @relation("FDRAccount")
  fdrPayoutFor      FixedDeposit[]     @relation("FDRPayoutAccount")
  investmentPosition InvestmentPosition[]
  reconciliations   ReconciliationLog[]

  @@index([userId, tier])
}

model Category {
  id       String            @id @default(cuid())
  userId   String
  user     User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  name     String
  type     TransactionType
  icon     String?
  color    String?
  parentId String?
  parent   Category?         @relation("CategoryToSubcategory", fields: [parentId], references: [id])
  children Category[]        @relation("CategoryToSubcategory")

  transactions       Transaction[]
  recurringSchedules RecurringSchedule[]

  @@unique([userId, name, parentId])
}

// ────────────────────────────────
// CASH FLOW (strictly separated from Transfers per brief §4.1)
// ────────────────────────────────

model Transaction {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId   String
  account     Account         @relation(fields: [accountId], references: [id])
  categoryId  String?
  category    Category?       @relation(fields: [categoryId], references: [id])
  type        TransactionType
  amount      Decimal         @db.Decimal(12, 2)
  date        DateTime
  description String?
  notes       String?
  tags        String[]
  attachmentUrl String?
  recurringScheduleId String?
  recurringSchedule   RecurringSchedule? @relation(fields: [recurringScheduleId], references: [id])
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId, date])
  @@index([accountId])
  @@index([categoryId])
}

// Transfers are a DISTINCT model/table from Transaction — this is what
// keeps internal movements (ATM withdrawal, wallet top-up) out of expense
// reports, per brief §2 "Distorted Expense Reports".
model Transfer {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fromAccountId String
  fromAccount   Account  @relation("TransferFrom", fields: [fromAccountId], references: [id])
  toAccountId   String
  toAccount     Account  @relation("TransferTo", fields: [toAccountId], references: [id])
  amount        Decimal  @db.Decimal(12, 2)
  date          DateTime
  notes         String?
  createdAt     DateTime @default(now())

  @@index([userId, date])
}

// ────────────────────────────────
// RECURRING / FORECASTING
// ────────────────────────────────

model RecurringSchedule {
  id                 String               @id @default(cuid())
  userId             String
  user               User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  name               String
  type               TransactionType
  amount             Decimal              @db.Decimal(12, 2)
  accountId          String
  account            Account              @relation(fields: [accountId], references: [id])
  categoryId         String?
  category           Category?            @relation(fields: [categoryId], references: [id])
  frequency          RecurrenceFrequency
  intervalCount      Int                  @default(1)   // e.g. every 2 weeks
  startDate          DateTime
  endDate            DateTime?
  nextRunDate        DateTime
  reminderBufferDays Int                  @default(3)
  autoLog            Boolean              @default(false)
  isActive           Boolean              @default(true)
  createdAt          DateTime             @default(now())
  updatedAt          DateTime             @updatedAt

  generatedTransactions Transaction[]

  @@index([userId, nextRunDate])
}

// ────────────────────────────────
// FIXED DEPOSITS / TERM SAVINGS
// ────────────────────────────────

model FixedDeposit {
  id                String              @id @default(cuid())
  userId            String
  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId         String              @unique   // the LOCKED-tier account representing this FDR
  account           Account             @relation("FDRAccount", fields: [accountId], references: [id])
  institution       String?
  principal         Decimal             @db.Decimal(12, 2)
  interestRate      Decimal             @db.Decimal(5, 2)   // annual %, e.g. 7.25
  tenureMonths      Int
  compoundFrequency CompoundFrequency
  openDate          DateTime
  maturityDate      DateTime
  payoutAccountId   String
  payoutAccount     Account             @relation("FDRPayoutAccount", fields: [payoutAccountId], references: [id])
  status            FixedDepositStatus  @default(ACTIVE)
  maturityValue     Decimal?            @db.Decimal(12, 2)  // computed & cached at maturity
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([userId, maturityDate])
}

// ────────────────────────────────
// INVESTMENTS
// ────────────────────────────────

model InvestmentPosition {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId         String
  account           Account   @relation(fields: [accountId], references: [id])
  assetName         String
  assetType         String    // "EQUITY" | "MUTUAL_FUND" | "COMMODITY" | "INDEX"
  quantity          Decimal   @db.Decimal(18, 6)
  avgPurchasePrice  Decimal   @db.Decimal(12, 4)
  currentPrice      Decimal   @db.Decimal(12, 4)
  lastValuationDate DateTime  @default(now())
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  txns InvestmentTxn[]

  @@index([userId, accountId])
}

model InvestmentTxn {
  id         String              @id @default(cuid())
  positionId String
  position   InvestmentPosition  @relation(fields: [positionId], references: [id], onDelete: Cascade)
  type       InvestmentTxnType
  quantity   Decimal             @db.Decimal(18, 6)
  price      Decimal             @db.Decimal(12, 4)
  date       DateTime
  createdAt  DateTime            @default(now())
}

// ────────────────────────────────
// RECONCILIATION
// ────────────────────────────────

model ReconciliationLog {
  id               String   @id @default(cuid())
  accountId        String
  account          Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  statementBalance Decimal  @db.Decimal(12, 2)
  appBalance       Decimal  @db.Decimal(12, 2)
  difference       Decimal  @db.Decimal(12, 2)
  reconciledAt     DateTime @default(now())
  notes            String?
}
```

### 2.1 Schema Design Notes

- **Double-entry integrity (brief §4.1):** `Transfer` is a first-class table, not two `Transaction` rows. All balance mutations for transfers happen inside a single Prisma `$transaction` that debits `fromAccount.currentBalance` and credits `toAccount.currentBalance` atomically.
- **Structural isolation of cash-flow vs. capital repositioning:** Reports that compute income/expense (`/api/reports/*`) query `Transaction` only — `Transfer` never enters those aggregates. This directly satisfies the "Distorted Expense Reports" pain point.
- **Currency precision:** every money column is `Decimal(12,2)` (or higher precision for unit prices/quantities where fractional shares matter). Never use `Float`/`Int` cents implicitly — Prisma's `Decimal` type maps to Postgres `NUMERIC`, avoiding floating-point drift.
- **FDR as both an Account and a FixedDeposit record:** opening an FDR creates a `LOCKED`-tier `Account` (so it rolls into Net Worth) *and* a `FixedDeposit` row (so its lifecycle — rate, tenure, compounding — can be tracked). This keeps net worth aggregation generic (`SUM(Account.currentBalance)` grouped by tier) while FDR-specific logic lives in its own table.
- **RecurringSchedule → Transaction link:** when a recurring charge is auto-logged or manually confirmed, a `Transaction` row is created with `recurringScheduleId` set, so history stays queryable both by account and by "which subscription generated this."

---

## 3. API Design (Next.js Route Handlers)

All routes are under `/api`, return JSON, and are scoped to the authenticated user (session-derived `userId`, never trust a client-supplied one). Standard error shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "amount must be positive" } }
```

### 3.1 Accounts

| Method | Route | Description |
|---|---|---|
| GET | `/api/accounts` | List accounts, grouped by tier. Query: `?tier=LIQUID` |
| POST | `/api/accounts` | Create account |
| GET | `/api/accounts/:id` | Account detail + recent transactions |
| PATCH | `/api/accounts/:id` | Update account metadata |
| DELETE | `/api/accounts/:id` | Soft-delete (`isActive = false`) |
| POST | `/api/accounts/:id/reconcile` | Submit statement balance, creates `ReconciliationLog`, flags variance |

**POST `/api/accounts`**
```json
// Request
{ "name": "BRAC Bank Checking", "tier": "LIQUID", "subtype": "CHECKING", "openingBalance": 50000, "currency": "BDT" }
// Response 201
{ "id": "acc_x1", "name": "BRAC Bank Checking", "tier": "LIQUID", "currentBalance": "50000.00", ... }
```

### 3.2 Transactions

| Method | Route | Description |
|---|---|---|
| GET | `/api/transactions` | Filterable list. Query: `accountId, categoryId, type, from, to, tag, q, page, limit` |
| POST | `/api/transactions` | Create transaction (updates account balance in the same DB transaction) |
| GET | `/api/transactions/:id` | Single transaction |
| PATCH | `/api/transactions/:id` | Edit (recomputes account balance delta) |
| DELETE | `/api/transactions/:id` | Delete (reverses balance impact) |

### 3.3 Transfers

| Method | Route | Description |
|---|---|---|
| GET | `/api/transfers` | List transfers |
| POST | `/api/transfers` | Create transfer — atomic debit/credit, zero net cash-flow impact |

**POST `/api/transfers`**
```json
// Request
{ "fromAccountId": "acc_checking", "toAccountId": "acc_wallet", "amount": 2000, "date": "2026-09-10", "notes": "ATM withdrawal to wallet" }
// Response 201
{ "id": "trf_9", "fromAccountId": "acc_checking", "toAccountId": "acc_wallet", "amount": "2000.00" }
```

### 3.4 Recurring Schedules & Forecast

| Method | Route | Description |
|---|---|---|
| GET | `/api/recurring` | List active/inactive recurring rules |
| POST | `/api/recurring` | Create rule, computes initial `nextRunDate` |
| PATCH | `/api/recurring/:id` | Update rule |
| DELETE | `/api/recurring/:id` | Cancel rule |
| POST | `/api/recurring/:id/run` | Manually confirm a due charge → creates `Transaction`, advances `nextRunDate` |
| GET | `/api/recurring/forecast?days=30` | Returns projected balance timeline vs. committed debits (drives brief §3.3 forecasting) |

**GET `/api/recurring/forecast?days=30`**
```json
{
  "horizonDays": 30,
  "startingLiquidBalance": "84200.00",
  "events": [
    { "date": "2026-09-15", "name": "Netflix", "amount": "-650.00", "projectedBalance": "83550.00" },
    { "date": "2026-09-20", "name": "Salary", "amount": "+120000.00", "projectedBalance": "203550.00" }
  ],
  "riskAlerts": [
    { "date": "2026-09-15", "message": "Projected liquid balance would go negative before salary lands" }
  ]
}
```

Forecast logic (server-side, `forecast.service.ts`):
1. Start from current summed `LIQUID`-tier balances.
2. Walk forward day-by-day for the horizon, materializing each `RecurringSchedule` occurrence (expanding frequency + `intervalCount`) as a signed cash event.
3. Running balance is checked after each event; any point where it goes negative is pushed into `riskAlerts`.

### 3.5 Fixed Deposits

| Method | Route | Description |
|---|---|---|
| GET | `/api/fixed-deposits` | List, sorted by `maturityDate` |
| POST | `/api/fixed-deposits` | Create — creates the `LOCKED` `Account` + `FixedDeposit` row together |
| PATCH | `/api/fixed-deposits/:id` | Edit terms (rate, payout account, etc.) |
| POST | `/api/fixed-deposits/:id/renew` | Roll principal (+interest) into a new FDR record |
| POST | `/api/fixed-deposits/:id/withdraw` | Marks `WITHDRAWN`, creates a `Transfer` from the FDR account to `payoutAccount` |

Interest calculation (`interest.service.ts`):
- **Simple:** `maturityValue = principal * (1 + rate/100 * tenureMonths/12)`
- **Compounding (monthly/quarterly):** `maturityValue = principal * (1 + (rate/100)/n)^(n * tenureMonths/12)`, where `n` = periods/year (12 or 4)
- **At maturity:** interest accrues but is only realized/paid in a single lump event on `maturityDate`

### 3.6 Investments

| Method | Route | Description |
|---|---|---|
| GET | `/api/investments` | List positions with unrealized gain/loss |
| POST | `/api/investments` | Record a BUY → creates/updates `InvestmentPosition` + `InvestmentTxn` |
| POST | `/api/investments/:id/sell` | Record a SELL, reduces quantity, realizes gain/loss |
| POST | `/api/investments/:id/valuation` | Manual price update → recomputes unrealized P/L |

### 3.7 Reports & Net Worth

| Method | Route | Description |
|---|---|---|
| GET | `/api/reports/net-worth` | `{ totalLiquid, totalLocked, totalInvested, netWorth }` |
| GET | `/api/reports/cash-flow?period=monthly` | Income vs expense series (Transaction-only, Transfers excluded) |
| GET | `/api/reports/category-breakdown?from&to` | Expense sum grouped by category |

### 3.8 Auth

- `NextAuth` (Credentials or OAuth provider), session strategy `jwt`, `userId` attached to session token and read in every route handler via `getServerSession`.

---

## 4. Docker Compose Setup

**`docker-compose.yml`**
```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-myfin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-myfin}
      POSTGRES_DB: ${POSTGRES_DB:-myfin}
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-myfin}"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-myfin}:${POSTGRES_PASSWORD:-myfin}@db:5432/${POSTGRES_DB:-myfin}
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    command: sh -c "npx prisma migrate deploy && npm run start"

volumes:
  db_data:
```

**`Dockerfile`** (multi-stage)
```dockerfile
# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start"]
```

**`.env.example`**
```
POSTGRES_USER=myfin
POSTGRES_PASSWORD=change_me
POSTGRES_DB=myfin
DATABASE_URL=postgresql://myfin:change_me@localhost:5432/myfin
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

### 4.1 Local Dev Workflow

```bash
# first-time setup
cp .env.example .env
docker compose up -d db          # start only the DB for local dev
npx prisma migrate dev           # run migrations against local db
npx prisma db seed               # seed categories, demo accounts
npm run dev                      # run Next.js outside Docker for hot reload

# full containerized run
docker compose up --build
```

---

## 5. Cross-Cutting Concerns

- **Validation:** every route handler validates its body with a Zod schema in `lib/validators/` before touching Prisma — reject early, never trust client-shaped money values.
- **Balance consistency:** any write that affects `Account.currentBalance` (Transaction create/edit/delete, Transfer create, FDR renew/withdraw) is wrapped in `prisma.$transaction([...])` so the cached balance and the underlying rows can never drift.
- **Timezone:** all `date` fields stored as UTC `DateTime`; display formatting is client-side per user locale.
- **Migrations:** `prisma migrate dev` locally, `prisma migrate deploy` in the Docker `app` service's startup command (as shown above) — no manual SQL in production.
- **Seeding:** `prisma/seed.ts` should create a default category set (Groceries, Rent, Utilities, Subscriptions, Salary, etc.) so the "Add Transaction" category picker isn't empty on first run.
