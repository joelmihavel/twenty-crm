# HAWKEYE_ROUTES.md
# Complete routing table — every URL, URL param, query string, breadcrumb, and 404 rule
# Used by: Claude Code when configuring React Router and building any navigation element

---

## ROUTER SETUP

```tsx
// src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,   // sidebar + <Outlet />
    children: [
      { index: true, element: <Navigate to="/tenants" replace /> },
      // ── List screens ──
      { path: 'tenants',      element: <TenantList /> },
      { path: 'merchants',    element: <MerchantList /> },
      { path: 'pids',         element: <PIDList /> },
      { path: 'rids',         element: <RIDList /> },
      { path: 'contracts',    element: <ContractList /> },
      { path: 'transactions', element: <TransactionList /> },
      { path: 'tickets',      element: <TicketList /> },
      { path: 'vendors',      element: <VendorList /> },
      { path: 'fsins',        element: <FSINList /> },
      { path: 'items',        element: <ItemList /> },
      { path: 'overheads',    element: <OverheadList /> },
      // ── Detail screens ──
      { path: 'tenants/:id',      element: <TenantDetail /> },
      { path: 'merchants/:id',    element: <MerchantDetail /> },
      { path: 'pids/:id',         element: <PIDDetail /> },
      { path: 'rids/:id',         element: <RIDDetail /> },
      { path: 'contracts/:id',    element: <ContractDetail /> },
      { path: 'transactions/:id', element: <TransactionDetail /> },
      { path: 'tickets/:id',      element: <TicketDetail /> },
      { path: 'vendors/:id',      element: <VendorDetail /> },
      { path: 'fsins/:id',        element: <FSINDetail /> },
      { path: 'items/:id',        element: <ItemDetail /> },
      { path: 'overheads/:id',    element: <OverheadDetail /> },
      // ── Boards ──
      { path: 'pipeline/demand',  element: <DemandPipeline /> },
      { path: 'pipeline/supply',  element: <SupplyPipeline /> },
      { path: 'resolution-board', element: <ResolutionBoard /> },
      // ── Dashboards ──
      { path: 'dashboard/demand', element: <DemandDashboard /> },
      { path: 'dashboard/rent',   element: <RentDashboard /> },
      // ── Forms & workflows ──
      { path: 'forms/tenant-onboarding',   element: <TenantOnboarding /> },
      { path: 'forms/landlord-onboarding', element: <LandlordOnboarding /> },
      { path: 'forms/reserve',             element: <ReserveForm /> },
      { path: 'forms/ticket',              element: <TicketForm /> },
      { path: 'forms/move-out-notice',     element: <MoveOutNotice /> },
      { path: 'forms/renewal-decision',    element: <RenewalDecision /> },
      { path: 'forms/inspection',          element: <InspectionChecklist /> },
      { path: 'sd-settlement',             element: <SDSettlement /> },
      { path: 'po-approval',               element: <POApprovalQueue /> },
    ],
  },
  // Outside AppShell — no sidebar
  { path: '/forms/survey', element: <SurveyPage /> },
  // 404
  { path: '*', element: <NotFoundPage /> },
]);
```

```tsx
// src/main.tsx
<ThemeProvider theme={resolvedTheme}>
  <RouterProvider router={router} />
</ThemeProvider>
```

---

## INDEX REDIRECT

| From | To | Mechanism |
|---|---|---|
| `/` | `/tenants` | `<Navigate to="/tenants" replace />` as index child of AppShell |

---

## S1 — LIST SCREENS (11 routes)

| Route | Screen ID | Component file |
|---|---|---|
| `/tenants` | S1.1 | `src/pages/TenantList.tsx` |
| `/merchants` | S1.2 | `src/pages/MerchantList.tsx` |
| `/pids` | S1.3 | `src/pages/PIDList.tsx` |
| `/rids` | S1.4 | `src/pages/RIDList.tsx` |
| `/contracts` | S1.5 | `src/pages/ContractList.tsx` |
| `/transactions` | S1.6 | `src/pages/TransactionList.tsx` |
| `/tickets` | S1.7 | `src/pages/TicketList.tsx` |
| `/vendors` | S1.8 | `src/pages/VendorList.tsx` |
| `/fsins` | S1.9 | `src/pages/FSINList.tsx` |
| `/items` | S1.10 | `src/pages/ItemList.tsx` |
| `/overheads` | S1.11 | `src/pages/OverheadList.tsx` |

### Reading query params on list screens

Each list screen calls `useSearchParams()` on mount, builds a filter object, and
passes it into the corresponding service function. When a param is present, the
matching filter control is shown as active/pre-filled.

```tsx
// Pattern used in every list screen
import { useSearchParams } from 'react-router-dom';

export function TenantList() {
  const [searchParams] = useSearchParams();
  const filters: TenantFilters = {
    lifecycle:        searchParams.get('lifecycle')    ?? undefined,
    channel:          searchParams.get('channel')      ?? undefined,
    rent_status:      searchParams.get('rent_status')  ?? undefined,
    aging_bucket:     searchParams.get('aging_bucket') ?? undefined,
    pid:              searchParams.get('pid')          ?? undefined,
    month:            searchParams.get('month')        ?? undefined,
    search:           searchParams.get('search')       ?? undefined,
  };
  // pass filters into getTenants(filters)
}
```

### Accepted query params per list screen

**`/tenants`**
| Param | Values | Source |
|---|---|---|
| `lifecycle` | any `TenantLifecycleStage` | Pipeline kanban, funnel chart click, KPI card |
| `channel` | `first_inquiry_channel` enum value | Lead Sources chart bar click |
| `qualification` | `Qualified \| Not Qualified \| Dead \| Paused` | — |
| `bgv_status` | `Not Started \| In Progress \| Passed \| Failed` | — |
| `rent_status` | `Paid \| Overdue \| Upcoming` | Rent dashboard, R2 donut click |
| `aging_bucket` | `1-5 \| 6-10 \| 11-15 \| 15+` | R3 aging bar click |
| `pid` | PID string | PID Detail "all time tenants" chip |
| `month` | `YYYY-MM` | D3 area chart click |
| `search` | string | — |

**`/merchants`**
| Param | Values |
|---|---|
| `merchant_type` | `Landlord \| POC \| Lead \| Broker \| Management` |
| `deal_stage` | any deal stage string |
| `city` | city name |
| `search` | string |

**`/pids`**
| Param | Values |
|---|---|
| `pid_type` | `lead \| active \| churned` |
| `cluster` | `HSR \| KRM \| IDR \| MHD \| BLD \| MGR \| HBL \| WHF` |
| `deal_stage` | any deal stage string |
| `deal_owner` | team member name |
| `search` | string |

**`/rids`**
| Param | Values |
|---|---|
| `pid` | PID string — filter rooms by property |
| `room_status` | `Available \| Occupied \| Under Maintenance \| Blocked` |
| `bed_type` | `Single \| Double \| Queen \| King` |
| `search` | string |

**`/contracts`**
| Param | Values |
|---|---|
| `applies_to` | `Tenant \| Merchant` |
| `contract_type` | `L&L \| Authorisation \| C&S` |
| `pid` | PID string |
| `rid` | RID string |
| `search` | string |

**`/transactions`**
| Param | Values | Source |
|---|---|---|
| `credit_debit` | `Credit \| Debit` | — |
| `purpose_category_1` | `OPEX \| CAPEX \| REVENUE \| COGS \| REFUNDS \| etc.` | — |
| `pid` | PID string | — |
| `month` | `YYYY-MM` | Collection trend bar click |
| `search` | string | — |

**`/tickets`**
| Param | Values |
|---|---|
| `pipeline` | `Tenant \| Landlord` |
| `ticket_status` | any status string |
| `priority` | `Low \| Medium \| High \| Urgent \| Critical` |
| `ticket_category` | `Plumbing \| Electrical \| Appliance \| etc.` |
| `ticket_owner` | team member name |
| `pid` | PID string |
| `search` | string |

**`/vendors`** — `?vendor_type= &quality_tier= &city= &search=`

**`/fsins`** — `?category= &vendor_code= &stock_status=Sufficient|Reorder &search=`

**`/items`** — `?state=BUY|WIB|WOB|PIB|POB|WORK|DEAD &fsin_code= &search=`

**`/overheads`** — `?pid= &category_type= &object_type=Recurring|One-Time &search=`

---

## S2 — DETAIL SCREENS (11 routes)

| Route | Screen ID | Component file | id value |
|---|---|---|---|
| `/tenants/:id` | S2.1 | `src/pages/TenantDetail.tsx` | `Tenant.id` e.g. `'t-001'` |
| `/merchants/:id` | S2.2 | `src/pages/MerchantDetail.tsx` | `Merchant.id` e.g. `'m-rachana'` |
| `/pids/:id` | S2.3 | `src/pages/PIDDetail.tsx` | `PID.id` e.g. `'PID9'` |
| `/rids/:id` | S2.4 | `src/pages/RIDDetail.tsx` | `RID.id` e.g. `'09BR2'` |
| `/contracts/:id` | S2.5 | `src/pages/ContractDetail.tsx` | `Contract.id` e.g. `'CNT-T-2025-001'` |
| `/transactions/:id` | S2.6 | `src/pages/TransactionDetail.tsx` | `Transaction.id` e.g. `'txn-001'` |
| `/tickets/:id` | S2.7 | `src/pages/TicketDetail.tsx` | `Ticket.id` e.g. `'tkt-001'` |
| `/vendors/:id` | S2.8 | `src/pages/VendorDetail.tsx` | `Vendor.id` e.g. `'v-gr'` |
| `/fsins/:id` | S2.9 | `src/pages/FSINDetail.tsx` | `FSIN.id` e.g. `'fsin-gr-bed'` |
| `/items/:id` | S2.10 | `src/pages/ItemDetail.tsx` | `Item.id` e.g. `'ITM-GR10001-001'` |
| `/overheads/:id` | S2.11 | `src/pages/OverheadDetail.tsx` | `Overhead.id` e.g. `'oh-001'` |

```tsx
// Pattern used in every detail screen
const { id } = useParams<{ id: string }>();
const navigate = useNavigate();
// fetch: getEntityById(id!)
// if null → show not-found inline state
```

---

## S3 — BOARD SCREENS (3 routes)

| Route | Screen ID | Component file |
|---|---|---|
| `/pipeline/demand` | S3.1 | `src/pages/DemandPipeline.tsx` |
| `/pipeline/supply` | S3.2 | `src/pages/SupplyPipeline.tsx` |
| `/resolution-board` | S3.3 | `src/pages/ResolutionBoard.tsx` |

No URL params. Board state (column filters, search) managed by Jotai atoms only.

---

## S4 — DASHBOARD SCREENS (2 routes)

| Route | Screen ID | Component file |
|---|---|---|
| `/dashboard/demand` | S4.1 | `src/pages/DemandDashboard.tsx` |
| `/dashboard/rent` | S4.2 | `src/pages/RentDashboard.tsx` |

**Important:** `/dashboard` (without suffix) has no route and shows a 404.
Do not add a `/dashboard` index redirect — users arrive via sidebar links directly.

---

## S5 — FORM AND WORKFLOW SCREENS (9 routes)

| Route | Screen ID | Component file | Notes |
|---|---|---|---|
| `/forms/tenant-onboarding` | S5.1 | `src/pages/forms/TenantOnboarding.tsx` | Multi-step |
| `/forms/landlord-onboarding` | S5.2 | `src/pages/forms/LandlordOnboarding.tsx` | Multi-step |
| `/forms/reserve` | S5.3 | `src/pages/forms/ReserveForm.tsx` | Produces RSV-2025-XXXX |
| `/forms/ticket` | S5.4 | `src/pages/forms/TicketForm.tsx` | Produces TKT-XXXXXXXXXX |
| `/forms/move-out-notice` | S5.5 | `src/pages/forms/MoveOutNotice.tsx` | Auto-populates contract |
| `/forms/renewal-decision` | S5.6 | `src/pages/forms/RenewalDecision.tsx` | Conditional fields |
| `/forms/inspection` | S5.7 | `src/pages/forms/InspectionChecklist.tsx` | max-width 390px |
| `/sd-settlement` | S5.8 | `src/pages/SDSettlement.tsx` | Top-level, not /forms/ |
| `/po-approval` | S5.9 | `src/pages/POApprovalQueue.tsx` | Top-level, not /forms/ |

### Query params for pre-population

**`/forms/tenant-onboarding`** — `?pid= &rid=` pre-selects property and room

**`/forms/ticket`** — `?pid= &rid= &tenant=` pre-selects all three fields

**`/forms/inspection`** — `?pid= &rid=` pre-selects and auto-loads `getItemsByRid(rid)`

**`/forms/move-out-notice`** — `?tenant=` pre-selects tenant, auto-populates contract fields

**`/forms/renewal-decision`** — `?tenant=` pre-selects tenant

**`/sd-settlement`** — `?tenant=` pre-selects tenant, auto-loads contract and SD transaction

---

## S6 — SURVEY SCREEN (outside AppShell)

| Route | Screen ID | Component file | Notes |
|---|---|---|---|
| `/forms/survey` | S6.1 | `src/pages/forms/SurveyPage.tsx` | No sidebar. max-width 390px. |

This route is defined as a **sibling** to the AppShell route, not a child.
It renders without any sidebar navigation — it is shared as a direct URL with tenants.

---

## SIDEBAR NAVIGATION

```
Primary navigation (top section):
  IconUsers             Tenants                  /tenants
  IconLayoutKanban      Pipeline                 /pipeline/demand
  IconChartBar          Demand Dashboard         /dashboard/demand
  ─────────── divider ───────────────────────────────────────────
  IconBuildingEstate    Merchants                /merchants
  IconBuilding          Properties (PIDs)        /pids
  IconLayoutKanban      Supply Pipeline          /pipeline/supply
  ─────────── divider ───────────────────────────────────────────
  IconDoor              Rooms (RIDs)             /rids
  IconFile              Contracts                /contracts
  IconTicket            Tickets                  /tickets
  IconLayoutKanban      Resolution Board         /resolution-board
  ─────────── divider ───────────────────────────────────────────
  IconReceipt           Transactions             /transactions
  IconCoin              Rent Dashboard           /dashboard/rent
  ─────────── divider ───────────────────────────────────────────
  IconTruck             Vendors                  /vendors
  IconPackage           FSIN Catalog             /fsins
  IconBox               Items                    /items
  IconBolt              Overheads                /overheads

Quick Actions section (below primary nav):
  IconUserPlus          Tenant Onboarding        /forms/tenant-onboarding
  IconHomeHeart         Landlord Onboarding      /forms/landlord-onboarding
  IconForms             Reserve                  /forms/reserve
  IconPlus              New Ticket               /forms/ticket
  IconDoorExit          Move-out Notice          /forms/move-out-notice
  IconRefresh           Renewal Decision         /forms/renewal-decision
  IconClipboardList     Inspection               /forms/inspection
  IconCash              SD Settlement            /sd-settlement
  IconChecklist         PO Approval Queue        /po-approval

Sidebar footer (pinned to bottom):
  <ThemeToggle />   three-way: light / system / dark
  <FlentWordmark /> "Flent" text logo
```

Active route: use React Router's `<NavLink>` with `isActive` to apply active styling.
No highlighting for Quick Actions (they are actions, not current-location indicators).

---

## BREADCRUMBS

Every detail screen shows a single back button at top-left. Use `navigate(-1)` — never
hardcode the list route. Users arrive at detail screens from multiple entry points.

```tsx
// Standard detail screen header pattern
<PageHeader>
  <LightIconButton Icon={IconChevronLeft} onClick={() => navigate(-1)} size="sm" />
  <PageTitle>{displayName}</PageTitle>
</PageHeader>
```

| Screen | Visible back label |
|---|---|
| Tenant Detail | ← Tenants |
| Merchant Detail | ← Merchants |
| PID Detail | ← Properties |
| RID Detail | ← Rooms |
| Contract Detail | ← Contracts |
| Transaction Detail | ← Transactions |
| Ticket Detail | ← Tickets |
| Vendor Detail | ← Vendors |
| FSIN Detail | ← Catalog |
| Item Detail | ← Items |
| Overhead Detail | ← Overheads |

Do NOT implement multi-level breadcrumbs. One back chevron is the full navigation chrome
for detail screens.

---

## DRAWER ROUTES (URL does not change)

Two drawers exist. They are controlled by the `drawerStateAtom` Jotai atom.
The URL does NOT change when a drawer opens.

### Transaction Drawer

Triggered by: clicking any UTN (monospace value) **except** when already on `/transactions/:id`.

```tsx
const isOnTransactionPage = !!useMatch('/transactions/:id');

// Render UTN
<StyledMonoValue
  onClick={isOnTransactionPage ? undefined : () => openTransactionDrawer(txn.id)}
  style={{ cursor: isOnTransactionPage ? 'default' : 'pointer' }}
>
  {txn.utn}
</StyledMonoValue>

// Drawer footer always shows:
<Button title="Open Full Record →" onClick={() => navigate(`/transactions/${id}`)} />
```

### Item Drawer

Triggered by: clicking any item code **except** when already on `/items/:id`.

```tsx
const isOnItemPage = !!useMatch('/items/:id');

// Drawer footer always shows:
<Button title="Open Full Record →" onClick={() => navigate(`/items/${id}`)} />
```

---

## CHART CLICK-THROUGH NAVIGATION

Every interactive chart element that navigates uses `useNavigate()` from React Router.
The query param names must exactly match the `TenantFilters` and `TransactionFilters`
keys from `HAWKEYE_SERVICES_API.md` — mismatches silently break the filter.

### Demand Dashboard

| Chart | Element clicked | navigate() call |
|---|---|---|
| D1 Lead Sources | any bar | `navigate('/tenants?channel=' + encodeURIComponent(d.channel))` |
| D2 Conversion Funnel | any stage | `navigate('/tenants?lifecycle=' + encodeURIComponent(d.stage))` |
| D3 Conversion Trend | any data point | `navigate('/tenants?lifecycle=Converted&month=' + d.month)` |
| D4 Pipeline Breakdown donut | any segment | `navigate('/tenants?lifecycle=' + encodeURIComponent(d.stage))` |

### Rent Dashboard

| Chart | Element clicked | navigate() call |
|---|---|---|
| R2 Collection Status donut | Overdue segment only | `navigate('/tenants?rent_status=Overdue')` |
| R3 Overdue Aging bar | any bar | `navigate('/tenants?rent_status=Overdue&aging_bucket=' + d.bucket)` |
| Collection trend bar (6-month) | any bar | `navigate('/transactions?month=' + d.month)` |

### Detail screen charts

| Chart | Element clicked | navigate() call |
|---|---|---|
| P2 Occupancy Timeline cell | occupied cell | `navigate('/tenants/' + d.tenantId)` |
| Ri1 Rent Trajectory dot | any tenancy dot | `navigate('/tenants/' + d.tenantId)` |

### Dashboard KPI cards (click-through)

| KPI card | navigate() call |
|---|---|
| Demand — Total Leads | `navigate('/tenants')` |
| Demand — Visits Completed | `navigate('/tenants?lifecycle=Visit Done')` |
| Demand — Conversions | `navigate('/tenants?lifecycle=Converted')` |
| Demand — Moved In | `navigate('/tenants?lifecycle=Moved In')` |
| Rent — Overdue count | `navigate('/tenants?rent_status=Overdue')` |
| Rent — Total collected | `navigate('/transactions?credit_debit=Credit&month=' + currentMonth)` |

---

## CHIP AND ENTITYCHIP NAVIGATION REFERENCE

### EntityChip targets (full detail pages)

| Field | navigate() destination |
|---|---|
| Tenant name | `/tenants/{tenant.id}` |
| Merchant name | `/merchants/{merchant.id}` |
| Vendor name | `/vendors/{vendor.id}` |
| FSIN item name (on Item Detail) | `/fsins/{fsin.id}` |
| Transaction From/To party (Tenant) | `/tenants/{id}` |
| Transaction From/To party (Merchant) | `/merchants/{id}` |
| Transaction From/To party (Vendor) | `/vendors/{id}` |

### Chip targets (related page, same hierarchy)

| Field | navigate() destination |
|---|---|
| `current_pid` on Tenant | `/pids/{pid}` |
| `current_rid` on Tenant | `/rids/{rid}` |
| `pid` on Contract | `/pids/{pid}` |
| `rid` on Contract | `/rids/{rid}` |
| `pid` on Transaction | `/pids/{pid}` |
| `rid` on Transaction | `/rids/{rid}` |
| `contract_uid` on Transaction | `/contracts/{contract.id}` |
| `pid` on Ticket sidebar | `/pids/{pid}` |
| `rid` on Ticket sidebar | `/rids/{rid}` |
| `location` on Item (if RID format) | `/rids/{rid}` |
| `fsin_code` on Item | `/fsins/{fsin.id}` |
| `pid` on RID header | `/pids/{pid}` |
| `current_contract_id` on RID | `/contracts/{contract.id}` |
| Each RID mini-card on PID Detail | `/rids/{rid}` |
| `vendor_code` on FSIN | `/vendors/{vendor.id}` |
| PID chip on Resolution Board card | `/pids/{pid}` |
| RID chip on Resolution Board card | `/rids/{rid}` |

### Drawer triggers (no URL change)

| Field | Opens |
|---|---|
| Any UTN anywhere (except `/transactions/:id`) | Transaction Drawer |
| `transaction_id` on Ticket Detail | Transaction Drawer |
| UTN in Contract Detail transaction list | Transaction Drawer |
| `txn_no` on Item Detail | Transaction Drawer |
| Any item_code anywhere (except `/items/:id`) | Item Drawer |
| Item names in Inspection Checklist | Item Drawer |

---

## 404 HANDLING

### Unknown route — catch-all `*`

```tsx
// src/pages/NotFoundPage.tsx
export function NotFoundPage() {
  return (
    <StyledCentered>
      <IconAlertTriangle size={48} color={theme.color.orange} />
      <h2>Page not found</h2>
      <p>This URL doesn't exist in Hawkeye.</p>
      <Button title="Go to Tenants" onClick={() => navigate('/tenants')} />
    </StyledCentered>
  );
}
```

### Unknown entity ID on detail screens

Service returns `null` → show inline empty state inside the detail page layout:

```tsx
if (!entity) {
  return (
    <StyledEmptyState>
      <IconAlertTriangle size={32} color={theme.color.orange} />
      <p>Record not found</p>
      <LightButton title="← Back" onClick={() => navigate(-1)} />
    </StyledEmptyState>
  );
}
```

Do not redirect to the list screen on unknown ID — use `navigate(-1)` in the back button
so the user can return to wherever they came from.

---

## COMPLETE ROUTE INVENTORY

```
/                                  → redirect to /tenants

── List screens (11) ──────────────────────────────────────
/tenants
/merchants
/pids
/rids
/contracts
/transactions
/tickets
/vendors
/fsins
/items
/overheads

── Detail screens (11) ─────────────────────────────────────
/tenants/:id
/merchants/:id
/pids/:id
/rids/:id
/contracts/:id
/transactions/:id
/tickets/:id
/vendors/:id
/fsins/:id
/items/:id
/overheads/:id

── Boards (3) ───────────────────────────────────────────────
/pipeline/demand
/pipeline/supply
/resolution-board

── Dashboards (2) ───────────────────────────────────────────
/dashboard/demand
/dashboard/rent

── Forms and workflows (9) ──────────────────────────────────
/forms/tenant-onboarding
/forms/landlord-onboarding
/forms/reserve
/forms/ticket
/forms/move-out-notice
/forms/renewal-decision
/forms/inspection
/sd-settlement
/po-approval

── Outside AppShell (1) ─────────────────────────────────────
/forms/survey

── Catch-all ────────────────────────────────────────────────
*   → NotFoundPage
```

**Total: 38 routable paths + redirect + catch-all**

---

## NAVIGATION RULES SUMMARY

| Rule | Detail |
|---|---|
| Back button | Always `navigate(-1)`. Never hardcode the list path. |
| UTN click | Always opens Transaction Drawer. Exception: already on `/transactions/:id`. |
| Item code click | Always opens Item Drawer. Exception: already on `/items/:id`. |
| `/dashboard` (no suffix) | No route — shows 404. Don't add an index redirect. |
| `/forms/survey` | Outside AppShell. No sidebar rendered. |
| Query param names | Must match `*Filters` type keys in HAWKEYE_SERVICES_API.md exactly. |
| `encodeURIComponent` | Wrap all string values in navigate() query strings (lifecycle stages have spaces). |
| Unknown ID on detail page | Show inline empty state with `navigate(-1)` back button. |
