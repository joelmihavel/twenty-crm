# Hawkeye CRM — UI/UX Redesign Spec

**Date**: 2026-04-11
**Goal**: Transform Hawkeye from a generic schema-dump into a purpose-built property management CRM using Untitled UI Pro components properly.

---

## 1. Dashboard (Common Metrics)

Replace current random chart selection with actionable property management KPIs.

### Row 1 — Hero Metrics (4 cards)
| Metric | Source | Display |
|--------|--------|---------|
| Occupancy Rate | `roomAvailabilities` count where roomStatus=OCCUPIED / total rooms (429) | ProgressCircle + percentage + "X/Y rooms" |
| Active Tenants | `tenants` count where tenantLifecycle=MOVED_IN | Large number + Badge trend |
| Active Contracts | `contracts` totalCount | Large number |
| Open Tickets | `tickets` count where ticketStatus != Closed | Large number (0 until tickets are used) |

### Row 2 — Pipeline + Distribution (2 charts)
| Chart | Type | Data |
|-------|------|------|
| Tenant Lifecycle Pipeline | Horizontal bar chart | Group tenants by tenantLifecycle (10 stages). Null = "Unassigned" bucket |
| Properties by Cluster | Bar chart | Group properties by cluster field (HSR, KRM, IDR, MHD, BLD, MGR, HBL, WHF) |

### Row 3 — Action Lists (2 panels)
| Panel | Content |
|-------|---------|
| Expiring Contracts | Contracts where end date is within 30 days — show as a mini table: tenant name, property, end date |
| Recent Activity | Keep existing ActivityTimeline but improve to show record titles not UUIDs |

---

## 2. Entity Page Defaults

Each entity gets a purpose-built default view. The entity-config.ts `defaultView` and new config fields drive this.

### Tenants — Pipeline View (default)
- **Default view**: Kanban grouped by `tenantLifecycle`
- **Kanban columns**: New Inquiry → Visit Scheduled → Visit Done → Negotiation → Converted → Gestation → Moved In → Notice Period → Moved Out → Dead Lead. Plus "Unassigned" for null.
- **Card shows**: Name, phone, email (if present), lifecycle badge
- **Table fallback**: Columns: Name, Phone, Email, Lifecycle Stage, Occupation, Gender. Hide fields with <10% fill rate from default table columns.
- **Search**: ComboBox search by name/phone prominently placed above the view

### Properties — Card Grid (default)
- **Default view**: New "grid" view type
- **Card shows**: Property name, area/cluster, room count (from rooms relation count), occupancy badge (X/Y occupied), property type, lifecycle status badge
- **Table fallback**: Name, Cluster, Property Type, Lifecycle Status, Units, Floors
- **Click**: Opens property detail with Rooms tab showing room cards with status badges

### Contracts — Table with Calendar option
- **Default view**: Table sorted by contract end date
- **Key columns**: Contract ID, Contract Type (badge), State, Start Date, End Date, Monthly License Fee
- **Calendar view**: By contract end date (already configured)
- **Highlight**: Contracts ending within 30 days get a warning badge

### Tickets — Kanban (already configured)
- **Default view**: Kanban by `ticketStatus`
- **Card shows**: Ticket title, category badge, priority badge (color-coded), assigned vendor
- **Empty state**: "No tickets yet" with clear CTA

### Vendors — Compact Directory
- **Default view**: Table
- **Key columns**: Vendor name, Type (badge), Status (badge), Contact info
- **Compact rows**: Use AvatarLabelGroup for vendor name + type subtitle

### Transactions — Table with Totals
- **Default view**: Table
- **Key columns**: Date, Type (badge), Credit/Debit (badge), Amount (currency), Status (badge), From Party, To Party
- **Show total**: Sum of amounts at table footer

### Inventory (Items) — Search Catalog
- **Default view**: Table with prominent search
- **Key columns**: Item name, FSIN, State (badge), Category
- **Search**: ComboBox at top, filters by name/FSIN

### Merchants — Directory
- **Default view**: Table
- **Key columns**: Name, Type (badge), Source (badge), Contact info

---

## 3. Smart Column Selection

Replace "show all fields in random order" with intelligent column selection.

### Rules:
1. **Identity first**: The record's name/title field is ALWAYS column 1, rendered as AvatarLabelGroup (for people objects) or bold text (for others)
2. **Contact second**: Email, phone fields come next (if they exist on the object)
3. **Status third**: SELECT fields (lifecycle, status, type) as colored badges
4. **Key data fourth**: Currency, number, date fields
5. **Hide empty**: Fields with 0% fill rate in the current result set are hidden entirely (not shown as dash columns)
6. **Cap columns**: Maximum 7 columns on desktop, 4 on tablet. Rest accessible in record detail.

### Implementation:
- Add `fieldPriority` scoring function in `query-builder.ts`
- Score: FULL_NAME=100, name/title TEXT=95, EMAILS=90, PHONES=85, SELECT=70, CURRENCY=60, NUMBER=50, DATE=40, BOOLEAN=30, TEXT=20, LINKS=10
- Filter out fields where ALL values in the current result set are null/empty
- Sort by score descending, take top 7

---

## 4. Field Renderer Upgrades

Replace basic text rendering with proper Untitled UI components.

| Field Type | Current | Upgraded |
|-----------|---------|----------|
| TEXT (in table) | `<span class="truncate">` | Wrap in `<Tooltip>` for overflow |
| FULL_NAME | `Avatar xs` + text | `AvatarLabelGroup` with initials, email as subtitle |
| BOOLEAN | "Yes" / "No" text | `BadgeWithDot` green="Active" / red="Inactive" |
| RATING | Unicode stars `★☆` | `RatingStars` component |
| DATE | Fixed format string | Relative time ("3 days ago") with Tooltip showing full date |
| DATE_TIME | Fixed format string | Relative time with Tooltip |
| EMAILS | `<a href="mailto:">` | Icon + formatted email + copy button |
| PHONES | `<a href="tel:">` | Icon + formatted number + copy button |
| MULTI_SELECT (table) | Flex-wrap badges | `Tags` component with +N overflow |
| SELECT | Badge (keep) | Badge (keep, already good) |
| CURRENCY | Hardcoded ₹ | Locale-formatted with currency code from data |

---

## 5. Record Detail Redesign

Replace flat field dump with structured, contextual detail view.

### Hero Section (top of slideout)
- **People objects** (tenant, merchant): `AvatarLabelGroup size="lg"` with name, email subtitle, lifecycle badge
- **Other objects**: Bold title + object type badge
- **Quick actions**: Phone (click to call), Email (click to compose), Copy ID

### Field Groups (replace flat list)
Group fields by category using field name heuristics:
- **Contact**: fields containing "email", "phone", "name", "address"
- **Financial**: fields containing "rent", "fee", "amount", "deposit", "payment", "price"
- **Status**: SELECT and BOOLEAN fields
- **Dates**: DATE and DATE_TIME fields
- **Identity/KYC**: fields containing "pan", "aadhaar", "gst", "id"
- **Preferences**: fields containing "preference", "food", "smoking", "pet"
- **Other**: everything else

Each group renders as a collapsible section with a header. Empty groups are hidden.

### Slideout Component
Replace hand-rolled panel with `SlideoutMenu` component from the kit for proper animation, focus trap, and accessibility.

---

## 6. Component Upgrades

### Delete Confirmations
Replace raw `<div class="fixed inset-0">` overlays with `Modal` component (already used in CreateRecordModal).

### Date Field Editing
Replace plain `<Input>` for DATE fields with `DatePicker` component in FieldEditor and CreateRecordModal.

### Table Loading
Replace centered `<LoadingIndicator>` spinner with skeleton table rows (animate-pulse divs matching table column widths).

### Entity Page Stats Row
Replace oversized MetricCard grid with compact inline stat pills:
```
Total Tenants: 7.1K  |  Requirements: 7.1K  |  Contracts: 987
```
Using Badge components instead of full cards. Saves vertical space.

---

## 7. Property Grid View (New View Type)

Add a "grid" view alongside table/kanban/calendar for entity pages.

- Renders records as cards in a responsive grid (1 col mobile, 2 tablet, 3-4 desktop)
- Card shows: title (AvatarLabelGroup or bold text), 3-4 key field values, status badge
- Used as default for Properties entity
- Available for all entities via ViewSwitcher

---

## Implementation Priority

| Phase | What | Effort |
|-------|------|--------|
| A | Smart columns + field renderer upgrades + Tooltip | Core data presentation fix |
| B | Dashboard redesign with real KPIs | Common metrics for all users |
| C | Record detail redesign (hero, groups, SlideoutMenu) | Detail view polish |
| D | Entity-specific defaults (pipeline for tenants, grid for properties) | Workflow optimization |
| E | Component upgrades (DatePicker, Modal, skeleton, stats pills) | Polish |
