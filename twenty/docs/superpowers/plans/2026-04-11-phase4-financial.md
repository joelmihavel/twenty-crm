# Phase 4: Financial / Transactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 8 database tables and 1 trigger function for the Transaction object, providing a complete financial ledger with classification, party tracking, payment channels, line items, cross-entity links, purchase order extensions, and PO line items.

**Architecture:** Shared Base + Extension pattern with type discriminator. `transactions` holds the common header (UTN identifier, type discriminator, credit/debit direction, amount, status, audit trail). Six extension tables partition financial data by concern: classification (OPEX/CAPEX categories), parties (from/to with type and info), payment (channel/provider/gateway), line items (period + cost center), links (explicit FKs to 8 other entities replacing polymorphic contact_id), and purchase order (PO-specific fields). `po_lines` is a child table (ONE_TO_MANY from PO transactions) holding individual line items with FSIN references. A trigger on `po_lines` auto-calculates `line_amount = qty * unit_price`.

**Tech Stack:** PostgreSQL 16, TypeORM migrations, NestJS

**Spec:** `docs/superpowers/specs/2026-04-11-flent-crm-data-model-design.md` (Section 5: Transaction)

**Dependencies:** Phase 1 tables (`flent.tenants.record_id`, `flent.merchants.record_id`, `flent.vendors.vendor_code`), Phase 2 tables (`flent.properties.pid`, `flent.rooms.rid`, `flent.overheads.overhead_id`), Phase 3 tables (`flent.contracts.contract_uid`)

---

## File Structure

```
packages/twenty-server/src/database/typeorm/core/migrations/flent/
├── 1744502400000-phase4-transactions-base.ts                # Task 1
├── 1744502400001-phase4-transaction-classification.ts       # Task 2
├── 1744502400002-phase4-transaction-parties.ts              # Task 3
├── 1744502400003-phase4-transaction-payment.ts              # Task 4
├── 1744502400004-phase4-transaction-line-items.ts           # Task 5
├── 1744502400005-phase4-transaction-links.ts                # Task 6
├── 1744502400006-phase4-transaction-purchase-order.ts       # Task 7
├── 1744502400007-phase4-po-lines.ts                         # Task 8
└── 1744502400008-phase4-transaction-triggers.ts             # Task 9
```

---

## Task 1: Transactions Base Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400000-phase4-transactions-base.ts`

**Why:** The `transactions` table is the root of the Transaction object graph. All 6 extension tables and the `po_lines` child table reference `transactions.utn`. The UTN (Unique Transaction Number) is a system-generated string in format `TXN-YYYYMMDD-XXXXX`. The `transaction_type` field is a discriminator that determines which extension tables are populated: Payment/Payout/Refund/Adjustment use classification+parties+payment+line_items+links, while PurchaseOrder additionally populates `transaction_purchase_order` and `po_lines`. The `status` field tracks the transaction lifecycle from Pending through Approved/Settled/Reversed/Voided.

**Table: `flent.transactions`** (base, 11 cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| utn | VARCHAR(255) | PRIMARY KEY | TXN-YYYYMMDD-XXXXX, system-generated |
| transaction_type | VARCHAR(100) | NOT NULL | Payment / Payout / Refund / PurchaseOrder / Adjustment |
| credit_debit | VARCHAR(100) | NOT NULL | Credit / Debit |
| transaction_date | DATE | NOT NULL | |
| amount | DECIMAL(12,2) | NOT NULL | Always positive |
| status | VARCHAR(100) | NOT NULL | Pending / Approved / Settled / Reversed / Voided |
| created_by | VARCHAR(255) | NOT NULL | System user identifier |
| created_date | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| authorised_by | VARCHAR(255) | NULL | |
| authorised_date | TIMESTAMPTZ | NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `transaction_type`, `credit_debit`, `transaction_date`, `status`, `created_by`

- [ ] **Step 1: Create the transactions base table migration**

```typescript
// 1744502400000-phase4-transactions-base.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionsBase1744502400000
  implements MigrationInterface
{
  name = 'Phase4TransactionsBase1744502400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transactions" (
        "utn" character varying(255) NOT NULL,
        "transaction_type" character varying(100) NOT NULL,
        "credit_debit" character varying(100) NOT NULL,
        "transaction_date" date NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "status" character varying(100) NOT NULL,
        "created_by" character varying(255) NOT NULL,
        "created_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "authorised_by" character varying(255),
        "authorised_date" TIMESTAMP WITH TIME ZONE,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions_utn" PRIMARY KEY ("utn"),
        CONSTRAINT "CHK_transactions_amount_positive" CHECK ("amount" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_transaction_type" ON "flent"."transactions" ("transaction_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_credit_debit" ON "flent"."transactions" ("credit_debit")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_transaction_date" ON "flent"."transactions" ("transaction_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_status" ON "flent"."transactions" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_created_by" ON "flent"."transactions" ("created_by")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_created_by"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_status"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_transaction_date"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_credit_debit"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_transaction_type"`);
    await queryRunner.query(`DROP TABLE "flent"."transactions"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transactions'
ORDER BY ordinal_position;
```

Expected: 11 rows (utn, transaction_type, credit_debit, transaction_date, amount, status, created_by, created_date, authorised_by, authorised_date, updated_at).

```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'flent' AND tablename = 'transactions';
```

Expected: 6 indexes (PK + 5 created indexes).

```sql
-- Verify CHECK constraint on amount
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'flent'
  AND constraint_name = 'CHK_transactions_amount_positive';
```

Expected: 1 row with check clause for `amount >= 0`.

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400000-phase4-transactions-base.ts
git commit -m "feat(db): add transactions base table with UTN PK, type discriminator, status tracking, and amount CHECK"
```

---

## Task 2: Transaction Classification Extension Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400001-phase4-transaction-classification.ts`

**Why:** Every transaction is classified by two purpose categories for financial reporting. Category 1 maps to high-level accounting buckets (OPEX, CAPEX, REVENUE, etc.). Category 2 provides granular sub-classification (DEPOSIT, FIXTURES, TECH, MARKETING, etc.). These categories drive P&L reporting and cost center allocation in Metabase dashboards.

**Table: `flent.transaction_classification`** (ext, 3 cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| utn | VARCHAR(255) | PK, FK transactions(utn) CASCADE | |
| purpose_category_1 | VARCHAR(100) | NULL | OPEX / CAPEX / INTEREST / SALARY / REIMBURSEMENT / REVENUE / REFUNDS / COGS |
| purpose_category_2 | VARCHAR(100) | NULL | DEPOSIT / TRANSPORT / FIXTURES / OFFICE / EMPLOYEE / CONSULTANT / CONTRACTOR / INVENTORY / TECH / MARKETING / FOOD AND BEVERAGES |

**Indexes:** `purpose_category_1`, `purpose_category_2`

- [ ] **Step 1: Create the transaction classification migration**

```typescript
// 1744502400001-phase4-transaction-classification.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionClassification1744502400001
  implements MigrationInterface
{
  name = 'Phase4TransactionClassification1744502400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_classification" (
        "utn" character varying(255) NOT NULL,
        "purpose_category_1" character varying(100),
        "purpose_category_2" character varying(100),
        CONSTRAINT "PK_transaction_classification_utn" PRIMARY KEY ("utn")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_classification"
      ADD CONSTRAINT "FK_transaction_classification_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_classification_cat1" ON "flent"."transaction_classification" ("purpose_category_1")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_classification_cat2" ON "flent"."transaction_classification" ("purpose_category_2")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_classification_cat2"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_classification_cat1"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_classification" DROP CONSTRAINT "FK_transaction_classification_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_classification"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transaction_classification'
ORDER BY ordinal_position;
```

Expected: 3 rows.

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'transaction_classification';
```

Expected: PK_transaction_classification_utn (PRIMARY KEY), FK_transaction_classification_utn (FOREIGN KEY, CASCADE).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400001-phase4-transaction-classification.ts
git commit -m "feat(db): add transaction_classification with OPEX/CAPEX purpose categories for financial reporting"
```

---

## Task 3: Transaction Parties Extension Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400002-phase4-transaction-parties.ts`

**Why:** Every financial transaction involves a payer (from_party) and payee (to_party). Each party has a name, a type classification (Tenant/Landlord/Vendor/Platform/Third Party/Government), and derived info (GST number, PAN, address). The `from_party_info` and `to_party_info` fields are populated by workflow when a party is linked, pulling relevant KYC data from the respective entity tables.

**Table: `flent.transaction_parties`** (ext, 7 cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| utn | VARCHAR(255) | PK, FK transactions(utn) CASCADE | |
| from_party | VARCHAR(255) | NOT NULL | Payer name |
| from_party_type | VARCHAR(100) | NOT NULL | Tenant / Landlord / Vendor / Platform / Third Party / Government |
| from_party_info | TEXT | NULL | Derived: GST, PAN, address of payer |
| to_party | VARCHAR(255) | NOT NULL | Payee name |
| to_party_type | VARCHAR(100) | NOT NULL | Same values as from_party_type |
| to_party_info | TEXT | NULL | Derived: GST, PAN, address of payee |

**Indexes:** `from_party_type`, `to_party_type`

- [ ] **Step 1: Create the transaction parties migration**

```typescript
// 1744502400002-phase4-transaction-parties.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionParties1744502400002
  implements MigrationInterface
{
  name = 'Phase4TransactionParties1744502400002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_parties" (
        "utn" character varying(255) NOT NULL,
        "from_party" character varying(255) NOT NULL,
        "from_party_type" character varying(100) NOT NULL,
        "from_party_info" text,
        "to_party" character varying(255) NOT NULL,
        "to_party_type" character varying(100) NOT NULL,
        "to_party_info" text,
        CONSTRAINT "PK_transaction_parties_utn" PRIMARY KEY ("utn")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_parties"
      ADD CONSTRAINT "FK_transaction_parties_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_parties_from_type" ON "flent"."transaction_parties" ("from_party_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_parties_to_type" ON "flent"."transaction_parties" ("to_party_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_parties_to_type"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_parties_from_type"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_parties" DROP CONSTRAINT "FK_transaction_parties_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_parties"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transaction_parties'
ORDER BY ordinal_position;
```

Expected: 7 rows.

```sql
-- Verify to_party_info exists (was missing in v1, added in audit fix #3)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transaction_parties'
  AND column_name = 'to_party_info';
```

Expected: 1 row with `data_type = text`.

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400002-phase4-transaction-parties.ts
git commit -m "feat(db): add transaction_parties with from/to party names, types, and derived info fields"
```

---

## Task 4: Transaction Payment Extension Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400003-phase4-transaction-payment.ts`

**Why:** Payment method details are isolated from the base transaction to keep the core ledger clean. This table captures the payment channel (UPI, NEFT, RTGS, etc.), the payment provider (Kotak, IDFC, Razorpayx, Volopay), and the gateway reference ID for reconciliation. Only populated for Payment/Payout/Refund transaction types (not PurchaseOrder or Adjustment).

**Table: `flent.transaction_payment`** (ext, 4 cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| utn | VARCHAR(255) | PK, FK transactions(utn) CASCADE | |
| payment_channel | VARCHAR(100) | NULL | UPI / NEFT / RTGS / IMPS / Auto-debit NACH / Virtual Account / Payment Link / Cheque / Cash / Other |
| payment_provider | VARCHAR(100) | NULL | Kotak / IDFC / Razorpayx / Volopay |
| gateway_reference_id | VARCHAR(255) | NULL | External reference for reconciliation |

**Indexes:** `payment_channel`, `payment_provider`

- [ ] **Step 1: Create the transaction payment migration**

```typescript
// 1744502400003-phase4-transaction-payment.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionPayment1744502400003
  implements MigrationInterface
{
  name = 'Phase4TransactionPayment1744502400003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_payment" (
        "utn" character varying(255) NOT NULL,
        "payment_channel" character varying(100),
        "payment_provider" character varying(100),
        "gateway_reference_id" character varying(255),
        CONSTRAINT "PK_transaction_payment_utn" PRIMARY KEY ("utn")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_payment"
      ADD CONSTRAINT "FK_transaction_payment_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_payment_channel" ON "flent"."transaction_payment" ("payment_channel")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_payment_provider" ON "flent"."transaction_payment" ("payment_provider")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_payment_provider"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_payment_channel"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_payment" DROP CONSTRAINT "FK_transaction_payment_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_payment"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transaction_payment'
ORDER BY ordinal_position;
```

Expected: 4 rows.

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'transaction_payment';
```

Expected: PK_transaction_payment_utn (PRIMARY KEY), FK_transaction_payment_utn (FOREIGN KEY, CASCADE).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400003-phase4-transaction-payment.ts
git commit -m "feat(db): add transaction_payment with channel, provider, and gateway reference for reconciliation"
```

---

## Task 5: Transaction Line Items Extension Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400004-phase4-transaction-line-items.ts`

**Why:** Line items break down a transaction into date-specific entries tied to cost/revenue centers. Unlike `po_lines` (which is a child table with multiple rows per PO), this is a 1:1 extension that captures the billing period, the cost center allocation, and a rich-text description for the transaction entry.

**Table: `flent.transaction_line_items`** (ext, 4 cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| utn | VARCHAR(255) | PK, FK transactions(utn) CASCADE | |
| line_item_date | DATE | NULL | Billing period date |
| cost_revenue_center | VARCHAR(255) | NULL | Cost center or revenue center name |
| line_item_description | TEXT | NULL | Rich text description |

**Indexes:** `line_item_date`, `cost_revenue_center`

- [ ] **Step 1: Create the transaction line items migration**

```typescript
// 1744502400004-phase4-transaction-line-items.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionLineItems1744502400004
  implements MigrationInterface
{
  name = 'Phase4TransactionLineItems1744502400004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_line_items" (
        "utn" character varying(255) NOT NULL,
        "line_item_date" date,
        "cost_revenue_center" character varying(255),
        "line_item_description" text,
        CONSTRAINT "PK_transaction_line_items_utn" PRIMARY KEY ("utn")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_line_items"
      ADD CONSTRAINT "FK_transaction_line_items_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_line_items_date" ON "flent"."transaction_line_items" ("line_item_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_line_items_center" ON "flent"."transaction_line_items" ("cost_revenue_center")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_line_items_center"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_line_items_date"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_line_items" DROP CONSTRAINT "FK_transaction_line_items_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_line_items"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transaction_line_items'
ORDER BY ordinal_position;
```

Expected: 4 rows.

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400004-phase4-transaction-line-items.ts
git commit -m "feat(db): add transaction_line_items with date, cost center, and description fields"
```

---

## Task 6: Transaction Links Extension Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400005-phase4-transaction-links.ts`

**Why:** This is the most critical extension table in Phase 4. It replaces the v1 polymorphic `contact_id` with 4 explicit FK dropdowns (tenant_id, merchant_id, vendor_code, overhead_id) plus 4 additional entity links (contract_uid, ticket_id, pid, rid). This was a major audit fix (#21) that eliminates the need for runtime type resolution and enables proper FK constraints. The `ticket_id` FK is deferred to Phase 5 (created as a nullable column without FK constraint initially, constraint added when tickets table exists).

**Table: `flent.transaction_links`** (ext, 9 cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| utn | VARCHAR(255) | PK, FK transactions(utn) CASCADE | |
| contract_uid | UUID | NULL, FK contracts(contract_uid) | Dropdown |
| tenant_id | UUID | NULL, FK tenants(record_id) | Replaces contact_id (fix #21) |
| merchant_id | UUID | NULL, FK merchants(record_id) | Replaces contact_id (fix #21) |
| vendor_code | VARCHAR(255) | NULL, FK vendors(vendor_code) | Replaces contact_id (fix #21) |
| overhead_id | UUID | NULL, FK overheads(overhead_id) | New FK (fix #21) |
| ticket_id | INTEGER | NULL | New FK, constraint deferred to Phase 5 |
| pid | VARCHAR(255) | NULL, FK properties(pid) | Was INTEGER, fixed to VARCHAR (fix #24) |
| rid | VARCHAR(255) | NULL, FK rooms(rid) | |

**Indexes:** `contract_uid`, `tenant_id`, `merchant_id`, `vendor_code`, `overhead_id`, `pid`, `rid`

- [ ] **Step 1: Create the transaction links migration**

```typescript
// 1744502400005-phase4-transaction-links.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionLinks1744502400005
  implements MigrationInterface
{
  name = 'Phase4TransactionLinks1744502400005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_links" (
        "utn" character varying(255) NOT NULL,
        "contract_uid" uuid,
        "tenant_id" uuid,
        "merchant_id" uuid,
        "vendor_code" character varying(255),
        "overhead_id" uuid,
        "ticket_id" integer,
        "pid" character varying(255),
        "rid" character varying(255),
        CONSTRAINT "PK_transaction_links_utn" PRIMARY KEY ("utn")
      )
    `);

    // FK to transactions base
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // FK to contracts
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_contract_uid"
      FOREIGN KEY ("contract_uid") REFERENCES "flent"."contracts"("contract_uid")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to tenants
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_tenant_id"
      FOREIGN KEY ("tenant_id") REFERENCES "flent"."tenants"("record_id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to merchants
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_merchant_id"
      FOREIGN KEY ("merchant_id") REFERENCES "flent"."merchants"("record_id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to vendors
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_vendor_code"
      FOREIGN KEY ("vendor_code") REFERENCES "flent"."vendors"("vendor_code")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to overheads
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_overhead_id"
      FOREIGN KEY ("overhead_id") REFERENCES "flent"."overheads"("overhead_id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // NOTE: ticket_id FK is deferred to Phase 5 when tickets table is created.
    // Column exists as nullable INTEGER without FK constraint.

    // FK to properties
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_pid"
      FOREIGN KEY ("pid") REFERENCES "flent"."properties"("pid")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to rooms
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_rid"
      FOREIGN KEY ("rid") REFERENCES "flent"."rooms"("rid")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Indexes for all FK columns
    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_contract_uid" ON "flent"."transaction_links" ("contract_uid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_tenant_id" ON "flent"."transaction_links" ("tenant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_merchant_id" ON "flent"."transaction_links" ("merchant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_vendor_code" ON "flent"."transaction_links" ("vendor_code")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_overhead_id" ON "flent"."transaction_links" ("overhead_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_ticket_id" ON "flent"."transaction_links" ("ticket_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_pid" ON "flent"."transaction_links" ("pid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_rid" ON "flent"."transaction_links" ("rid")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_rid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_pid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_ticket_id"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_overhead_id"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_vendor_code"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_merchant_id"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_tenant_id"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_contract_uid"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_rid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_pid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_overhead_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_vendor_code"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_merchant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_tenant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_contract_uid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_links"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transaction_links'
ORDER BY ordinal_position;
```

Expected: 9 rows.

```sql
-- Verify pid is VARCHAR not INTEGER (fix #24)
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transaction_links'
  AND column_name = 'pid';
```

Expected: `data_type = character varying`, `character_maximum_length = 255`.

```sql
-- Verify all 8 FK constraints (7 active + ticket_id deferred)
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'transaction_links'
ORDER BY constraint_name;
```

Expected: 8 constraints (1 PK + 7 FKs). No FK for ticket_id yet.

```sql
-- Verify all 8 indexes exist
SELECT indexname FROM pg_indexes
WHERE schemaname = 'flent' AND tablename = 'transaction_links'
ORDER BY indexname;
```

Expected: 9 indexes (PK + 8 created indexes including ticket_id index for future FK).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400005-phase4-transaction-links.ts
git commit -m "feat(db): add transaction_links with 8 explicit FK dropdowns replacing polymorphic contact_id (audit fix #21)"
```

---

## Task 7: Transaction Purchase Order Extension Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400006-phase4-transaction-purchase-order.ts`

**Why:** Purchase Orders are a specific transaction_type with additional fields: PO number, vendor reference, line item totals, GST rate, advance/remaining payment split, invoice document, and status lifecycle. The `vendor_name` is denormalized from `vendors.vendor_name` on link. Two self-referencing FK fields (`txn_id_advance`, `txn_id_remaining`) link the PO to its payment transactions. The `round_off` field handles sub-rupee adjustments in invoice reconciliation.

**Table: `flent.transaction_purchase_order`** (ext, 15 cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| utn | VARCHAR(255) | PK, FK transactions(utn) CASCADE | Only for transaction_type = PurchaseOrder |
| po_number | VARCHAR(255) | NOT NULL, UNIQUE | System-generated PO identifier |
| vendor_code | VARCHAR(255) | NOT NULL, FK vendors(vendor_code) | |
| vendor_name | VARCHAR(255) | NOT NULL | Derived: vendors.vendor_name |
| total_items | INTEGER | NULL | |
| gst_percent | DECIMAL(5,2) | NULL | |
| advance_amount | DECIMAL(12,2) | NULL | |
| remaining_amount | DECIMAL(12,2) | NULL | |
| advance_date | DATE | NULL | |
| fnf_date | DATE | NULL | Final and full settlement date |
| invoice | VARCHAR(500) | NULL | File URL |
| po_status | VARCHAR(100) | NOT NULL DEFAULT 'Draft' | Draft / Approved / Completed / Cancelled |
| round_off | DECIMAL(12,2) | NULL | Sub-rupee adjustment |
| txn_id_advance | VARCHAR(255) | NULL, FK transactions(utn) | Advance payment transaction |
| txn_id_remaining | VARCHAR(255) | NULL, FK transactions(utn) | Remaining payment transaction |

**Indexes:** `po_number` (UNIQUE), `vendor_code`, `po_status`, `txn_id_advance`, `txn_id_remaining`

- [ ] **Step 1: Create the transaction purchase order migration**

```typescript
// 1744502400006-phase4-transaction-purchase-order.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionPurchaseOrder1744502400006
  implements MigrationInterface
{
  name = 'Phase4TransactionPurchaseOrder1744502400006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_purchase_order" (
        "utn" character varying(255) NOT NULL,
        "po_number" character varying(255) NOT NULL,
        "vendor_code" character varying(255) NOT NULL,
        "vendor_name" character varying(255) NOT NULL,
        "total_items" integer,
        "gst_percent" numeric(5,2),
        "advance_amount" numeric(12,2),
        "remaining_amount" numeric(12,2),
        "advance_date" date,
        "fnf_date" date,
        "invoice" character varying(500),
        "po_status" character varying(100) NOT NULL DEFAULT 'Draft',
        "round_off" numeric(12,2),
        "txn_id_advance" character varying(255),
        "txn_id_remaining" character varying(255),
        CONSTRAINT "PK_transaction_purchase_order_utn" PRIMARY KEY ("utn"),
        CONSTRAINT "UQ_transaction_purchase_order_po_number" UNIQUE ("po_number")
      )
    `);

    // FK to transactions base (this PO IS a transaction)
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_purchase_order"
      ADD CONSTRAINT "FK_transaction_purchase_order_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // FK to vendors
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_purchase_order"
      ADD CONSTRAINT "FK_transaction_purchase_order_vendor_code"
      FOREIGN KEY ("vendor_code") REFERENCES "flent"."vendors"("vendor_code")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    // FK to advance payment transaction
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_purchase_order"
      ADD CONSTRAINT "FK_transaction_purchase_order_txn_advance"
      FOREIGN KEY ("txn_id_advance") REFERENCES "flent"."transactions"("utn")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to remaining payment transaction
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_purchase_order"
      ADD CONSTRAINT "FK_transaction_purchase_order_txn_remaining"
      FOREIGN KEY ("txn_id_remaining") REFERENCES "flent"."transactions"("utn")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_purchase_order_vendor_code" ON "flent"."transaction_purchase_order" ("vendor_code")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_purchase_order_po_status" ON "flent"."transaction_purchase_order" ("po_status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_purchase_order_txn_advance" ON "flent"."transaction_purchase_order" ("txn_id_advance")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_purchase_order_txn_remaining" ON "flent"."transaction_purchase_order" ("txn_id_remaining")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_purchase_order_txn_remaining"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_purchase_order_txn_advance"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_purchase_order_po_status"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_purchase_order_vendor_code"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_purchase_order" DROP CONSTRAINT "FK_transaction_purchase_order_txn_remaining"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_purchase_order" DROP CONSTRAINT "FK_transaction_purchase_order_txn_advance"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_purchase_order" DROP CONSTRAINT "FK_transaction_purchase_order_vendor_code"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_purchase_order" DROP CONSTRAINT "FK_transaction_purchase_order_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_purchase_order"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'transaction_purchase_order'
ORDER BY ordinal_position;
```

Expected: 15 rows.

```sql
-- Verify po_number UNIQUE constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'transaction_purchase_order'
  AND constraint_type = 'UNIQUE';
```

Expected: UQ_transaction_purchase_order_po_number.

```sql
-- Verify self-referencing FKs to transactions
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'transaction_purchase_order'
  AND constraint_type = 'FOREIGN KEY'
ORDER BY constraint_name;
```

Expected: 4 FK constraints (utn, vendor_code, txn_id_advance, txn_id_remaining).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400006-phase4-transaction-purchase-order.ts
git commit -m "feat(db): add transaction_purchase_order with PO number, vendor FK, advance/remaining self-refs, and status"
```

---

## Task 8: PO Lines Child Table

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400007-phase4-po-lines.ts`

**Why:** `po_lines` is the only child table in the Transaction object (ONE_TO_MANY from a PO transaction). Each PO can have multiple line items, each referencing a FSIN (Flent Standard Identification Number) for the item being purchased. The `line_amount` is derived as `qty * unit_price` and maintained by a trigger (Task 9). The `fsin_code` FK is deferred to Phase 6 when the FSIN table is created. When a PO status transitions to Completed, a trigger creates Item records from these lines (documented in the PO -> Item Creation Flow in the spec).

**Table: `flent.po_lines`** (child, 10 cols)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| po_line_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | System-generated |
| utn | VARCHAR(255) | NOT NULL, FK transactions(utn) CASCADE | Parent PO transaction |
| fsin_code | VARCHAR(255) | NULL | FK deferred to Phase 6 (fsins table) |
| item_name | VARCHAR(255) | NOT NULL | |
| qty | INTEGER | NOT NULL, CHECK >= 1 | |
| unit_price | DECIMAL(12,2) | NOT NULL | |
| line_amount | DECIMAL(12,2) | NULL | Auto-calculated: qty * unit_price |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| notes | TEXT | NULL | |

**Indexes:** `utn`, `fsin_code`

- [ ] **Step 1: Create the PO lines migration**

```typescript
// 1744502400007-phase4-po-lines.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4PoLines1744502400007
  implements MigrationInterface
{
  name = 'Phase4PoLines1744502400007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."po_lines" (
        "po_line_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "utn" character varying(255) NOT NULL,
        "fsin_code" character varying(255),
        "item_name" character varying(255) NOT NULL,
        "qty" integer NOT NULL,
        "unit_price" numeric(12,2) NOT NULL,
        "line_amount" numeric(12,2),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "notes" text,
        CONSTRAINT "PK_po_lines_po_line_id" PRIMARY KEY ("po_line_id"),
        CONSTRAINT "CHK_po_lines_qty_positive" CHECK ("qty" >= 1)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."po_lines"
      ADD CONSTRAINT "FK_po_lines_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // NOTE: fsin_code FK is deferred to Phase 6 when fsins table is created.
    // Column exists as nullable VARCHAR without FK constraint.

    await queryRunner.query(`
      CREATE INDEX "IDX_po_lines_utn" ON "flent"."po_lines" ("utn")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_po_lines_fsin_code" ON "flent"."po_lines" ("fsin_code")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_po_lines_fsin_code"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_po_lines_utn"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."po_lines" DROP CONSTRAINT "FK_po_lines_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."po_lines"`);
  }
}
```

- [ ] **Step 2: Verify**

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'flent' AND table_name = 'po_lines'
ORDER BY ordinal_position;
```

Expected: 10 rows.

```sql
-- Verify CHECK constraint on qty
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'flent'
  AND constraint_name = 'CHK_po_lines_qty_positive';
```

Expected: 1 row with check clause for `qty >= 1`.

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'flent' AND table_name = 'po_lines';
```

Expected: PK_po_lines_po_line_id (PRIMARY KEY), FK_po_lines_utn (FOREIGN KEY, CASCADE), CHK_po_lines_qty_positive (CHECK).

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400007-phase4-po-lines.ts
git commit -m "feat(db): add po_lines child table with qty CHECK, FSIN placeholder, and PO transaction FK"
```

---

## Task 9: Transaction Trigger Functions

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400008-phase4-transaction-triggers.ts`

**Why:** One derived field must be kept in sync by the database: `line_amount = qty * unit_price` on `po_lines`. Additionally, `updated_at` on the `transactions` base table should auto-update on any modification. Using BEFORE INSERT OR UPDATE triggers ensures derived values are always correct at write time without application logic.

- [ ] **Step 1: Create the triggers migration**

```typescript
// 1744502400008-phase4-transaction-triggers.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionTriggers1744502400008
  implements MigrationInterface
{
  name = 'Phase4TransactionTriggers1744502400008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Trigger 1: Auto-calculate line_amount on po_lines
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_calc_po_line_amount"()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.line_amount := NEW.qty * NEW.unit_price;
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_po_lines_line_amount"
      BEFORE INSERT OR UPDATE OF qty, unit_price
      ON "flent"."po_lines"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_calc_po_line_amount"()
    `);

    // Trigger 2: Auto-update updated_at on transactions
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_transactions_updated_at"()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_transactions_updated_at"
      BEFORE UPDATE
      ON "flent"."transactions"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_transactions_updated_at"()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_transactions_updated_at" ON "flent"."transactions"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_transactions_updated_at"()`
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_po_lines_line_amount" ON "flent"."po_lines"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_calc_po_line_amount"()`
    );
  }
}
```

- [ ] **Step 2: Verify triggers exist**

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'flent'
  AND event_object_table IN ('po_lines', 'transactions')
ORDER BY event_object_table, trigger_name;
```

Expected:

| trigger_name | event_manipulation | event_object_table | action_timing |
|---|---|---|---|
| trg_po_lines_line_amount | INSERT | po_lines | BEFORE |
| trg_po_lines_line_amount | UPDATE | po_lines | BEFORE |
| trg_transactions_updated_at | UPDATE | transactions | BEFORE |

- [ ] **Step 3: Verify trigger logic with test data**

```sql
-- Insert a test transaction
INSERT INTO "flent"."transactions" (
  utn, transaction_type, credit_debit, transaction_date,
  amount, status, created_by
) VALUES (
  'TXN-20250101-00001', 'PurchaseOrder', 'Debit', '2025-01-01',
  50000.00, 'Draft', 'system'
);

-- Test po_lines line_amount calculation
INSERT INTO "flent"."po_lines" (
  utn, item_name, qty, unit_price
) VALUES (
  'TXN-20250101-00001', 'AC Split 1.5T', 3, 35000.00
) RETURNING po_line_id, line_amount;
```

Expected: `line_amount = 105000.00`.

```sql
-- Test update recalculation
UPDATE "flent"."po_lines"
SET qty = 5
WHERE utn = 'TXN-20250101-00001'
RETURNING line_amount;
```

Expected: `line_amount = 175000.00`.

```sql
-- Test transactions updated_at trigger
UPDATE "flent"."transactions"
SET status = 'Approved'
WHERE utn = 'TXN-20250101-00001'
RETURNING updated_at;
```

Expected: `updated_at` is recent (within last second).

```sql
-- Clean up test data
DELETE FROM "flent"."transactions" WHERE utn = 'TXN-20250101-00001';
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744502400008-phase4-transaction-triggers.ts
git commit -m "feat(db): add transaction triggers — po_lines line_amount auto-calc and transactions updated_at"
```

---

## Task 10: Cross-Table Verification

**Files:** None (verification only)

**Why:** After all 9 migration files have been applied, verify the complete Transaction object graph: 8 tables, 56 total columns, 19 FK relationships, 27 indexes, 2 CHECK constraints, and 2 trigger functions.

- [ ] **Step 1: Verify table inventory**

```sql
SELECT table_name, COUNT(column_name) as col_count
FROM information_schema.columns
WHERE table_schema = 'flent'
  AND table_name IN (
    'transactions',
    'transaction_classification',
    'transaction_parties',
    'transaction_payment',
    'transaction_line_items',
    'transaction_links',
    'transaction_purchase_order',
    'po_lines'
  )
GROUP BY table_name
ORDER BY table_name;
```

Expected:

| table_name | col_count |
|---|---|
| po_lines | 10 |
| transaction_classification | 3 |
| transaction_line_items | 4 |
| transaction_links | 9 |
| transaction_parties | 7 |
| transaction_payment | 4 |
| transaction_purchase_order | 15 |
| transactions | 11 |

Total: 63 columns across 8 tables (11 base + 3 + 7 + 4 + 4 + 9 + 15 + 10 child = 63).

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
  AND tc.table_name IN (
    'transactions', 'transaction_classification', 'transaction_parties',
    'transaction_payment', 'transaction_line_items', 'transaction_links',
    'transaction_purchase_order', 'po_lines'
  )
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;
```

Expected: 19 FK rows:

| from_table | from_column | to_table | to_column | delete_rule |
|---|---|---|---|---|
| po_lines | utn | transactions | utn | CASCADE |
| transaction_classification | utn | transactions | utn | CASCADE |
| transaction_line_items | utn | transactions | utn | CASCADE |
| transaction_links | contract_uid | contracts | contract_uid | SET NULL |
| transaction_links | merchant_id | merchants | record_id | SET NULL |
| transaction_links | overhead_id | overheads | overhead_id | SET NULL |
| transaction_links | pid | properties | pid | SET NULL |
| transaction_links | rid | rooms | rid | SET NULL |
| transaction_links | tenant_id | tenants | record_id | SET NULL |
| transaction_links | utn | transactions | utn | CASCADE |
| transaction_links | vendor_code | vendors | vendor_code | SET NULL |
| transaction_parties | utn | transactions | utn | CASCADE |
| transaction_payment | utn | transactions | utn | CASCADE |
| transaction_purchase_order | txn_id_advance | transactions | utn | SET NULL |
| transaction_purchase_order | txn_id_remaining | transactions | utn | SET NULL |
| transaction_purchase_order | utn | transactions | utn | CASCADE |
| transaction_purchase_order | vendor_code | vendors | vendor_code | RESTRICT |

Note: `transaction_links.ticket_id` FK deferred to Phase 5. `po_lines.fsin_code` FK deferred to Phase 6.

- [ ] **Step 3: Verify CHECK constraints**

```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'flent'
  AND constraint_name IN ('CHK_transactions_amount_positive', 'CHK_po_lines_qty_positive');
```

Expected: 2 rows.

- [ ] **Step 4: Verify trigger functions**

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'flent'
  AND routine_name LIKE 'trg_%'
ORDER BY routine_name;
```

Expected: includes `trg_calc_po_line_amount` and `trg_transactions_updated_at` (plus Phase 3 triggers).

- [ ] **Step 5: Verify complete Phase 3 + 4 schema**

```sql
-- Full table count for flent schema after Phase 4
SELECT COUNT(DISTINCT table_name) as total_tables
FROM information_schema.columns
WHERE table_schema = 'flent';
```

Expected: Phase 1 tables + Phase 2 tables (18) + Phase 3 tables (3) + Phase 4 tables (8) = total depends on Phase 1 count.

```sql
-- Verify no orphaned FK references
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name || '.' || ccu.column_name AS references
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'flent'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name NOT IN (
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'flent'
  );
```

Expected: 0 rows (no dangling FK references, except deferred ticket_id and fsin_code which have no FK constraint yet).

- [ ] **Step 6: No commit needed (verification only)**

All Phase 4 tables are deployed and verified.

---

## Deferred FK Constraints (Phase 5 and Phase 6)

Two FK constraints are intentionally deferred because their target tables do not exist yet:

### Phase 5 (Tickets)

```sql
-- Run after tickets table is created in Phase 5
ALTER TABLE "flent"."transaction_links"
ADD CONSTRAINT "FK_transaction_links_ticket_id"
FOREIGN KEY ("ticket_id") REFERENCES "flent"."tickets"("ticket_id")
ON DELETE SET NULL ON UPDATE NO ACTION;
```

### Phase 6 (FSIN)

```sql
-- Run after fsins table is created in Phase 6
ALTER TABLE "flent"."po_lines"
ADD CONSTRAINT "FK_po_lines_fsin_code"
FOREIGN KEY ("fsin_code") REFERENCES "flent"."fsins"("fsin_code")
ON DELETE SET NULL ON UPDATE NO ACTION;
```

---

## Summary

Phase 4 delivers:
- **8 tables** in the `flent` schema: `transactions` (base), `transaction_classification`, `transaction_parties`, `transaction_payment`, `transaction_line_items`, `transaction_links` (extensions), `transaction_purchase_order` (PO extension), `po_lines` (child)
- **63 total columns** across all 8 tables
- **19 FK relationships** linking transactions to contracts, tenants, merchants, vendors, overheads, properties, rooms, and self-referencing PO payment links
- **27 indexes** for query performance on type, status, dates, categories, parties, channels, and all FK columns
- **2 CHECK constraints** (amount >= 0 on transactions, qty >= 1 on po_lines)
- **2 trigger functions** for derived field auto-calculation (po_lines.line_amount, transactions.updated_at)
- **2 deferred FK constraints** documented for Phase 5 (ticket_id) and Phase 6 (fsin_code)
- **9 migration files** following the established Phase 2/3 naming convention
