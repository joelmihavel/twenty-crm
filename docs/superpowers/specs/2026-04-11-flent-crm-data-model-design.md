# Flent Property Management CRM — Data Model Design

**Date:** 2026-04-11
**Version:** 2.0
**Status:** Approved
**Database:** PostgreSQL 16
**Pattern:** Shared Base + Extension Tables
**Source:** [Big Data Fix — Taxonomy v2 (Structured)](https://docs.google.com/spreadsheets/d/11bB8tK8PLTU2-OLUOTLT5q3dChczPBKGkrBMog-Vsfk/edit?usp=sharing) + PO SQL schema

## Overview

Custom data model for Flent's property management CRM built on Twenty. Replaces existing Twenty workspace entities entirely with Flent-specific objects.

- **11 objects** + Team (retained from Twenty)
- **53 tables** (11 base + 41 extensions + 1 child)
- **465 columns** (390 from sheets + 75 model fields: FKs, PKs, discriminators, audit fixes)
- **28 audit fixes** applied from 5-agent audit + founders panel review

## Architecture Principles

1. **Shared Base + Extension Tables** — every object has a base table (core identity + cross-object FKs). Extension tables hold group-specific, lifecycle-specific, or sub-type-specific fields. All FKs from other objects point to base tables only.

2. **Denormalized fields as real columns** — high-frequency lookups (`current_pid`, `current_tenant_name`) stored and updated by triggers/workflows.

3. **Pragmatic extension splits:**
   - Sub-types: Contract (Tenant/Merchant), Ticket (Tenant/Vendor), Merchant (Landlord/POC/Broker/Management)
   - Lifecycle phases: PID (Lead/Active/Churned)
   - Field groups: Tenant (attribution, requirements, qualification, visits, satisfaction)
   - Category types: Overheads (8 categories)

4. **JSONB for schedules** — `base_rent` on Merchant Contract stores rent hike schedule as JSONB.

5. **PO as Transaction type** — Purchase Orders extend Transaction base with PO-specific fields and `po_lines` child table.

6. **Explicit FK dropdowns on Transaction** — no polymorphic `contact_id`. Separate `tenant_id`, `merchant_id`, `vendor_code`, `overhead_id` FK fields (Manual dropdown selection).

## Object Inventory

| # | Object | Tables | Sheet Fields | Model Fields | Sub-types / Split |
|---|--------|--------|-------------|-------------|-------------------|
| 1 | Tenant | 6 | 61 | 68 | Field groups |
| 2 | PID (Property) | 4 | 52 | 56 | Lifecycle phases |
| 3 | RID (Room) | 5 | 17 | 20 | Field groups |
| 4 | Contract | 3 | 45 | 54 | Tenant / Merchant sub-types |
| 5 | Transaction | 8 | 25 | 56 | Type discriminator + PO extension |
| 6 | Ticket | 3 | 33 | 37 | Tenant / Vendor sub-types |
| 7 | Merchant | 5 | 32 | 33 | Landlord / POC / Broker / Management |
| 8 | Vendor | 5 | 27 | 29 | Field groups |
| 9 | Overheads | 9 | 64 | 72 | 8 category extensions |
| 10 | FSIN | 2 | 17 | 19 | Identification / Specification |
| 11 | Item | 4 | 17 | 21 | State / Transaction links |
| 12 | Team | — | — | — | Retained from Twenty |
| **Total** | | **53** | **390** | **465** | |

## Cross-Object Relationships

### Relationship Map

```
                                    MERCHANT
                                       |
                     +-----------------+------------------+
                     v                 v                  v
              CONTRACTS  <----->  PROPERTY (PID)  <-----> TRANSACTIONS
              (base)                   |                      |
                 |                     |                      |
    +------------+                     v                      |
    v            v              ROOM (RID)                    |
 TENANT      MERCHANT                 |                      |
 CONTRACT    CONTRACT                 v                      |
 DETAILS     DETAILS          TICKETS (base) <---------------+
                                 |         |
                                 v         v
                             TENANT    VENDOR
                             TICKET    TICKET
                             DETAILS   DETAILS

         VENDOR <----> FSIN <----> ITEM
            |                       |
            v                       v
         TXN (PO ext)          PO_LINES

         OVERHEADS --> 8 category extensions
              |
              v
         PROPERTY (PID)
```

### FK Reference Map (25 relationships)

| From | Column | To | Column | Type |
|------|--------|----|--------|------|
| rooms | pid | properties | pid | VARCHAR |
| contracts | pid | properties | pid | VARCHAR |
| contracts | rid | rooms | rid | VARCHAR |
| tenant_contract_details | tenant_id | tenants | record_id | UUID |
| tenant_contract_details | rid | rooms | rid | VARCHAR |
| merchant_contract_details | merchant_id | merchants | record_id | UUID |
| tenants | current_pid | properties | pid | VARCHAR |
| tenants | current_rid | rooms | rid | VARCHAR |
| rooms (availability) | current_contract_id | contracts | contract_uid | UUID |
| properties | merchant_id | merchants | record_id | UUID |
| transaction_links | contract_uid | contracts | contract_uid | UUID |
| transaction_links | tenant_id | tenants | record_id | UUID |
| transaction_links | merchant_id | merchants | record_id | UUID |
| transaction_links | vendor_code | vendors | vendor_code | VARCHAR |
| transaction_links | overhead_id | overheads | overhead_id | UUID |
| transaction_links | ticket_id | tickets | ticket_id | INTEGER |
| transaction_links | pid | properties | pid | VARCHAR |
| transaction_links | rid | rooms | rid | VARCHAR |
| tickets | pid | properties | pid | VARCHAR |
| tickets | assigned_vendor | vendors | vendor_code | VARCHAR |
| tickets | transaction_id | transactions | utn | VARCHAR |
| overheads | pid | properties | pid | VARCHAR |
| overheads | merchant_id | merchants | record_id | UUID |
| fsins | vendor_code | vendors | vendor_code | VARCHAR |
| items | fsin_code | fsins | fsin_code | VARCHAR |
| po_lines | fsin_code | fsins | fsin_code | VARCHAR |
| transaction_purchase_order | vendor_code | vendors | vendor_code | VARCHAR |

## Table Definitions

> Full field-level definitions with types, nullability, input methods, and notes are in the companion PDF:
> `docs/superpowers/specs/data-model-architecture-v2.pdf`

### 1. Tenant (6 tables)

- **`tenants`** (base, 21 cols) — identity, lifecycle, denormalized PID/RID
- **`tenant_attribution`** (ext, 13 cols) — first-touch tracking, UTMs, channels
- **`tenant_requirements`** (ext, 11 cols) — preferences, budget, micromarkets
- **`tenant_qualification`** (ext, 7 cols) — qualification status, BGV, disqualification
- **`tenant_visit_summary`** (ext, 7 cols) — visit counts, dates, feedback
- **`tenant_satisfaction`** (ext, 7 cols) — CSAT, NPS, ratings

### 2. PID / Property (4 tables)

- **`properties`** (base, 7 cols) — pid, lifecycle_status, merchant_id, cluster, owners
- **`property_lead_stage`** (ext, 16 cols) — prospect tracking, deal pipeline
- **`property_active`** (ext, 31 cols) — address, amenities, fixtures, building context, deadlines
- **`property_churned`** (ext, 4 cols) — deposit refund, exit costs, churn date

### 3. RID / Room (5 tables)

- **`rooms`** (base, 2 cols) — rid, pid FK
- **`room_specifications`** (ext, 3 cols) — bathroom, balcony
- **`room_furnishing`** (ext, 8 cols) — bed, AC, study table, annexure
- **`room_commercials`** (ext, 3 cols) — base rent, maintenance fee
- **`room_availability`** (ext, 5 cols) — status, current contract/tenant, available date

### 4. Contract (3 tables)

- **`contracts`** (base, 11 cols) — uid, type, pid, dates, terms, lock-in, agreement PDF
- **`tenant_contract_details`** (ext, 25 cols) — tenant FK, RID, rent breakdown, deposits, deductions, lifecycle
- **`merchant_contract_details`** (ext, 16 cols) — merchant FK, base_rent (JSONB), increments, COGS, payment cycle

### 5. Transaction (8 tables)

- **`transactions`** (base, 11 cols) — utn, type, credit/debit, amount, status, audit
- **`transaction_classification`** (ext, 3 cols) — purpose categories
- **`transaction_parties`** (ext, 7 cols) — from/to party, types, info
- **`transaction_payment`** (ext, 4 cols) — channel, provider, gateway ref
- **`transaction_line_items`** (ext, 4 cols) — period, cost center, description
- **`transaction_links`** (ext, 9 cols) — tenant_id, merchant_id, vendor_code, overhead_id, ticket_id, contract_uid, pid, rid
- **`transaction_purchase_order`** (ext, 15 cols) — PO-specific: po_number, vendor, amounts, status
- **`po_lines`** (child, 10 cols) — line items: FSIN, qty, price. Trigger creates Items on PO completion.

### 6. Ticket (3 tables)

- **`tickets`** (base, 15 cols) — pipeline, category, status, priority, parties, vendor assignment
- **`tenant_ticket_details`** (ext, 16 cols) — name, RID, phase, flag, cost, SLA, CSAT
- **`vendor_ticket_details`** (ext, 4 cols) — notes, response/close time

### 7. Merchant (5 tables)

- **`merchants`** (base, 13 cols) — identity, contact, type discriminator, timestamps
- **`merchant_landlord`** (ext, 19 cols) — KYC, payment details, address, psychographics
- **`merchant_poc`** (ext, TBD) — POC-specific fields
- **`merchant_broker`** (ext, TBD) — broker-specific fields
- **`merchant_management`** (ext, TBD) — building management-specific fields

### 8. Vendor (5 tables)

- **`vendors`** (base, 6 cols) — code, name, type, status, timestamps
- **`vendor_contact`** (ext, 7 cols) — contact details
- **`vendor_billing`** (ext, 9 cols) — GST, PAN, bank details, MSME
- **`vendor_capability`** (ext, 5 cols) — specialization, TAT, customization
- **`vendor_commercials`** (ext, 5 cols) — tier, terms, min order

### 9. Overheads (9 tables)

- **`overheads`** (base, 11 cols) — overhead_id, pid, merchant_id, category, frequency, timestamps
- **`overhead_maintenance`** (ext, 6 cols)
- **`overhead_wifi`** (ext, 13 cols) — includes wifi_pay_to_ll fix
- **`overhead_electricity`** (ext, 8 cols)
- **`overhead_dg`** (ext, 9 cols)
- **`overhead_water`** (ext, 7 cols)
- **`overhead_water_purifier`** (ext, 6 cols)
- **`overhead_gas`** (ext, 7 cols)
- **`overhead_helper`** (ext, 9 cols) — deduped from sheet

### 10. FSIN (2 tables)

- **`fsins`** (base, 12 cols) — code, vendor FK, name, category, UOM, image, depreciation, status
- **`fsin_specification`** (ext, 7 cols) — dimensions, material, finish, color, style

### 11. Item (4 tables)

- **`items`** (base, 7 cols) — code, FSIN FK, PO line FK, price, gst_percent
- **`item_state`** (ext, 11 cols) — lock, location, state machine, snapshots, QA
- **`item_transaction_links`** (ext, 3 cols) — bill_document_id, txn_no

## PO → Item Creation Flow

1. Create PO transaction (type=PurchaseOrder, status=Draft)
2. Add po_lines (FSIN + qty + price per line)
3. Record advance payment (separate transaction, linked via txn_id_advance)
4. PO status → Completed triggers `trg_create_items_on_po_completed`
5. For each po_line: create `qty` Item records (state=BUY, unit_price from line)
6. Record remaining payment (linked via txn_id_remaining)

## Derived / Denormalized Fields

| Field | Table | Source | Updated By |
|-------|-------|--------|------------|
| current_pid | tenants | contracts.pid | Workflow on move-in |
| current_rid | tenants | contracts.rid | Workflow on move-in/transfer |
| current_contract_id | room_availability | contracts.contract_uid | Workflow on activation |
| current_tenant_name | room_availability | contracts → tenant name | Workflow |
| party_name_tenant | tenant_contract_details | tenants.first_name + last_name | On link |
| party_name_merchant | merchant_contract_details | merchants.first_name + last_name | On link (landlord only) |
| lock_in_end_date | contracts | start + lock_in months | Auto-calculated |
| effective_retail_rent | tenant_contract_details | total - discount | Auto-calculated |
| total_deductions | tenant_contract_details | damages + society_fees + penalty | Auto-calculated |
| nps_category | tenant_satisfaction | last_nps_score | Auto-calculated |
| total_cogs | merchant_contract_details | base_rent + overheads | Derived |
| vendor_name | transaction_purchase_order | vendors.vendor_name | On link |
| unit_price | items | po_lines.unit_price | On creation (immutable) |
| gst_percent | items | PO.gst_rate | On creation (immutable) |

## Audit Fixes Applied (v2)

28 fixes from 5-agent audit covering all 11 sheets:

- 6 phantom fields resolved (derived sources → actual field rows)
- 7 missing FKs added (contracts.pid/tenant_id/merchant_id, transaction_links restructured)
- 3 data type mismatches fixed (INTEGER→VARCHAR for pid FKs)
- 3 missing status fields added (vendor, FSIN, transaction)
- 2 missing lifecycle dates added (PID activation_date, churn_date)
- 2 missing PKs/timestamps added (overheads overhead_id, created_at/updated_at)
- 1 missing flag added (wifi_pay_to_ll)
- 2 logic fixes (total_cogs derivation, cost_paid_by_flent on tickets)
- 1 type fix (contract_acquisition_cost_paid_to: number→string)
- 1 data quality fix (helper field dedup in overheads)

## Companion Files

- **PDF with full field-level definitions:** `data-model-architecture-v2.pdf`
- **HTML source:** `data-model-architecture-v2.html`
- **v1 (pre-audit):** `data-model-architecture.pdf` / `.html`
