# Phase 3: Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 3 database tables and 3 trigger functions for the Contract object, linking tenants and merchants to properties through typed contract records with auto-calculated financial fields.

**Architecture:** Shared Base + Extension pattern. `contracts` holds the common header (type, property, dates, terms, lock-in, agreement PDF). `tenant_contract_details` extends with tenant FK, room FK, rent breakdown (8 fee lines), deposits, deductions, and lifecycle tracking. `merchant_contract_details` extends with merchant FK, base_rent JSONB schedule, increment terms, COGS derivation, and payment cycle. Three PostgreSQL trigger functions auto-calculate `lock_in_end_date`, `effective_retail_rent`, and `total_deductions` so application code never computes them.

**Tech Stack:** PostgreSQL 16, TypeORM migrations, NestJS

**Spec:** `docs/superpowers/specs/2026-04-11-flent-crm-data-model-design.md` (Section 4: Contract)

**Dependencies:** Phase 1 tables (`flent.tenants.record_id`, `flent.merchants.record_id`), Phase 2 tables (`flent.properties.pid`, `flent.rooms.rid`)

---

## File Structure

```
packages/twenty-server/src/database/typeorm/core/migrations/flent/
├── 1744416000000-phase3-contracts-base.ts              # Task 1
├── 1744416000001-phase3-tenant-contract-details.ts     # Task 2
├── 1744416000002-phase3-merchant-contract-details.ts   # Task 3
└── 1744416000003-phase3-contracts-triggers.ts          # Task 4
```

---

## Task 1: Contracts Base Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744416000000-phase3-contracts-base.ts`

**Why:** The `contracts` table is the root of the Contract object graph. Both extension tables (`tenant_contract_details`, `merchant_contract_details`) reference `contracts.contract_uid` as both PK and FK with CASCADE delete. The `pid` FK ties every contract to a property. `rid` FK ties to a specific room. `contract_type` discriminates between L&L (Leave & License), Authorisation, and C&S (Caretaker & Service) sub-types.

**Table: `flent.contracts`** (base, 9 business cols + 2 audit cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| contract_uid | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | System-generated |
| contract_type | VARCHAR(100) | NOT NULL | L&L / Authorisation / C&S |
| pid | VARCHAR(255) | NOT NULL, FK properties(pid) | Parent property |
| rid | VARCHAR(255) | FK rooms(rid) | Associated room |
| contract_start_date | DATE | NOT NULL | |
| contract_end_date | DATE | NOT NULL | |
| service_term | INTEGER | NOT NULL | Months |
| lock_in_duration | INTEGER | NULL | Months |
| lock_in_end_date | DATE | NULL | Auto-calculated: start + lock_in months |
| notice_period | INTEGER | NULL | Days |
| agreement_pdf | VARCHAR(500) | NULL | File URL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `contract_type`, `pid`, `rid`, `contract_start_date`, `contract_end_date`

- [ ] **Step 1: Create the contracts base table migration**

```typescript
// 1744416000000-phase3-contracts-base.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase3ContractsBase1744416000000
  implements MigrationInterface
{
  name = 'Phase3ContractsBase1744416000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."contracts" (
        "contract_uid" uuid NOT NULL DEFAULT gen_random_uuid(),
        "contract_type" character varying(100) NOT NULL,
        "pid" character varying(255) NOT NULL,
        "rid" character varying(255),
        "contract_start_date" date NOT NULL,
        "contract_end_date" date NOT NULL,
        "service_term" integer NOT NULL,
        "lock_in_duration" integer,
        "lock_in_end_date" date,
        "notice_period" integer,
        "agreement_pdf" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contracts_contract_uid" PRIMARY KEY ("contract_uid")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."contracts"
      ADD CONSTRAINT "FK_contracts_pid"
      FOREIGN KEY ("pid") REFERENCES "flent"."properties"("pid")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."contracts"
      ADD CONSTRAINT "FK_contracts_rid"
      FOREIGN KEY ("rid") REFERENCES "flent"."rooms"("rid")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_contract_type" ON "flent"."contracts" ("contract_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_pid" ON "flent"."contracts" ("pid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_rid" ON "flent"."contracts" ("rid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_start_date" ON "flent"."contracts" ("contract_start_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_end_date" ON "flent"."contracts" ("contract_end_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_end_date"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_start_date"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_rid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_pid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_contract_type"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."contracts" DROP CONSTRAINT "FK_contracts_rid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."contracts" DROP CONSTRAINT "FK_contracts_pid"`
    );
    await queryRunner.query(`DROP TABLE "flent"."contracts"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'contracts'
ORDER BY ordinal_position;
```

Expected: 13 rows (contract_uid, contract_type, pid, rid, contract_start_date, contract_end_date, service_term, lock_in_duration, lock_in_end_date, notice_period, agreement_pdf, created_at, updated_at).

```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'flent' AND tablename = 'contracts';
```

Expected: 6 indexes (PK + 5 created indexes).

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'contracts';
```

Expected: PK_contracts_contract_uid (PRIMARY KEY), FK_contracts_pid (FOREIGN KEY), FK_contracts_rid (FOREIGN KEY).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744416000000-phase3-contracts-base.ts
git commit -m "feat(db): add contracts base table with pid/rid FKs, type discriminator, and date indexes"
```

---

## Task 2: Tenant Contract Details Extension Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744416000001-phase3-tenant-contract-details.ts`

**Why:** Tenant contracts capture the full rent breakdown (8 fee line items), deposit tracking, deduction accounting, and dual lifecycle state machines (payment + agreement). The `party_name_tenant` field is denormalized from `tenants.first_name + last_name` and updated by workflow on link. `effective_retail_rent` and `total_deductions` are derived columns maintained by triggers (Task 4).

**Table: `flent.tenant_contract_details`** (ext, 25 business cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| contract_uid | UUID | PK, FK contracts(contract_uid) CASCADE | |
| tenant_id | UUID | NOT NULL, FK tenants(record_id) | Tenant party |
| rid | VARCHAR(255) | NOT NULL, FK rooms(rid) | Room assignment |
| party_name_tenant | VARCHAR(255) | NOT NULL | Derived: tenants.first_name + last_name |
| preferred_move_out_date | DATE | NULL | |
| payment_lifecycle | VARCHAR(100) | NULL | Token Paid / FMR Paid / SD Paid / FMR and SD Cleared / Payments Done |
| agreement_lifecycle | VARCHAR(100) | NULL | L&L and C&S Released / L&L Signed / C&S Signed / All agreements signed |
| total_retail_rent | DECIMAL(12,2) | NULL | Derived sum |
| monthly_license_fee | DECIMAL(12,2) | NULL | |
| maintenance_fee | DECIMAL(12,2) | NULL | |
| furnishing_fee | DECIMAL(12,2) | NULL | |
| convenience_fee | DECIMAL(12,2) | NULL | |
| gst | DECIMAL(12,2) | NULL | |
| discount_amount | DECIMAL(12,2) | NULL | |
| effective_retail_rent | DECIMAL(12,2) | NULL | Auto-calculated: total_retail_rent - discount_amount |
| security_deposit | DECIMAL(12,2) | NULL | |
| caution_deposit | DECIMAL(12,2) | NULL | |
| lock_in_fee | DECIMAL(12,2) | NULL | |
| exit_fee | DECIMAL(12,2) | NULL | |
| damages_deductions | DECIMAL(12,2) | NULL | |
| society_fees | DECIMAL(12,2) | NULL | |
| penalty | DECIMAL(12,2) | NULL | |
| total_deductions | DECIMAL(12,2) | NULL | Auto-calculated: damages + society_fees + penalty |
| fmr_status | VARCHAR(100) | NULL | |
| deposit_paid_status | VARCHAR(100) | NULL | |

**Indexes:** `tenant_id`, `rid`, `payment_lifecycle`, `agreement_lifecycle`

- [ ] **Step 1: Create the tenant contract details migration**

```typescript
// 1744416000001-phase3-tenant-contract-details.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase3TenantContractDetails1744416000001
  implements MigrationInterface
{
  name = 'Phase3TenantContractDetails1744416000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."tenant_contract_details" (
        "contract_uid" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "rid" character varying(255) NOT NULL,
        "party_name_tenant" character varying(255) NOT NULL,
        "preferred_move_out_date" date,
        "payment_lifecycle" character varying(100),
        "agreement_lifecycle" character varying(100),
        "total_retail_rent" numeric(12,2),
        "monthly_license_fee" numeric(12,2),
        "maintenance_fee" numeric(12,2),
        "furnishing_fee" numeric(12,2),
        "convenience_fee" numeric(12,2),
        "gst" numeric(12,2),
        "discount_amount" numeric(12,2),
        "effective_retail_rent" numeric(12,2),
        "security_deposit" numeric(12,2),
        "caution_deposit" numeric(12,2),
        "lock_in_fee" numeric(12,2),
        "exit_fee" numeric(12,2),
        "damages_deductions" numeric(12,2),
        "society_fees" numeric(12,2),
        "penalty" numeric(12,2),
        "total_deductions" numeric(12,2),
        "fmr_status" character varying(100),
        "deposit_paid_status" character varying(100),
        CONSTRAINT "PK_tenant_contract_details_uid" PRIMARY KEY ("contract_uid")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."tenant_contract_details"
      ADD CONSTRAINT "FK_tenant_contract_details_contract_uid"
      FOREIGN KEY ("contract_uid") REFERENCES "flent"."contracts"("contract_uid")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."tenant_contract_details"
      ADD CONSTRAINT "FK_tenant_contract_details_tenant_id"
      FOREIGN KEY ("tenant_id") REFERENCES "flent"."tenants"("record_id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."tenant_contract_details"
      ADD CONSTRAINT "FK_tenant_contract_details_rid"
      FOREIGN KEY ("rid") REFERENCES "flent"."rooms"("rid")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_contract_details_tenant_id" ON "flent"."tenant_contract_details" ("tenant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_contract_details_rid" ON "flent"."tenant_contract_details" ("rid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_contract_details_payment_lifecycle" ON "flent"."tenant_contract_details" ("payment_lifecycle")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_contract_details_agreement_lifecycle" ON "flent"."tenant_contract_details" ("agreement_lifecycle")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_tenant_contract_details_agreement_lifecycle"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_tenant_contract_details_payment_lifecycle"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_tenant_contract_details_rid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_tenant_contract_details_tenant_id"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."tenant_contract_details" DROP CONSTRAINT "FK_tenant_contract_details_rid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."tenant_contract_details" DROP CONSTRAINT "FK_tenant_contract_details_tenant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."tenant_contract_details" DROP CONSTRAINT "FK_tenant_contract_details_contract_uid"`
    );
    await queryRunner.query(`DROP TABLE "flent"."tenant_contract_details"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'tenant_contract_details'
ORDER BY ordinal_position;
```

Expected: 25 rows.

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'tenant_contract_details';
```

Expected: PK_tenant_contract_details_uid (PRIMARY KEY), FK_tenant_contract_details_contract_uid (FOREIGN KEY, CASCADE), FK_tenant_contract_details_tenant_id (FOREIGN KEY), FK_tenant_contract_details_rid (FOREIGN KEY).

```sql
-- Verify CASCADE on contract delete
SELECT rc.delete_rule
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'flent'
  AND tc.table_name = 'tenant_contract_details'
  AND tc.constraint_name = 'FK_tenant_contract_details_contract_uid';
```

Expected: `delete_rule = CASCADE`.

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744416000001-phase3-tenant-contract-details.ts
git commit -m "feat(db): add tenant_contract_details with 25 cols — rent breakdown, deposits, deductions, lifecycle tracking"
```

---

## Task 3: Merchant Contract Details Extension Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744416000002-phase3-merchant-contract-details.ts`

**Why:** Merchant contracts capture the landlord-side economics: base rent as a JSONB hike schedule, increment terms, COGS derivation, acquisition costs, and payment cycle. The `party_name_merchant` is denormalized from `merchants.first_name + last_name` (landlord type only). `total_cogs` is a derived column maintained by application logic (base_rent + overheads). `contract_acquisition_cost_paid_to` was fixed from DECIMAL to VARCHAR (it stores a party name, not an amount).

**Table: `flent.merchant_contract_details`** (ext, 16 business cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| contract_uid | UUID | PK, FK contracts(contract_uid) CASCADE | |
| merchant_id | UUID | NOT NULL, FK merchants(record_id) | Merchant/landlord party |
| party_name_merchant | VARCHAR(255) | NOT NULL | Derived: merchants.first_name + last_name (landlord only) |
| key_handover_date | DATE | NULL | |
| increment_percentage | DECIMAL(5,2) | NULL | |
| increment_frequency | VARCHAR(100) | NULL | Annual / Biennial / None |
| agreement_status | VARCHAR(100) | NULL | Negotiation / Triggered / Active |
| base_rent | JSONB | NOT NULL | Rent hike schedule. Format: [{"month":0,"amount":60000},{"month":12,"amount":66000}] |
| merchant_security_deposit | DECIMAL(12,2) | NULL | |
| management_fee_per_month | DECIMAL(12,2) | NULL | |
| total_cogs | DECIMAL(12,2) | NULL | Derived: base_rent (this contract) + overheads |
| contract_acquisition_cost | DECIMAL(12,2) | NULL | |
| contract_acquisition_cost_paid_to | VARCHAR(255) | NULL | Party name, not amount (type fix) |
| payment_cycle | VARCHAR(100) | NOT NULL | Prepaid / Postpaid |
| payment_deadline | DATE | NOT NULL | |
| inventory_list | VARCHAR(500) | NULL | File URL |

**Indexes:** `merchant_id`, `agreement_status`, `payment_cycle`

- [ ] **Step 1: Create the merchant contract details migration**

```typescript
// 1744416000002-phase3-merchant-contract-details.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase3MerchantContractDetails1744416000002
  implements MigrationInterface
{
  name = 'Phase3MerchantContractDetails1744416000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."merchant_contract_details" (
        "contract_uid" uuid NOT NULL,
        "merchant_id" uuid NOT NULL,
        "party_name_merchant" character varying(255) NOT NULL,
        "key_handover_date" date,
        "increment_percentage" numeric(5,2),
        "increment_frequency" character varying(100),
        "agreement_status" character varying(100),
        "base_rent" jsonb NOT NULL,
        "merchant_security_deposit" numeric(12,2),
        "management_fee_per_month" numeric(12,2),
        "total_cogs" numeric(12,2),
        "contract_acquisition_cost" numeric(12,2),
        "contract_acquisition_cost_paid_to" character varying(255),
        "payment_cycle" character varying(100) NOT NULL,
        "payment_deadline" date NOT NULL,
        "inventory_list" character varying(500),
        CONSTRAINT "PK_merchant_contract_details_uid" PRIMARY KEY ("contract_uid")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."merchant_contract_details"
      ADD CONSTRAINT "FK_merchant_contract_details_contract_uid"
      FOREIGN KEY ("contract_uid") REFERENCES "flent"."contracts"("contract_uid")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."merchant_contract_details"
      ADD CONSTRAINT "FK_merchant_contract_details_merchant_id"
      FOREIGN KEY ("merchant_id") REFERENCES "flent"."merchants"("record_id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_merchant_contract_details_merchant_id" ON "flent"."merchant_contract_details" ("merchant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_merchant_contract_details_agreement_status" ON "flent"."merchant_contract_details" ("agreement_status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_merchant_contract_details_payment_cycle" ON "flent"."merchant_contract_details" ("payment_cycle")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_merchant_contract_details_payment_cycle"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_merchant_contract_details_agreement_status"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_merchant_contract_details_merchant_id"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."merchant_contract_details" DROP CONSTRAINT "FK_merchant_contract_details_merchant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."merchant_contract_details" DROP CONSTRAINT "FK_merchant_contract_details_contract_uid"`
    );
    await queryRunner.query(`DROP TABLE "flent"."merchant_contract_details"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'merchant_contract_details'
ORDER BY ordinal_position;
```

Expected: 16 rows.

```sql
-- Verify JSONB column for base_rent
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'merchant_contract_details'
  AND column_name = 'base_rent';
```

Expected: `data_type = jsonb`.

```sql
-- Verify contract_acquisition_cost_paid_to is VARCHAR not DECIMAL (type fix #25)
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'merchant_contract_details'
  AND column_name = 'contract_acquisition_cost_paid_to';
```

Expected: `data_type = character varying`, `character_maximum_length = 255`.

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'merchant_contract_details';
```

Expected: PK_merchant_contract_details_uid (PRIMARY KEY), FK_merchant_contract_details_contract_uid (FOREIGN KEY, CASCADE), FK_merchant_contract_details_merchant_id (FOREIGN KEY).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744416000002-phase3-merchant-contract-details.ts
git commit -m "feat(db): add merchant_contract_details with 16 cols — base_rent JSONB, increment terms, COGS, payment cycle"
```

---

## Task 4: Contract Trigger Functions

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744416000003-phase3-contracts-triggers.ts`

**Why:** Three derived fields must be kept in sync by the database to guarantee consistency regardless of which application path writes data. (1) `lock_in_end_date` = `contract_start_date + lock_in_duration months` on the contracts base table. (2) `effective_retail_rent` = `total_retail_rent - discount_amount` on tenant_contract_details. (3) `total_deductions` = `damages_deductions + society_fees + penalty` on tenant_contract_details. Using BEFORE INSERT OR UPDATE triggers ensures derived values are always correct at write time.

- [ ] **Step 1: Create the triggers migration**

```typescript
// 1744416000003-phase3-contracts-triggers.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase3ContractsTriggers1744416000003
  implements MigrationInterface
{
  name = 'Phase3ContractsTriggers1744416000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Trigger 1: Auto-calculate lock_in_end_date on contracts
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_calc_lock_in_end_date"()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.lock_in_duration IS NOT NULL AND NEW.contract_start_date IS NOT NULL THEN
          NEW.lock_in_end_date := NEW.contract_start_date + (NEW.lock_in_duration || ' months')::interval;
        ELSE
          NEW.lock_in_end_date := NULL;
        END IF;
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_contracts_lock_in_end_date"
      BEFORE INSERT OR UPDATE OF lock_in_duration, contract_start_date
      ON "flent"."contracts"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_calc_lock_in_end_date"()
    `);

    // Trigger 2: Auto-calculate effective_retail_rent on tenant_contract_details
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_calc_effective_retail_rent"()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.effective_retail_rent := COALESCE(NEW.total_retail_rent, 0) - COALESCE(NEW.discount_amount, 0);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_tenant_contract_effective_rent"
      BEFORE INSERT OR UPDATE OF total_retail_rent, discount_amount
      ON "flent"."tenant_contract_details"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_calc_effective_retail_rent"()
    `);

    // Trigger 3: Auto-calculate total_deductions on tenant_contract_details
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_calc_total_deductions"()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.total_deductions := COALESCE(NEW.damages_deductions, 0)
                              + COALESCE(NEW.society_fees, 0)
                              + COALESCE(NEW.penalty, 0);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_tenant_contract_total_deductions"
      BEFORE INSERT OR UPDATE OF damages_deductions, society_fees, penalty
      ON "flent"."tenant_contract_details"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_calc_total_deductions"()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_tenant_contract_total_deductions" ON "flent"."tenant_contract_details"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_calc_total_deductions"()`
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_tenant_contract_effective_rent" ON "flent"."tenant_contract_details"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_calc_effective_retail_rent"()`
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_contracts_lock_in_end_date" ON "flent"."contracts"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_calc_lock_in_end_date"()`
    );
  }
}
```

- [ ] **Step 2: Verify triggers exist**

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'flent'
ORDER BY event_object_table, trigger_name;
```

Expected:

| trigger_name | event_manipulation | event_object_table | action_timing |
|---|---|---|---|
| trg_contracts_lock_in_end_date | INSERT | contracts | BEFORE |
| trg_contracts_lock_in_end_date | UPDATE | contracts | BEFORE |
| trg_tenant_contract_effective_rent | INSERT | tenant_contract_details | BEFORE |
| trg_tenant_contract_effective_rent | UPDATE | tenant_contract_details | BEFORE |
| trg_tenant_contract_total_deductions | INSERT | tenant_contract_details | BEFORE |
| trg_tenant_contract_total_deductions | UPDATE | tenant_contract_details | BEFORE |

- [ ] **Step 3: Verify trigger logic with test data**

```sql
-- Test lock_in_end_date calculation
INSERT INTO "flent"."contracts" (
  contract_type, pid, contract_start_date, contract_end_date,
  service_term, lock_in_duration
) VALUES (
  'L&L', '<valid_pid>', '2025-01-01', '2026-01-01',
  12, 6
) RETURNING contract_uid, lock_in_end_date;
```

Expected: `lock_in_end_date = 2025-07-01`.

```sql
-- Test effective_retail_rent calculation
INSERT INTO "flent"."tenant_contract_details" (
  contract_uid, tenant_id, rid, party_name_tenant,
  total_retail_rent, discount_amount
) VALUES (
  '<uid_from_above>', '<valid_tenant_id>', '<valid_rid>', 'Test Tenant',
  25000.00, 2000.00
) RETURNING effective_retail_rent;
```

Expected: `effective_retail_rent = 23000.00`.

```sql
-- Test total_deductions calculation
UPDATE "flent"."tenant_contract_details"
SET damages_deductions = 5000.00, society_fees = 1200.00, penalty = 800.00
WHERE contract_uid = '<uid_from_above>'
RETURNING total_deductions;
```

Expected: `total_deductions = 7000.00`.

```sql
-- Clean up test data
DELETE FROM "flent"."contracts" WHERE contract_uid = '<uid_from_above>';
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744416000003-phase3-contracts-triggers.ts
git commit -m "feat(db): add 3 contract triggers — lock_in_end_date, effective_retail_rent, total_deductions auto-calc"
```

---

## Task 5: Cross-Table Verification

**Files:** None (verification only)

**Why:** After all 4 migration files have been applied, verify the complete Contract object graph: 3 tables, 54 total columns, 7 FK relationships, 10 indexes, and 3 trigger functions.

- [ ] **Step 1: Verify table inventory**

```sql
SELECT table_name, COUNT(column_name) as col_count
FROM information_schema.columns
WHERE table_schema = 'flent'
  AND table_name IN ('contracts', 'tenant_contract_details', 'merchant_contract_details')
GROUP BY table_name
ORDER BY table_name;
```

Expected:

| table_name | col_count |
|---|---|
| contracts | 13 |
| merchant_contract_details | 16 |
| tenant_contract_details | 25 |

Total: 54 columns (matches spec).

- [ ] **Step 2: Verify all FK relationships**

```sql
SELECT
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'flent'
  AND tc.table_name IN ('contracts', 'tenant_contract_details', 'merchant_contract_details')
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;
```

Expected: 7 FK rows:

| from_table | from_column | to_table | to_column | delete_rule |
|---|---|---|---|---|
| contracts | pid | properties | pid | RESTRICT |
| contracts | rid | rooms | rid | SET NULL |
| merchant_contract_details | contract_uid | contracts | contract_uid | CASCADE |
| merchant_contract_details | merchant_id | merchants | record_id | RESTRICT |
| tenant_contract_details | contract_uid | contracts | contract_uid | CASCADE |
| tenant_contract_details | rid | rooms | rid | RESTRICT |
| tenant_contract_details | tenant_id | tenants | record_id | RESTRICT |

- [ ] **Step 3: Verify trigger functions**

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'flent'
  AND routine_name LIKE 'trg_calc_%'
ORDER BY routine_name;
```

Expected: 3 rows (trg_calc_effective_retail_rent, trg_calc_lock_in_end_date, trg_calc_total_deductions).

- [ ] **Step 4: Commit (no files -- verification only)**

No commit needed. All Phase 3 tables are deployed and verified.

---

## Summary

Phase 3 delivers:
- **3 tables** in the `flent` schema: `contracts` (base), `tenant_contract_details` (extension), `merchant_contract_details` (extension)
- **54 total columns** across all 3 tables (matches spec exactly)
- **7 FK relationships** linking contracts to properties, rooms, tenants, and merchants
- **10 indexes** for query performance on type, dates, lifecycle status, and party lookups
- **3 trigger functions** for derived field auto-calculation (lock_in_end_date, effective_retail_rent, total_deductions)
- **4 migration files** following the established Phase 2 naming convention
