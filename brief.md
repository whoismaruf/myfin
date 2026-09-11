# Product Brief: Personal Finance & Wealth OS

## 1. Executive Summary
- **Product Name:** Personal Finance & Wealth OS (Working Title)
- **One-Sentence Pitch:** A unified personal wealth and cash-flow management application engineered to track multi-tier liquid accounts, daily expenses, recurring commitments, and locked-in wealth instruments (FDRs, term deposits, and investments).
- **Core Objective:** Provide absolute clarity on net worth, actual liquid reserves, upcoming cash commitments, and long-term asset growth without the complexity of enterprise ERPs or the limitations of basic expense trackers.

---

## 2. Problem Statement & Target Audience
- **Target Audience:** Working professionals, freelancers, and investors managing funds across distributed bank accounts, liquid cash, digital wallets, recurring subscription commitments, and term investments.
- **Core Pain Points:**
  - **Siloed Tracking:** Most standard personal finance apps lump money into a single balance or fail to distinguish between available liquid cash and locked term deposits (FDRs).
  - **Distorted Expense Reports:** Internal account transfers (e.g., withdrawing ATM cash or transferring to a digital wallet) often mistakenly register as expenses or new income.
  - **Subscription Blindspots:** Lack of forward-looking forecasting for committed recurring bills and annual renewals leads to liquidity crunches.
  - **Unmanaged Fixed Deposits:** Term savings and FDRs have distinct maturity dates, compound frequencies, and payout targets that spreadsheet tools fail to monitor dynamically.

---

## 3. Product Scope & Functional Requirements

### 3.1 Account Management & Liquidity Tiers
- **Multi-Account Support:** Segregate capital into distinct liquidity classifications:
  - **Liquid Accounts:** Checking, savings, physical cash-in-hand, and digital/mobile wallets.
  - **Locked / Term Savings:** Fixed Deposit Receipts (FDR), Deposit Pension Schemes (DPS), and certificates of deposit.
  - **Growth / Asset Accounts:** Equities, mutual funds, commodities, and index holdings.
- **Internal Transfers (Zero-Sum Ledger):** Dedicated inter-account transfer mechanism with source and destination accounts to ensure net-zero impact on cash flow reports.
- **Manual Balance Reconciliation:** Ability to verify and reconcile app ledger balances with physical bank statements or cash audits.
- **Net Worth Metrics:** Real-time top-level breakdown:
  - Total Liquid Cash
  - Total Locked / Term Capital
  - Total Invested Assets
  - Consolidated Net Worth

### 3.2 Income & Expense Tracking
- **Categorized Transaction Ledger:** Log inflow and outflow with timestamp, category, subcategory, account source, tags, notes, and optional attachment receipts.
- **Rapid Data Entry:** High-density, keyboard-first or sub-3-click entry flow designed for low friction.
- **Cash Flow Analytics:** Visual monthly burn rate, category breakdowns, historical trend analysis, and income vs. expense ratio.

### 3.3 Subscriptions, Recurring Payments & Forecasting
- **Recurring Schedule Rules:** Support flexible recurrence intervals (daily, weekly, bi-weekly, monthly, quarterly, annual, custom).
- **Subscription Metadata:** Track renewal dates, payment method/source account, category, billing frequency, and reminder buffers.
- **Predictive Cash Flow Forecasting:**
  - 30 / 60 / 90-day forward-looking projection of committed debits against forecasted income.
  - Account balance simulations alerting the user if upcoming scheduled charges exceed projected account liquidity.
- **Auto-Log / Prompt Execution:** Optional automated booking or single-click manual confirmation of recurring charges on their respective billing dates.

### 3.4 Fixed Deposits (FDR) & Term Savings Management
- **Lifecycle Tracking:** Track opening deposit date, principal amount, tenure (months/years), maturity date, and nominal interest rate.
- **Interest Mechanics:** Handle simple vs. compounding interest calculation schedules (monthly, quarterly, at maturity).
- **Payout Routing:** Designate linked liquidation accounts where interest or matured principal is deposited.
- **Maturity Pipeline:** Timeline and calendar alerts for upcoming matured deposits to facilitate timely renewal or reinvestment.

### 3.5 Investment Portfolio Tracking
- **Asset Ledger:** Record purchases, unit prices, total invested capital, and position quantities for stocks, mutual funds, or secondary assets.
- **Valuation Updates:** Periodic manual or benchmarked market valuation updates to track unrealized gains/losses and overall portfolio weight.

---

## 4. Technical Constraints & Data Architecture

### 4.1 Data Integrity & Precision
- **Double-Entry Principles:** Every transaction and transfer must maintain strict balance integrity across source and destination ledgers.
- **Numeric Precision:** Store all currency amounts as integers (minor units / cents / paisa) or using fixed-point `DECIMAL(12, 2)` to eliminate floating-point arithmetic errors.
- **Strict Separation of Types:** Ensure queries differentiating between cash flow events (Income/Expense) and capital repositioning (Transfers/Investments) are structurally isolated at the database schema level.

### 4.2 Out of Scope (Phase 1 / MVP)
- Automated Open Banking / third-party Plaid bank screen scraping.
- Real-time stock exchange ticker streaming or automated broker order execution.
- Multi-user joint account synchronization or enterprise payroll modules.

---

## 5. Next Milestones & Architecture Roadmap
1. **Data Model & ERD:** Complete relational schema definition (PostgreSQL / Prisma / Drizzle) covering Accounts, Transactions, Transfers, RecurringSchedules, and FixedDeposits.
2. **Core User Flow & Wireframe Mapping:** Dashboard, quick transaction input, FDR maturity pipeline, and cash flow forecast calendar.
3. **Tech Stack Finalization:** Application framework (Web/Desktop vs. Native Mobile), local-first vs. server-side persistence, and UI component system.
