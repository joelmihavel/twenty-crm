# HAWKEYE_INTERACTIONS.md
# Every clickable element, every cross-entity navigation link, every drawer trigger,
# every hover state, every side effect. The definitive interaction reference.
# Used by: Claude Code when building any component that a user can interact with.

---

## HOW TO USE THIS FILE

Before building any screen, scan the section for that screen.
Before placing any chip, button, or table row, find it in the component-level rules.
When in doubt about whether something should navigate, open a drawer, or do nothing —
this file is the answer.

---

## GLOBAL INTERACTION RULES

These apply everywhere without exception.

### Rule 1 — UTN always opens Transaction Drawer (not full page)
Any `utn` value rendered anywhere opens the Transaction Drawer via `drawerStateAtom`.
Exception: on `/transactions/:id` the UTN is already the full page — no drawer trigger.
Drawer footer always has: `<Button title="Open Full Record →" onClick={() => navigate('/transactions/' + id)} />`

### Rule 2 — Item Code always opens Item Drawer (not full page)
Any `item_code` value rendered anywhere opens the Item Drawer via `drawerStateAtom`.
Exception: on `/items/:id` — no drawer trigger.
Drawer footer always has: `<Button title="Open Full Record →" onClick={() => navigate('/items/' + id)} />`

### Rule 3 — Back button always uses navigate(-1)
Never hardcode `navigate('/tenants')` inside a detail screen back button.
User may have arrived from a pipeline card, a chart click, a sidebar link, or another detail page.
`navigate(-1)` preserves the correct history.

### Rule 4 — Table rows are clickable
Every `StyledTr` in every list screen has `onClick={() => navigate(detailUrl)}` and `cursor: pointer`.
The row click navigates to the detail page. Chip/EntityChip clicks inside the row also navigate,
but to their own targets (different entity). Stop propagation on chips inside rows.

```tsx
// Pattern for row + chip coexistence
<StyledTr onClick={() => navigate(`/tenants/${tenant.id}`)}>
  <StyledTd>
    <EntityChip
      name={tenant.first_name + ' ' + tenant.last_name}
      onClick={(e) => { e.stopPropagation(); navigate(`/tenants/${tenant.id}`); }}
    />
  </StyledTd>
  <StyledTd>
    <Chip
      label={tenant.current_pid}
      onClick={(e) => { e.stopPropagation(); navigate(`/pids/${tenant.current_pid}`); }}
    />
  </StyledTd>
</StyledTr>
```

### Rule 5 — Drawers close on backdrop click OR Escape key

```tsx
// Drawer backdrop
<StyledDrawerBackdrop onClick={closeDrawer} />

// Escape key listener — add in drawer component
useEffect(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);
```

### Rule 6 — StyledToast shows on exactly these events
1. Drag-drop stage change on any kanban board → `"Moved to [Stage]"`
2. Copy-to-clipboard for any ID field → `"Copied"`
3. Form submit success → `"Saved successfully"`
4. Inline ticket status update → `"Status updated"`

```tsx
// Trigger pattern
const [toast, setToast] = useState<string | null>(null);
const showToast = (msg: string) => {
  setToast(msg);
  setTimeout(() => setToast(null), 2500);
};
// Render
{toast && <StyledToast>{toast}</StyledToast>}
```

### Rule 7 — Query param names must match filter type keys exactly
When navigating with filters, the param key must exactly match the property name in
the `*Filters` type in `HAWKEYE_SERVICES_API.md`. Mismatched names silently break filters.

```tsx
// Correct — matches TenantFilters.lifecycle
navigate(`/tenants?lifecycle=${encodeURIComponent(stage)}`);

// Correct — matches TenantFilters.rent_status
navigate('/tenants?rent_status=Overdue');

// Wrong — TenantFilters has no rentStatus key
navigate('/tenants?rentStatus=Overdue');
```

---

## CROSS-ENTITY NAVIGATION MAP

The complete relationship graph. Every arrow is a clickable link in the UI.

```
TENANT
  → Contracts (via tenant_id)          → /contracts/:id
  → Tickets (via tenant_id)            → /tickets/:id
  → Transactions (via contact_id)      → Transaction Drawer
  → RID (current_rid)                  → /rids/:id
  → PID (current_pid)                  → /pids/:id

MERCHANT
  → PIDs (via merchant_id)             → /pids/:id
  → Contracts (via merchant_id)        → /contracts/:id
  → Transactions (via to_party)        → Transaction Drawer

PID
  → RIDs (via pid)                     → /rids/:id
  → Merchant (via merchant_id)         → /merchants/:id
  → Contracts (via pid)                → /contracts/:id
  → Tickets (via pid)                  → /tickets/:id
  → Transactions (via pid)             → Transaction Drawer
  → Overheads (via pid)                → /overheads/:id
  → Tenants (current_pid on Tenant)    → /tenants/:id

RID
  → PID (via pid)                      → /pids/:id
  → Contracts (via rid)                → /contracts/:id
  → Tickets (via rid)                  → /tickets/:id
  → Tenant (current_rid on Tenant)     → /tenants/:id
  → Items (via location)               → Item Drawer

CONTRACT
  → Tenant/Merchant (party)            → /tenants/:id or /merchants/:id
  → PID                                → /pids/:id
  → RID                                → /rids/:id
  → Transactions (via contract_uid)    → Transaction Drawer

TRANSACTION
  → Contract (contract_uid)            → /contracts/:id
  → Contact (contact_id)               → /tenants/:id or /merchants/:id or /vendors/:id
  → PID                                → /pids/:id
  → RID                                → /rids/:id

TICKET
  → PID                                → /pids/:id
  → RID                                → /rids/:id
  → Tenant                             → /tenants/:id
  → Vendor (assigned_vendor)           → /vendors/:id
  → Transaction (transaction_id)       → Transaction Drawer

VENDOR
  → Tickets (assigned_vendor)          → /tickets/:id
  → FSINs (vendor_code)                → /fsins/:id

FSIN
  → Vendor (vendor_code)               → /vendors/:id
  → Items (fsin_code reverse)          → Item Drawer

ITEM
  → FSIN (fsin_code)                   → /fsins/:id
  → Location RID                       → /rids/:id
  → Transaction (txn_no)               → Transaction Drawer
```

---

## DRAWER COMPONENTS

### Transaction Drawer

**Width:** 400px, right-side overlay sliding in from the right.
**Triggered by:** any UTN rendered anywhere, except on `/transactions/:id`.

```tsx
// Drawer state
type DrawerState = { open: boolean; type: 'transaction' | 'item' | null; id: string | null };
export const drawerStateAtom = atom<DrawerState>({ open: false, type: null, id: null });
```

**Contents:**
```
Header
  UTN (StyledMonoValue)
  Direction Tag (Credit green / Debit red)
  LightIconButton(IconX) — close

Body
  Amount (StyledCurrencyValue, green or red)
  Transaction Date
  From party → EntityChip (navigates to party detail page)
  To party → EntityChip
  Payment Channel + Provider
  Gateway Reference ID (StyledMonoValue)
  Purpose Category 1 + 2 (Tags)
  PID Chip → /pids/:id
  RID Chip → /rids/:id
  Contract UID Chip → /contracts/:id
  Line item description (if present)

Footer
  Button("Open Full Record →") → navigate('/transactions/' + id)
```

**Close triggers:**
- Click the `IconX` button in header
- Click the `StyledDrawerBackdrop` (full-screen semi-transparent overlay behind drawer)
- Press `Escape` key

### Item Drawer

**Width:** 400px, same pattern as Transaction Drawer.
**Triggered by:** any `item_code` rendered anywhere, except on `/items/:id`.

**Contents:**
```
Header
  Item Code (StyledMonoValue)
  State Tag (color from itemStateToTagColor)
  LightIconButton(IconX) — close

Body
  FSIN image placeholder (48×48)
  FSIN item_name + fsin_code Chip → /fsins/:id
  Vendor EntityChip → /vendors/:id
  Unit Price (₹)
  Current Location Chip → /rids/:id (if PIB) or plain text (if warehouse)
  Lock status (Toggle, read-only)
  QA Flag (AnimatedCheckmark or ✗)

  Repair & Replace summary
    Total repair cost ₹ (sum from history)
    Purchase price ₹
    Recommendation Tag: Repair/Monitor/Replace (from repairRecommendation())

  Top 3 recent repair tickets
    Each: ticket_id (StyledMonoValue) → /tickets/:id
    Each: title + date + cost

Footer
  Button("Open Full Record →") → navigate('/items/' + id)
```

---

## S1 — LIST SCREEN INTERACTIONS

### All list screens — shared interaction pattern

```
PageHeader
  Title (static, not clickable)
  Record count Tag (static)
  "+ Create" Button → navigates to relevant form

FilterBar
  Filter dropdowns (Select components) → each change re-fetches list with new filter
  Search TextInput → debounced 300ms, re-fetches with search param
  Active filter pills → each has × to clear that one filter
  "Clear all" link → clears all filters, re-fetches

Table
  Header row: StyledTh — not clickable, not sortable (no sort in v1)
  Data row: StyledTr
    → onClick: navigate to detail page
    → onMouseEnter: subtle background change (theme.background.secondary)
    → cursor: pointer on whole row

Empty state (no results after filter)
  IconChartBar or relevant icon
  "No records found"
  If filtered: "Clear filters" LightButton
```

### S1.1 — Tenant List `/tenants`

**Row click:** → `/tenants/:id`

**Chip interactions within row:**
- `Current PID` Chip → `stopPropagation` + `/pids/{pid}`
- `Lifecycle` Tag — not clickable (display only), but shows tooltip on hover: `"in stage N days"` via `AppTooltip`

**Hover tooltip on Lifecycle Tag:**
```tsx
<AppTooltip content={`${daysBetween(lastStageChangeDate)} days in this stage`}>
  <Tag color={lifecycleToTagColor(tenant.tenant_lifecycle)} text={tenant.tenant_lifecycle} />
</AppTooltip>
```

**Pre-filter from query param:** On mount, if `?lifecycle=X` is in URL, the lifecycle
Select shows "X" as selected and the table is pre-filtered.

### S1.3 — PID List `/pids`

**Row click:** → `/pids/:id`

**Filter:** `?pid_type=active` pre-selects the type dropdown.
PIDs of type `lead` show no current_pid or RID data — those columns are blank/`—`.

### S1.4 — RID List `/rids`

**Row click:** → `/rids/:id`

**Chip interactions:**
- `PID` Chip → `stopPropagation` + `/pids/{pid}`
- `Current Tenant` EntityChip → `stopPropagation` + `/tenants/{tenant.id}`

**AnimatedCheckmark vs `—`:** AC column shows `<AnimatedCheckmark isChecked={true} />` when `ac=true`, `—` when false.

### S1.6 — Transaction List `/transactions`

**UTN column:** Clicking the UTN (StyledMonoValue) opens Transaction Drawer.
`stopPropagation` on UTN click so the row's navigate-to-detail doesn't also fire.

**Row click:** → `/transactions/:id` (full detail page)
Both the row click and the UTN click are valid — UTN opens drawer, row navigates full page.

**Amount colouring:**
- Credit: `theme.color.green`
- Debit: `theme.color.red`

### S1.7 — Ticket List `/tickets`

**Row click:** → `/tickets/:id`

**Within row:** `PID` Chip, `RID` Chip (if present), `Vendor` EntityChip — all `stopPropagation`.

**Title column:** `<OverflowingTextWithTooltip text={ticket.ticket_name} />` — shows full text in tooltip when truncated.

### S1.9 — FSIN Catalog `/fsins`

**Row click:** → `/fsins/:id`

**Vendor EntityChip** in row → `stopPropagation` + `/vendors/{vendor.id}`

**Stock Tag:** Derived on render — if total item count ≤ `fsin.reorder_point`, show `<Tag color="orange" text="Reorder" />`, else `<Tag color="green" text="Sufficient" />`.

### S1.10 — Item List `/items`

**Item Code column:** `StyledMonoValue` — clicking opens Item Drawer (`stopPropagation` from row).

**Row click:** → `/items/:id`

**Location Chip:** If location matches RID format (e.g. `09BR2`), → `/rids/09BR2`. If warehouse (e.g. `WH01-R3`), no navigation — plain text.

---

## S2 — DETAIL SCREEN INTERACTIONS

### All detail screens — shared interaction pattern

```
PageHeader
  LightIconButton(IconArrowLeft) or LightButton(IconArrowLeft, "Back") → navigate(-1)
  Entity display name (static)
  Status Tag(s) for primary status field
  LightButton(IconEdit, "Edit") → [edit mode, future scope, show "Coming soon" toast for now]

TabBar
  Each tab label is clickable
  Active tab has distinct visual style (font.weight.semibold + bottom border)
  Tab selection updates local state (useState), no URL change

Right sidebar
  Always visible, fixed width (1fr of StyledDetailGrid)
  Each panel is a StyledCard with StyledSectionTitle
  All chips and entity chips within sidebar panels are clickable per cross-entity map
```

### S2.1 — Tenant Detail `/tenants/:id`

**Tabs:** Overview · Attribution · Requirements · Lifecycle · Satisfaction · History

**Overview tab:**
- All file URL fields → `LightIconButton(IconFile)` opening `window.open(url)`
- All external URL fields (linkedin, twitter, instagram) → `LightIconButton(IconExternalLink)` opening `window.open(url, '_blank')`
- BGV Report → `LightIconButton(IconFile, "View BGV Report")`

**Attribution tab:**
- `WAX-Code`, `google_click_id`, `facebook_click_id` — each has `LightIconButton(IconCopy)` that copies to clipboard and shows `StyledToast("Copied")`
- The entire Onboarding Provenance Block uses `background.noisy` (distinct visual treatment, read-only, no edit)

**Lifecycle tab:**
- `Current PID` (EntityChip) → `/pids/{pid}`
- `Current RID` (Chip) → `/rids/{rid}`

**History tab:**
- Every `linkedObject` in a history entry renders as a clickable Chip or EntityChip
- Timeline entries with `type: 'payment'` have Transaction Drawer trigger on the UTN
- Filter buttons above timeline: `All` · `Payments` · `Stage Changes` · `Documents` — each filters visible entries by type

**Right sidebar:**
- Current Contract card — contract_uid Chip → `/contracts/:id`
- Active Tickets list (5 rows) — each row → `/tickets/:id`
- Recent Transactions (5 rows) — each UTN → Transaction Drawer
- All Tenancies — each row: period dates + RID Chip → RID + PID Chip → PID

### S2.2 — Merchant Detail `/merchants/:id`

**Tabs:** Lead Info · Identity & Bank · Psychographics · Permissions · History

**Identity & Bank tab:**
- `bank_account_number` — shows last 4 digits only (`•••• 5678`) + `LightIconButton(IconCopy)` on full value
- `ifsc_code` — copy button
- `aadhaar_back` → `LightIconButton(IconFile)`
- `pan_card_image` → `LightIconButton(IconFile)`

**Right sidebar:**
- All Properties table — each PID row: PID code Chip → `/pids/{pid}` + type Tag + cluster + units
- Recent Payments — each UTN → Transaction Drawer

### S2.3 — PID Detail `/pids/:id`

**Tabs:** Property · Pipeline · Building · Financials · History

**Conditional rendering by `pid_type`:**
- `lead` → show Pipeline tab data, hide active block fields
- `active` / `churned` → show Property/Building/Financials tabs
- `churned` → red banner at top of page: "This property has churned" + deposit_refunded Toggle + exit_cost_opx

**Financials tab:**
- Shows data from the linked Merchant Contract
- Revenue vs COGS Chart (P1) below existing fields

**History tab:**
- Occupancy Timeline Chart (P2) — each occupied cell → `/tenants/{tenantId}`
- Ticket Category Chart (P3) — read-only, no click navigation

**Right sidebar — Active Occupancy Block (always visible):**
- Each RID mini-card: RID code (monospace, not a link) + Status Tag + Tenant EntityChip → `/tenants/{id}` + Base Rent + Available From
- RID mini-card itself is clickable → `/rids/{rid}`
- Landlord: Merchant EntityChip → `/merchants/{id}`
- All Time Tenants: each EntityChip → `/tenants/{id}`, period dates, RID Chip → `/rids/{rid}`
- Active Tickets: each row → `/tickets/{id}`

### S2.4 — RID Detail `/rids/:id`

**Tabs:** Room · History

**History tab:**
- Occupancy History Table (primary): each row — period, Location Chip → `/rids/{rid}`, State Tag, duration, Tenant EntityChip → `/tenants/{id}`
- Rent Trajectory Chart (Ri1) below table: each dot → `/tenants/{tenantId}`
- Full Timeline below chart

**Right sidebar:**
- Parent Property: PID code Chip → `/pids/{pid}`, Merchant EntityChip → `/merchants/{id}`
- Occupancy Rate Chart (Ri2) — no interaction
- Current Inventory: each Item Code (StyledMonoValue) → Item Drawer
- Linked Tickets: each row → `/tickets/{id}`

### S2.5 — Contract Detail `/contracts/:id`

**Tabs:** Terms · Commercials · Deductions (Tenant only) · Documents · History

**Commercials tab — Payment Progress Tracker stepper:**
- Step 1: Token Paid — amount + date + UTN → Transaction Drawer
- Step 2: FMR Paid — amount + date + UTN → Transaction Drawer
- Step 3: SD Paid — amount + date + UTN → Transaction Drawer
- Step 4: Move-in Ready — date only
- Each step is visually distinct: completed = solid, pending = outlined

**Documents tab:**
- Agreement PDF → `LightIconButton(IconFile, "View Agreement")`
- Inventory List → `LightIconButton(IconFile, "View Inventory")` (Merchant only)

**Right sidebar:**
- Parties section: Tenant/Merchant EntityChip → respective detail page, PID Chip → PID, RID Chip → RID
- All Transactions for this contract: each UTN → Transaction Drawer

### S2.6 — Transaction Detail `/transactions/:id`

**Tabs:** Details · Audit

**UTN at top:** `StyledMonoValue` — no drawer trigger (already on full page)

**From/To parties:** EntityChip → navigates to respective entity detail page

**Right sidebar:**
- Other transactions for this contract (5 rows): each UTN → Transaction Drawer
- All transactions for this contact (5 rows): each UTN → Transaction Drawer
- Note: these sidebar UTNs DO open the drawer even though we're on the Transaction detail page.
  Only the primary UTN for the current page has no drawer trigger.

### S2.7 — Ticket Detail `/tickets/:id`

**Tabs:** Details · Execution · SLA & Feedback · History

**Details tab:**
- `ticket_status` — inline click-to-edit:
  `Tag` shows current status → clicking opens a `Select` dropdown in place → on change: `updateTicketStatus(id, newStatus)` + `showToast("Status updated")`
- If `ticket_category` = `Appliance` or `Inventory` → **Linked Item section** appears:
  - Item Code Chip → Item Drawer (not full page)
  - State Tag + recent repair history condensed table
  - Each repair ticket row → `/tickets/{ticketId}`

**Execution tab:**
- `Vendor` EntityChip → `/vendors/{vendor.id}`
- `resolution_notes` field → editable `AutosizeTextInput` (saves on blur)
- `Notes` field → append-only timeline log (actor + timestamp per entry), rendered as scrollable list
  - Each note shows actor name (bold) + timestamp (timeAgo) + content
  - No edit/delete — append only
- `Transaction Chip` → Transaction Drawer

**Right sidebar:**
- PID Chip → `/pids/{pid}`
- RID Chip (if present) → `/rids/{rid}`
- Tenant EntityChip (if Tenant ticket) → `/tenants/{id}`
- Vendor EntityChip → `/vendors/{id}`

### S2.8 — Vendor Detail `/vendors/:id`

**Tabs:** Contact & Billing · Capability · Commercials · History

**Right sidebar — Vendor Performance Panel (always visible):**
- Ticket Volume Chart (V1) — read-only
- Resolution Time Chart (V2) — read-only
- Category Breakdown Chart (V3) — read-only
- All chart panels have no click-through navigation

**History tab:**
- Each ticket row in history → `/tickets/{id}`

### S2.9 — FSIN Detail `/fsins/:id`

**Tabs:** Catalog · Specifications · History

**Right sidebar — Stock Summary Panel (always visible):**
- Reorder Status Tag — green "Sufficient" or orange "Reorder" (derived, not clickable)
- Physical Units table: each Item Code (StyledMonoValue) → Item Drawer
- Unit State Donut Chart (F1) — read-only

**History tab:**
- Procurement History Chart (F2) — read-only
- Timeline entries with `type: 'payment'` → UTN opens Transaction Drawer

### S2.10 — Item Detail `/items/:id`

**Tabs:** Unit Detail · History (History is default active tab)

**History tab (primary view):**
1. **Location History Table** at top:
   - Each `Location` value: if RID format → Chip → `/rids/{rid}`; if warehouse → plain text
   - Each `Tenant` value: EntityChip → `/tenants/{id}` (if occupied period)
   - Most recent entry first
2. Repair Cost Chart (I1) below table — read-only
3. Full Timeline below chart — UTN entries → Transaction Drawer, Ticket entries → `/tickets/{id}`

**Unit Detail tab:**
- `fsin_code` Chip → `/fsins/{fsin.id}` (the FSIN detail page, not a drawer)
- `location` Chip → `/rids/{rid}` if RID format
- `txn_no` (StyledMonoValue) → Transaction Drawer

**Right sidebar — Repair vs Replace Panel (always visible):**
- `Total repair cost` (₹) + `Purchase price` (₹)
- Repair/Monitor/Replace Tag (from `repairRecommendation()` — green/orange/red)
- Product Info: FSIN thumbnail (48×48) + FSIN name Chip → `/fsins/{fsin.id}` + Vendor EntityChip → `/vendors/{id}`
- Transaction ref UTN → Transaction Drawer

### S2.11 — Overhead Detail `/overheads/:id`

**Tabs:** Overview · History

**Overview tab:**
- Category-conditional field rendering — only fields for the selected `category_type` are shown
- Password fields (`wifi_password`, `electricity_password`, `water_password`, `gas_password`):
  - Default: `••••••`
  - `LightIconButton(IconEye)` toggles reveal
  - After reveal: `LightIconButton(IconEyeOff)` toggles back to masked
- `document` field → `LightIconButton(IconFile)`

**Right sidebar:**
- PID Chip → `/pids/{pid}`
- Merchant EntityChip → `/merchants/{id}` (via PID's merchant_id — requires lookup)

---

## S3 — BOARD SCREEN INTERACTIONS

### All boards — shared interaction pattern

**Layout:**
- Outer container: `overflow-x: auto` (horizontally scrollable)
- Each column: `width: 260px`, `flex-shrink: 0`, independently `overflow-y: auto`
- Cards: draggable via HTML5 Drag API

**Drag and drop implementation:**
```tsx
// On dragstart
card.setAttribute('draggable', 'true');
onDragStart: setDraggedCardId(card.id);

// On dragover column
onDragOver: (e) => e.preventDefault();  // allows drop

// On drop
onDrop: async (targetColumn) => {
  await updateEntityStage(draggedCardId, targetColumn);
  // optimistic update: move card in local state immediately
  showToast(`Moved to ${targetColumn}`);
};
```

State stored in a Jotai atom (e.g. `demandPipelineState`). Never in component state alone.

**Card click** → navigate to detail page (whole card is clickable)

### S3.1 — Demand Pipeline `/pipeline/demand`

**Columns (left to right):**
New Inquiry · Visit Scheduled · Visit Done · Negotiation · Converted · Gestation · Moved In · Notice Period · Moved Out · Dead Lead

**Card contents:**
- Tenant name (bold, `font.size.md`)
- Mobile (secondary, `font.size.xs`)
- PID Chip (if has current_pid) → `stopPropagation` + `/pids/{pid}`
- RID Chip (if has current_rid) → `stopPropagation` + `/rids/{rid}`
- Qualification Tag + Channel Tag
- Create date (`timeAgo`)

**Left border indicator:**
- If `daysBetween(lastStageChangeDate) > 7` → orange left border `3px solid theme.color.orange`

**Card hover:**
```tsx
// Mini tooltip on card hover showing quick summary
<AppTooltip content={
  `${tenant.first_name} ${tenant.last_name}\n` +
  `${tenant.mobile_phone}\n` +
  `BGV: ${tenant.bgv_status}\n` +
  `${daysBetween(lastStageChange)} days in stage`
}>
  <KanbanCard ...>
```

**Card click:** → `/tenants/{id}`

**Drag and drop side effect:**
- Calls `updateTenantLifecycle(tenantId, newStage)` from tenants.service.ts
- Shows `StyledToast("Moved to " + newStage)`

### S3.2 — Supply Pipeline `/pipeline/supply`

**Columns (left to right):**
To be contacted · In touch · LL Interested · Qualified · Evaluation · Negotiations · Offer Extended · Under Contract · To nurture

**Card contents:**
- PID No. (StyledMonoValue) + Merchant name
- Cluster Tag + Expected Rent (₹)
- Row of RID status dots: one small coloured dot per room, colour = Room Status Tag colour
  - Dots are display-only, not individually clickable
- Deal Owner name

**Left border indicator:**
- If no history entry in > 14 days → yellow left border `3px solid theme.color.yellow`

**Card click:** → `/pids/{id}`

**Drag and drop side effect:**
- Calls service to update `deal_stage` on the PID
- Shows `StyledToast("Moved to " + newStage)`

### S3.3 — Resolution Board `/resolution-board`

**Columns (left to right):**
New Request · Waiting on Customer · Waiting on Vendor · Blocked · Waiting for Payment · Ready for Closure · Closed

**Card contents:**
- Ticket ID (StyledMonoValue) + Priority Tag
- Title (2-line clamp via `OverflowingTextWithTooltip`)
- PID Chip + RID Chip (if present) → `stopPropagation` + navigate
- Vendor EntityChip (if assigned) → `stopPropagation` + `/vendors/{id}`
- Owner name + Days open
  - `theme.color.orange` if days > 3, `theme.color.red` if days > 7
- SLA breach indicator: red 6px dot if `time_to_first_response_sla_hours > 24`

**Stats panel (top-right of board):**
- Ticket Status Bar Chart (B1) — read-only
- SLA Breach Rate Radial (B2) — read-only

**Card click:** → `/tickets/{id}`

**Drag and drop side effect:**
- Calls `updateTicketStatus(ticketId, newStatus)` from tickets.service.ts
- Shows `StyledToast("Status updated to " + newStatus)`

---

## S4 — DASHBOARD INTERACTIONS

### S4.1 — Demand Dashboard `/dashboard/demand`

**KPI cards (4 total — each is a clickable StyledCard):**

| KPI | On click |
|---|---|
| Active Leads (count) | `navigate('/tenants')` |
| Visits This Month | `navigate('/tenants?lifecycle=Visit Done')` |
| Conversions This Month | `navigate('/tenants?lifecycle=Converted')` |
| Avg Days to Convert | No navigation — informational only |

**Chart interactions:**

| Chart | Interactive element | navigate() call |
|---|---|---|
| D1 Lead Sources | Any bar | `/tenants?channel=${encodeURIComponent(d.channel)}` |
| D2 Conversion Funnel | Any stage | `/tenants?lifecycle=${encodeURIComponent(d.stage)}` |
| D3 Conversion Trend | Any data point | `/tenants?lifecycle=Converted&month=${d.month}` |
| D4 Pipeline Breakdown donut | Any segment | `/tenants?lifecycle=${encodeURIComponent(d.stage)}` |
| D5 Visit vs Conversion | Bars and line | no navigation — informational |

All chart hover states show the custom `StyledTooltipWrapper` tooltip (not Recharts default).

### S4.2 — Rent Dashboard `/dashboard/rent`

**KPI cards (4 total — each is a clickable StyledCard):**

| KPI | On click |
|---|---|
| Total Due (₹) | `navigate('/tenants')` |
| Collected (₹) | `navigate('/transactions?credit_debit=Credit&month=' + currentMonth)` |
| Outstanding (₹) | `navigate('/tenants?rent_status=Overdue')` |
| Overdue > 5 days | `navigate('/tenants?rent_status=Overdue')` |

**Chart interactions:**

| Chart | Interactive element | navigate() call |
|---|---|---|
| R1 Collection Trend | No click — informational | — |
| R2 Collection Status donut | Overdue segment only | `/tenants?rent_status=Overdue` |
| R3 Overdue Aging bars | Any bar | `/tenants?rent_status=Overdue&aging_bucket=${d.bucket}` |
| R4 Landlord Payout | No click — informational | — |

**Collection Status Table:**
- Tenant EntityChip → `/tenants/{id}`
- PID Chip → `/pids/{pid}`
- `₹2,000 fine` Tag (shown if overdue > 5 days): display only, not clickable

**Landlord Payout Table:**
- Merchant EntityChip → `/merchants/{id}`

**6-month collection trend bars (the existing CSS bar chart):**
- Each bar → `navigate('/transactions?month=' + d.month)` where month is `YYYY-MM`

---

## S5 — FORM SCREEN INTERACTIONS

### All forms — shared interaction pattern

```
Layout: max-width 640px, margin: auto, sections in StyledCard

Every Select or dropdown that loads data from a service:
  - Shows loading state while fetching
  - Shows error if service throws

Submit button:
  - Disabled while submitting
  - On success: show StyledToast("Saved successfully")
  - On error: show inline error state under the form

Required fields:
  - Marked with * in label
  - Show error message on submit if empty
```

### S5.1 — Tenant Onboarding `/forms/tenant-onboarding`

**Pre-population:** If `?pid=X&rid=Y` in URL, PID and RID dropdowns are pre-selected.

**Interactions:**
- PID selector → on change, loads available RIDs for that PID via `getRidsByPid(pid)`
- RID selector → only shows rooms with `room_status: 'Available'`
- On submit → creates tenant record → shows success + "View Tenant" LightButton → navigate to new tenant

### S5.3 — Reserve Form `/forms/reserve`

**Micromarkets field:** Rendered as a checkbox grid (multiple can be selected simultaneously).
Not a multi-select dropdown — explicit checkbox grid of neighbourhood options.

**On submit:** Generates `RSV-2025-XXXX` confirmation code shown in success state.

### S5.4 — Ticket Form `/forms/ticket`

**Pre-population:** If `?pid=X&rid=Y&tenant=Z` in URL, those dropdowns pre-select.

**Interactions:**
- PID selector → loads RIDs for that PID
- Vendor selector → loads from `getVendors()`
- On submit → creates ticket → shows `TKT-XXXXXXXXXX` code + "View Ticket" button

### S5.5 — Move-out Notice `/forms/move-out-notice`

**Tenant selector:** On select, auto-populates contract fields (read-only):
- Contract UID (Chip → opens Contract drawer or navigates to contract)
- Contract End Date
- Lock-in End Date
- Notice Period days

**Conditional field:** "Notice period waived?" Yes/No — if "No", show warning banner:
`"Early exit — lock-in fee may apply: ₹{lock_in_fee}"`

### S5.6 — Renewal Decision `/forms/renewal-decision`

**Tenant selector:** On select, loads current contract details.

**Decision radio:** Yes / No / No Response
- Yes → show new contract term fields + rent fields
- No → show exit date + reason fields
- No Response → show follow-up date field only

### S5.7 — Inspection Checklist `/forms/inspection`

**max-width: 390px** — this is a mobile-first screen.

**Interactions:**
- PID + RID selectors → on RID select, loads `getItemsByRid(rid)` and renders item list
- Each item name → `stopPropagation` + opens Item Drawer
- Each item has 4 condition pill Buttons: `Good` · `Minor Damage` · `Major Damage` · `Missing`
  - Pills are mutually exclusive per item
  - Active pill has `border: 2px solid theme.color.blue`
- Sticky summary bar at bottom shows: items inspected / total + total damage ₹ estimate
- On submit (move-out context): opens deduction modal
  - Modal: table of damaged/missing items + estimated cost each
  - "Confirm Deductions" button → creates deduction record

### S5.8 — SD Settlement `/sd-settlement`

**Tenant selector:** On select:
- Contract UID Chip appears → clicking opens `/contracts/{id}` (full page, not drawer)
- SD Transaction link appears → clicking opens Transaction Drawer

**Interactions:**
- Deductions table: editable amount fields per row
- "Approve Settlement" button → simulates creating new transaction (mock UTN generated)
- Shows generated UTN in success state + `LightIconButton(IconCopy)`

### S5.9 — PO Approval Queue `/po-approval`

**Table interactions:**
- Each row is expandable → clicking row header expands to show line items
- Payee EntityChip within expanded row → navigate to vendor/merchant detail
- "Approve" LightButton → inline optimistic update (row goes green)
- "Reject" LightButton → inline optimistic update (row goes red) + reason TextInput appears

### S5.10 — Move-out Orchestrator `/move-out-orchestrator`

**Grid of move-out cards:** Each card represents a tenant in Notice Period or Moved Out.
- Tenant EntityChip → `/tenants/{id}`
- Contract Chip → `/contracts/{id}`
- RID Chip → `/rids/{rid}`

**9-step stepper per card:** Steps are checkboxes tracking move-out completion.
Each step click → toggles step completion + saves to service.

---

## S6 — SURVEY SCREEN INTERACTIONS

### S6.1 — CSAT/NPS Survey `/forms/survey`

**max-width: 390px** — mobile first, no sidebar.

**CSAT section:**
- 5 star rating buttons (1–5)
- Each star click → fills stars 1 through N in yellow
- Submit button → shows `<AnimatedCheckmark isChecked={true} />` success state

**NPS section:**
- 10 pill buttons (0–10)
- Colour coding: 0–6 `theme.color.red`, 7–8 `theme.color.yellow`, 9–10 `theme.color.green`
- On select: `NPS Category` Tag appears instantly showing Promoter/Passive/Detractor
- Optional comment `TextInput`
- Submit button → success state

**Both sections are independent** — submitting CSAT doesn't affect NPS section.

---

## FILTER BAR INTERACTION PATTERN

Applied in every list screen.

```tsx
export function FilterBar({ filters, onFilterChange, onClearAll }) {
  return (
    <StyledFilterBar>
      {/* Dropdowns */}
      <Select value={filters.lifecycle} onChange={(v) => onFilterChange('lifecycle', v)} />
      {/* more selects... */}

      {/* Search */}
      <TextInput
        placeholder="Search…"
        value={filters.search}
        onChange={(v) => onFilterChange('search', v)}
      />

      {/* Active filter pills — shown for every non-null filter value */}
      {Object.entries(filters)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([key, value]) => (
          <StyledFilterPill key={key}>
            {key}: {value}
            <LightIconButton Icon={IconX} onClick={() => onFilterChange(key, undefined)} />
          </StyledFilterPill>
        ))}

      {/* Clear all — shown only when any filter is active */}
      {hasActiveFilters && (
        <LightButton title="Clear all" onClick={onClearAll} />
      )}
    </StyledFilterBar>
  );
}
```

URL sync: when a filter changes, update URL via `setSearchParams` so the filtered state
is shareable and persists on refresh.

---

## INLINE STATUS EDIT — TICKET DETAIL

The `ticket_status` field on Ticket Detail is the only inline-editable field in v1.

```tsx
// Pattern
const [editingStatus, setEditingStatus] = useState(false);

{editingStatus ? (
  <Select
    value={ticket.ticket_status}
    options={ticketStatusOptions}
    onChange={async (newStatus) => {
      await updateTicketStatus(ticket.id, newStatus);
      setEditingStatus(false);
      showToast('Status updated');
    }}
    autoFocus
    onBlur={() => setEditingStatus(false)}
  />
) : (
  <Tag
    color={ticketStatusToTagColor(ticket.ticket_status)}
    text={ticket.ticket_status}
    onClick={() => setEditingStatus(true)}
    style={{ cursor: 'pointer' }}
  />
)}
```

---

## COPY-TO-CLIPBOARD INTERACTION

Standard pattern for all copy fields.

```tsx
function CopyableValue({ value, display }: { value: string; display: string }) {
  const [toast, setToast] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <StyledRow>
      <StyledMonoValue>{display}</StyledMonoValue>
      <LightIconButton Icon={IconCopy} onClick={handleCopy} />
      {toast && <StyledToast>Copied</StyledToast>}
    </StyledRow>
  );
}
```

Fields with copy buttons: `wax_code` · `google_click_id` · `facebook_click_id`
· `bank_account_number` (Merchant) · `ifsc_code` · any UTN in the Attribution tab

---

## PASSWORD REVEAL INTERACTION

```tsx
function MaskedField({ value, label }: { value: string; label: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <StyledFieldWrapper>
      <StyledFieldLabel>{label}</StyledFieldLabel>
      <StyledRow>
        <StyledMonoValue>{revealed ? value : '••••••'}</StyledMonoValue>
        <LightIconButton
          Icon={revealed ? IconEyeOff : IconEye}
          onClick={() => setRevealed(r => !r)}
        />
      </StyledRow>
    </StyledFieldWrapper>
  );
}
```

---

## INTERACTION VERIFICATION CHECKLIST

Run before marking any screen complete.

**Navigation**
- [ ] Every EntityChip navigates to its entity's detail page on click
- [ ] Every monospace ID Chip navigates to the correct detail page
- [ ] Every table row navigates to its entity's detail page on click
- [ ] Chip clicks inside table rows use `stopPropagation` so the row click doesn't also fire
- [ ] Back button on every detail screen uses `navigate(-1)`

**Drawers**
- [ ] All UTNs (except on `/transactions/:id`) open Transaction Drawer
- [ ] All Item Codes (except on `/items/:id`) open Item Drawer
- [ ] Both drawers close on backdrop click
- [ ] Both drawers close on Escape key
- [ ] Both drawers have "Open Full Record →" footer button

**Toasts**
- [ ] Drag-drop on kanban → "Moved to X" toast
- [ ] Copy-to-clipboard → "Copied" toast
- [ ] Form submit → "Saved successfully" toast
- [ ] Inline ticket status update → "Status updated" toast

**Boards**
- [ ] All three boards are horizontally scrollable
- [ ] Each column is independently vertically scrollable
- [ ] Cards are draggable via HTML5 API
- [ ] Drag-drop calls the correct service function and updates Jotai atom

**Dashboards**
- [ ] All 4 KPI cards on each dashboard are clickable
- [ ] D1 bar → `/tenants?channel=X`
- [ ] D2 stage → `/tenants?lifecycle=X`
- [ ] D3 point → `/tenants?lifecycle=Converted&month=YYYY-MM`
- [ ] D4 segment → `/tenants?lifecycle=X`
- [ ] R2 overdue segment → `/tenants?rent_status=Overdue`
- [ ] R3 bar → `/tenants?rent_status=Overdue&aging_bucket=X`
- [ ] Collection trend bars → `/transactions?month=YYYY-MM`
- [ ] P2 Gantt cell → `/tenants/{id}`
- [ ] Ri1 trajectory dot → `/tenants/{id}`

**Forms**
- [ ] Tenant/RID selectors on forms cascade (RID dropdown reloads when PID changes)
- [ ] Required field validation fires on submit
- [ ] Submit button disabled during submission
- [ ] Success state shown after submit

**Fields**
- [ ] All file URL fields render as LightIconButton(IconFile), never as img or raw URL
- [ ] All password fields are masked by default with reveal toggle
- [ ] All boolean fields render as Toggle in read-only display
- [ ] All copy-able ID fields have LightIconButton(IconCopy) + toast
- [ ] Ticket status Tag on Ticket Detail is click-to-edit inline Select
