# Hawkeye CRM — Data Taxonomy Reference
# Every object · Every field · API names · Types · Required status · Enum values · Validation rules

---

## HOW TO USE THIS DOCUMENT

This file is the ground truth for every field that must appear somewhere in the Hawkeye frontend. Before marking any screen complete, run the parity check at the bottom of each object section. Every field listed here must be either:

1. **Rendered** — visible somewhere in the UI on the relevant detail/form screen
2. **Stored in the type** — present in the TypeScript type even if not always shown (e.g. system fields like `record_id`, `created_at`)
3. **Excluded with a documented reason** — e.g. `gst_percent` is a derived PO field shown only as a derived display value

A field that is in this document but cannot be found in any screen spec, any TypeScript type, or any mock data is a **coverage gap** that must be fixed before the build is complete.

---

## FIELD CONVENTIONS

| Symbol | Meaning |
|---|---|
| `NOT NULL` | Required field — must be present to save a record |
| `NULL` | Optional field |
| `Derived` | Auto-populated from another object — read-only in UI |
| `System` | Set by system (timestamps, IDs) — never shown as editable |
| `Workflow` | Set by automation trigger — read-only in UI |
| `Auto-calculated` | Computed from other fields on the same object — read-only |
| `Manual` | User fills this in |

---

## OBJECT 1: TENANT

**Purpose:** Every person who inquires about or lives in a Flent property. Covers full lifecycle from first inquiry to move-out.

**Linked from:** Contracts (tenant_id) · Tickets (tenant_id) · Transactions (contact_id)

**Derives from:** Contracts → current_pid, current_rid · Self → nps_category

---

### GROUP: tenant_identity

| Field Name | API Name | Type | DB Type | Required | Input | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Record ID | `record_id` | string | UUID | NOT NULL | System | Primary key — show as `StyledMonoValue` |
| First Name | `first_name` | string | VARCHAR(255) | NOT NULL | Manual | — |
| Last Name | `last_name` | string | VARCHAR(255) | NOT NULL | Manual | — |
| Email | `email` | string | VARCHAR(255) | NOT NULL | Manual | Format: Email |
| Mobile Phone | `mobile_phone` | string | VARCHAR(20) | NOT NULL | Manual | Format: +91XXXXXXXXXX |
| WhatsApp Phone | `whatsapp_phone` | string | VARCHAR(20) | NULL | Manual | Format: +91XXXXXXXXXX |
| Gender | `gender` | enum | VARCHAR(100) | NOT NULL | Manual | `Male` / `Female` |
| Date of Birth | `date_of_birth` | date | DATE | NULL | Manual | YYYY-MM-DD |
| Aadhaar Number | `aadhaar_number` | string | VARCHAR(255) | NOT NULL | Workflow/Manual | Format: XXXX XXXX XXXX |
| Aadhaar Front (Image) | `aadhaar_front_image` | string | VARCHAR(500) | NOT NULL | Workflow/Manual | File URL — render as `LightIconButton(IconFile)` |
| Aadhaar Back (Image) | `aadhaar_back_image` | string | VARCHAR(500) | NOT NULL | Workflow/Manual | File URL — render as `LightIconButton(IconFile)` |
| PAN | `pan` | string | VARCHAR(255) | NOT NULL | Workflow/Manual | Format: AAAAP1234A |
| PAN Card Image | `pan_card_image` | string | VARCHAR(500) | NULL | Workflow/Manual | File URL — render as `LightIconButton(IconFile)` |
| LinkedIn URL | `linkedin_url` | string | VARCHAR(500) | NULL | Manual | URL — open in new tab |
| Twitter (X) URL | `twitter_url` | string | VARCHAR(500) | NULL | Manual | URL — open in new tab |
| Instagram ID | `instagram_id` | string | VARCHAR(500) | NULL | Manual | URL — open in new tab |
| Occupation | `occupation` | string | VARCHAR(255) | NULL | Manual | — |
| Employer Name | `employer_name` | string | VARCHAR(255) | NULL | Manual | — |

---

### GROUP: tenant_attribution — captured at first touch, NEVER overwritten

| Field Name | API Name | Type | DB Type | Required | Input | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Create Date | `create_date` | datetime | TIMESTAMP | NOT NULL | System | First inquiry timestamp |
| Channel | `first_inquiry_channel` | enum | VARCHAR(100) | NOT NULL | Workflow/Manual | `WhatsApp` / `Website` / `Instagram` / `Facebook` / `Direct Call` / `Walk-in` / `Platform` / `Referral` / `Offline Activation` / `LinkedIn` |
| Source Drilldown 1 | `source_drilldown_1` | enum | VARCHAR(100) | NULL | Manual | `Google Ads` / `Meta Ads` / `Instagram Ads` / `YouTube Ads` / `Housing.com` / `MagicBricks` / `NoBroker` / `99acres` / `WhatsApp Organic` / `Walk-in` / `Referral` / `Direct Call` / `Other` |
| Source Drilldown 2 | `source_drilldown_2` | string | VARCHAR(255) | NULL | Manual | Campaign name, referring partner, agent name |
| WAX-Code | `wax_code` | string | VARCHAR(255) | NULL | System | Show with `LightIconButton(IconCopy)` to clipboard |
| Google Click ID | `google_click_id` | string | VARCHAR(255) | NULL | System | Show with `LightIconButton(IconCopy)` |
| Facebook Click ID | `facebook_click_id` | string | VARCHAR(255) | NULL | System | Show with `LightIconButton(IconCopy)` |
| UTM Source | `utm_source` | string | VARCHAR(255) | NULL | Workflow | — |
| UTM Medium | `utm_medium` | string | VARCHAR(255) | NULL | Workflow | — |
| UTM Campaign | `utm_campaign` | string | VARCHAR(255) | NULL | Workflow | — |
| UTM Content | `utm_content` | string | VARCHAR(255) | NULL | Workflow | Ad variant tracking |
| UTM Term | `utm_term` | string | VARCHAR(255) | NULL | Workflow | Keyword tracking |

**⚠ Attribution lock rule:** These fields are locked after first record creation. No field in this group may be overwritten on re-engagement. The Onboarding Provenance Block in the History tab must display all these fields permanently.

---

### GROUP: tenant_requirements

| Field Name | API Name | Type | DB Type | Required | Input | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Preferred Micromarkets | `preferred_micromarkets` | multi-enum | TEXT[] | NULL | Manual | Multi-select; Bangalore neighbourhood list |
| Preferred Occupancy Type | `preferred_occupancy_type` | enum | VARCHAR(100) | NULL | Manual | `Full Home` / `Private Room` |
| Preferred Furnished Type | `preferred_furnished_type` | enum | VARCHAR(100) | NULL | Manual | `Furnished` / `Semi-Furnished` / `Unfurnished` |
| Preferred Move-in Timeline | `preferred_move_in_timeline` | enum | VARCHAR(100) | NULL | Manual | `Immediate` / `Within 2 Weeks` / `Flexible` |
| Gender Preferences | `gender_preferences` | enum | VARCHAR(100) | NULL | Manual | `Male Only` / `Female Only` / `No Preference` |
| Food Preferences | `food_preferences` | enum | VARCHAR(100) | NULL | Manual | `Vegetarian` / `Non-Vegetarian` / `Vegan` / `No Preference` |
| Has Pet | `has_pet` | bool | BOOLEAN | NULL | Manual | true / false |
| Smoking Preferences | `smoking_preferences` | enum | VARCHAR(100) | NULL | Manual | `Smoker` / `Non-Smoker` / `Occasional` |
| Custom Preference | `custom_preference` | text | TEXT | NULL | Manual | Free text |
| Budget Maximum (INR) | `budget_max` | number | DECIMAL | NULL | Manual | Maximum budget for room/home |

---

### GROUP: tenant_lifecycle_status — system-written only, never manually edited

| Field Name | API Name | Type | DB Type | Required | Input | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Tenant Lifecycle Stage | `tenant_lifecycle` | enum | VARCHAR(100) | NOT NULL | Webhook/Manual | `New Inquiry` / `Visit Scheduled` / `Visit Done` / `Negotiation` / `Converted` / `Gestation` / `Moved In` / `Notice Period` / `Moved Out` / `Dead Lead` — **Single source of truth for tenant stage** |
| Current PID | `current_pid` | number | INTEGER | NULL | Derived | From Contracts.pid — show as `EntityChip` linking to PID detail |
| Current RID | `current_rid` | string | VARCHAR(255) | NULL | Derived | From Contracts.rid — show as `Chip` linking to RID detail |

---

### GROUP: tenant_qualification

| Field Name | API Name | Type | DB Type | Required | Input | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Qualification Status | `qualification_status` | enum | VARCHAR(100) | NULL | Manual | `Qualified` / `Not Qualified` / `Dead` / `Paused` |
| Disqualification Reason | `disqualification_reason` | enum | VARCHAR(100) | NULL | Manual | `Budget` / `Location` / `Availability` / `No Response` / `Chose Competitor` / `Life Event` / `Other` |
| Disqualification Detail | `disqualification_detail` | string | TEXT | NULL | Manual | Free text, shown when reason = Other |
| BGV Status | `bgv_status` | enum | VARCHAR(100) | NULL | Manual | `Not Started` / `In Progress` / `Passed` / `Failed` |
| BGV Report | `bgv_report` | string | VARCHAR(500) | NULL | Manual | File URL — `LightIconButton(IconFile, "View BGV Report")` |
| BGV Completed Date | `bgv_completed_date` | date | DATE | NULL | Manual | YYYY-MM-DD |

---

### GROUP: tenant_visit_summary

| Field Name | API Name | Type | DB Type | Required | Input | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Total Visits | `total_visits_count` | number | INTEGER | NOT NULL | Workflow | Incremented on every meeting creation |
| Visits Cancelled | `visits_cancelled` | number | INTEGER | NULL | Workflow | — |
| Visits Completed | `visits_completed` | number | INTEGER | NULL | Workflow | Primary conversion rate input |
| First Visit Date | `first_visit_date` | date | DATE | NULL | Workflow | Set on first completion; never overwritten |
| RIDs Visited | `rids_visited` | string | VARCHAR(255) | NULL | Workflow | Comma-separated: "09BR1, 18BR3" |
| Feedback | `feedback` | text | TEXT | NULL | Manual | Free text post-visit rep observations |

---

### GROUP: tenant_satisfaction

| Field Name | API Name | Type | DB Type | Required | Input | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Onboarding CSAT Score | `onboarding_csat_score` | number | SMALLINT | NULL | Webhook/Manual | Scale 1–5; render as star display |
| Offboarding CSAT Score | `offboarding_csat_score` | number | SMALLINT | NULL | Webhook/Manual | Scale 1–5; render as star display |
| Last NPS Score | `last_nps_score` | number | SMALLINT | NULL | Webhook/Manual | Scale 0–10 |
| Last NPS Date | `last_nps_date` | date | DATE | NULL | Workflow | Date of most recent response |
| NPS Category | `nps_category` | enum | VARCHAR(100) | NULL | Auto-calculated | From `last_nps_score`: `Promoter` (9–10) / `Passive` (7–8) / `Detractor` (0–6) |
| Last NPS Comment | `last_nps_comment` | string | TEXT | NULL | Webhook | Free text from survey |

**Tenant parity check (62 fields total):**
- [ ] All 18 `tenant_identity` fields present in Tenant Detail → Overview tab
- [ ] All 13 `tenant_attribution` fields present in Attribution tab / Onboarding Provenance Block
- [ ] All 10 `tenant_requirements` fields present in Requirements tab
- [ ] All 3 `tenant_lifecycle_status` fields present in Lifecycle tab
- [ ] All 6 `tenant_qualification` fields present in Overview tab → Qualification section
- [ ] All 6 `tenant_visit_summary` fields present in Lifecycle tab → Visit Summary section
- [ ] All 6 `tenant_satisfaction` fields present in Satisfaction tab
- [ ] `record_id` in TypeScript type even if not rendered visibly
- [ ] `tenant_lifecycle` has correct enum values in all dropdowns and filter selects

---

## OBJECT 2: MERCHANT (LANDLORD)

**Purpose:** Property owners/landlords who lease their properties to Flent.

**Linked from:** Contracts (merchant_id) · PID (merchant_id) · Transactions (from_party/to_party)

**Note:** No derived fields — Merchant is a master object, all fields entered manually.

---

| Field Name | API Name | Type | DB Type | Required | Group | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Merchant Type | `merchant_type` | enum | — | NOT NULL | — | `Landlord` / `POC` / `Lead` / `Broker` / `Management` |
| Lead Source | `lead_source` | enum | VARCHAR(100) | NULL | lead_info | How landlord was acquired |
| Prefix | `prefix` | enum | VARCHAR(100) | NULL | lead_info | `Mr` / `Mrs` / `Ms` / `Dr` |
| First Name | `first_name` | string | VARCHAR(255) | NOT NULL | lead_info | — |
| Last Name | `last_name` | string | VARCHAR(255) | NOT NULL | lead_info | — |
| Email | `email` | string | VARCHAR(255) | NULL | lead_info | — |
| Country Code | `country_code` | enum | VARCHAR(100) | NOT NULL | lead_info | `+91` / `+1` etc. |
| Phone No. | `phone` | string | VARCHAR(20) | NOT NULL | lead_info | — |
| Current City | `current_city` | string | VARCHAR(255) | NULL | lead_info | — |
| Unique ID | `unique_id` | string | VARCHAR(255) | NULL | lead_info | System-assigned — show as `StyledMonoValue` |
| Disqualification Reason | `disqualification_reason` | enum | VARCHAR(100) | NULL | lead_info | Why lead was disqualified |
| Lost Reason | `lost_reason` | enum | VARCHAR(100) | NULL | lead_info | Why deal was lost |
| Landlord Personality | `landlord_personality` | string | TEXT | NULL | psychographics | Long text notes |
| General LL Comments | `general_ll_comments` | string | TEXT | NULL | psychographics | General notes |
| Potentially Multi-home LL? | `potentially_multihome` | bool | BOOLEAN | NULL | psychographics | true / false |
| Designation | `designation` | string | VARCHAR(255) | NULL | demographics | Professional title |
| Organization | `organization` | string | VARCHAR(255) | NULL | demographics | Employer/company |
| Aadhaar Back | `aadhaar_back` | string | VARCHAR(500) | NOT NULL | identity_documents | File URL — `LightIconButton(IconFile)` |
| PAN Card Number | `pan_number` | string | VARCHAR(255) | NOT NULL | identity_documents | Format: AAAAA9999A |
| PAN Card (Image) | `pan_card_image` | string | VARCHAR(500) | NOT NULL | identity_documents | File URL — `LightIconButton(IconFile)` |
| Bank Account No. | `bank_account_number` | string | VARCHAR(255) | NOT NULL | payment_details | Show masked, copy button |
| Beneficiary Name | `beneficiary_name` | string | VARCHAR(255) | NOT NULL | payment_details | — |
| IFSC Code | `ifsc_code` | string | VARCHAR(255) | NOT NULL | payment_details | Format: XXXX0XXXXXX — copy button |
| Current Residential | `current_residential` | string | TEXT | NOT NULL | address | Full address |
| Permanent Residential | `permanent_residential` | string | TEXT | NULL | address | — |
| Management Email | `management_email` | string | VARCHAR(255) | NULL | management | Society email — opens mailto: |
| Management Phone | `management_phone` | string | VARCHAR(20) | NULL | management | Society phone — copy button |
| Communications Permission | `communications_permission` | bool | BOOLEAN | NULL | permissions_meta | Toggle display |
| Signing Authority | `signing_authority` | bool | BOOLEAN | NOT NULL | permissions_meta | Toggle display |
| LinkedIn | `linkedin_url` | string | VARCHAR(500) | NULL | permissions_meta | URL — external link |
| First Added | `first_added` | datetime | TIMESTAMP | NOT NULL | permissions_meta | System-set |
| Last Updated | `last_updated` | datetime | TIMESTAMP | NOT NULL | permissions_meta | System-set |

**Merchant parity check (32 fields):**
- [ ] `merchant_type` — present on list view as Tag and on detail header
- [ ] All lead_info fields (12) on Lead Info tab
- [ ] All psychographics fields (3) on Psychographics tab
- [ ] Demographics (2) on Identity & Bank tab
- [ ] All identity_documents (3) on Identity & Bank tab
- [ ] All payment_details (3) on Identity & Bank tab — bank_account_number masked
- [ ] address (2) on Identity & Bank tab
- [ ] management (2) on Identity & Bank tab
- [ ] permissions_meta (5) on Permissions tab
- [ ] `first_added` and `last_updated` in TypeScript type

---

## OBJECT 3: PID (PROPERTY)

**Purpose:** A property unit managed by Flent. Full lifecycle from lead acquisition to churn.

**Linked from:** RID (pid) · Contracts (pid) · Tickets (pid) · Transactions (pid) · Overheads (pid) · Tenant (current_pid)

---

### PID has a TYPE field and three distinct data blocks

```
type field: "lead" | "active" | "churned"
  → "lead": show lead_stage fields only
  → "active": show property_details + residence_context + fixture_costs + building_context + payment_deadlines + poc
  → "churned": show active fields + churned block
```

| Field Name | API Name | Type | Required | Group / Block | Enum Values / Notes |
|---|---|---|---|---|---|
| TYPE | `pid_type` | enum | NOT NULL | — | `lead` / `active` / `churned` |
| **LEAD STAGE BLOCK** | | | | | |
| PPID No. | `ppid` | string | NOT NULL | lead_stage | Prospect ID — `StyledMonoValue` |
| Date Added | `date_added` | datetime | NOT NULL | lead_stage | When lead created |
| No. of Units | `units_count` | number | NOT NULL | lead_stage | Min: 1 |
| Deal Type | `deal_type` | enum | NOT NULL | lead_stage | `Residence Lead` / `Enterprise Lead` |
| No. of Apartments | `apartment_count` | number | NULL | lead_stage | — |
| Property Type (lead) | `property_type_lead` | enum | NOT NULL | lead_stage | Property classification at lead |
| Cluster | `cluster` | enum | NOT NULL | lead_stage | `HSR` / `KRM` / `IDR` / `MHD` / `BLD` / `MGR` / `HBL` / `WHF` |
| Deal Owner | `deal_owner` | enum | NOT NULL | lead_stage | Sales rep |
| Furnishing | `furnishing_lead` | enum | NULL | lead_stage | `Unfurnished` / `Semi-Furnished` / `Partially Furnished` / `Fully Furnished` |
| Expected Rent | `expected_rent` | number | NOT NULL | lead_stage | Decimal — ₹ Indian format |
| Google Map Location (lead) | `google_map_location_lead` | string | NULL | lead_stage | URL — `LightIconButton(IconMapPin, "Open Map")` |
| Deal Stage | `deal_stage` | enum | NOT NULL | lead_stage | `To be contacted` / `In touch` / `LL Interested` / `Qualified` / `Evaluation` / `Negotiations` / `Offer Extended` / `Under Contract` / `To nurture` |
| Disqualification Reason | `disqualification_reason` | enum | NULL | lead_stage | `Rented Out` / `Family Only` / `Not Flent Standard` / `Gone Cold` / `Rent too high` / `LL not interested` / `Broker Gated` / `Duplicate` etc. |
| Lost Reason | `lost_reason` | enum | NULL | lead_stage | — |
| Exploratory Visit Score | `exploratory_visit_score` | number | NULL | lead_stage | Integer |
| Potential Report | `potential_report` | string | NULL | lead_stage | File URL — `LightIconButton(IconFile)` |
| **ACTIVE BLOCK — Property Details** | | | | | |
| PID No. | `pid` | string | NOT NULL | property_details | Primary key — `StyledMonoValue` |
| House No. | `house_no` | string | NULL | property_details | — |
| Property Type (active) | `property_type` | enum | NOT NULL | property_details | — |
| No. of Units | `active_units_count` | number | NOT NULL | property_details | — |
| Tier | `tier` | string | NULL | property_details | Quality tier |
| Floor | `floor` | string | NULL | property_details | — |
| Google Map Location (active) | `google_map_location` | string | NOT NULL | property_details | URL — `LightIconButton(IconMapPin)` |
| Address | `address` | string | NOT NULL | property_details | Long text |
| Building / Society | `building_society` | string | NOT NULL | property_details | — |
| Cluster (active) | `active_cluster` | enum | NOT NULL | property_details | Same values as lead cluster |
| Parking Type | `parking_type` | multi-enum | NULL | property_details | Multi-select |
| Parking Number | `parking_number` | string | NULL | property_details | — |
| Power Backup | `power_backup` | enum | NULL | property_details | — |
| Water Source | `water_source` | multi-enum | NULL | property_details | Multi-select |
| Restrictions | `restrictions` | enum | NULL | residence_context | — |
| Other Notes | `other_notes` | text | NULL | residence_context | Long text |
| Furniture Movement | `furniture_movement` | enum | NULL | residence_context | — |
| Furnishing Status | `furnishing_status` | enum | NULL | residence_context | — |
| LL Extra Clauses | `ll_extra_clauses` | string | NULL | residence_context | Long text |
| Final Approved Amount | `final_approved_amt` | number | NULL | fixture_costs | ₹ |
| Final Invoice | `final_invoice` | string | NULL | fixture_costs | File URL |
| Payment Collection | `payment_collection` | enum | NULL | fixture_costs | `Upfront` / `Straight Deduction` / `EMI` |
| EMI Period | `emi_period` | number | NULL | fixture_costs | Integer |
| Opex Collections | `opex_collections` | number | NULL | fixture_costs | ₹ |
| **BUILDING CONTEXT BLOCK** | | | | | |
| Prop. Mgmt. App | `prop_mgmt_app` | enum | NULL | building_context | Society management app name |
| Rules & Regulations | `rules_regulations` | string | NULL | building_context | File URL — `LightIconButton(IconFile)` |
| Garbage Disposal | `garbage_disposal` | string | NULL | building_context | Short text |
| Timing Restrictions | `timing_restrictions` | string | NULL | building_context | Short text |
| Move-in/out Formalities | `move_in_out_formalities` | text | NULL | building_context | Long text |
| **PAYMENT DEADLINES BLOCK** | | | | | |
| Rent Deadline | `rent_deadline` | string | NOT NULL | payment_deadlines | e.g. "5th" — day of month |
| Overheads Deadline | `overheads_deadline` | string | NULL | payment_deadlines | — |
| **POC BLOCK** | | | | | |
| Deal Owner (active) | `active_deal_owner` | string | NOT NULL | poc | Sales rep |
| PSM Owner | `psm_owner` | string | NOT NULL | poc | Property service manager |
| **CHURNED BLOCK** | | | | | |
| Deposit Refunded? | `deposit_refunded` | bool | NULL | churned | Boolean — show only when type=churned |
| Exit Cost OPX | `exit_cost_opx` | number | NULL | churned | ₹ — show only when type=churned |

**PID parity check (51 fields):**
- [ ] `pid_type` drives conditional rendering (lead/active/churned block)
- [ ] All 16 lead_stage fields on Pipeline tab
- [ ] All 14 property_details fields on Property tab
- [ ] All 5 residence_context fields on Property tab
- [ ] All 5 fixture_costs fields on Property tab / Financials tab
- [ ] All 5 building_context fields on Building tab
- [ ] Both payment_deadlines fields on Pipeline tab
- [ ] Both poc fields on Pipeline tab
- [ ] Both churned fields shown with red banner when type=churned

---

## OBJECT 4: RID (ROOM)

**Purpose:** Individual room within a property. Most granular unit for pricing, occupancy, and contract assignment.

**Linked from:** Contracts (rid) · Tickets (rid) · Transactions (rid) · Tenant (current_rid) · ITEM (location)

---

| Field Name | API Name | Type | DB Type | Required | Group | Notes |
|---|---|---|---|---|---|---|
| RID | `rid` | string | VARCHAR(255) | NOT NULL | room_identity | Primary key — `StyledMonoValue`. Format: "09BR2" |
| PID | `pid` | string | VARCHAR(255) | NOT NULL | room_identity | FK to PID — `EntityChip` linking to PID detail |
| Attached Bathroom | `attached_bathroom` | bool | BOOLEAN | NULL | room_specifications | Toggle display |
| Balcony | `balcony` | bool | BOOLEAN | NULL | room_specifications | Toggle display |
| Bed Type | `bed_type` | enum | VARCHAR(100) | NULL | furnishing_inventory | `Single` / `Double` / `Queen` / `King` |
| AC | `ac` | bool | BOOLEAN | NULL | furnishing_inventory | Toggle display |
| AC Type | `ac_type` | enum | VARCHAR(100) | NULL | furnishing_inventory | `Split` / `Window` / `Portable` / `Not Possible` — only shown when ac=true |
| AC Feasibility | `ac_feasibility` | enum | VARCHAR(100) | NULL | furnishing_inventory | Only shown when ac=false |
| Study Table | `study_table` | bool | BOOLEAN | NULL | furnishing_inventory | Toggle display |
| Annexure | `annexure` | string | VARCHAR(500) | NULL | furnishing_inventory | File URL — `LightIconButton(IconFile, "View Annexure")` |
| Annexure Last Update | `annexure_last_update_date` | date | DATE | NULL | furnishing_inventory | YYYY-MM-DD |
| Base Rent (INR) | `base_rent` | decimal | DECIMAL(12,2) | NOT NULL | commercials | ₹ Indian format |
| Maintenance Fee (INR) | `maintenance_fee` | decimal | DECIMAL(12,2) | NULL | commercials | ₹ |
| Room Status | `room_status` | enum | VARCHAR(100) | NOT NULL | availability_status | `Available` / `Occupied` / `Under Maintenance` / `Blocked` |
| Current Contract ID | `current_contract_id` | string | VARCHAR(255) | NULL | availability_status | Derived from Contracts — `Chip` linking to Contract detail |
| Current Tenant Name | `current_tenant_name` | string | VARCHAR(255) | NULL | availability_status | Derived — `EntityChip` linking to Tenant detail |
| Available From | `available_from` | date | DATE | NULL | availability_status | Derived from contract end date |

**RID parity check (17 fields):**
- [ ] Both room_identity fields on detail header
- [ ] Both room_specifications fields as toggles in Room tab
- [ ] All 9 furnishing_inventory fields (ac_type conditional on ac=true)
- [ ] Both commercials fields
- [ ] All 4 availability_status fields — current_contract and current_tenant as clickable chips

---

## OBJECT 5: CONTRACTS

**Purpose:** Legal agreements between Flent and parties. Two sub-types: Tenant Contract and Merchant Contract.

**Linked from:** Tenant (current_pid/current_rid) · RID (current_contract_id) · Transactions (contract_uid)

**Note:** Some fields apply to Tenant only, some to Merchant only, some to both. The column in the table below shows this.

---

| Applies To | Field Name | API Name | Type | Required | Group | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Both | UUID | `contract_uid` | string | NOT NULL | contract_identity | Primary key — `StyledMonoValue`. Format: derived from party+pid+rid+date |
| Both | Contract Type | `contract_type` | enum | NOT NULL | contract_identity | `L&L` / `Authorisation` / `C&S` |
| Tenant | Party Name (Tenant) | `party_name_tenant` | string | NOT NULL | contract_identity | Derived from Tenant.full_name — `EntityChip` |
| Merchant | Party Name (Merchant) | `party_name_merchant` | string | NOT NULL | contract_identity | Derived from Merchant.full_name — `EntityChip` |
| Tenant | RID | `rid` | string | NOT NULL | contract_identity | `Chip` linking to RID detail |
| Both | Contract Start Date | `contract_start_date` | date | NOT NULL | contract_terms | YYYY-MM-DD |
| Both | Contract End Date | `contract_end_date` | date | NOT NULL | contract_terms | Computed: start + service_term |
| Both | Service Term (Months) | `service_term` | number | NOT NULL | contract_terms | Integer |
| Both | Lock-in Duration (Months) | `lock_in_duration` | number | NULL | contract_terms | — |
| Both | Lock-in End Date | `lock_in_end_date` | date | NULL | contract_terms | Auto-calculated: start + lock_in_duration |
| Tenant | Preferred Move Out Date | `preferred_move_out_date` | date | NULL | contract_terms | Tenant's stated preferred exit date |
| Both | Notice Period (Days) | `notice_period` | number | NULL | contract_terms | — |
| Merchant | Key Handover Date | `key_handover_date` | date | NULL | contract_terms | YYYY-MM-DD |
| Merchant | Increment % | `increment_percentage` | number | NULL | contract_terms | Annual rent increment |
| Merchant | Increment Frequency | `increment_frequency` | enum | NULL | contract_terms | `Annual` / `Biennial` / `None` |
| Tenant | Payment Lifecycle | `payment_lifecycle` | enum | NULL | lifecycle_status | `Token Paid` / `FMR Paid` / `SD Paid` / `FMR and SD Cleared` / `Payments Done` |
| Tenant | Agreement Lifecycle | `agreement_lifecycle` | enum | NULL | lifecycle_status | `L&L and C&S Released` / `L&L Signed` / `C&S Signed` / `All agreements signed` |
| Merchant | Agreement Status | `agreement_status` | enum | NULL | lifecycle_status | `Negotiation` / `Triggered` / `Active` |
| Tenant | Total Retail Rent | `total_retail_rent` | number | NULL | commercials | ₹ gross rack rent |
| Tenant | Monthly License Fee | `monthly_license_fee` | number | NULL | commercials | ₹ |
| Tenant | Maintenance Fee | `maintenance_fee` | number | NULL | commercials | ₹ |
| Tenant | Furnishing Fee | `furnishing_fee` | number | NULL | commercials | ₹ |
| Tenant | Convenience Fee | `convenience_fee` | number | NULL | commercials | ₹ |
| Tenant | GST | `gst` | number | NULL | commercials | ₹ |
| Tenant | Discount Amount | `discount_amount` | number | NULL | commercials | ₹ |
| Tenant | Effective Retail Rent | `effective_retail_rent` | number | NULL | commercials | ₹ **Auto-calculated: total - discount** — display prominently |
| Tenant | Security Deposit | `security_deposit` | number | NULL | commercials | ₹ |
| Tenant | Caution Deposit | `caution_deposit` | number | NULL | commercials | ₹ |
| Tenant | Lock-in Fee | `lock_in_fee` | number | NULL | commercials | ₹ |
| Tenant | Exit Fee | `exit_fee` | number | NULL | commercials | ₹ |
| Merchant | Base Rent | `base_rent` | array | NOT NULL | commercials | Array with tenure + hike schedule: `[{months: 12, amount: 60000}, {months: 12, amount: 66000}]` |
| Merchant | Security Deposit | `merchant_security_deposit` | number | NULL | commercials | ₹ |
| Merchant | Management Fee/Month | `management_fee_per_month` | number | NULL | commercials | ₹ |
| Merchant | Total COGS | `total_cogs` | number | NULL | commercials | ₹ — derived from base rent + overheads |
| Merchant | Contract Acquisition Cost | `contract_acquisition_cost` | number | NULL | commercials | ₹ |
| Merchant | Contract Acquisition Cost Paid To | `contract_acquisition_cost_paid_to` | number | NULL | commercials | ₹ |
| Merchant | Payment Cycle | `payment_cycle` | enum | NOT NULL | commercials | `Prepaid` / `Postpaid` |
| Merchant | Payment Deadline | `payment_deadline` | date | NOT NULL | commercials | Last date of payment |
| Tenant | Damages Deductions | `damages_deductions` | number | NULL | deductions | ₹ |
| Tenant | Society Fees | `society_fees` | number | NULL | deductions | ₹ |
| Tenant | Penalty | `penalty` | number | NULL | deductions | ₹ |
| Tenant | FMR Status | `fmr_status` | enum | NULL | contract_status | First month rent status |
| Tenant | Deposit Paid Status | `deposit_paid_status` | enum | NULL | contract_status | Whether deposit received |
| Both | Agreement PDF | `agreement_pdf` | string | NULL | documents | File URL — `LightIconButton(IconFile)` |
| Merchant | Inventory List | `inventory_list` | string | NULL | documents | File URL — `LightIconButton(IconFile)` |

**Derived values (auto-calculated, read-only display):**
- `total_deductions` = damages_deductions + society_fees + penalty — show as bold sum in Deductions tab
- `effective_retail_rent` = total_retail_rent - discount_amount — show prominently in Commercials tab

**Contracts parity check (46 fields):**
- [ ] Both contract_identity fields shown for both types + type-specific party/RID fields
- [ ] All 8 contract_terms fields — merchant-only shown for Merchant contracts only
- [ ] All 3 lifecycle_status fields — correct sub-type shown per contract type
- [ ] All 17 Tenant commercials fields on Commercials tab
- [ ] All 8 Merchant commercials fields on Commercials tab
- [ ] Payment Progress Tracker stepper (Token → FMR → SD → Move-in Ready) derived from `payment_lifecycle`
- [ ] Total Deductions auto-sum on Deductions tab
- [ ] All 4 contract_status fields on Tenant contracts
- [ ] Both documents fields as LightIconButton

---

## OBJECT 6: TRANSACTIONS

**Purpose:** Every money movement in or out of the platform.

**Linked from:** Tickets (transaction_id) · ITEM (txn_no)

---

| Field Name | API Name | Type | DB Type | Required | Group | Enum Values / Notes |
|---|---|---|---|---|---|---|
| UTN | `utn` | string | VARCHAR(255) | NOT NULL | transaction_core | Unique Transaction Number — `StyledMonoValue`. Format: TXN-YYYYMMDD-XXXXX |
| Credit / Debit | `credit_debit` | enum | VARCHAR(100) | NOT NULL | transaction_core | `Credit` / `Debit` — drives green/red coloring |
| Transaction Date | `transaction_date` | date | DATE | NOT NULL | transaction_core | YYYY-MM-DD |
| Amount (INR) | `amount` | number | DECIMAL(12,2) | NOT NULL | transaction_core | Always positive — direction in credit_debit. ₹ Indian format |
| Purpose Category 1 | `purpose_category_1` | enum | VARCHAR(100) | NOT NULL | transaction_classification | `OPEX` / `CAPEX` / `INTEREST` / `SALARY` / `REIMBURSEMENT` / `REVENUE` / `REFUNDS` / `COGS` |
| Purpose Category 2 | `purpose_category_2` | enum | VARCHAR(100) | NOT NULL | transaction_classification | `DEPOSIT` / `TRANSPORT` / `FIXTURES` / `OFFICE` / `EMPLOYEE` / `CONSULTANT` / `CONTRACTOR` / `INVENTORY` / `TECH` / `MARKETING` / `FOOD AND BEVERAGES` / `RENT` / `CUSTOMER EXPERIENCE` / `ON/OFF-BOARDING` / `RUNNING EXPENSE` |
| From (Payer) | `from_party` | string | VARCHAR(255) | NOT NULL | transaction_parties | Entity sending money |
| From Party Type | `from_party_type` | enum | VARCHAR(100) | NOT NULL | transaction_parties | `Tenant` / `Landlord` / `Vendor` / `Platform` / `Third Party` / `Government` |
| From Party Info | `from_party_info` | string | TEXT | NULL | transaction_parties | GSTIN, PAN, Address — derived |
| To (Payee) | `to_party` | string | VARCHAR(255) | NOT NULL | transaction_parties | Entity receiving money |
| To Party Type | `to_party_type` | enum | VARCHAR(100) | NOT NULL | transaction_parties | Same values as From Party Type |
| Payment Channel | `payment_channel` | enum | VARCHAR(100) | NULL | transaction_payment | `UPI` / `NEFT` / `RTGS` / `IMPS` / `Auto-debit (NACH)` / `Virtual Account` / `Cheque` / `Card` / `Cash` / `Other` |
| Payment Provider | `payment_provider` | enum | VARCHAR(100) | NULL | transaction_payment | `Kotak` / `IDFC` / `Razorpayx` / `Volopay` / `CASHFREE` / `Mobiqwik` |
| Gateway Reference ID | `gateway_reference_id` | string | VARCHAR(255) | NULL | transaction_payment | `StyledMonoValue` — format varies: "CFPay_...", "5.09E11", "CB007..." |
| Created By | `created_by` | string | VARCHAR(255) | NOT NULL | transaction_audit | — |
| Created Date | `created_date` | datetime | TIMESTAMP | NOT NULL | transaction_audit | Distinct from transaction_date |
| Authorised By | `authorised_by` | string | VARCHAR(255) | NULL | transaction_audit | Dual-control compliance |
| Authorised Date | `authorised_date` | datetime | TIMESTAMP | NULL | transaction_audit | — |
| Line Item Date | `line_item_date` | date | DATE | NULL | transaction_line_items | Period this covers |
| Cost / Revenue Center | `cost_revenue_center` | string | VARCHAR(255) | NULL | transaction_line_items | Internal code — e.g. "Revenue", "Operations" |
| Description | `line_item_description` | string | TEXT | NULL | transaction_line_items | Format: "[work], [RID], [owner], [cost_code]" |
| Contract UID | `contract_uid` | string | VARCHAR(255) | NULL | transaction_links | `Chip` linking to Contract detail |
| Contact ID | `contact_id` | number | INTEGER | NULL | transaction_links | `EntityChip` linking to Tenant/Merchant/Vendor |
| PID | `pid` | number | INTEGER | NULL | transaction_links | `Chip` linking to PID detail |
| RID | `rid` | string | VARCHAR(255) | NULL | transaction_links | `Chip` linking to RID detail |

**Transactions parity check (25 fields):**
- [ ] `utn` shown as `StyledMonoValue` everywhere it appears
- [ ] `credit_debit` drives green (Credit) vs red (Debit) coloring on amount
- [ ] `amount` always displayed in ₹ Indian format
- [ ] All 8 `purpose_category_2` values are valid options in filter dropdowns
- [ ] `gateway_reference_id` shown as `StyledMonoValue`
- [ ] Transaction Drawer shows all 25 fields

---

## OBJECT 7: TICKETS

**Purpose:** Service requests, complaints, and maintenance tasks. Two sub-types: Tenant Tickets and Vendor Tickets.

**Linked from:** Transactions (ticket_id)

---

| Applies To | Field Name | API Name | Type | Required | Group | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Both | Pipeline | `pipeline` | enum | NOT NULL | ticket_identity | `Tenant` / `Landlord` |
| Both | Ticket ID | `ticket_id` | number | NOT NULL | ticket_identity | System integer — `StyledMonoValue` |
| Both | Create Date | `create_date` | datetime | NOT NULL | ticket_identity | Timestamp |
| Both | Created By | `created_by` | string | NOT NULL | ticket_identity | Who raised it |
| Tenant | Ticket Name | `ticket_name` | string | NOT NULL | ticket_identity | Short display title |
| Both | Ticket Description | `ticket_description` | text | NOT NULL | ticket_identity | Full issue description — show verbatim, no truncation on detail page |
| Both | Ticket Owner | `ticket_owner` | enum | NOT NULL | ticket_identity | Internal team member dropdown |
| Tenant | Conversation ID | `conversation_id` | string | NULL | ticket_identity | Superchat thread link |
| Both | PID | `pid` | string | NOT NULL | ticket_identity | `Chip` linking to PID detail |
| Tenant | RID | `rid` | string | NULL | ticket_identity | `Chip` linking to RID detail |
| Both | Ticket Category | `ticket_category` | enum | NOT NULL | categorisation | `Plumbing` / `Carpentry` / `Electrical` / `Utility` / `Inventory` / `Appliance` / `Agreement` / `Reimbursement` / `OO` (On/Off-boarding) / `Other` |
| Both | Ticket Status | `ticket_status` | enum | NOT NULL | categorisation | `New Request` / `Waiting on Customer` / `Waiting on Vendor` / `Blocked` / `Waiting on Landlord` / `Waiting for Payment` / `Ready for Closure` / `Closed` |
| Both | Priority | `priority` | enum | NOT NULL | categorisation | `Low` / `Medium` / `High` / `Urgent` / `Critical` |
| Tenant | Category (Phase) | `category_phase` | enum | NULL | categorisation | `Pre Move-In` / `Gestation` / `Active` |
| Tenant | Time-Date Slot | `time_slot` | datetime | NULL | categorisation | Preferred vendor visit time |
| Tenant | Ticket Flag | `ticket_flag` | enum | NULL | categorisation | `Reasonable` / `Not Reasonable` / `Subjective` |
| Tenant | Flag Notes | `flag_notes` | string | NULL | categorisation | Supporting notes |
| Both | Resolution Notes | `resolution_notes` | text | NULL | execution | Required for closure — editable `AutosizeTextInput` |
| Vendor | Notes | `notes` | text | NULL | execution | Append-only action log — render as timeline |
| Both | Collected from Tenant | `collected_from_tenant` | number | NULL | execution | ₹ |
| Both | Collected from Merchant | `collected_from_merchant` | number | NULL | execution | ₹ |
| Tenant | Total Cost (Net) | `total_cost` | number | NULL | execution | Auto-calculated: cost paid - collected |
| Both | Transaction ID | `transaction_id` | string | NULL | execution | `Chip` → Transaction Drawer |
| Both | Assigned Vendor | `assigned_vendor` | string | NULL | execution | `EntityChip` linking to Vendor detail |
| Tenant | Vendor Group Chat ID | `vendor_group_chat_id` | string | NULL | execution | — |
| Tenant | Related Tickets | `related_tickets` | string | NULL | execution | Comma-separated ticket IDs, each as a `Chip` |
| Vendor | First Response (mins) | `first_response_mins` | number | NULL | sla_feedback | — |
| Tenant | Time to First Assignment | `time_to_first_rep_assignment` | number | NULL | sla_feedback | Integer |
| Tenant | Time to First Response (SLA) | `time_to_first_response_sla_hours` | number | NULL | sla_feedback | Hours |
| Vendor | Time to Close (hours) | `time_to_close_hours` | number | NULL | sla_feedback | Auto-calculated on closure |
| Tenant | Tenant Rating | `tenant_rating` | number | NULL | sla_feedback | Scale 1–5 — star display |
| Tenant | CSAT Feedback | `csat_feedback` | string | NULL | sla_feedback | Free text |
| Tenant | CSAT Response | `csat_response` | string | NULL | sla_feedback | Internal response text |

**Tickets parity check (33 fields):**
- [ ] `pipeline` shown as Tag on list and detail header
- [ ] `ticket_description` shown untruncated on Ticket Detail
- [ ] `ticket_status` inline Tag with click-to-edit Select on Detail page
- [ ] `ticket_category` — if Appliance/Inventory, show Linked Item section
- [ ] All 8 `ticket_status` values correct in Resolution Board columns
- [ ] `resolution_notes` is editable `AutosizeTextInput` on Execution tab
- [ ] `notes` rendered as append-only Timeline log (not a text area)
- [ ] `related_tickets` rendered as clickable Chips
- [ ] `tenant_rating` as star display
- [ ] All SLA fields present on SLA & Feedback tab

---

## OBJECT 8: VENDOR

**Purpose:** External suppliers, contractors, and service providers.

**Linked from:** FSIN (vendor_code) · Tickets (assigned_vendor) · Transactions (from_party/to_party)

---

| Field Name | API Name | Type | DB Type | Required | Group | Enum Values / Notes |
|---|---|---|---|---|---|---|
| Vendor Code | `vendor_code` | string | VARCHAR(255) | NOT NULL | identification | Primary key — `StyledMonoValue`. 2-letter code: "AA", "GR" |
| Vendor Name | `vendor_name` | string | VARCHAR(255) | NOT NULL | identification | — |
| Vendor Type | `vendor_type` | enum | VARCHAR(100) | NOT NULL | identification | `Manufacturer` / `Wholesaler` / `Distributor` / `Freelancer` / `Aggregator` / `Retailer` / `Landlord` |
| Contact Name | `contact_name` | string | VARCHAR(255) | NOT NULL | contact_info | Primary POC |
| Phone | `phone` | string | VARCHAR(20) | NOT NULL | contact_info | Unique constraint |
| Alternate Phone | `alternate_phone` | string | VARCHAR(20) | NULL | contact_info | — |
| Email | `email` | string | VARCHAR(255) | NOT NULL | contact_info | Unique constraint |
| City | `city` | string | VARCHAR(255) | NOT NULL | contact_info | — |
| Address | `address` | text | TEXT | NOT NULL | contact_info | — |
| GST Number | `gst_number` | string | VARCHAR(255) | NULL | billing | — |
| PAN | `pan` | string | VARCHAR(255) | NULL | billing | Unique constraint |
| Billing Name | `billing_name` | string | VARCHAR(255) | NULL | billing | Name on invoices |
| Bank Name | `bank_name` | string | VARCHAR(255) | NULL | billing | — |
| Bank Account Number | `bank_account_number` | string | VARCHAR(255) | NULL | billing | — |
| IFSC Code | `ifsc_code` | string | VARCHAR(255) | NULL | billing | — |
| MSME Vendor | `msme_vendor` | enum | VARCHAR(100) | NULL | billing | `Yes` / `No` |
| Udyam Aadhaar | `udyam_aadhaar` | string | VARCHAR(255) | NULL | billing | MSME registration number |
| Specialization | `specialization` | text | TEXT | NOT NULL | capability_scope | Detailed expertise description |
| TAT (Days) | `tat_in_days` | number | INTEGER | NOT NULL | capability_scope | Standard turnaround time |
| Customization Capability | `customization_capability` | enum | VARCHAR(100) | NOT NULL | capability_scope | `Low` / `Medium` / `High` |
| Standardisation Fit | `standardisation_fit` | enum | VARCHAR(100) | NOT NULL | capability_scope | `C1` / `C2` / `C3` |
| Quality Tier | `quality_tier` | enum | VARCHAR(100) | NOT NULL | commercials | `T1` / `T2` / `T3` |
| Payment Terms | `payment_terms` | string | VARCHAR(255) | NULL | commercials | — |
| Min Order Value | `min_order_value` | number | DECIMAL(12,2) | NULL | commercials | ₹ |
| Negotiation Remarks | `negotiation_remarks` | text | TEXT | NULL | commercials | — |
| Created At | `created_at` | datetime | TIMESTAMP | NOT NULL | internal | System timestamp |
| Updated At | `updated_at` | datetime | TIMESTAMP | NOT NULL | internal | System timestamp |

**Vendor parity check (27 fields):**
- [ ] All fields across Contact & Billing, Capability, Commercials tabs
- [ ] `vendor_code` as `StyledMonoValue` throughout

---

## OBJECT 9: FSIN (Furniture Standard Identification Number)

**Purpose:** Product catalog entry / SKU template. Each FSIN defines what a type of item IS. Individual units tracked in ITEM.

**Linked from:** ITEM (fsin_code)

---

| Field Name | API Name | Type | DB Type | Required | Group | Enum Values / Notes |
|---|---|---|---|---|---|---|
| FSIN Code | `fsin_code` | string | VARCHAR(255) | NOT NULL | identification | Primary key — `StyledMonoValue`. Format: "AA10001" |
| Vendor Code | `vendor_code` | string | VARCHAR(255) | NOT NULL | identification | FK to Vendor — `EntityChip` linking to Vendor detail |
| Item Name | `item_name` | string | VARCHAR(255) | NOT NULL | identification | Product type and name |
| Category | `category` | enum | VARCHAR(100) | NOT NULL | identification | Product category |
| UOM | `uom` | enum | VARCHAR(100) | NOT NULL | identification | Unit of measurement |
| Image | `image` | string | VARCHAR(500) | NOT NULL | identification | Product image URL — render as 48×48 placeholder box |
| Reorder Point | `reorder_point` | number | INTEGER | NULL | identification | Min stock before reorder alert |
| Annual Depreciation | `annual_depreciation` | number | DECIMAL(12,2) | NOT NULL | identification | ₹/year |
| Perceived Value | `perceived_value` | number | DECIMAL(12,2) | NULL | identification | ₹ estimated |
| Dimensions | `dimensions` | string | VARCHAR(255) | NULL | specification | L × W × H |
| Material | `material` | string | VARCHAR(255) | NULL | specification | Primary material |
| Finish | `finish` | string | VARCHAR(255) | NULL | specification | Surface finish |
| Color | `color` | string | VARCHAR(255) | NULL | specification | — |
| Style | `style` | string | VARCHAR(255) | NULL | specification | Design style |
| Attribute | `attribute` | string | VARCHAR(255) | NULL | specification | Combined category/color/material for search |
| Packaging | `packaging` | enum | VARCHAR(100) | NOT NULL | others | `Flatpack` / `Assembled` |
| Lego (Tag Count) | `lego` | number | INTEGER | NOT NULL | others | Number of tags to print |

**FSIN parity check (17 fields):**
- [ ] All 9 identification fields in Catalog tab
- [ ] All 6 specification fields in Specifications tab
- [ ] Both `others` fields in Catalog tab

---

## OBJECT 10: ITEM

**Purpose:** Single physical unit of inventory. Each ITEM is one instance of an FSIN.

**Linked from:** FSIN (fsin_code reverse) · PID/RID (location)

---

| Field Name | API Name | Type | DB Type | Required | Group | Notes |
|---|---|---|---|---|---|---|
| Item Code | `item_code` | string | VARCHAR(255) | NOT NULL | identification | Primary key — `StyledMonoValue` |
| FSIN Code | `fsin_code` | string | VARCHAR(255) | NOT NULL | identification | FK to FSIN — `Chip` with product name, links to FSIN detail |
| PO Line ID | `po_line_id` | string | UUID | NOT NULL | identification | Purchase order line — `StyledMonoValue` |
| Created At | `created_at` | datetime | TIMESTAMP | NOT NULL | identification | Item creation timestamp |
| Serial No. | `serial_no` | number | INTEGER | NOT NULL | identification | Sequence number |
| Unit Price (excl GST) | `unit_price` | number | DECIMAL(12,2) | NOT NULL | identification | ₹ from PO — never changes |
| Lock | `lock` | bool | BOOLEAN | NOT NULL | state | Reserved flag — `Toggle` display (read-only) |
| Locked By PFS | `lock_by_pfs` | string | UUID | NULL | state | `StyledMonoValue` |
| Locked At | `locked_at` | datetime | TIMESTAMP | NULL | state | — |
| Location | `location` | string | VARCHAR(255) | NULL | state | e.g. "09BR2" or "WH01-R3" — `Chip` linking to RID if property |
| State | `state` | enum | VARCHAR(100) | NOT NULL | state | `BUY` / `WIB` / `WOB` / `PIB` / `POB` / `WORK` / `DEAD` — Tag with color |
| State Time | `state_time` | datetime | TIMESTAMP | NULL | state | When item entered current state |
| Latest Snapshot Date | `latest_snapshot_date` | datetime | TIMESTAMP | NULL | state | When last photo taken |
| Snapshot | `snapshot` | string | VARCHAR(500) | NULL | state | Latest condition photo — render as 80×80 image box |
| Utilised At | `utilised_at` | datetime | TIMESTAMP | NULL | pib | First true utilization date |
| QA Flag | `qa_flag` | enum | VARCHAR(100) | NULL | icqa | `Yes` / `No` — found/not found in warehouse check — `AnimatedCheckmark` or ✗ |
| Bill Document ID | `bill_document_id` | string | VARCHAR(255) | NULL | transaction_links | Billing document — `LightIconButton(IconFile)` |

**Derived fields on ITEM (from PO via FSIN, shown read-only):**
- `gst_percent` — GST rate from PO at creation — show as plain display field
- `txn_no` / UTN — transaction number for purchase — `Chip` → Transaction Drawer

**Item state color mapping for Tags:**
```
BUY   → yellow  (ordered, not received)
WIB   → yellow  (warehouse in-bound)
WOB   → yellow  (warehouse out-bound)
PIB   → purple  (in property, in use)
POB   → turquoise (property out-bound)
WORK  → pink    (under repair)
DEAD  → gray    (scrapped)
```

**ITEM parity check (17 fields + 2 derived):**
- [ ] All identification fields in Unit Detail tab
- [ ] All 8 state fields shown with correct Tag colors
- [ ] `utilised_at` in PIB section
- [ ] `qa_flag` as AnimatedCheckmark or ✗
- [ ] `bill_document_id` as LightIconButton
- [ ] `gst_percent` and `txn_no` shown as derived read-only display fields
- [ ] Location History Table in History tab (primary view)
- [ ] Repair vs Replace Panel in right sidebar (C-01 answer)

---

## OBJECT 11: OVERHEADS

**Purpose:** Recurring and one-time property-level costs. Each record belongs to one PID and has a category type.

**Linked from:** Transactions (cost_revenue_center) · Contracts/Merchant (total_cogs aggregated)

**Note:** Each `category_type` has its own set of category-specific fields. Only show fields relevant to the selected category.

---

### BASE FIELDS (all overhead records)

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| PID | `pid` | string | NOT NULL | FK to PID — `Chip` linking to PID detail |
| Category Type | `category_type` | enum | NOT NULL | `Maintenance` / `WiFi` / `DG (Generator)` / `Water` / `Water Purifier` / `Gas Connection` / `Electricity` / `Helper` |
| Object Type | `object_type` | enum | NOT NULL | `Recurring` / `One-Time` |
| Frequency | `frequency` | enum | NULL | `Monthly` / `Quarterly` / `Bi-Annually` / `Annually` |
| Start Date | `start_date` | date | NULL | YYYY-MM-DD |
| End Date | `end_date` | date | NULL | YYYY-MM-DD |
| Document | `document` | string | NULL | File URL — `LightIconButton(IconFile)` |

---

### MAINTENANCE FIELDS (when category_type = "Maintenance")

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Amount | `maintenance_amount` | number | NOT NULL | ₹ |
| Cutoff Date | `maintenance_cutoff_date` | string | NOT NULL | Day of month, e.g. "10th" |
| Cycle | `maintenance_cycle` | enum | NOT NULL | `Prepaid` / `Postpaid` |
| Payment To Landlord | `maintenance_pay_to_ll` | bool | NOT NULL | Toggle display |
| Collection From Tenant | `maintenance_collect_tenant` | bool | NOT NULL | Toggle display |

---

### WIFI FIELDS (when category_type = "WiFi")

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Service Provider | `wifi_provider` | enum | NOT NULL | `ACT` / `Airtel` / `Tata` |
| Account ID | `wifi_account_id` | string | NULL | — |
| Start Date | `wifi_start_date` | date | NULL | Activation date |
| Plan Duration | `wifi_plan_duration` | number | NULL | Months |
| End Date | `wifi_end_date` | date | NULL | — |
| Plan Cost | `wifi_plan_cost` | number | NULL | ₹ |
| SSID | `wifi_ssid` | string | NOT NULL | Network name |
| Password | `wifi_password` | string | NOT NULL | **Masked ••••••** with `LightIconButton(IconEye)` reveal toggle |
| Ownership | `wifi_ownership` | string | NOT NULL | `Product` / `CX` |
| Amount | `wifi_amount` | number | NULL | ₹/month |
| Registered Number | `wifi_registered_number` | string | NULL | — |
| Collection From Tenant | `wifi_collect_tenant` | bool | NOT NULL | Toggle display |

---

### ELECTRICITY FIELDS (when category_type = "Electricity")

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Provider | `electricity_provider` | string | NOT NULL | Electricity board name |
| Type of Connection | `electricity_connection_type` | string | NOT NULL | Domestic / Commercial etc. |
| Account Number | `electricity_account_no` | string | NULL | Meter/account number |
| Password | `electricity_password` | string | NULL | **Masked ••••••** with reveal toggle |
| Ownership | `electricity_ownership` | enum | NOT NULL | — |
| Payment To Landlord | `electricity_pay_to_ll` | bool | NOT NULL | Toggle display |
| Collection From Tenant | `electricity_collect_tenant` | bool | NOT NULL | Toggle display |

---

### DG / GENERATOR FIELDS (when category_type = "DG (Generator)")

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Brand / Product Details | `dg_brand_details` | string | NOT NULL | — |
| Capacity (kVA) | `dg_capacity_kva` | number | NOT NULL | Integer |
| Maintenance Schedule | `dg_maintenance_schedule` | enum | NULL | Servicing frequency |
| Fuel Tank Capacity | `dg_fuel_tank_capacity` | number | NOT NULL | Litres |
| Refill Unit (Litres) | `dg_refill_unit_litres` | number | NOT NULL | Standard refill qty |
| Amount | `dg_amount` | number | NULL | ₹ running cost |
| Payment To Landlord | `dg_pay_to_ll` | bool | NOT NULL | Toggle display |
| Collection From Tenant | `dg_collect_tenant` | bool | NOT NULL | Toggle display |

---

### WATER FIELDS (when category_type = "Water")

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Account Number | `water_account_no` | string | NULL | — |
| Password | `water_password` | string | NULL | **Masked ••••••** with reveal toggle |
| Ownership | `water_ownership` | enum | NOT NULL | — |
| Payments / Dues | `water_payments_dues` | number | NULL | ₹ outstanding |
| Payment To Landlord | `water_pay_to_ll` | bool | NOT NULL | Toggle display |
| Collection From Tenant | `water_collect_tenant` | bool | NOT NULL | Toggle display |

---

### WATER PURIFIER FIELDS (when category_type = "Water Purifier")

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Type of Purifier | `purifier_type` | enum | NOT NULL | Rented / Owned |
| Brand Name | `purifier_brand` | enum | NOT NULL | — |
| ID / Serial No. | `purifier_serial_no` | string | NOT NULL | — |
| Cost | `purifier_cost` | number | NOT NULL | ₹ subscription cost |
| Ownership | `purifier_ownership` | string | NOT NULL | Flent / Owner |
| Start Date | `purifier_start_date` | datetime | NULL | — |
| Duration | `purifier_duration` | number | NULL | Months |
| Payment To Landlord | `purifier_pay_to_ll` | bool | NOT NULL | Toggle display |
| Collection From Tenant | `purifier_collect_tenant` | bool | NOT NULL | Toggle display |

---

### GAS CONNECTION FIELDS (when category_type = "Gas Connection")

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Type of Connection | `gas_connection_type` | string | NOT NULL | Pipeline / Cylinder / LPG |
| Account Number | `gas_account_no` | string | NULL | — |
| Password | `gas_password` | string | NULL | **Masked ••••••** with reveal toggle |
| Ownership | `gas_ownership` | enum | NOT NULL | — |
| Payment To Landlord | `gas_pay_to_ll` | bool | NOT NULL | Toggle display |
| Collection From Tenant | `gas_collect_tenant` | bool | NOT NULL | Toggle display |

---

### HELPER FIELDS (when category_type = "Helper")

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Name | `helper_name` | string | NOT NULL | Full name |
| Phone | `helper_phone` | string | NOT NULL | Contact number |
| Role | `helper_role` | enum | NOT NULL | `Caretaker` / `Cleaner` / `Security` / `Cook` / `Maintenance` / `Other` |
| Monthly Salary | `helper_salary` | number | NOT NULL | ₹ |
| Working Hours | `helper_hours` | string | NULL | e.g. "8AM–8PM" |
| Responsibilities | `helper_responsibilities` | text | NULL | Long text |
| Payment To Landlord | `helper_pay_to_ll` | bool | NOT NULL | Toggle display |
| Collection From Tenant | `helper_collect_tenant` | bool | NOT NULL | Toggle display |

**Overheads parity check:**
- [ ] Base fields (7) always shown regardless of category
- [ ] Maintenance (5) — shown only when category_type = Maintenance
- [ ] WiFi (12) — shown only when category_type = WiFi
- [ ] Electricity (7) — shown only when category_type = Electricity
- [ ] DG/Generator (8) — shown only when category_type = DG (Generator)
- [ ] Water (6) — shown only when category_type = Water
- [ ] Water Purifier (9) — shown only when category_type = Water Purifier
- [ ] Gas Connection (6) — shown only when category_type = Gas Connection
- [ ] Helper (8) — shown only when category_type = Helper
- [ ] All password fields (WiFi, Electricity, Water, Gas) are masked with reveal toggle

---

## CROSS-OBJECT PARITY RULES

These rules apply across all objects. Verify before marking any screen complete.

### ID display rules
Every field that is a primary key or foreign key must be rendered in `StyledMonoValue` (monospace font, `font.color.secondary`):
- `record_id` on Tenant
- `pid` on PID, RID, Contracts, Transactions, Tickets, Overheads
- `rid` on RID, Contracts, Transactions, Tickets
- `contract_uid` on Contracts, Transactions
- `utn` on Transactions
- `ticket_id` on Tickets
- `vendor_code` on Vendor, FSIN
- `fsin_code` on FSIN, ITEM
- `item_code` on ITEM
- `po_line_id` on ITEM
- `gateway_reference_id` on Transactions

### File URL display rules
Every field with `Format: File URL` renders as `LightIconButton(IconFile, "View [Document Name]")`. Never render as `<img>`. Never render as raw URL text.

List of all File URL fields:
- Tenant: `aadhaar_front_image`, `aadhaar_back_image`, `pan_card_image`, `bgv_report`
- Merchant: `aadhaar_back`, `pan_card_image`
- PID: `potential_report`, `final_invoice`, `rules_regulations`
- RID: `annexure`
- Contracts: `agreement_pdf`, `inventory_list`
- Overheads: `document`
- FSIN: `image` (render as 48×48 placeholder box, not a button)
- ITEM: `snapshot` (render as 80×80 image box), `bill_document_id` (LightIconButton)

### Password masking rules
Every field with "Password" in the name renders as `••••••` by default with a `LightIconButton(IconEye)` reveal toggle. Never show passwords in plain text by default.

Password fields:
- `wifi_password`
- `electricity_password`
- `water_password`
- `gas_password`
- Merchant: `bank_account_number` (partially masked: show last 4 digits only)

### Boolean / Toggle display rules
All `bool` fields render as a `Toggle` component (from `twenty-ui/input`) in read-only display mode — not as "true/false" text or checkboxes.

### Enum value completeness
Every `enum` or `multi-enum` field must have all its values available as options in:
1. Any filter Select/dropdown that references that field
2. Any form input that creates/edits that field
3. Any Tag color mapping that displays that field's value

---

## MASTER FIELD COUNT SUMMARY

| Object | Total Fields | Required (NOT NULL) | Optional (NULL) | Derived/System |
|---|---|---|---|---|
| Tenant | 62 | 12 | 44 | 6 |
| Merchant | 32 | 12 | 20 | 3 |
| PID | 51 | 17 | 34 | 3 |
| RID | 17 | 5 | 12 | 4 |
| Contracts | 46 | 10 | 36 | 7 |
| Transactions | 25 | 10 | 15 | 5 |
| Tickets | 33 | 7 | 26 | 3 |
| Vendor | 27 | 14 | 13 | 2 |
| FSIN | 17 | 9 | 8 | 1 |
| ITEM | 19 | 7 | 12 | 4 |
| Overheads (base) | 7 | 3 | 4 | 1 |
| Overheads (Maintenance) | 5 | 5 | 0 | 0 |
| Overheads (WiFi) | 12 | 5 | 7 | 0 |
| Overheads (Electricity) | 7 | 5 | 2 | 0 |
| Overheads (DG/Generator) | 8 | 6 | 2 | 0 |
| Overheads (Water) | 6 | 3 | 3 | 0 |
| Overheads (Water Purifier) | 9 | 6 | 3 | 0 |
| Overheads (Gas Connection) | 6 | 4 | 2 | 0 |
| Overheads (Helper) | 8 | 6 | 2 | 0 |
| **TOTAL** | **~450** | **~166** | **~248** | **~39** |

---

## HOW TO RUN THE PARITY CHECK

After building each detail screen, run through this checklist:

```
For TENANT DETAIL:
  grep -r "first_name\|last_name\|email\|mobile_phone" src/pages/TenantDetail.tsx → must find
  grep -r "aadhaar_number\|aadhaar_front\|aadhaar_back" src/pages/TenantDetail.tsx → must find
  grep -r "pan\b\|pan_card_image" src/pages/TenantDetail.tsx → must find
  grep -r "first_inquiry_channel\|wax_code\|utm_source" src/pages/TenantDetail.tsx → must find
  grep -r "preferred_micromarkets\|budget_max\|has_pet" src/pages/TenantDetail.tsx → must find
  grep -r "tenant_lifecycle\|current_pid\|current_rid" src/pages/TenantDetail.tsx → must find
  grep -r "bgv_status\|disqualification_reason" src/pages/TenantDetail.tsx → must find
  grep -r "onboarding_csat\|last_nps_score\|nps_category" src/pages/TenantDetail.tsx → must find
  grep -r "total_visits_count\|first_visit_date\|rids_visited" src/pages/TenantDetail.tsx → must find
```

Run equivalent checks for every object. Every field API name must appear at least once in the relevant page component file — either as a rendered value, a TypeScript type property access, or a mock data key.

Fields that are system-only (`record_id`, `created_at`, internal timestamps) must appear in the TypeScript `type` definition even if not rendered visibly in the UI.
