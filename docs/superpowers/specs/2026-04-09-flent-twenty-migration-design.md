# Flent Twenty CRM: Migration Design Spec

**Date**: 2026-04-09
**Company**: Flent (Portal 45469632) — Property & co-living management, Bangalore
**Team**: 40 members
**Approach**: GCP-Native Maximum (Approach A)
**GCP Project**: `flent-twenty-prod` | Region: `asia-south1` (Mumbai)

---

## 1. Architecture Overview

Single GCP project housing all infrastructure. No n8n — all automation via Cloud Functions + Cloud Pub/Sub + Cloud Workflows. Vertex AI for agentic layer. Metabase for embedded dashboards.

```
                         Internet
                            |
                     Cloud CDN + LB (managed SSL)
                            |
                    ┌───────┴────────┐
                    │  GKE Cluster   │
                    │                │
                    │ [twenty-server x3] ──┐
                    │ [twenty-worker x2]   │── Cloud SQL Auth Proxy (sidecar)
                    │ [pgbouncer sidecar]  │        |
                    │ [metabase x1]  ──────┘   Cloud SQL PG16 (HA)
                    │                           + read replica (Metabase)
                    └────────────────┘              |
                            |                  Memorystore Redis 5GB
              ┌─────────────┼─────────────┐
              │             │             │
        Cloud Functions  Pub/Sub    Cloud Workflows
        (webhooks)      (event bus)  (orchestration)
              │             │             │
    ┌─────────┼─────┐      │      ┌──────┼──────┐
    │    │    │  │  │      │      │      │      │
   HS  Zoho Cal Resend    │   tenant  agreement
  mirror Sign .com  │     │   onboard lifecycle
                   data    │
                  validator│
                           │
              ┌────────────┼────────────┐
              │            │            │
        Vertex AI     Secret Mgr    DLQ Topics
        Agents        (all secrets)  (dead letters)

GCP Services:
  Cloud Functions (2nd gen, asia-south1):
    - hubspot-mirror         (hourly sync)
    - zoho-sign-callback     (agreement events)
    - calcom-webhook         (booking events)
    - resend-webhook         (email delivery status)
    - data-validator         (phone/Aadhaar/PAN validation on writes)

  Cloud Pub/Sub:
    - topic: crm-events      (Twenty webhook -> fan-out)
    - topic: agreement-events
    - topic: mirror-events
    - topic: crm-events-dlq       (dead letter for failed crm-events)
    - topic: agreement-events-dlq (dead letter for failed agreement events)
    - topic: mirror-events-dlq    (dead letter for failed mirror events)

  Cloud Scheduler:
    - hourly-hubspot-mirror
    - daily-lease-expiry-check

  Cloud Workflows:
    - tenant-onboarding      (reserve -> token -> agreement -> move-in)
    - agreement-lifecycle    (create -> send -> track -> store signed copy)

  Secret Manager:
    - hubspot-api-key, zoho-sign-api-key, cashfree-credentials
    - resend-api-key, twenty-api-key, metabase-embedding-secret

  Vertex AI Agent Builder:
    - ops-assistant          (NL queries over CRM data)
    - tenant-qualifier       (lead scoring from pipeline data)

  Cloud SQL Read Replica:
    - Dedicated for Metabase queries (zero impact on CRM performance)

  Cloud Monitoring + Cloud Logging (unified observability)
```

---

## 2. Infrastructure Specifications

### GKE Cluster: `flent-twenty`

| Component | Spec | Notes |
|-----------|------|-------|
| Cluster type | GKE Standard, multi-zone | asia-south1-a, asia-south1-b |
| Server node pool | 3x `e2-standard-4` (4 vCPU, 16GB) | Twenty server pods |
| Worker node pool | 2x `e2-standard-2` (Spot VMs) | BullMQ workers, fault-tolerant |
| Server pods | 3 replicas, HPA at CPU 70% | Handles 40 concurrent users |
| Worker pods | 2 replicas, HPA on queue depth | Background jobs |
| Cloud SQL Auth Proxy | Sidecar per server pod | Secure tunnel to Cloud SQL |
| PgBouncer | Sidecar per server pod | Transaction mode, 50 connections/pod (150 total < 400 max) |
| Ingress | GKE managed L7 + Cloud CDN | Managed SSL certificate |

### Cloud SQL: `flent-twenty-db`

| Parameter | Value |
|-----------|-------|
| Instance | `db-custom-8-32768` (8 vCPU, 32GB RAM) |
| Storage | 200GB SSD, auto-increase |
| HA | Regional (automatic failover) |
| Backups | Daily automated + continuous WAL (PITR) |
| `shared_buffers` | 8 GB |
| `effective_cache_size` | 24 GB |
| `work_mem` | 16 MB |
| `max_connections` | 400 |
| `random_page_cost` | 1.1 |
| `max_parallel_workers_per_gather` | 4 |
| `default_statistics_target` | 200 |

### Twenty Server Configuration

```env
SERVER_URL=https://crm.flent.in
APP_SECRET=<generated-64-char>
PG_DATABASE_URL=postgres://twenty:***@/twenty?host=/cloudsql/flent-twenty-prod:asia-south1:flent-twenty-db
REDIS_URL=redis://<memorystore-ip>:6379
NODE_OPTIONS="--max-old-space-size=8192"
PG_DATABASE_PRIMARY_TIMEOUT_MS=5000
PG_POOL_MAX_CONNECTIONS=50
PG_POOL_IDLE_TIMEOUT_MS=300000
API_RATE_LIMITING_SHORT_LIMIT=500
API_RATE_LIMITING_LONG_LIMIT=2000
STORAGE_TYPE=s3
STORAGE_S3_REGION=asia-south1
STORAGE_S3_NAME=flent-twenty-files
STORAGE_S3_ENDPOINT=https://storage.googleapis.com
EMAIL_DRIVER=resend
EMAIL_FROM_ADDRESS=crm@flent.in
AUTH_GOOGLE_ENABLED=true
MESSAGING_PROVIDER_GMAIL_ENABLED=true
CALENDAR_PROVIDER_GOOGLE_ENABLED=true
SENTRY_ENVIRONMENT=production
```

### Cost Estimate (40 users, asia-south1)

| Service | Spec | Monthly |
|---------|------|---------|
| GKE Standard | Mgmt + 3x e2-standard-4 + 2x e2-standard-2 Spot | ~$294 |
| Cloud SQL | db-custom-8-32768, HA, 200GB SSD | ~$500 |
| Memorystore | Standard 5GB | ~$250 |
| Cloud CDN + LB | Frontend caching, managed cert | ~$30 |
| Cloud Functions | ~100K invocations/mo | ~$5 |
| Cloud Pub/Sub + Workflows + Scheduler | Messaging + orchestration | ~$8 |
| Vertex AI | Agent calls ~10K/mo | ~$50 |
| GCS | 200GB | ~$4 |
| Monitoring/Logging | Standard tier | ~$30 |
| Metabase pod (GKE) | 1x e2-standard-2 | ~$50 |
| Cloud SQL read replica | db-custom-2-8192 (Metabase) | ~$100 |
| Cloud SQL staging | db-f1-micro (staging env) | ~$15 |
| Secret Manager | ~20 secrets | ~$1 |
| **Total** | | **~$1,337/mo** |

---

## 3. Data Model (7 Objects)

### Object Relationship Map

```
People (standard)
  ├── Tenant (custom) -------- 1:1 (one tenant profile per person)
  ├── Landlord (custom) ------ 1:1 (one landlord profile per person)
  │
  └── Opportunity (standard) - 1:many

Property (custom)
  └── Room (custom) ---------- 1:many

Contract (custom) -- THE RELATIONSHIP RESOLVER
  ├── Tenant ---- many:1  (a tenant can have many contracts over time)
  ├── Landlord -- many:1  (a landlord can have many contracts across properties)
  ├── Property -- many:1  (a property can have many contracts)
  └── Room ------ many:1  (a room can have many contracts over time)
  
  Contract resolves all many-to-many relationships:
  - Property has multiple landlords? -> Multiple Landlord Agreement contracts
  - Landlord owns multiple properties? -> Multiple contracts, one per property
  - Property has multiple tenants? -> Multiple Tenant Agreement contracts (co-living)
  - Tenant moves between properties? -> Old contract terminated, new contract created

Ticket (custom)
  ├── Property -- many:1
  ├── Tenant ---- many:1
  └── Landlord -- many:1

Opportunity (standard)
  ├── People ---- many:1
  ├── Property -- many:1
  └── Room ------ many:1
```

### 3.1 People (Standard — Extended)

Twenty's built-in People object. Shared identity for all human contacts.

| Field | Type | Notes |
|-------|------|-------|
| First Name | Text | Standard |
| Last Name | Text | Standard |
| Email | Email | Standard — primary email |
| Phone | Phone | Standard — primary phone |
| City | Text | Standard |
| Role | Multi-select | Tenant / Landlord / Lead / POC |
| Aadhar Number | Text | Indian national ID |
| PAN Card | Text | Pattern: ABCDE1234F |
| Country Code | Text | Default: 91 |
| Lead Source | Select | Organic-website / Facebook / Instagram / LinkedIn / Friends and Family / Intercom / Google Search / NoBroker / MyGate |
| Lead Sub-Source | Text | UTM details, campaign reference |
| HubSpot Record ID | Text | For mirroring — maps to HS contact ID |

### 3.2 Tenant (Custom, linked to People)

One record per person who is a tenant. A tenant who moves between properties has ONE Tenant record — the property history is tracked via Contract objects (type: Tenant Agreement). Current property/room are denormalized here for quick access.

| Field | Type | Source (HubSpot) |
|-------|------|-----------------|
| Person | Relation -> People | Core identity link |
| Property | Relation -> Property | Current/assigned property |
| Room | Relation -> Room | Current room (RID format: "12BR2") |
| Contract | Relation -> Contract | Active lease |
| HubSpot Record ID | Text | Mirror reference |
| CX Owner | Relation -> Workspace Member | CX team member managing this tenant |
| Sales Owner | Relation -> Workspace Member | Sales rep who converted this tenant |
| Customer Status | Select: Active / Churned / Lead / Gestation / Move-out Initiated | `customer_status` |
| Tenant Lifecycle | Select: Token Pending / Token Received / FMR+Deposit Pending / FMR+Deposit Completed / Agreement Pending / Agreement Signed / Move In Pending / Move In Blocked / Inventory Check Pending / Inventory Check Completed | `tenant_lifecycle` |
| Reserve Status | Select: Form Filled / Paid / High Intent / Thinking / Low Intent / No Response / Location Unserviceable / Refunded / Not Interested / Dropped | `reserve_status` |
| Monthly Rent | Currency | `tenant_monthly_rent` |
| Base Rent | Currency | `tenant_base_rent` |
| Maintenance Amount | Currency | `monthly_maintenance` |
| Convenience Fee | Currency | `convenience_fee` |
| Platform Fee | Currency | `platform_fee` |
| GST | Currency | `tenant_gst` |
| Furnishing Rental | Currency | `furnishing_rental` |
| Rent Due | Currency | Computed: total owed this cycle |
| Rent Status | Select: Paid / Pending / Overdue | `rent_status` |
| First Month Rent | Currency | `first_month_rent` |
| Move-in Date | Date | `move_in_date` |
| Move-out Date | Date | `move_out_date` |
| Preferred Areas | Multi-select: HSR Layout / Koramangala / Bellandur-Sarjapura / Indiranagar / Whitefield / Ulsoor-MG Road | `preferred_area` |
| Budget | Currency | Budget preference |
| Food Preference | Select: Veg / Non-veg / Eggetarian / No Preference | `food_preference` |
| Smoking | Select: Yes / No / Occasionally | |
| Pet Preference | Select: Yes / No | |
| NPS Score | Number | |
| Rental Link | Link | Cashfree payment link URL |
| CF Order ID | Text | Cashfree order reference |
| CF Link ID | Text | Cashfree link ID |

### 3.3 Landlord (Custom, linked to People)

One record per person who is a landlord. A landlord owning 3 properties has ONE Landlord record — the properties are linked via Contract objects (type: Landlord Agreement).

| Field | Type | Source (BHG) |
|-------|------|-------------|
| Person | Relation -> People | Core identity link |
| HubSpot Record ID | Text | Mirror reference |
| Sales Owner | Relation -> Workspace Member | Sales rep managing this landlord relationship |
| Landlord Status | Select: Active / Churned / Lead / Onboarding | `landlord_status` |
| Cashfree Vendor ID | Text | Format: `{record_id}_landlord` |
| Vendor Status | Select: ACTIVE / BLOCKED / PENDING | From Cashfree API |
| PAN Card | Text | For TDS purposes |
| Bank Account Number | Text | Encrypted |
| IFSC Code | Text | |
| Account Holder Name | Text | |
| Account Type | Select: Individual / Business | |
| Penny Drop Status | Select: Success / Failed / Pending | Bank verification |
| Priority | Number | Payout priority ranking |
| Payment Control | Select: Completed / Hold / Pending | |
| Last Cashfree Sync | Date | |

**Per-property financial terms** (license fee, TDS, settlement day/cycle, maintenance-to-landlord, units) live on the **Contract** object, not on Landlord — because they vary per property.

### 3.4 Property (Custom)

Physical property. Includes utility details as field groups (not separate object).

| Field | Type | Source |
|-------|------|--------|
| PID | Text (required) | Primary identifier: "PID1", "PID18" |
| Property Name | Text | Building/society name |
| Building Name | Text | |
| Address | Address | Full property address |
| Area | Select: HSR Layout / Koramangala / Bellandur-Sarjapura / Indiranagar / Whitefield / Ulsoor-MG Road / Marathahalli / Electronic City | `area_name` |
| Cluster | Text | Geographic cluster |
| Map Link | Link | Google Maps URL |
| Property Type | Select: Gated Society / Standalone Apartment / Independent Residence / Villa / PG / Co-living / Commercial / Mixed Use | `property_type` |
| Grade | Select: T0 / T1 / T2 / T3 | Property quality tier |
| Units | Number | Total rooms/units |
| Floors | Number | |
| Washrooms | Number | |
| Furnishings | Text | Description |
| Monthly License Fee | Currency | Total rent payable to landlord |
| Maintenance Fee | Currency | Monthly maintenance |
| Rent Cycle | Select: Monthly / Quarterly | |
| Maintenance Cycle | Select: Monthly / Quarterly | |
| TDS Deduction | Boolean | |
| Sales Owner | Relation -> Workspace Member | Sales rep who acquired this property |
| Source | Select: MyGate / NoBroker / WhatsApp Group / Security Guard / Referral / OLX / Direct | `source` |
| Gallery Link | Link | Photo gallery URL |
| Lock Box Installed | Boolean | |
| Lock Box Code | Text | |
| Parking Info | Text | |
| — Electricity Provider | Text | BESCOM etc. |
| — Electricity Account ID | Text | |
| — Electricity User ID | Text | Portal login |
| — Gas Provider | Text | |
| — Gas ID | Text | |
| — Water Source | Text | |
| — Water Provider | Text | |
| — WiFi ISP | Text | ACT, Airtel, etc. |
| — WiFi Account ID | Text | |
| — WiFi SSID | Text | |
| — WiFi Password | Text | |
| — WiFi Plan | Text | |
| HubSpot Record ID | Text | Mirror reference |

### 3.5 Room (Custom, linked to Property)

Individual unit within a property. Maps to HubSpot Room ID object.

| Field | Type | Source |
|-------|------|--------|
| Room ID | Text (required) | Format: "12BR2", "09BR3" |
| Property | Relation -> Property | Parent property |
| 3-Month Lock-in Rent | Currency | |
| 6-Month Lock-in Rent | Currency | |
| 11-Month Lock-in Rent | Currency | |
| No Lock-in Rent | Currency | |
| Current Tenant | Relation -> Tenant | Who lives here now |
| Status | Select: Occupied / Vacant / Maintenance / Reserved | |

### 3.6 Contract (Custom)

Lease agreement. Includes Zoho Sign agreement fields directly.

| Field | Type | Source |
|-------|------|--------|
| Contract ID | Text | Primary reference |
| Contract UID | Text | System-generated unique ID |
| Contract Type | Select: Tenant Agreement / Landlord Agreement | `contract_type` |
| State | Select: Active / Renewed / Terminated / Upcoming / Didn't Move In / Room Change | `state` |
| Business Type | Select: Unfurnished / Fully Furnished / F4B / Partially Furnished | `business_type` |
| Person | Relation -> People | Party to contract |
| Tenant | Relation -> Tenant | If tenant contract |
| Landlord | Relation -> Landlord | If landlord contract |
| Property | Relation -> Property | |
| Room | Relation -> Room | |
| Start Date | Date | |
| End Date | Date | |
| Go-Live Date | Date | When rent billing starts |
| Lock-in End | Date | |
| Lock-in Plan | Select: 3 Months / 6 Months / 11 Months / No Lock-in | |
| Monthly License Fee | Currency | |
| Base Rent | Currency | |
| Security Deposit | Currency | |
| Platform Fees | Currency | |
| Convenience Fee | Currency | |
| GST | Currency | |
| TDS Amount | Currency | |
| Maintenance Amount | Currency | |
| Increment Percentage | Number | Annual rent increase % |
| Rental Cycle | Select: Monthly | |
| Short Term Flag | Boolean | |
| — Team Assignment — |
| Partner Success Manager | Relation -> Workspace Member | PSM for this landlord-property relationship (Landlord Agreements only) |
| — Landlord Financial Terms (for Landlord Agreement contracts) — |
| LF Settlement Day | Number | Day of month for landlord payout |
| LF Settlement Cycle | Select: Monthly / Quarterly | |
| Maintenance to Landlord | Boolean | Whether maintenance fee flows to landlord |
| TDS on License Fee | Currency | Tax deducted at source for this property |
| Number of Units | Number | Units covered by this contract |
| Monthly Payment Status | Select: Paid / Unpaid | Current month payout status |
| Water Charges Separate | Boolean | |
| Move-in Inspector | Text | |
| Move-in Status | Select | |
| Move-in Issues | Rich Text | |
| Move-out Inspector | Text | |
| Move-out Status | Select | |
| Deposit Settled | Boolean | |
| Settlement Amount | Currency | |
| — Agreement: Zoho Request ID | Text | Zoho Sign API reference |
| — Agreement: Status | Select: Draft / Sent / Viewed / Signed / Rejected / Expired | |
| — Agreement: Sent Date | Date | |
| — Agreement: Signed Date | Date | |
| — Agreement: Document URL | Link | Signed PDF in GCS |
| — Agreement: Licensee Name | Text | Tenant legal name |
| — Agreement: Licensor Name | Text | Landlord legal name |
| HubSpot Record ID | Text | Mirror reference |

### 3.7 Ticket (Custom)

Support and landlord pipeline tickets.

| Field | Type | Source |
|-------|------|--------|
| Ticket ID | Text | Auto-generated |
| Pipeline | Select: Support / Landlord | |
| Status | Select | Support: New Request / Waiting on Customer / Waiting on Vendor / Waiting on Landlord / Waiting on Product / Action Pending / Ready For Closure / Closed. Landlord: New / Waiting on Tenant / Waiting on Landlord / Waiting on Flent / External Dependency / Vendor Scheduled / Closed / Blocked |
| Category | Select: Plumbing / Electrical / HVAC / Structural / General / Pest Control / Cleaning / Appliance / Internet / Other | `ticket_category` |
| Property | Relation -> Property | |
| Tenant | Relation -> Tenant | Reporter or affected tenant |
| Landlord | Relation -> Landlord | Property owner (for landlord pipeline) |
| Priority | Select: Emergency / High / Medium / Low | |
| Cost | Currency | Repair/service cost |
| Cost Paid By | Select: Flent / Landlord / Tenant | |
| Resolution Notes | Rich Text | |
| Tenant Rating | Number (1-5) | CSAT after resolution |
| Scheduled On | Date | Service appointment |
| Time Slot | Text | |
| Flag | Select: Reasonable / Non-Reasonable / Subjective | `ticket_flag` |
| HubSpot Record ID | Text | Mirror reference |

### 3.8 Opportunity (Standard — Extended)

Twenty's built-in Opportunity object. Used for all sales pipelines.

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | Standard — deal name |
| Amount | Currency | Standard — deal value |
| Close Date | Date | Standard |
| Stage | Select | Pipeline-specific (see below) |
| Pipeline Type | Select: Reserve / Occupancy / F4B / Supply | Drives filtered views |
| Person | Relation -> People | The prospect |
| Property | Relation -> Property | Target property |
| Room | Relation -> Room | Target room |
| Budget Range | Currency | Prospect budget |
| Expected Move-in | Date | |
| Location Preference | Multi-select | Areas of interest |
| POC Name | Text | Point of contact |
| POC Phone | Phone | |
| Property Grade | Select: T1 / T2 / T3 | |
| Number of Units | Number | For supply deals |
| HubSpot Record ID | Text | Mirror reference |

**Pipeline Stages:**

| Pipeline | Stages |
|----------|--------|
| **Reserve** | Form Filled -> Payment Completed -> Qualified -> Options Shared -> Visits Scheduled -> Converted / Disqualified / Dropped / Refunded |
| **Occupancy** | Lead Qualified -> Visit Scheduled -> Visit Completed -> Negotiation -> Token Received -> Move in Done / Dropped / Disqualified |
| **F4B** | Reach-out Initiated -> Contact Made -> Meeting Scheduled -> No Decision -> Proposal Sent -> Negotiation Started -> Token Received -> Converted / Lost / Disqualified |
| **Supply** | New Lead -> Site Visit Scheduled -> Site Visit Done -> Documentation -> Onboarding -> Active / Dropped |

---

## 4. Integration Architecture

### 4.1 HubSpot Hourly Mirror

**Direction**: HubSpot -> Twenty (one-way until cutover)
**Trigger**: Cloud Scheduler -> Cloud Function every 60 minutes
**Logic**:
1. Read last sync timestamp from GCS checkpoint file
2. Query HubSpot Search API for records modified since checkpoint
3. For each changed record, map fields to Twenty schema
4. Upsert via Twenty GraphQL API (batch, 60 records/call)
5. Update checkpoint
6. Log sync stats to Cloud Logging

**Objects mirrored**: Contacts -> People + Tenant/Landlord, Deals -> Opportunity, Tickets -> Ticket, Contracts -> Contract, Property IDs -> Property, Room IDs -> Room

**Mirror stops**: When team fully migrates and cutover date is declared.

### 4.2 Zoho Sign (Agreement Lifecycle)

**Flow**:
```
Contract state -> "Agreement Pending"
  |
  v (Twenty webhook -> Pub/Sub -> Cloud Workflow)
Cloud Workflow: agreement-lifecycle
  1. Fetch contract + tenant + landlord data from Twenty API
  2. Call Zoho Sign API: create request from template
     - Populate: tenant name, landlord name, property address, rent, dates, terms
     - Add signers: tenant email, landlord email, flent@flent.in
  3. Update Contract: agreement_zoho_request_id, agreement_status = "Sent"
  4. Wait for callback
  
Zoho Sign callback -> Cloud Function (zoho-sign-callback)
  -> Publish to Pub/Sub (agreement-events)
  -> Cloud Workflow:
     On "Signed":
       - Download signed PDF via Zoho Sign API
       - Upload to GCS (flent-twenty-files/agreements/{contract_id}.pdf)
       - Update Contract: agreement_status = "Signed", agreement_signed_date, agreement_document_url
       - Update Contract state -> next lifecycle step
     On "Rejected":
       - Update Contract: agreement_status = "Rejected"
       - Create Task for ops team
     On "Expired":
       - Update Contract: agreement_status = "Expired"
       - Trigger re-send workflow
```

### 4.3 Cal.com (Visit Scheduling)

**Flow**:
```
Cal.com booking webhook -> Cloud Function (calcom-webhook)
  1. Parse booking data (name, email, phone, event type, datetime)
  2. Search Twenty People by email
  3. If not found: create People record + Tenant record (status: Lead)
  4. Create or update Opportunity:
     - Pipeline Type: Occupancy
     - Stage: "Visit Scheduled"
     - Close Date: booking datetime
  5. Create Task for property manager assigned to that area
```

### 4.4 Resend (Transactional Email)

**Configuration**:
```env
EMAIL_DRIVER=resend
RESEND_API_KEY=<key>
EMAIL_FROM_ADDRESS=crm@flent.in
EMAIL_FROM_NAME=Flent
```

**Use cases**:
- Lease renewal reminders (60/30/15 days before expiry)
- Rent due notifications (1st, 3rd, 5th of month)
- Move-in/out instructions
- Ticket status updates
- Agreement sent/signed confirmations

### 4.5 WhatsApp (Last Phase — via Galabox/Superchat)

**Placeholder**: Not built in initial phases. Architecture stub:
```
Twenty webhook (crm-events topic)
  -> Cloud Function (whatsapp-sender)
  -> Galabox/Superchat API
  -> Message delivery + read receipt logging back to Twenty
```

### 4.6 Event Bus (Cloud Pub/Sub)

All integrations communicate through Pub/Sub topics:

| Topic | Publishers | Subscribers |
|-------|-----------|-------------|
| `crm-events` | Twenty webhooks (record create/update/delete) | All Cloud Workflows that react to CRM changes |
| `agreement-events` | Zoho Sign callback function | Agreement lifecycle workflow |
| `mirror-events` | HubSpot mirror function | Logging, audit |

---

## 5. Vertex AI Agent Architecture

### 5.1 Ops Assistant

**Platform**: Vertex AI Agent Builder
**Grounding**: Twenty GraphQL API as a tool (read-only)
**Access**: Management team via Slack or embedded in Twenty
**Capabilities**:
- "What's our occupancy rate across all properties?"
- "Which tenants have overdue rent this month?"
- "Show revenue breakdown for March by property"
- "List all contracts expiring in the next 30 days"
- "How many supply deals are in pipeline?"

### 5.2 Tenant Qualifier

**Trigger**: Cloud Function on new Opportunity (Occupancy pipeline)
**Input**: Prospect data (budget, preferred area, employment, interaction history)
**Output**: Score 0-100 written to Opportunity record
**Model**: Gemini via Vertex AI with structured output

### 5.3 Payment Anomaly Detector (Phase 4)

Deferred until payment flows are built.

---

## 6. Permissions & RBAC Model (40 Users)

### 6.1 Role Definitions

| Role | Team | Count | Description |
|------|------|-------|-------------|
| **Admin** | Leadership | 2-3 | Full system access, settings, API keys, workflow management, data model changes |
| **Partner Success Manager** | Partner Success | 4-5 | Manages landlord relationships and property operations |
| **CX Associate** | Customer Experience | 5-8 | Manages tenant lifecycle, support tickets, move-in/out |
| **Leasing Agent** | Sales (Demand) | 5-8 | Converts leads to tenants via Reserve/Occupancy pipelines |
| **Supply Agent** | Sales (Supply) | 3-5 | Acquires new properties, manages Supply pipeline |
| **F4B Sales** | Sales (B2B) | 2-3 | Flent for Business corporate deals |
| **Maintenance** | Operations | 4-6 | Handles support tickets, property maintenance |
| **Finance** | Finance | 2-3 | Contract financials, payment reconciliation, landlord payouts |
| **Management** | Leadership | 3-4 | Read-only dashboards, reporting, oversight |

### 6.2 Object-Level Permissions

| Role | People | Tenant | Landlord | Property | Room | Contract | Ticket | Opportunity |
|------|--------|--------|----------|----------|------|----------|--------|-------------|
| **Admin** | Full | Full | Full | Full | Full | Full | Full | Full |
| **PSM** | See/Edit | See | See/Edit | See/Edit | See | See/Edit | See/Edit | See |
| **CX Associate** | See/Edit | See/Edit | See | See | See | See | See/Edit | See |
| **Leasing Agent** | See/Edit | See/Edit | See | See | See | See | See | See/Edit |
| **Supply Agent** | See/Edit | See | See/Edit | See/Edit | See/Edit | See | See | See/Edit |
| **F4B Sales** | See/Edit | No | See | See | See | See | No | See/Edit |
| **Maintenance** | See | See | See | See | See | No | See/Edit | No |
| **Finance** | See | See | See/Edit | See | See | See/Edit | See | See |
| **Management** | See | See | See | See | See | See | See | See |

### 6.3 Field-Level Permissions (Sensitive Fields)

| Field | Admin | PSM | CX | Sales | Maintenance | Finance | Management |
|-------|-------|-----|----|----|-------------|---------|------------|
| Aadhar Number (People) | Edit | See | See | No | No | See | No |
| PAN Card (People/Landlord) | Edit | See | No | No | No | See | No |
| Bank Account Number (Landlord) | Edit | No | No | No | No | See/Edit | No |
| IFSC Code (Landlord) | Edit | No | No | No | No | See/Edit | No |
| Cashfree Vendor ID (Landlord) | Edit | No | No | No | No | See | No |
| Monthly License Fee (Contract) | Edit | See | No | See | No | See/Edit | See |
| Security Deposit (Contract) | Edit | See | See | No | No | See/Edit | See |
| Rent Due (Tenant) | Edit | No | See | No | No | See/Edit | See |
| Ticket Cost (Ticket) | Edit | See | See | No | See | See/Edit | See |
| Lock Box Code (Property) | Edit | See | See | No | See | No | No |
| WiFi Password (Property) | Edit | See | See | No | See | No | No |

### 6.4 Settings Permissions

| Setting | Admin | PSM | CX | Sales | Maintenance | Finance | Management |
|---------|-------|-----|----|----|-------------|---------|------------|
| API Key Generation | Yes | No | No | No | No | No | No |
| Data Model Changes | Yes | No | No | No | No | No | No |
| Workflow Management | Yes | No | No | No | No | No | No |
| Role Assignment | Yes | No | No | No | No | No | No |
| Security Settings | Yes | No | No | No | No | No | No |
| Workspace Preferences | Yes | No | No | No | No | No | No |
| Import CSV | Yes | Yes | Yes | Yes | No | Yes | No |
| Export CSV | Yes | Yes | Yes | Yes | No | Yes | Yes |
| Send Email | Yes | Yes | Yes | Yes | No | Yes | No |

### 6.5 Default Views per Role

Each role's landing experience is their "My X" filtered view:

| Role | Default View | Filter |
|------|-------------|--------|
| **PSM** | My Landlord Contracts | Contract.psm = current_user AND type = Landlord Agreement |
| **CX Associate** | My Tenants | Tenant.cx_owner = current_user |
| **Leasing Agent** | My Opportunities | Opportunity.assignee = current_user AND pipeline = Occupancy/Reserve |
| **Supply Agent** | My Properties | Property.sales_owner = current_user |
| **F4B Sales** | F4B Pipeline | Opportunity.pipeline_type = F4B |
| **Maintenance** | Open Tickets | Ticket.status != Closed |
| **Finance** | Expiring Contracts | Contract.end_date <= today+60 AND state = Active |
| **Management** | Metabase Dashboard | External link to Metabase |

### 6.6 Row-Level Permissions (Available in v1.20 — Enterprise License)

Twenty v1.20 includes **full row-level permission predicates** in the codebase (`@license Enterprise`). This enables ownership-based record filtering per role.

**Types available** (from `twenty-shared/src/types/`):
- `RowLevelPermissionPredicate`: filter by field value with operands (IS, IS_NOT, CONTAINS, IS_EMPTY, etc.)
- `RelationPredicateValue`: supports `isCurrentWorkspaceMemberSelected` — "records assigned to me"
- `RowLevelPermissionPredicateGroup`: AND/OR grouping, nestable for complex rules
- All predicates are scoped to a `roleId`

**Configuration for Flent:**

| Role | Object | Rule | Predicate |
|------|--------|------|-----------|
| **CX Associate** | Tenant | See only my tenants | `cx_owner IS currentWorkspaceMember` |
| **CX Associate** | Ticket | See only my tenants' tickets | `tenant.cx_owner IS currentWorkspaceMember` |
| **PSM** | Contract (Landlord Agreement) | See only my contracts | `psm IS currentWorkspaceMember` |
| **PSM** | Landlord | See only landlords I manage | Via contract relation |
| **Leasing Agent** | Opportunity | See only my deals | `assignee IS currentWorkspaceMember` |
| **Supply Agent** | Property | See only my properties | `sales_owner IS currentWorkspaceMember` |
| **Supply Agent** | Landlord | See only my landlords | `sales_owner IS currentWorkspaceMember` |
| **F4B Sales** | Opportunity | See only F4B deals | `pipeline_type IS F4B` AND `assignee IS currentWorkspaceMember` |
| **Maintenance** | Ticket | See only open tickets | `status IS_NOT Closed` (no ownership filter — maintenance sees all open tickets) |
| **Finance** | All objects | See all records | No row-level restriction (needs full visibility for reconciliation) |
| **Management** | All objects | See all records | No row-level restriction |
| **Admin** | All objects | Full access | No restriction |

**Note**: This requires Enterprise license features. For self-hosted AGPL, these types exist in code but may need the Enterprise license flag enabled. Evaluate whether Twenty's commercial license ($19/user/mo = $760/mo for 40 users) is needed for row-level permissions, or whether the AGPL codebase includes the enforcement layer.

---

## 7. Views Configuration

| View Name | Object | Filter | Used By |
|-----------|--------|--------|---------|
| Active Tenants | Tenant | status = Active | All |
| Move-out Next 15 Days | Tenant | move_out_date <= today+15 AND status = Active | PSM |
| Overdue Rent | Tenant | rent_status = Overdue | Finance, Management |
| Active Landlords | Landlord | status = Active | Finance |
| Reserve Pipeline | Opportunity | pipeline_type = Reserve | Leasing Agents |
| Occupancy Pipeline | Opportunity | pipeline_type = Occupancy | Leasing Agents |
| F4B Pipeline | Opportunity | pipeline_type = F4B | F4B Sales |
| Supply Pipeline | Opportunity | pipeline_type = Supply | PSM |
| Open Support Tickets | Ticket | pipeline = Support AND status != Closed | Maintenance |
| Landlord Tickets | Ticket | pipeline = Landlord AND status != Closed | PSM |
| Expiring Contracts | Contract | end_date <= today+60 AND state = Active | Management, Finance |
| Vacant Rooms | Room | status = Vacant | Leasing Agents |
| Properties by Area | Property | Group by: area | All |
| My Tenants (CX) | Tenant | cx_owner = current user | CX team |
| My Landlords (Sales) | Landlord | sales_owner = current user | Sales team |
| My Properties (Sales) | Property | sales_owner = current user | Sales team |
| My Landlord Contracts (PSM) | Contract | psm = current user AND type = Landlord Agreement | Partner Success |

---

## 8. Error Handling & Resilience (CEO Review Addition)

### Dead Letter Queues

Every Pub/Sub subscription gets a DLQ topic. Messages that fail processing 5 times are routed to DLQ for manual review.

| Subscription | DLQ Topic | Max Retries | Alert |
|-------------|-----------|-------------|-------|
| crm-events-sub | crm-events-dlq | 5 | >10 messages in DLQ |
| agreement-events-sub | agreement-events-dlq | 5 | Any message in DLQ |
| mirror-events-sub | mirror-events-dlq | 5 | >50 messages in DLQ |

### Error Rescue Map

| Codepath | Error | Rescue | User Sees |
|----------|-------|--------|-----------|
| hubspot-mirror: HS API 429 | RateLimitError | Backoff + retry 3x | Nothing (transparent) |
| hubspot-mirror: Twenty upsert fails | UpsertError | Log to `gs://flent-twenty-files/mirror-errors/`, alert if >10/run | Mirror delay alert |
| hubspot-mirror: bad data mapping | MappingError | Skip record, log full context, continue | Record missing (ops alert) |
| zoho-sign-callback: contract not found | NotFoundError | Retry in 5 min (may not have synced yet), DLQ after 3 | Task for ops |
| zoho-sign-callback: GCS upload fail | StorageError | Retry 3x, then DLQ | "Agreement signed but PDF unavailable" task |
| calcom-webhook: duplicate booking | DuplicateError | Idempotency check (booking ID), skip | Nothing |
| calcom-webhook: ambiguous match | AmbiguousMatchError | Create new People record, flag for manual merge | Task for ops |
| data-validator: invalid phone/Aadhaar | ValidationError | Flag record with `_validation_errors` field, create Task | Task for record owner with error details |

---

## 9. Data Validation Cloud Function (CEO Review — Accepted Expansion)

**Trigger**: Pub/Sub `crm-events` topic on record create/update for People, Tenant, Landlord
**Runtime**: Cloud Functions 2nd gen, Node.js 20

### Validation Rules

| Field | Object | Rule | Error Message |
|-------|--------|------|---------------|
| Phone | People | Must match `^\\+?91[6-9]\\d{9}$` | "Invalid Indian phone number" |
| Aadhar Number | People | Must be 12 digits: `^\\d{12}$` | "Aadhaar must be 12 digits" |
| PAN Card | People/Landlord | Must match `^[A-Z]{5}\\d{4}[A-Z]$` | "Invalid PAN format" |
| Email | People | Must be valid email format | "Invalid email" |
| IFSC Code | Landlord | Must match `^[A-Z]{4}0[A-Z0-9]{6}$` | "Invalid IFSC code" |
| PID | Property | Must match `^PID\\d+$` | "PID format: PID followed by number" |
| Room ID | Room | Must match `^\\d{2}[A-Z]{2}\\d$` | "Room ID format: 12BR2" |

**Behavior**: On validation failure, the Cloud Function updates the record with an `_validation_errors` JSON field and creates a Task assigned to the record owner. Records are NOT rejected (Twenty doesn't support pre-write hooks) — instead, invalid data is flagged immediately after write.

---

## 10. Metabase Deployment (CEO Review — Accepted Expansion)

### Architecture

- **Metabase** deployed as a pod on GKE cluster (1 replica, `e2-standard-2`)
- **Data source**: Cloud SQL read replica (zero impact on CRM writes)
- **Embedding**: Signed JWT embedding in Twenty via custom iframe/link
- **Authentication**: Metabase SSO via Google OAuth (same as Twenty)

### Starter Dashboards (5)

| Dashboard | Key Metrics | Used By |
|-----------|------------|---------|
| **Occupancy Overview** | Occupancy rate by property, by area, by month. Vacant rooms list. | Management, PSM |
| **Revenue by Property** | Monthly rent collected, license fee paid, earnings. Trend over 12 months. | Management, Finance |
| **Pipeline Funnel** | Reserve → Occupancy → Move-in conversion. Drop-off by stage. | Sales, Management |
| **Ticket SLA** | Open tickets by age (>7 days flagged), resolution time by category, CSAT scores. | CX, Management |
| **Lease Expiry Calendar** | Contracts expiring in 30/60/90 days. Renewal rate. | PSM, Finance |

### Cost Addition

| Service | Spec | Monthly |
|---------|------|---------|
| GKE (Metabase pod) | 1x e2-standard-2 | ~$50 |
| Cloud SQL read replica | db-custom-2-8192 | ~$100 |
| **Additional total** | | **~$150/mo** |

---

## 11. Security Hardening (CEO Review Addition)

### Secret Manager

All secrets stored in GCP Secret Manager, not environment variables:

| Secret | Used By |
|--------|---------|
| `hubspot-api-key` | hubspot-mirror Cloud Function |
| `zoho-sign-api-key` | zoho-sign-callback Cloud Function |
| `cashfree-client-id` | Payment Cloud Functions (Phase 4) |
| `cashfree-client-secret` | Payment Cloud Functions (Phase 4) |
| `resend-api-key` | Twenty server (email driver) |
| `twenty-api-key` | All Cloud Functions calling Twenty API |
| `twenty-app-secret` | Twenty server (JWT signing) |
| `metabase-embedding-secret` | Twenty server (signed JWT for Metabase embeds) |

### Webhook Signature Verification

| Integration | Verification Method |
|-------------|-------------------|
| Cashfree | HMAC-SHA256 with webhook secret |
| Zoho Sign | HMAC verification via Zoho's API |
| Cal.com | HMAC-SHA256 with signing key |
| Twenty webhooks | `X-Twenty-Webhook-Signature` HMAC SHA256 |

### Staging Environment

- GKE namespace: `staging` (same cluster, isolated)
- Cloud SQL: `flent-twenty-staging` (db-f1-micro, $15/mo)
- All integrations tested in staging before production deployment
- Staging uses separate API keys for Zoho Sign sandbox, Cal.com test, Cashfree test mode

---

## 12. Migration Phases

### Phase 1: Infrastructure + Mirror (Weeks 1-2)

**Goal**: Twenty running on GCP, hourly HubSpot mirror active, team has read-only access.

- Provision GCP project `flent-twenty-prod` in `asia-south1`
- Create Secret Manager secrets for all integrations
- Deploy GKE cluster, Cloud SQL (primary + read replica), Memorystore, GCS, CDN, LB
- Deploy Cloud SQL Auth Proxy + PgBouncer sidecars
- Deploy Twenty via Helm chart (pinned to `v1.20.11`) with tuned config
- Deploy Metabase on GKE, connected to Cloud SQL read replica
- Deploy staging namespace with lightweight Cloud SQL instance
- Configure Resend email integration
- Configure Google OAuth for Gmail/Calendar sync
- Build and deploy `hubspot-mirror` Cloud Function + Scheduler
- Build and deploy `data-validator` Cloud Function (phone/Aadhaar/PAN validation)
- Configure Pub/Sub topics with DLQ subscriptions
- Start hourly mirroring of all HubSpot data (109 Flent-specific properties only, not all 613)
- Set up Cloud Monitoring dashboards and alerts
- Team gets access to Twenty (read alongside HubSpot)

**Exit criteria**:
- All 16,853 HubSpot records visible in Twenty
- Mirror running hourly without errors for 48h
- Mirror function has unit tests for all 7 object mappings + error handling
- Data validator rejecting malformed phone/PAN correctly
- Metabase accessible and connected to read replica

### Phase 2: Custom Data Model + Views (Weeks 2-3)

**Goal**: All 7 objects created with correct fields, data flowing from mirror into correct objects.

- Create custom objects: Tenant, Landlord, Property, Room, Contract, Ticket
- Extend People and Opportunity with custom fields
- Update mirror function with property whitelist (109 fields only) to map HubSpot data:
  - Contacts (customer_type=Tenant) -> People + Tenant
  - Contacts (customer_type=Landlord) -> People + Landlord
  - Deals -> Opportunity (with pipeline_type field)
  - HubSpot Tickets -> Ticket
  - HubSpot Contract -> Contract
  - HubSpot Property ID -> Property
  - HubSpot Room ID -> Room
- Configure all views (Section 7)
- Set up permissions per role (Section 6)
- Configure row-level permissions if Enterprise license available
- Build 5 Metabase dashboards (Section 10) + embed in Twenty via signed JWT

**Exit criteria**:
- All objects populated, record counts match HubSpot
- All 17 views loading correctly
- Permissions tested with 5 pilot users
- 5 Metabase dashboards live and embedded

### Phase 3: Workflows + Integrations (Weeks 3-5)

**Goal**: Core automations running, Zoho Sign and Cal.com live.

- Rebuild top 30 HubSpot workflows in Twenty's workflow engine:
  - Tenant lifecycle transitions
  - Rent reminder notifications (via Resend)
  - Move-out intimation (Slack)
  - Contract state activation
  - Ticket created alerts (Slack)
  - Lead qualification pipeline automation
  - NPS scoring workflows
- Deploy Zoho Sign integration (agreement lifecycle)
- Deploy Cal.com integration (visit scheduling)
- Deploy Pub/Sub event bus + Cloud Workflows
- Build data validation workflows (phone format, PAN format via CODE action)
- Parallel run: both systems active, 10 pilot users working primarily in Twenty

**Exit criteria**:
- All critical workflows firing correctly (30/30)
- Zoho Sign agreement round-trip tested (create -> sign -> PDF stored in GCS)
- Cal.com bookings creating Opportunities in Occupancy pipeline
- Data validation catching malformed inputs in staging

### Phase 4: Payment Operations (Weeks 5-7)

**Goal**: Cashfree payment collection and landlord payouts running through Twenty.

*Detailed spec deferred — will be designed separately based on BHG 3.1 App Script logic and Make scenarios.*

High-level scope:
- Token payment collection flow
- Monthly rent collection cycle
- Security deposit collection
- Landlord payout automation
- Settlement reconciliation
- Invoice generation

### Phase 5: WhatsApp + Cutover (Weeks 8-11)

**Goal**: Full team on Twenty, HubSpot decommissioned.

*Note: 2-week buffer between Phase 4 and Phase 5 for integration debugging and user feedback. Timeline is best-case; add buffer for Phase 4 spec design that hasn't been completed yet.*

- WhatsApp integration via Galabox/Superchat partner
- Migrate remaining 70 HubSpot workflows
- Full team (40 users) working in Twenty
- Load test: 40 simulated concurrent users
- Stop HubSpot mirror
- Final data reconciliation check
- HubSpot decommissioned (export backup retained)

**Exit criteria**:
- Zero dependency on HubSpot for any operation
- Load test passed: 40 simulated concurrent users, p95 < 500ms
- All 40 users with daily active usage for 5 consecutive business days

### Phase 6: Enhancement (Ongoing)

- Vertex AI agents (ops assistant, tenant qualifier, anomaly detection)
- Supply Pipeline Management (new feature — thousands of historic records)
- Tenant Pipeline Management (visits, chats, potential sales)
- Tenant/Landlord self-service portal
- Mobile PWA
- Slack bot with actions + slash commands (deferred from CEO review)

### Timeline Note (CEO Review Addition)

The 9-week original timeline is **best-case**. Realistic timeline with buffers:

| Phase | Best Case | Realistic | Buffer For |
|-------|-----------|-----------|-----------|
| Phase 1: Infra + Mirror | Weeks 1-2 | Weeks 1-2 | N/A |
| Phase 2: Data Model | Weeks 2-3 | Weeks 2-4 | Enterprise license decision, field mapping edge cases |
| Phase 3: Workflows | Weeks 3-5 | Weeks 4-6 | Integration debugging (Zoho Sign, Cal.com) |
| Phase 4: Payments | Weeks 5-7 | Weeks 7-9 | Spec not designed yet, Cashfree API complexity |
| Phase 5: Cutover | Weeks 7-9 | Weeks 10-12 | User feedback, workflow gaps discovered in parallel run |
| **Total** | **9 weeks** | **12 weeks** | |

---

## 13. HubSpot Mirror Field Mapping

### Contacts -> People + Tenant/Landlord

| HubSpot Field | Twenty Object | Twenty Field |
|---------------|--------------|-------------|
| `firstname` | People | First Name |
| `lastname` | People | Last Name |
| `email` | People | Email |
| `phone` | People | Phone |
| `customer_type` | People | Role |
| `hs_object_id` | People | HubSpot Record ID |
| `aadhar_number` | People | Aadhar Number |
| `pan_card` | People | PAN Card |
| `lead_source` | People | Lead Source |
| — If customer_type contains "Tenant" — |
| `tenant_lifecycle` | Tenant | Tenant Lifecycle |
| `reserve_status` | Tenant | Reserve Status |
| `tenant_monthly_rent` | Tenant | Monthly Rent |
| `real_move_in_date` | Tenant | Move-in Date |
| `preferred_area` | Tenant | Preferred Areas |
| — If customer_type contains "Landlord" — |
| `landlord_status` (derived) | Landlord | Landlord Status |
| Bank details (5+ fields) | Landlord | Bank Account Number, IFSC, etc. |
| Per-property terms (license fee, TDS, settlement day) | Contract (type: Landlord Agreement) | Linked via Landlord + Property |

### Deals -> Opportunity

| HubSpot Field | Twenty Field |
|---------------|-------------|
| `dealname` | Name |
| `amount` | Amount |
| `closedate` | Close Date |
| `dealstage` | Stage |
| `pipeline` (Reserve/Occupancy/F4B) | Pipeline Type |

### Custom Objects -> Direct Mapping

| HubSpot Object | Twenty Object | Key Field |
|---------------|--------------|-----------|
| Contract | Contract | contract_id |
| Property ID | Property | pid |
| Room ID | Room | roomid |
| Ticket | Ticket | hs_object_id |

---

## 14. Operational Resilience (CEO Review Additions)

### 14.1 Rollback Plan

| Scenario | Rollback Procedure | RTO |
|----------|--------------------|-----|
| Failed Twenty GKE deployment | `helm rollback flent-twenty` to previous revision | <5 min |
| Corrupted mirror sync (bad data in Twenty) | Cloud SQL PITR to timestamp before corrupted sync run | <30 min |
| Custom object schema change breaks workflows | Revert schema via Twenty Admin Panel + re-deploy workflows | <15 min |
| Complete Twenty failure during parallel run | Team switches back to HubSpot (still receiving mirror data) | Immediate |
| Post-cutover: Twenty down | Restore from Cloud SQL daily backup + GCS file backup | <1 hour |

**Break-glass procedure** (during parallel run): If Twenty is unusable, team reverts to HubSpot. All data up to the last hourly mirror sync is present. Data entered in Twenty since last sync would need manual re-entry. This is the safety net during Phases 2-4.

### 14.2 Alerting Thresholds

| Metric | Threshold | Channel | Escalation |
|--------|-----------|---------|------------|
| GKE pod CrashLoopBackOff | Any occurrence | Slack #flent-ops | Admin on-call |
| GKE pod OOMKilled | Any occurrence | Slack #flent-ops | Admin on-call |
| Cloud SQL connection count | >80% of max_connections (320/400) | Slack #flent-ops | Admin |
| Cloud SQL CPU utilization | >80% sustained 10 min | Slack #flent-ops | Admin |
| Memorystore memory usage | >80% (4GB/5GB) | Slack #flent-ops | Admin |
| API rate limit approaching | >400 of 500 short-term limit | Cloud Monitoring log | Info only |
| Mirror sync failure | >2 consecutive failures | Slack #flent-ops + email | Admin urgent |
| DLQ message count | >0 for agreement-events | Slack #flent-ops | Admin urgent |
| DLQ message count | >10 for crm-events | Slack #flent-ops | Admin |
| Twenty /healthz failure | Any failure for >30s | Slack #flent-ops | Admin on-call |
| SSL certificate expiry | <30 days | Email to admin | Managed cert auto-renews |
| Metabase health check | Any failure for >2 min | Slack #flent-ops | Admin |

### 14.3 Encryption Strategy

| Data | At Rest | In Transit | Method |
|------|---------|-----------|--------|
| Cloud SQL (all data) | Encrypted by default (Google-managed keys) | TLS via Cloud SQL Auth Proxy | GCP default |
| Bank Account Number (Landlord) | Application-level AES-256 encryption before storage | TLS | Twenty workflow CODE action encrypts/decrypts using Secret Manager key |
| Aadhaar Number (People) | Application-level AES-256 encryption | TLS | Same as bank details — UIDAI guidelines require encryption at rest |
| PAN Card (People/Landlord) | Stored as-is (not classified as sensitive PII by DPDP Act) | TLS | Cloud SQL default encryption sufficient |
| GCS files (agreements, attachments) | Encrypted by default (Google-managed keys) | TLS | GCP default |
| Memorystore (Redis) | Encrypted in-transit | TLS | Memorystore Standard tier default |

### 14.4 Initial Backfill Strategy

The first mirror run must pull ALL 16,853 records, not just changes since last sync.

**Approach**: Run initial backfill as a **GKE Job** (not Cloud Function) to avoid the 60-minute timeout.

```
GKE Job: hubspot-initial-backfill
  1. Fetch all Contacts (8,393) via HubSpot Search API (200/page, ~42 pages)
  2. Fetch all Deals (3,782) — ~19 pages
  3. Fetch all Tickets (2,739) — ~14 pages
  4. Fetch all Contracts (1,199), Property IDs (196), Room IDs (74), Notifications (470)
  5. Transform each record per mapping rules
  6. Upsert into Twenty via GraphQL API (60 records/batch)
  7. Total: ~281 upsert calls, ~170 HubSpot API calls
  8. Expected duration: 15-25 minutes
  9. No timeout (GKE Job has configurable deadline, set to 2 hours)
```

After initial backfill completes, the hourly Cloud Function mirror takes over for incremental syncs.

### 14.5 Denormalized Field Sync (Tenant -> Property/Room/Contract)

Tenant object has denormalized `Property`, `Room`, and `Contract` relations for quick access. These must stay in sync with the canonical source (Contract).

**Trigger**: Twenty workflow on Contract state change.

```
On Contract.state change:
  If new state = "Active":
    -> Update Tenant.property = Contract.property
    -> Update Tenant.room = Contract.room
    -> Update Tenant.contract = this Contract
    -> Update Room.current_tenant = Contract.tenant
    -> Update Room.status = "Occupied"
  If new state = "Terminated" or "Room Change":
    -> Clear Tenant.property, Tenant.room, Tenant.contract (set to null)
    -> Update Room.current_tenant = null
    -> Update Room.status = "Vacant"
```

### 14.6 Phase 4 Field Stability

Phase 4 (Payments) is deferred but may add fields to existing objects. The following fields on existing objects are **stable and will not change**:
- Tenant: `CF Order ID`, `CF Link ID`, `Rental Link` — these are Cashfree identifiers already defined
- Landlord: `Cashfree Vendor ID`, `Vendor Status`, `Payment Control` — Cashfree vendor management
- Contract: All financial fields (license fee, rent, deposit, GST, TDS) — these are contract terms, not payment tracking

Phase 4 may ADD the following new fields (will not modify existing):
- Tenant: payment history link, last payment date, outstanding balance
- Landlord: last settlement date, settlement history link, unsettled balance
- NEW object: Payment (if needed for transaction-level tracking)
- NEW object: Landlord Payout (if needed for settlement tracking)

---

## 15. Agent Team Composition (Claude Code)


The implementation will be executed by a Claude Code agent team using specialized skills:

| Agent Role | Skills | Scope |
|-----------|--------|-------|
| **Infrastructure Lead** | Terraform, GKE, Cloud SQL | Phase 1: GCP provisioning, Twenty deployment |
| **Data Architect** | Twenty API, GraphQL, migration scripts | Phase 2: Custom objects, field mapping, mirror function |
| **Workflow Engineer** | Twenty workflows, Cloud Functions, Pub/Sub | Phase 3: Automation, Zoho Sign, Cal.com |
| **Integration Engineer** | Cashfree API, payment flows | Phase 4: Payment operations |
| **AI Engineer** | Vertex AI, Agent Builder | Phase 5: Ops assistant, tenant qualifier |

**Skill usage**:
- `/autoresearch` — iterative improvement on each phase (deploy → verify → fix → repeat)
- `/superpowers:writing-plans` — detailed implementation plan per phase
- `/superpowers:subagent-driven-development` — parallel agent execution within phases
- `/plan-ceo-review` — validate business logic alignment after each phase
- `/plan-eng-review` — validate architecture decisions and performance

---

## 16. Success Criteria

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 1 | Mirror sync success rate | >99.5% per hourly run |
| Phase 1 | Twenty UI response time (p95) | <500ms |
| Phase 2 | Record count match (HubSpot vs Twenty) | 100% |
| Phase 2 | All 17 views loading correctly | Pass |
| Phase 3 | Critical workflows firing correctly | 30/30 |
| Phase 3 | Zoho Sign round-trip (send -> sign -> store) | Pass |
| Phase 5 | Team adoption (daily active users) | 40/40 |
| Phase 5 | Zero HubSpot dependency | Confirmed |
| Overall | UI operation latency (click to render) | <300ms |
