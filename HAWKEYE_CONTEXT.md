# Hawkeye — Project Context for Claude Code

## What is this project?

Hawkeye is Flent's internal CRM. It is being built as a custom frontend module on top of **Twenty CRM** (open-source, MIT/AGPL licensed, built with React + NestJS + GraphQL). The goal is to replace a fragmented stack of HubSpot, Google Sheets, Make automations, and Typeform with a single, purpose-built operations tool that all of Flent's internal teams use daily.

This file exists so you — Claude Code — have full business and technical context before writing a single line of code. Read it completely before starting.

---

## What does Flent do?

Flent is a **co-living and managed rental company** based in Bangalore, India. The business works like this:

1. Flent identifies and acquires residential properties from landlords (called **Merchants** internally)
2. Flent furnishes these properties and manages them operationally
3. Flent rents individual rooms or full homes to tenants, typically young professionals
4. Flent manages the entire lifecycle — lead acquisition, tenant onboarding, stay, maintenance, and move-out

Flent operates across clusters in Bangalore: HSR Layout, Koramangala (KRM), Bellandur (BLD), Indiranagar (IDR), Marathahalli (MHD), Magarapatta (MGR), Hebbal (HBL), Whitefield (WHF).

---

## The five internal teams and what they do

### 1. Demand (Sales)
Handles everything from the moment a tenant enquires to the moment they move in. They manage lead qualification, property visits, token collection, and the onboarding process. Their pipeline runs from "New Inquiry" through multiple stages to "Moved In."

### 2. Supply
Acquires new properties from landlords. They identify leads, qualify them (P0/P1 tier system), conduct property visits and pricing, negotiate management agreements, and onboard landlords. Their pipeline tracks each property from a prospecting lead to "Under Contract."

### 3. CX (Customer Experience)
Manages the tenant's experience during their stay. Handles maintenance tickets, vendor dispatch, move-in/move-out logistics, cleaning coordination, utility notifications, CSAT/NPS surveys, and the renewal journey.

### 4. Inventory (IMS)
Tracks every physical item — furniture, appliances, fixtures — from the moment it's purchased through its entire lifecycle in and out of properties. They manage purchase orders, item states (in warehouse, in property, under repair, dead), and make repair-vs-replace decisions.

### 5. Finance
Processes all payments: tenant rent collection, landlord disbursements, vendor payments, security deposit settlements, and PO approvals. They need document verification before releasing payments and require a dual-control approval flow for larger disbursements.

---

## The data model — 13 core objects

Everything in Hawkeye maps to one of these objects. Understanding the hierarchy is critical:

```
MERCHANT (Landlord)
  └── owns → PID (Property)
                └── contains → RID (Room)
                                 └── occupied by → TENANT (via Contract)
                                 └── contains → ITEM (Furniture/Appliance)
                                                  └── is a unit of → FSIN (Product catalog entry)
```

Cutting across all of the above:
- **Contract** — the legal agreement between Flent and either a Tenant (for room occupancy) or a Merchant (for property management)
- **Transaction** — every money movement: rent paid, deposits, landlord payouts, vendor payments
- **Ticket** — every service request, maintenance issue, or complaint — raised by tenants or for vendor work
- **Overhead** — recurring property costs: WiFi, electricity, maintenance, generator, water, gas, helper/caretaker
- **Vendor** — external service providers who do maintenance and repair work

### Key IDs you'll see everywhere
- `PID-041` — a property (Property ID)
- `PID-041-A` — a room within that property (Room ID)
- `CNT-T-2025-0041` — a tenant contract
- `CNT-M-2025-0012` — a merchant/landlord contract
- `TXN-20250615-00123` — a transaction (UTN = Unique Transaction Number)
- `TKT-1042` — a ticket
- `FSIN-BED-001` — a furniture SKU in the catalog
- `ITM-BED-001-01` — a specific physical unit of that SKU
- `VND-001` — a vendor

### How objects relate to each other
```
Tenant      → has many Contracts, Tickets, Transactions
Merchant    → has many PIDs, Contracts, Transactions
PID         → has many RIDs, Tickets, Transactions, Overheads, Tenants (current)
RID         → belongs to PID, has many Contracts, Tickets, Transactions, ITEMs
Contract    → links Tenant or Merchant to PID/RID, has many Transactions
Transaction → links to Contract, Tenant/Merchant/Vendor, PID, RID
Ticket      → links to PID, RID, Tenant, Vendor; has one Transaction (cost recovery)
Vendor      → has many Tickets, FSINs, Transactions
FSIN        → belongs to Vendor, has many ITEMs
ITEM        → belongs to FSIN, lives at PID/RID (or warehouse)
Overhead    → belongs to PID, linked to Merchant indirectly
```

---

## The current pain — why this CRM is being built

Flent currently runs on a patchwork:

| What | Current tool | Problem |
|---|---|---|
| Tenant CRM | HubSpot | 8 separate sync workflows just to keep deal stage + contact stage in sync. Fields get overwritten on re-engagement. No single source of truth for lifecycle. |
| Tenant onboarding | Typeform + Make | External to CRM. Manual triggering. No native record creation. |
| Rent tracking | Google Sheets + Make | Manual payment link generation. No automated pro-rata calculation. |
| Lead attribution | HubSpot | First-touch source gets overwritten on re-engagement. gclid/fbclid not reliably captured. |
| Landlord onboarding | Sheets + Make + WhatsApp | Bank details collected over WhatsApp. No verification workflow. Dummy contact hack for Typeform sync. |
| Inventory management | Custom IMS system | Separate from CRM. No link between items and tenant tickets. Repair-vs-replace decisions made blind. |
| Vendor dispatch | Manual WhatsApp | No structured ticket format. Ops manually selects vendor and sends WhatsApp. |
| PO approvals | Manual Slack + Sheets | Finance checks bank details manually before approving. No audit trail. |
| Property visit tracking | Cal.com + Sheets | Visit outcomes not fed back to CRM. Conversion flow not triggered automatically. |

---

## The 75 problems being solved

Problems are organised into 5 pods. The type column tells you what kind of work is involved:

- **Automation** — a workflow that should trigger automatically on an event
- **Migration** — something currently in an external tool that needs to become native to the CRM
- **New build** — a flow that doesn't exist at all yet
- **Integration** — a connection to an external system that needs to persist
- **Dashboard** — a reporting view

### Demand pod (D-01 to D-31) — key ones
- **D-01**: Monthly rent collection — pro-rata calculation, payment link, escalation reminders on 1st/5th/10th, eviction warning by 15th
- **D-03**: Auto-qualify leads who book a visit or reserve
- **D-04**: Move deal to "Visit Scheduled" when Cal.com booking created
- **D-07**: Migrate tenant onboarding from Typeform + Make → native CRM
- **D-08**: Lock first-touch attribution — never overwrite on re-engagement
- **D-09**: Keep deal stage + contact lifecycle stage in sync (replacing 8 HubSpot workflows)
- **D-10**: Token paid → auto-promote lead to Tenant
- **D-18**: Renewal journey automation — Yes/No/No Response branches
- **D-20**: Send visit booking events to Meta CAPI (server-side, SHA-256 hashed)
- **D-28**: Ops dashboard — pipeline health, leads-to-conversion ratio

### Supply pod (S-01 to S-25) — key ones
- **S-02**: P0/P1 lead qualification tier system for landlords
- **S-03**: Bank details collection + verification before token release
- **S-07**: Landlord data sync to downstream systems on onboarding
- **S-10**: Migrate Typeform onboarding data sync (currently uses a "dummy contact hack" in HubSpot)
- **S-14**: Disqualify landlord lead with mandatory reason capture
- **S-18**: Landlord Relationship Management — structured RM approach, not ticket-based

### CX pod (C-01 to C-16) — key ones
- **C-01**: Item-level ticket history dashboard — repair vs replace decision support
- **C-05**: Record all items going to/from a property on move-in
- **C-09**: PID/RID inspection checklist + deduction report on move-out
- **C-11**: Structured tenant ticketing system
- **C-12**: Post-ticket CSAT survey automation
- **C-14**: Auto-deduction of dues from security deposit
- **C-15**: End-to-end move-out automation flow

### Inventory pod (I-01 to I-03) — key ones
- **I-01**: Auto PO creation on vendor job approval
- **I-02**: Auto-update item states on move-in/out
- **I-03**: Payment dispatch on PO approval via IMS integration

### Finance pod (F-01 to F-04) — key ones
- **F-01**: Landlord payment processing with document verification
- **F-03**: Token deposit verification — onboarding form filled + bank details match
- **F-04**: Balance token deposit verification — agreements signed + bank details match

---

## The external tools Hawkeye integrates with

### Critical (cannot go live without)
- **Razorpay** — payment links and webhooks. Every payment flow in Demand and Finance runs through it. Webhooks trigger CRM state changes (token paid → lead promoted, etc.)
- **WhatsApp (via Superchat BSP)** — all tenant-facing communications. Move-in messages, payment reminders, TKBM (Things to Know Before Move-in), lockbox code release, utility notifications
- **Cal.com** — visit scheduling. Booking events trigger deal stage changes. Outcome recording (no-show, done, rescheduled) drives follow-up automations

### Important (needed within first sprint)
- **Slack** — internal team notifications. New lead alerts, payment confirmations, move-in day missing-item alerts
- **Meta CAPI** — server-side conversion events for visit bookings. Requires SHA-256 hashing of PII. Has a gate flag that must reset on re-engagement
- **Google Ads** — lead capture. gclid captured at first touch and locked

### Migration targets (being deprecated)
- **Typeform** — tenant and landlord onboarding forms. Being replaced by native CRM forms
- **HubSpot** — current tenant CRM. Being fully replaced by Hawkeye
- **Google Sheets + Make** — rent tracking and various automations. Being migrated to native CRM workflows

---

## Item lifecycle states — important for inventory screens

Every physical item (`ITEM`) goes through these states:

| State | Meaning |
|---|---|
| `BUY` | Ordered/purchased, not yet received |
| `WIB` | Warehouse In-Bound — received at warehouse |
| `WOB` | Warehouse Out-Bound — dispatched from warehouse to a property |
| `PIB` | Property In-Bound — installed and in use at a property |
| `POB` | Property Out-Bound — removed from property, in transit back |
| `WORK` | Under repair or maintenance |
| `DEAD` | Scrapped/written off |

An item's location field looks like `PID042-A` when in a property room or `WH01-R3` when in a warehouse rack.

---

## Tenant lifecycle stages — the single source of truth

The `tenant_lifecycle` field on Tenant is THE source of truth for where a tenant is in the funnel. It replaced 5 overlapping fields in HubSpot. Never manually edited — every transition is triggered by a system event.

```
New Inquiry
  → Visit Scheduled    (trigger: Cal.com booking created with title "Flent - Home Visit")
  → Visit Done         (trigger: meeting status updated to completed)
  → Negotiation        (trigger: ops manual update)
  → Converted          (trigger: token payment confirmed by Razorpay)
  → Gestation          (trigger: 6 hours after move-in date)
  → Moved In           (trigger: all payments confirmed + move-in date reached)
  → Notice Period      (trigger: move-out notice submitted)
  → Moved Out          (trigger: move-out process completed)
  → Dead Lead          (trigger: manual disqualification)
```

---

## PID types — lead vs active vs churned

Every PID (property) has a `type` field:
- **lead** — property being prospected, not yet under contract
- **active** — property currently managed by Flent with a live merchant contract
- **churned** — property that was previously managed but is no longer

The detail page for a PID shows different fields depending on its type. Lead stage fields (PPID, Deal Stage, Expected Rent, etc.) are relevant for `lead` type. Active fields (full address, overheads, RIDs, tenant contracts) are relevant for `active` type. Churned adds Deposit Refunded and Exit Cost OPX.

---

## Contract types

**Tenant Contract** — between Flent and a tenant for occupancy of a specific RID. Has payment lifecycle (Token Paid → FMR Paid → SD Paid → All Payments Done) and agreement lifecycle (L&L Signed → C&S Signed → All Agreements Signed). Has deductions for move-out settlement.

**Merchant Contract** — between Flent and a landlord for management of a PID. Has base rent (which may have hike schedule), management fee, security deposit, and increment terms. Two sub-types: L&L (Leave and License) and Authorisation.

---

## Key business rules encoded in the UI

These rules drive conditional logic in forms and display logic in dashboards:

1. **Rent escalation**: Fine of ₹2,000 applies from the 5th of the month if rent unpaid. Eviction proceedings can begin from the 15th.
2. **Payment links**: FMR + SD payment links sent 2 days before move-in, or same day if move-in is urgent.
3. **Lockbox code**: Released only after security deposit confirmed. Zero manual releases.
4. **TKBM**: Sent 2 days before move-in if deposit is paid.
5. **Renewal trigger**: Starts when move-out date is within ~60 days. Three branches: Yes (renewal flow), No (move-out flow), No Response (follow-up, then call).
6. **BGV gate**: BGV must pass before move-in is allowed.
7. **Token deposit verification**: Finance checklist must be complete — onboarding form filled AND bank details match — before token is released.
8. **PO approval**: Payment only dispatched after PO approved in IMS. Finance dual-control required.
9. **Item repair-vs-replace**: If repair cost > 70% of purchase price, recommend Replace. 30–70% → Monitor. < 30% → Repair.
10. **Attribution lock**: First-touch source (channel, UTMs, gclid, fbclid) captured at lead creation and never overwritten on re-engagement.

---

## The screens being built

Hawkeye has these screen categories:

| Category | Count | Examples |
|---|---|---|
| Entity List screens | 11 | Tenant List, PID List, Ticket List, Items List |
| Entity Detail screens | 11 | Tenant Detail, PID Detail, Item Detail, Contract Detail |
| Pipeline / Board screens | 3 | Demand Pipeline (kanban), Supply Pipeline (kanban), Resolution Board (kanban) |
| Dashboard screens | 2 | Demand Dashboard, Rent Dashboard |
| Workflow / Form screens | 10 | Tenant Onboarding, Landlord Onboarding, Inspection Checklist, SD Settlement, PO Approval Queue |
| Utility screens | 1 | CSAT/NPS Survey |

Every detail screen has a **History tab** showing a chronological trail of all events for that record. Cross-entity references (tenant → contract → transaction → PID → room → item) are all clickable. Transactions open in a slide-in drawer. Items open in a slide-in drawer. Everything navigates to the right place.

---

## Technical constraints

- Built inside Twenty CRM — must match Twenty's visual design exactly
- Uses `styled-components` with emotion and Twenty's theme tokens (no Tailwind)
- Uses Twenty's actual component library: `Tag`, `Chip`, `EntityChip`, `Button`, `TextInput`, `Toggle`, `Select`, `AnimatedCheckmark`, `MenuItem` etc.
- State via Jotai atoms for shared state, React `useState` for local
- All data is mock data in `/src/mock/` — no API calls
- Icons from `@tabler/icons-react` only
- All amounts in Indian number format: ₹1,25,000
- All dates: DD MMM YYYY

---

## What "done" looks like

A screen is done when:
1. Every field from the taxonomy is present and correctly rendered
2. Every cross-entity reference is a clickable link to the correct destination
3. The History tab has realistic, sequential mock entries
4. Status Tags use the correct color mapping
5. File fields render as document buttons, not broken images
6. The screen looks indistinguishable from a native Twenty CRM screen

---

*This context document should be kept open in your editor while building. Every screen decision should be traceable back to a business rule, a data field, or a relationship described here.*
