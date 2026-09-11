# UI Specification — Personal Finance & Wealth OS
Mobile-first, simple, low-friction. Target: 5-tab navigation, sub-3-click entry, no page requires more than one level of drill-down to reach an action.

---

## 0. Design Principles
1. **Mobile-first, thumb-reachable.** Primary actions live in the bottom third of the screen (bottom nav + FAB), not top-right corners.
2. **One primary action per screen.** Every page has a single obvious "next step" — don't compete for attention with 3 CTAs.
3. **Numbers before charts.** Lead with the hard number (e.g. "Net Worth: ৳1,240,500"), charts are secondary and collapsible.
4. **Progressive disclosure.** Advanced fields (tags, attachments, compounding schedule) are hidden behind an "Advanced" toggle in forms — the default form is 3–5 fields max.
5. **Consistent color language:** green = liquid/income, blue = locked/term, purple = invested/growth, red = expense/overdue.

---

## 1. Information Architecture — Page List (10 core screens)

| # | Page | Purpose | Priority |
|---|------|---------|----------|
| 1 | **Dashboard (Home)** | Net worth summary, liquidity breakdown, upcoming commitments at a glance | MVP |
| 2 | **Transactions (Ledger)** | Scrollable list of income/expense entries, filter & search | MVP |
| 3 | **Add/Edit Transaction** | Quick entry form (modal/bottom sheet, not full page) | MVP |
| 4 | **Accounts** | List of all accounts grouped by tier (Liquid / Locked / Growth) | MVP |
| 5 | **Account Detail** | Single account balance, history, reconcile action | MVP |
| 6 | **Transfer Money** | Source → destination transfer form | MVP |
| 7 | **Recurring / Subscriptions** | List of recurring bills + calendar/forecast view | MVP |
| 8 | **Add/Edit Recurring Rule** | Frequency, amount, account, reminder buffer | MVP |
| 9 | **Fixed Deposits (FDR)** | List with maturity countdown, add/edit FDR, payout routing | MVP |
| 10 | **Investments / Portfolio** | Holdings list, add position, valuation update | MVP |
| 11 | **Reports & Analytics** | Cash flow trends, category breakdown, income vs expense | Phase 2 |
| 12 | **Settings / Profile** | Currency, categories, reminder prefs, data export | Phase 2 |

Total for MVP: **~10 screens**, several of which (Add/Edit forms, Transfer) should be **bottom sheets/modals**, not separate routes — this keeps the "page count" low and navigation shallow.

---

## 2. Navigation Structure (Mobile)

**Bottom Tab Bar — 4 tabs + center FAB:**

```
[ Home ]   [ Ledger ]   [ (+) ]   [ Accounts ]   [ More ]
```

- **Home** → Dashboard
- **Ledger** → Transactions list
- **(+) FAB (center, raised)** → Opens quick-add sheet with 3 options: *Transaction / Transfer / Recurring*
- **Accounts** → Accounts list (tiered)
- **More** → Fixed Deposits, Investments, Reports, Settings (secondary items don't deserve their own tab)

This keeps the tab bar at 4–5 items max (mobile UX best practice), while FDRs/Investments/Reports live one tap deeper under "More" since they're checked less frequently than daily transactions.

---

## 3. Component Inventory

### 3.1 Dashboard components
- **Net Worth Hero Card** — large number, tap to expand breakdown (Liquid / Locked / Invested)
- **Liquidity Strip** — 3 small stat tiles: Total Liquid, Total Locked, Total Invested
- **Upcoming Commitments Widget** — next 3 recurring bills due, with days-until-due badge
- **FDR Maturity Alert Banner** — appears only if a deposit matures within 30 days
- **Mini Cash Flow Sparkline** — 30-day income vs expense trend line, tap → full Reports page
- **Quick Add Button** — floating, always visible

### 3.2 Transaction Ledger components
- **Transaction List Item** — icon (category), title, account tag, amount (color-coded), date
- **Sticky Filter Bar** — date range, category, account (collapsible chips)
- **Grouped-by-Date Section Headers** — "Today", "Yesterday", "Sep 8"
- **Search bar** (collapsed by default, expands on tap)
- **Empty state illustration** for zero transactions

### 3.3 Add/Edit Transaction (bottom sheet, not full page)
- Amount input (numeric keypad, large touch target)
- Income/Expense toggle (segmented control)
- Account picker (dropdown/chips)
- Category picker (grid of icons, most-used first)
- Date (defaults to today)
- **Advanced (collapsed):** subcategory, tags, notes, attach receipt photo

### 3.4 Accounts components
- **Tier Section Headers** — "Liquid", "Locked/Term", "Growth" with subtotal per tier
- **Account Card** — name, institution icon, balance, tier color strip
- **Reconcile Button** — on each account card, opens reconciliation modal
- **Add Account Button** — top of list

### 3.5 Transfer components
- **Source/Destination Picker** — two account selectors with swap icon between them
- **Amount input**
- **Confirmation summary** — "Transfer ৳X from A → B, no impact on cash flow" (reinforces zero-sum concept visually)

### 3.6 Recurring/Subscriptions components
- **Upcoming Timeline List** — chronological, grouped by week
- **Recurring Rule Card** — name, amount, frequency badge, next date, account
- **Forecast Toggle** — switches list view to a 30/60/90-day calendar heatmap showing projected balance vs commitments
- **Balance Risk Alert** — red banner if projected balance goes negative before a bill is due
- **Add Recurring Rule form** — amount, frequency selector, start date, linked account, reminder buffer, auto-log toggle

### 3.7 Fixed Deposits (FDR) components
- **FDR Card** — principal, interest rate, maturity date, circular progress ring showing tenure elapsed
- **Maturity Pipeline Timeline** — horizontal scroll of upcoming maturities sorted by date
- **Add/Edit FDR form** — principal, tenure, rate, compounding frequency, payout account
- **Renewal Prompt Modal** — triggered on/near maturity date: "Renew / Withdraw to [account]"

### 3.8 Investments components
- **Holdings List** — asset name, quantity, current value, gain/loss % (color-coded)
- **Portfolio Allocation Chart** — simple donut, tap segment to filter list
- **Add Position form** — asset name, units, purchase price, date
- **Update Valuation form** — quick price update per holding

### 3.9 Reports components (Phase 2)
- **Cash Flow Bar Chart** — monthly income vs expense
- **Category Breakdown Donut/List**
- **Income vs Expense Ratio gauge**
- **Historical Trend Line** — net worth over time

### 3.10 Shared/Global components
- Bottom Tab Bar, FAB, Bottom Sheet container, Toast/Snackbar for confirmations, Empty states, Skeleton loaders, Confirmation dialogs (for deletes), Currency input component (masked, 2 decimal precision), Date picker, Category icon picker

---

## 4. Mobile-Specific UX Rules
- **Touch targets ≥ 44×44px**, generous spacing between list items and buttons.
- **Forms open as bottom sheets**, not full-page navigations — reduces perceived page count and keeps context visible.
- **Numeric keypad by default** for all amount fields.
- **Single-column layouts only** — no side-by-side cards on mobile; stack vertically.
- **Sticky primary action** at bottom of forms (e.g. "Save Transaction") so it's always reachable without scrolling.
- **Swipe gestures** on transaction list items: swipe left to delete, swipe right to edit (with undo toast).
- **Dark mode support** from day one — finance apps are checked at all hours.
- **Offline-tolerant UI** — since this is likely local-first (per brief §5.3), show a subtle "unsynced" indicator rather than blocking the UI.

---

## 5. Summary — Screen Count for MVP
- **10 primary screens/routes**
- **4–5 of those are bottom-sheet modals** (Add Transaction, Transfer, Add Recurring, Add FDR, Add Investment) rather than full navigational pages
- **Effective navigation depth: 2 taps max** to reach any create action from Home
- Reports & Settings deferred to Phase 2, reachable via "More" tab in MVP as placeholders if needed
