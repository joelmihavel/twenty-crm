# Phase 1: Core Entities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the 16 database tables for Tenant, Merchant, and Vendor objects with all fields, constraints, indexes, and enum types.

**Architecture:** Each object uses shared base + extension tables pattern. Base tables hold core identity + cross-object FKs. Extensions hold group-specific fields joined by FK to base PK.

**Tech Stack:** PostgreSQL 16, TypeORM migrations, NestJS

**Migration location:** `packages/twenty-server/src/database/typeorm/core/migrations/flent/`

---

## File Structure

```
packages/twenty-server/src/database/typeorm/core/migrations/flent/
├── 1744300001-phase1-tenant-base.ts                  # Task 1: tenants base table
├── 1744300002-phase1-tenant-extensions-attribution.ts # Task 2: tenant_attribution + tenant_requirements
├── 1744300003-phase1-tenant-extensions-lifecycle.ts   # Task 3: tenant_qualification + tenant_visit_summary + tenant_satisfaction
├── 1744300004-phase1-merchant-base.ts                 # Task 4: merchants base table
├── 1744300005-phase1-merchant-extensions.ts            # Task 5: merchant_landlord + merchant_poc + merchant_broker + merchant_management
├── 1744300006-phase1-vendor-base-contact.ts            # Task 6: vendors base + vendor_contact
├── 1744300007-phase1-vendor-extensions.ts              # Task 7: vendor_billing + vendor_capability + vendor_commercials
```

---

## Task 1: Tenant Base Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300001-phase1-tenant-base.ts`

This migration creates the `tenants` base table with 21 columns covering identity, contact, KYC documents, social links, and lifecycle tracking.

- [ ] **Step 1: Create the flent migration directory**

```bash
mkdir -p packages/twenty-server/src/database/typeorm/core/migrations/flent/
```

- [ ] **Step 2: Create the tenants base table migration**

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateTenantBase1744300001 implements MigrationInterface {
  name = 'CreateTenantBase1744300001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."tenants" (
        "record_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "first_name" character varying(255) NOT NULL,
        "last_name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "mobile_phone" character varying(20) NOT NULL,
        "whatsapp_phone" character varying(20),
        "gender" character varying(100) NOT NULL,
        "date_of_birth" date,
        "aadhaar_number" character varying(255) NOT NULL,
        "aadhaar_front_image" character varying(500) NOT NULL,
        "aadhaar_back_image" character varying(500) NOT NULL,
        "pan" character varying(255) NOT NULL,
        "pan_card_image" character varying(500),
        "linkedin_url" character varying(500),
        "twitter_url" character varying(500),
        "instagram_id" character varying(500),
        "occupation" character varying(255),
        "employer_name" character varying(255),
        "tenant_lifecycle" character varying(100) NOT NULL DEFAULT 'New Inquiry',
        "current_pid" character varying(255),
        "current_rid" character varying(255),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants_record_id" PRIMARY KEY ("record_id")
      )`
    );

    // Unique index on email
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_TENANTS_EMAIL_UNIQUE" ON "core"."tenants" ("email")`
    );

    // Non-unique indexes for frequent lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_TENANTS_MOBILE_PHONE" ON "core"."tenants" ("mobile_phone")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_TENANTS_TENANT_LIFECYCLE" ON "core"."tenants" ("tenant_lifecycle")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_TENANTS_CURRENT_PID" ON "core"."tenants" ("current_pid")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_TENANTS_CURRENT_RID" ON "core"."tenants" ("current_rid")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANTS_CURRENT_RID"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANTS_CURRENT_PID"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANTS_TENANT_LIFECYCLE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANTS_MOBILE_PHONE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANTS_EMAIL_UNIQUE"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."tenants"`);
  }
}
```

- [ ] **Step 3: Verify the migration**

Run the migration and then verify with information_schema queries:

```sql
-- Verify table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'core' AND table_name = 'tenants';

-- Verify column count and types
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'core' AND table_name = 'tenants'
ORDER BY ordinal_position;

-- Verify indexes exist
SELECT indexname FROM pg_indexes
WHERE schemaname = 'core' AND tablename = 'tenants';
```

Expected: 23 columns (21 data + created_at + updated_at), 5 indexes (1 PK + 1 unique + 3 non-unique).

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300001-phase1-tenant-base.ts
git commit -m "feat(flent): add tenants base table migration

Creates the tenants base table with 21 columns for identity, contact,
KYC documents, social links, and lifecycle tracking. Includes unique
index on email and lookup indexes on mobile_phone, tenant_lifecycle,
current_pid, and current_rid.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Tenant Extensions -- Attribution and Requirements

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300002-phase1-tenant-extensions-attribution.ts`

This migration creates `tenant_attribution` (13 columns for marketing source tracking) and `tenant_requirements` (11 columns for housing preferences). Both use 1:1 FK to `tenants.record_id` as their PK.

- [ ] **Step 1: Create the migration file**

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateTenantExtensionsAttribution1744300002 implements MigrationInterface {
  name = 'CreateTenantExtensionsAttribution1744300002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── tenant_attribution ──────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."tenant_attribution" (
        "tenant_id" uuid NOT NULL,
        "create_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "first_inquiry_channel" character varying(100) NOT NULL,
        "source_drilldown_1" character varying(100),
        "source_drilldown_2" character varying(255),
        "wax_code" character varying(255),
        "google_click_id" character varying(255),
        "facebook_click_id" character varying(255),
        "utm_source" character varying(255),
        "utm_medium" character varying(255),
        "utm_campaign" character varying(255),
        "utm_content" character varying(255),
        "utm_term" character varying(255),
        CONSTRAINT "PK_tenant_attribution_tenant_id" PRIMARY KEY ("tenant_id"),
        CONSTRAINT "FK_tenant_attribution_tenant_id" FOREIGN KEY ("tenant_id")
          REFERENCES "core"."tenants" ("record_id") ON DELETE CASCADE
      )`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_TENANT_ATTRIBUTION_FIRST_INQUIRY_CHANNEL" ON "core"."tenant_attribution" ("first_inquiry_channel")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_TENANT_ATTRIBUTION_CREATE_DATE" ON "core"."tenant_attribution" ("create_date")`
    );

    // ── tenant_requirements ─────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."tenant_requirements" (
        "tenant_id" uuid NOT NULL,
        "preferred_micromarkets" text[],
        "preferred_occupancy_type" character varying(100),
        "preferred_furnished_type" character varying(100),
        "preferred_move_in_timeline" character varying(100),
        "gender_preferences" character varying(100),
        "food_preferences" character varying(100),
        "has_pet" boolean,
        "smoking_preferences" character varying(100),
        "custom_preference" text,
        "budget_max" decimal(12,2),
        CONSTRAINT "PK_tenant_requirements_tenant_id" PRIMARY KEY ("tenant_id"),
        CONSTRAINT "FK_tenant_requirements_tenant_id" FOREIGN KEY ("tenant_id")
          REFERENCES "core"."tenants" ("record_id") ON DELETE CASCADE
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."tenant_requirements"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANT_ATTRIBUTION_CREATE_DATE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANT_ATTRIBUTION_FIRST_INQUIRY_CHANNEL"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."tenant_attribution"`);
  }
}
```

- [ ] **Step 2: Verify the migration**

```sql
-- Verify tenant_attribution
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'core' AND table_name = 'tenant_attribution'
ORDER BY ordinal_position;

-- Verify tenant_requirements
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'core' AND table_name = 'tenant_requirements'
ORDER BY ordinal_position;

-- Verify FK constraints exist
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'core' AND table_name IN ('tenant_attribution', 'tenant_requirements');
```

Expected: tenant_attribution has 13 columns with PK + FK + 2 indexes. tenant_requirements has 11 columns with PK + FK.

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300002-phase1-tenant-extensions-attribution.ts
git commit -m "feat(flent): add tenant attribution and requirements extension tables

Creates tenant_attribution (13 cols) for marketing source tracking with
UTM parameters, click IDs, and inquiry channels. Creates
tenant_requirements (11 cols) for housing preferences including
micromarkets, occupancy type, budget, and lifestyle preferences.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Tenant Extensions -- Qualification, Visit Summary, Satisfaction

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300003-phase1-tenant-extensions-lifecycle.ts`

This migration creates 3 extension tables: `tenant_qualification` (7 cols for BGV and qualification tracking), `tenant_visit_summary` (7 cols for visit aggregates), and `tenant_satisfaction` (7 cols for CSAT/NPS scores with CHECK constraints).

- [ ] **Step 1: Create the migration file**

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateTenantExtensionsLifecycle1744300003 implements MigrationInterface {
  name = 'CreateTenantExtensionsLifecycle1744300003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── tenant_qualification ────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."tenant_qualification" (
        "tenant_id" uuid NOT NULL,
        "qualification_status" character varying(100),
        "disqualification_reason" character varying(100),
        "disqualification_detail" text,
        "bgv_status" character varying(100),
        "bgv_report" character varying(500),
        "bgv_completed_date" date,
        CONSTRAINT "PK_tenant_qualification_tenant_id" PRIMARY KEY ("tenant_id"),
        CONSTRAINT "FK_tenant_qualification_tenant_id" FOREIGN KEY ("tenant_id")
          REFERENCES "core"."tenants" ("record_id") ON DELETE CASCADE
      )`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_TENANT_QUALIFICATION_STATUS" ON "core"."tenant_qualification" ("qualification_status")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_TENANT_QUALIFICATION_BGV_STATUS" ON "core"."tenant_qualification" ("bgv_status")`
    );

    // ── tenant_visit_summary ────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."tenant_visit_summary" (
        "tenant_id" uuid NOT NULL,
        "total_visits_count" integer NOT NULL DEFAULT 0,
        "visits_cancelled" integer,
        "visits_completed" integer,
        "first_visit_date" date,
        "rids_visited" character varying(255),
        "feedback" text,
        CONSTRAINT "PK_tenant_visit_summary_tenant_id" PRIMARY KEY ("tenant_id"),
        CONSTRAINT "FK_tenant_visit_summary_tenant_id" FOREIGN KEY ("tenant_id")
          REFERENCES "core"."tenants" ("record_id") ON DELETE CASCADE
      )`
    );

    // ── tenant_satisfaction ─────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."tenant_satisfaction" (
        "tenant_id" uuid NOT NULL,
        "onboarding_csat_score" smallint,
        "offboarding_csat_score" smallint,
        "last_nps_score" smallint,
        "last_nps_date" date,
        "nps_category" character varying(100),
        "last_nps_comment" text,
        CONSTRAINT "PK_tenant_satisfaction_tenant_id" PRIMARY KEY ("tenant_id"),
        CONSTRAINT "FK_tenant_satisfaction_tenant_id" FOREIGN KEY ("tenant_id")
          REFERENCES "core"."tenants" ("record_id") ON DELETE CASCADE,
        CONSTRAINT "CHK_tenant_satisfaction_onboarding_csat"
          CHECK ("onboarding_csat_score" BETWEEN 1 AND 5),
        CONSTRAINT "CHK_tenant_satisfaction_offboarding_csat"
          CHECK ("offboarding_csat_score" BETWEEN 1 AND 5),
        CONSTRAINT "CHK_tenant_satisfaction_nps"
          CHECK ("last_nps_score" BETWEEN 0 AND 10)
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."tenant_satisfaction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."tenant_visit_summary"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANT_QUALIFICATION_BGV_STATUS"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_TENANT_QUALIFICATION_STATUS"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."tenant_qualification"`);
  }
}
```

- [ ] **Step 2: Verify the migration**

```sql
-- Verify all 3 tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'core'
  AND table_name IN ('tenant_qualification', 'tenant_visit_summary', 'tenant_satisfaction')
ORDER BY table_name;

-- Verify CHECK constraints on tenant_satisfaction
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'core'
  AND constraint_name LIKE 'CHK_tenant_satisfaction%';

-- Verify column counts
SELECT table_name, COUNT(*) as col_count
FROM information_schema.columns
WHERE table_schema = 'core'
  AND table_name IN ('tenant_qualification', 'tenant_visit_summary', 'tenant_satisfaction')
GROUP BY table_name
ORDER BY table_name;
```

Expected: 3 tables with 7 columns each. 3 CHECK constraints on tenant_satisfaction. 2 indexes on tenant_qualification.

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300003-phase1-tenant-extensions-lifecycle.ts
git commit -m "feat(flent): add tenant qualification, visit summary, and satisfaction tables

Creates tenant_qualification (7 cols) with qualification and BGV status
tracking. Creates tenant_visit_summary (7 cols) for visit aggregates.
Creates tenant_satisfaction (7 cols) with CSAT (1-5) and NPS (0-10)
CHECK constraints for score validation.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Merchant Base Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300004-phase1-merchant-base.ts`

This migration creates the `merchants` base table with 13 columns covering merchant identity, contact details, and type classification. Merchants can be Landlords, POCs, Leads, Brokers, or Management entities.

- [ ] **Step 1: Create the migration file**

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateMerchantBase1744300004 implements MigrationInterface {
  name = 'CreateMerchantBase1744300004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."merchants" (
        "record_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "merchant_type" character varying(100) NOT NULL,
        "prefix" character varying(100),
        "first_name" character varying(255) NOT NULL,
        "last_name" character varying(255) NOT NULL,
        "email" character varying(255),
        "country_code" character varying(100) NOT NULL DEFAULT '+91',
        "phone" character varying(20) NOT NULL,
        "current_city" character varying(255),
        "lead_source" character varying(100),
        "unique_id" character varying(255),
        "first_added" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "last_updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_merchants_record_id" PRIMARY KEY ("record_id")
      )`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_MERCHANTS_MERCHANT_TYPE" ON "core"."merchants" ("merchant_type")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_MERCHANTS_EMAIL" ON "core"."merchants" ("email")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_MERCHANTS_PHONE" ON "core"."merchants" ("phone")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_MERCHANTS_UNIQUE_ID" ON "core"."merchants" ("unique_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_MERCHANTS_UNIQUE_ID"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_MERCHANTS_PHONE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_MERCHANTS_EMAIL"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_MERCHANTS_MERCHANT_TYPE"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."merchants"`);
  }
}
```

- [ ] **Step 2: Verify the migration**

```sql
-- Verify table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'core' AND table_name = 'merchants';

-- Verify column count and types
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'core' AND table_name = 'merchants'
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname FROM pg_indexes
WHERE schemaname = 'core' AND tablename = 'merchants';
```

Expected: 13 columns, 5 indexes (1 PK + 4 non-unique on merchant_type, email, phone, unique_id).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300004-phase1-merchant-base.ts
git commit -m "feat(flent): add merchants base table migration

Creates the merchants base table with 13 columns for identity, contact,
and type classification (Landlord/POC/Lead/Broker/Management). Includes
lookup indexes on merchant_type, email, phone, and unique_id.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Merchant Extension Tables

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300005-phase1-merchant-extensions.ts`

This migration creates 4 merchant extension tables: `merchant_landlord` (19 cols with KYC, banking, and property details), `merchant_poc` (placeholder), `merchant_broker` (placeholder), and `merchant_management` (placeholder). The POC, broker, and management tables have their PKs and FKs established now; columns will be added in a future migration when specs are finalized.

- [ ] **Step 1: Create the migration file**

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateMerchantExtensions1744300005 implements MigrationInterface {
  name = 'CreateMerchantExtensions1744300005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── merchant_landlord ───────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."merchant_landlord" (
        "merchant_id" uuid NOT NULL,
        "disqualification_reason" character varying(100),
        "lost_reason" character varying(100),
        "landlord_personality" text,
        "general_ll_comments" text,
        "potentially_multihome" boolean,
        "designation" character varying(255),
        "organization" character varying(255),
        "aadhaar_back" character varying(500) NOT NULL,
        "pan_number" character varying(255) NOT NULL,
        "pan_card_image" character varying(500) NOT NULL,
        "bank_account_number" character varying(255) NOT NULL,
        "beneficiary_name" character varying(255) NOT NULL,
        "ifsc_code" character varying(255) NOT NULL,
        "current_residential" text NOT NULL,
        "permanent_residential" text,
        "communications_permission" boolean,
        "signing_authority" boolean NOT NULL,
        "linkedin_url" character varying(500),
        CONSTRAINT "PK_merchant_landlord_merchant_id" PRIMARY KEY ("merchant_id"),
        CONSTRAINT "FK_merchant_landlord_merchant_id" FOREIGN KEY ("merchant_id")
          REFERENCES "core"."merchants" ("record_id") ON DELETE CASCADE
      )`
    );

    // ── merchant_poc ────────────────────────────────────────────────────
    // Placeholder extension table. Base merchant fields (name, email, phone)
    // cover shared contact data. Additional POC-specific columns TBD per spec.
    await queryRunner.query(
      `CREATE TABLE "core"."merchant_poc" (
        "merchant_id" uuid NOT NULL,
        CONSTRAINT "PK_merchant_poc_merchant_id" PRIMARY KEY ("merchant_id"),
        CONSTRAINT "FK_merchant_poc_merchant_id" FOREIGN KEY ("merchant_id")
          REFERENCES "core"."merchants" ("record_id") ON DELETE CASCADE
      )`
    );

    // ── merchant_broker ─────────────────────────────────────────────────
    // Placeholder extension table. Additional broker-specific columns TBD per spec.
    await queryRunner.query(
      `CREATE TABLE "core"."merchant_broker" (
        "merchant_id" uuid NOT NULL,
        CONSTRAINT "PK_merchant_broker_merchant_id" PRIMARY KEY ("merchant_id"),
        CONSTRAINT "FK_merchant_broker_merchant_id" FOREIGN KEY ("merchant_id")
          REFERENCES "core"."merchants" ("record_id") ON DELETE CASCADE
      )`
    );

    // ── merchant_management ─────────────────────────────────────────────
    // Placeholder extension table. Additional management-specific columns TBD per spec.
    await queryRunner.query(
      `CREATE TABLE "core"."merchant_management" (
        "merchant_id" uuid NOT NULL,
        CONSTRAINT "PK_merchant_management_merchant_id" PRIMARY KEY ("merchant_id"),
        CONSTRAINT "FK_merchant_management_merchant_id" FOREIGN KEY ("merchant_id")
          REFERENCES "core"."merchants" ("record_id") ON DELETE CASCADE
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."merchant_management"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."merchant_broker"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."merchant_poc"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."merchant_landlord"`);
  }
}
```

- [ ] **Step 2: Verify the migration**

```sql
-- Verify all 4 tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'core'
  AND table_name IN ('merchant_landlord', 'merchant_poc', 'merchant_broker', 'merchant_management')
ORDER BY table_name;

-- Verify merchant_landlord has all 19 columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'core' AND table_name = 'merchant_landlord'
ORDER BY ordinal_position;

-- Verify FK constraints on all 4 tables
SELECT tc.table_name, tc.constraint_name, tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'core'
  AND tc.table_name IN ('merchant_landlord', 'merchant_poc', 'merchant_broker', 'merchant_management')
  AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
ORDER BY tc.table_name, tc.constraint_type;

-- Verify placeholder tables have exactly 1 column
SELECT table_name, COUNT(*) as col_count
FROM information_schema.columns
WHERE table_schema = 'core'
  AND table_name IN ('merchant_poc', 'merchant_broker', 'merchant_management')
GROUP BY table_name;
```

Expected: 4 tables. merchant_landlord has 19 columns. Placeholder tables have 1 column each. Each table has 1 PK + 1 FK constraint.

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300005-phase1-merchant-extensions.ts
git commit -m "feat(flent): add merchant extension tables (landlord + 3 placeholders)

Creates merchant_landlord (19 cols) with KYC documents, banking details,
and property management fields. Creates merchant_poc, merchant_broker,
and merchant_management as placeholder extension tables with FK
relationships established. Placeholder columns TBD per spec.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Vendor Base + Contact Tables

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300006-phase1-vendor-base-contact.ts`

This migration creates the `vendors` base table (6 cols, using `vendor_code` VARCHAR PK instead of UUID) and `vendor_contact` extension table (7 cols). The vendor entity uses a natural key pattern -- vendor_code is a business-assigned identifier, not a system-generated UUID.

- [ ] **Step 1: Create the migration file**

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateVendorBaseContact1744300006 implements MigrationInterface {
  name = 'CreateVendorBaseContact1744300006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── vendors ─────────────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."vendors" (
        "vendor_code" character varying(255) NOT NULL,
        "vendor_name" character varying(255) NOT NULL,
        "vendor_type" character varying(100) NOT NULL,
        "status" character varying(100) NOT NULL DEFAULT 'Active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendors_vendor_code" PRIMARY KEY ("vendor_code")
      )`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_VENDORS_VENDOR_TYPE" ON "core"."vendors" ("vendor_type")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_VENDORS_STATUS" ON "core"."vendors" ("status")`
    );

    // ── vendor_contact ──────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."vendor_contact" (
        "vendor_code" character varying(255) NOT NULL,
        "contact_name" character varying(255) NOT NULL,
        "phone" character varying(20) NOT NULL,
        "alternate_phone" character varying(20),
        "email" character varying(255) NOT NULL,
        "city" character varying(255) NOT NULL,
        "address" text NOT NULL,
        CONSTRAINT "PK_vendor_contact_vendor_code" PRIMARY KEY ("vendor_code"),
        CONSTRAINT "FK_vendor_contact_vendor_code" FOREIGN KEY ("vendor_code")
          REFERENCES "core"."vendors" ("vendor_code") ON DELETE CASCADE
      )`
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_VENDOR_CONTACT_EMAIL_UNIQUE" ON "core"."vendor_contact" ("email")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_VENDOR_CONTACT_PHONE" ON "core"."vendor_contact" ("phone")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_VENDOR_CONTACT_PHONE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_VENDOR_CONTACT_EMAIL_UNIQUE"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."vendor_contact"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_VENDORS_STATUS"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_VENDORS_VENDOR_TYPE"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."vendors"`);
  }
}
```

- [ ] **Step 2: Verify the migration**

```sql
-- Verify both tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'core'
  AND table_name IN ('vendors', 'vendor_contact')
ORDER BY table_name;

-- Verify vendors PK is VARCHAR not UUID
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'core' AND table_name = 'vendors' AND column_name = 'vendor_code';

-- Verify vendor_contact columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'core' AND table_name = 'vendor_contact'
ORDER BY ordinal_position;

-- Verify indexes
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'core' AND tablename IN ('vendors', 'vendor_contact')
ORDER BY tablename, indexname;
```

Expected: vendors has 6 columns with VARCHAR(255) PK. vendor_contact has 7 columns with FK to vendors.vendor_code. 2 indexes on vendors, 2 indexes on vendor_contact (1 unique + 1 non-unique).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300006-phase1-vendor-base-contact.ts
git commit -m "feat(flent): add vendors base and vendor_contact extension tables

Creates vendors base table (6 cols) with business-assigned vendor_code
VARCHAR PK and status tracking. Creates vendor_contact (7 cols) with
contact details, unique email index, and phone lookup index.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Vendor Extensions -- Billing, Capability, Commercials

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300007-phase1-vendor-extensions.ts`

This migration creates 3 vendor extension tables: `vendor_billing` (9 cols for GST, PAN, and banking), `vendor_capability` (5 cols for specialization and delivery metrics), and `vendor_commercials` (5 cols for pricing and payment terms).

- [ ] **Step 1: Create the migration file**

```typescript
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateVendorExtensions1744300007 implements MigrationInterface {
  name = 'CreateVendorExtensions1744300007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── vendor_billing ──────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."vendor_billing" (
        "vendor_code" character varying(255) NOT NULL,
        "gst_number" character varying(255),
        "pan" character varying(255),
        "billing_name" character varying(255),
        "bank_name" character varying(255),
        "bank_account_number" character varying(255),
        "ifsc_code" character varying(255),
        "msme_vendor" character varying(100),
        "udyam_aadhaar" character varying(255),
        CONSTRAINT "PK_vendor_billing_vendor_code" PRIMARY KEY ("vendor_code"),
        CONSTRAINT "FK_vendor_billing_vendor_code" FOREIGN KEY ("vendor_code")
          REFERENCES "core"."vendors" ("vendor_code") ON DELETE CASCADE
      )`
    );

    // ── vendor_capability ───────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."vendor_capability" (
        "vendor_code" character varying(255) NOT NULL,
        "specialization" text NOT NULL,
        "tat_in_days" integer NOT NULL,
        "customization_capability" character varying(100) NOT NULL,
        "standardisation_fit" character varying(100) NOT NULL,
        CONSTRAINT "PK_vendor_capability_vendor_code" PRIMARY KEY ("vendor_code"),
        CONSTRAINT "FK_vendor_capability_vendor_code" FOREIGN KEY ("vendor_code")
          REFERENCES "core"."vendors" ("vendor_code") ON DELETE CASCADE
      )`
    );

    // ── vendor_commercials ──────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "core"."vendor_commercials" (
        "vendor_code" character varying(255) NOT NULL,
        "quality_tier" character varying(100) NOT NULL,
        "payment_terms" character varying(255),
        "min_order_value" decimal(12,2),
        "negotiation_remarks" text,
        CONSTRAINT "PK_vendor_commercials_vendor_code" PRIMARY KEY ("vendor_code"),
        CONSTRAINT "FK_vendor_commercials_vendor_code" FOREIGN KEY ("vendor_code")
          REFERENCES "core"."vendors" ("vendor_code") ON DELETE CASCADE
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."vendor_commercials"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."vendor_capability"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."vendor_billing"`);
  }
}
```

- [ ] **Step 2: Verify the migration**

```sql
-- Verify all 3 tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'core'
  AND table_name IN ('vendor_billing', 'vendor_capability', 'vendor_commercials')
ORDER BY table_name;

-- Verify column counts
SELECT table_name, COUNT(*) as col_count
FROM information_schema.columns
WHERE table_schema = 'core'
  AND table_name IN ('vendor_billing', 'vendor_capability', 'vendor_commercials')
GROUP BY table_name
ORDER BY table_name;

-- Verify FK constraints reference vendors.vendor_code
SELECT tc.table_name, tc.constraint_name, kcu.column_name,
       ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
WHERE tc.table_schema = 'core'
  AND tc.table_name IN ('vendor_billing', 'vendor_capability', 'vendor_commercials')
  AND tc.constraint_type = 'FOREIGN KEY';

-- Verify decimal precision on vendor_commercials.min_order_value
SELECT column_name, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema = 'core'
  AND table_name = 'vendor_commercials'
  AND column_name = 'min_order_value';
```

Expected: 3 tables. vendor_billing has 9 columns, vendor_capability has 5, vendor_commercials has 5. All FKs reference vendors.vendor_code. min_order_value has precision 12, scale 2.

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744300007-phase1-vendor-extensions.ts
git commit -m "feat(flent): add vendor billing, capability, and commercials extension tables

Creates vendor_billing (9 cols) for GST, PAN, and banking details.
Creates vendor_capability (5 cols) for specialization, TAT, and
customization metrics. Creates vendor_commercials (5 cols) for quality
tier, payment terms, and order value thresholds.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Summary

| Task | Migration File | Tables Created | Total Columns |
|------|---------------|----------------|---------------|
| 1 | `1744300001-phase1-tenant-base.ts` | tenants | 23 |
| 2 | `1744300002-phase1-tenant-extensions-attribution.ts` | tenant_attribution, tenant_requirements | 24 |
| 3 | `1744300003-phase1-tenant-extensions-lifecycle.ts` | tenant_qualification, tenant_visit_summary, tenant_satisfaction | 21 |
| 4 | `1744300004-phase1-merchant-base.ts` | merchants | 13 |
| 5 | `1744300005-phase1-merchant-extensions.ts` | merchant_landlord, merchant_poc, merchant_broker, merchant_management | 22 |
| 6 | `1744300006-phase1-vendor-base-contact.ts` | vendors, vendor_contact | 13 |
| 7 | `1744300007-phase1-vendor-extensions.ts` | vendor_billing, vendor_capability, vendor_commercials | 19 |
| **Total** | **7 migrations** | **16 tables** | **135 columns** |

### Index Summary

| Table | Index Name | Type | Columns |
|-------|-----------|------|---------|
| tenants | IDX_TENANTS_EMAIL_UNIQUE | UNIQUE | email |
| tenants | IDX_TENANTS_MOBILE_PHONE | BTREE | mobile_phone |
| tenants | IDX_TENANTS_TENANT_LIFECYCLE | BTREE | tenant_lifecycle |
| tenants | IDX_TENANTS_CURRENT_PID | BTREE | current_pid |
| tenants | IDX_TENANTS_CURRENT_RID | BTREE | current_rid |
| tenant_attribution | IDX_TENANT_ATTRIBUTION_FIRST_INQUIRY_CHANNEL | BTREE | first_inquiry_channel |
| tenant_attribution | IDX_TENANT_ATTRIBUTION_CREATE_DATE | BTREE | create_date |
| tenant_qualification | IDX_TENANT_QUALIFICATION_STATUS | BTREE | qualification_status |
| tenant_qualification | IDX_TENANT_QUALIFICATION_BGV_STATUS | BTREE | bgv_status |
| merchants | IDX_MERCHANTS_MERCHANT_TYPE | BTREE | merchant_type |
| merchants | IDX_MERCHANTS_EMAIL | BTREE | email |
| merchants | IDX_MERCHANTS_PHONE | BTREE | phone |
| merchants | IDX_MERCHANTS_UNIQUE_ID | BTREE | unique_id |
| vendors | IDX_VENDORS_VENDOR_TYPE | BTREE | vendor_type |
| vendors | IDX_VENDORS_STATUS | BTREE | status |
| vendor_contact | IDX_VENDOR_CONTACT_EMAIL_UNIQUE | UNIQUE | email |
| vendor_contact | IDX_VENDOR_CONTACT_PHONE | BTREE | phone |

### Constraint Summary

| Table | Constraint | Type | Rule |
|-------|-----------|------|------|
| tenant_satisfaction | CHK_tenant_satisfaction_onboarding_csat | CHECK | BETWEEN 1 AND 5 |
| tenant_satisfaction | CHK_tenant_satisfaction_offboarding_csat | CHECK | BETWEEN 1 AND 5 |
| tenant_satisfaction | CHK_tenant_satisfaction_nps | CHECK | BETWEEN 0 AND 10 |

### FK Cascade Summary

All extension tables use `ON DELETE CASCADE` to their respective base table PK:
- `tenant_*` tables cascade from `tenants.record_id`
- `merchant_*` tables cascade from `merchants.record_id`
- `vendor_*` tables cascade from `vendors.vendor_code`

### Phase 2 Deferred Items

The following items are intentionally deferred to Phase 2:
- **FK constraints** on `tenants.current_pid` and `tenants.current_rid` (awaiting `properties` and `rooms` tables)
- **Column additions** to `merchant_poc`, `merchant_broker`, `merchant_management` (awaiting finalized specs)
- **Enum types** for lifecycle/status fields (currently VARCHAR to allow flexibility during initial data migration from HubSpot)
