# Flent Twenty CRM — Code Audit Report

**Date**: 2026-04-09
**Method**: Autoresearch 100-iteration parallel review (5 tracks x 20 iterations)
**Codebase**: flent-homes/twenty (43 TS files, 13 TF files, 16 YAML files)
**Baseline**: 137 tests passing, 42 potential issues

---

## Executive Summary

| Severity | Count | Needs Immediate Action |
|----------|-------|----------------------|
| **CRITICAL** | 17 | YES — secrets exposed, field mismatches, data loss risk |
| **HIGH** | 44 | Before first mirror sync |
| **MEDIUM** | 34 | Next sprint |
| **LOW** | 11 | Backlog |
| **Total** | **106** | |

### Top 5 Systemic Issues

1. **Field name divergence (15 issues, 6 CRITICAL)** — Mirror uses snakeToCamel on HubSpot fields but data model was designed with shorter names. Every Tenant, Room, Ticket, and Contract field will silently fail.

2. **SELECT value format mismatch (all objects)** — Mirror sends raw text ("Active"), data model expects SCREAMING_SNAKE ("ACTIVE"). Every SELECT field across all objects is broken.

3. **Secrets in code (3 CRITICAL)** — Plaintext DB password in K8s manifest, HMAC key in deployment, Metabase admin password hardcoded in TypeScript. Must rotate immediately.

4. **Missing security contexts (all containers)** — All 4 container types run as root with full capabilities. No NetworkPolicies. GKE master open to 0.0.0.0/0.

5. **Test coverage gaps (134 tests needed)** — Cloud Function entry points have 0 tests. 4 scripts (3,000 lines) completely untested. 69 tests defined but not running.

---

## Issues by Track

### Track 1: TypeScript Quality (20 issues)
| # | Severity | Issue |
|---|----------|-------|
| 1 | CRITICAL | Hardcoded Metabase admin credentials in source |
| 2 | CRITICAL | SQL injection via unparameterized schema name |
| 3 | HIGH | GraphQL injection via string interpolation in mutations |
| 4 | HIGH | Unsafe `as` cast on deserialized JSON without validation |
| 5 | HIGH | Checkpoint advances past failed records (data loss) |
| 6 | HIGH | Unbounded pagination can exhaust Cloud Function memory |
| 7 | MEDIUM | OBJECT_MAPPERS typed as Record<string> instead of strict type |
| 8 | MEDIUM | Validator casts record fields without type guard |
| 9 | MEDIUM | PIPELINE_MAP has contradictory Record<string> + as const |
| 10 | MEDIUM | NaN/negative BATCH_SIZE causes infinite loop |
| 11 | MEDIUM | Invalid timestamp produces NaN epoch sent to HubSpot |
| 12 | MEDIUM | Validator silently acknowledges malformed Pub/Sub messages |
| 13 | MEDIUM | singularFromPlural misses edge cases (categories->categorie) |
| 14 | MEDIUM | VALIDATION_RULES typed as Record<string> not Record<CrmObjectName> |
| 15 | MEDIUM | API key captured at module load, never refreshed |
| 16 | MEDIUM | getObjectById silently swallows all errors |
| 17 | LOW | Duplicated gql/esc/banner functions across 3 scripts |
| 18 | LOW | Duplicated OBJECT_IDS across view and RBAC scripts |
| 19 | LOW | Phone regex rejects valid formats with separators |
| 20 | LOW | Dashboard grid layout overlap bug |

### Track 2: Terraform Security (20 issues)
| # | Severity | Issue |
|---|----------|-------|
| 1 | CRITICAL | GKE master authorized networks open to 0.0.0.0/0 |
| 2 | CRITICAL | Project-level secretmanager.secretAccessor (all secrets) |
| 3 | HIGH | Project-level storage.objectAdmin (access to tfstate bucket) |
| 4 | HIGH | Cloud SQL missing require_ssl enforcement |
| 5 | HIGH | Cloud SQL missing audit logging flags |
| 6 | HIGH | Database passwords exposed as Terraform outputs |
| 7 | HIGH | No CMEK for Cloud SQL or GCS |
| 8 | MEDIUM | GKE nodes use overly broad cloud-platform OAuth scope |
| 9 | MEDIUM | GKE missing Binary Authorization |
| 10 | MEDIUM | Internal firewall allows all 65535 ports |
| 11 | MEDIUM | No secret rotation policy configured |
| 12 | MEDIUM | Redis noeviction + 5GB = production outage risk |
| 13 | MEDIUM | GCS bucket missing public access prevention |
| 14 | MEDIUM | Pub/Sub topics missing CMEK |
| 15 | MEDIUM | Terraform state backend missing CMEK |
| 16 | MEDIUM | Read replica has deletion_protection = false |
| 17 | MEDIUM | Single email notification channel for all alerts |
| 18 | MEDIUM | GKE node pool disks missing CMEK |
| 19 | LOW | Missing GKE node CPU/memory alerts |
| 20 | LOW | Secret Manager single-region replication |

### Track 3: K8s Manifests (20 issues)
| # | Severity | Issue |
|---|----------|-------|
| 1 | CRITICAL | Plaintext secrets committed to repository |
| 2 | CRITICAL | Hardcoded GCS HMAC access key in deployment |
| 3 | HIGH | Using :latest image tag in production |
| 4 | HIGH | No security context on twenty-server container |
| 5 | HIGH | No security context on twenty-worker container |
| 6 | HIGH | Worker deployment has no health probes |
| 7 | HIGH | No PodDisruptionBudgets defined |
| 8 | HIGH | PgBouncer single replica is a SPOF |
| 9 | HIGH | No NetworkPolicies defined |
| 10 | HIGH | PgBouncer auth_type set to plain |
| 11 | HIGH | No security context on pgbouncer container |
| 12 | HIGH | No security context on metabase container |
| 13 | MEDIUM | Server missing startupProbe |
| 14 | MEDIUM | No pod anti-affinity on server deployment |
| 15 | HIGH | Metabase uses H2 embedded DB (data loss on restart) |
| 16 | MEDIUM | Metabase ingress missing TLS |
| 17 | MEDIUM | Hardcoded Redis IP instead of DNS |
| 18 | MEDIUM | No Prometheus annotations on any pod |
| 19 | MEDIUM | No pod-level securityContext (seccomp, fsGroup) |
| 20 | MEDIUM | HPA CPU-only scaling for memory-intensive app |

### Track 4: Test Coverage (20 gaps)
| # | Severity | Gap |
|---|----------|-----|
| 1 | CRITICAL | Validator index.ts Pub/Sub decode — 0 tests |
| 2 | CRITICAL | Validator Secret Manager getApiKey — 0 tests |
| 3 | HIGH | Validator twentyGraphQL error handling — 0 tests |
| 4 | CRITICAL | Validator full handler integration — 0 tests |
| 5 | CRITICAL | Mirror index.ts HTTP handler — 0 tests |
| 6 | MEDIUM | Mirror runSync skips unmapped types — 0 tests |
| 7 | HIGH | Mirror fatal fetch prevents checkpoint update — 0 tests |
| 8 | MEDIUM | singularFromPlural helper — 0 tests |
| 9 | MEDIUM | CheckpointManager.read invalid fields — edge cases |
| 10 | CRITICAL | setup-data-model 69 tests not running (vitest config) |
| 11 | HIGH | setup-data-model metadata-client — 0 tests |
| 12 | MEDIUM | setup-data-model helpers makeOptions — 0 tests |
| 13 | HIGH | setup-metabase entire module (1,263 lines) — 0 tests |
| 14 | HIGH | setup-metabase metabase-client HTTP helper — 0 tests |
| 15 | HIGH | setup-rbac entire module (557 lines) — 0 tests |
| 16 | HIGH | setup-views entire module (642 lines) — 0 tests |
| 17 | MEDIUM | Mirror pickFields with missing properties — 0 tests |
| 18 | MEDIUM | Validator validateRecord non-string values — 0 tests |
| 19 | LOW | toCurrency negative/very large values — 0 tests |
| 20 | HIGH | CheckpointManager.write failure — 0 tests |

### Track 5: Integration Correctness (20 issues)
| # | Severity | Issue |
|---|----------|-------|
| 1 | CRITICAL | Tenant: tenantMonthlyRent vs monthlyRent |
| 2 | CRITICAL | Tenant: tenantBaseRent vs baseRent |
| 3 | CRITICAL | Tenant: monthlyMaintenance vs maintenanceAmount |
| 4 | CRITICAL | Tenant: tenantGst vs gst |
| 5 | HIGH | Tenant: rentDue sent as string, model expects CURRENCY |
| 6 | HIGH | Tenant: realMoveInDate vs moveInDate |
| 7 | HIGH | Tenant: preferredArea vs preferredAreas (MULTI_SELECT) |
| 8 | HIGH | Tenant: smokingPreference vs smoking |
| 9 | MEDIUM | Tenant: cashfreeOrderId vs cfOrderId |
| 10 | CRITICAL | Room: n3/n6/n11MonthLockInRent vs three/six/elevenMonthLockInRent |
| 11 | CRITICAL | Ticket: hsPipeline/hsPipelineStage vs pipeline/ticketStatus |
| 12 | HIGH | Ticket: costAssociated vs cost, ticketFlag vs flag |
| 13 | HIGH | Contract: contractStartDate vs startDate |
| 14 | HIGH | Contract: propertyBaseRent vs baseRent |
| 15 | HIGH | Validator API URL points to api.twenty.com not crm.flent.in |
| 16 | HIGH | Property: areaName vs area |
| 17 | CRITICAL | Workload Identity namespace: "twenty" vs "twenty-prod" |
| 18 | CRITICAL | All SELECT values: raw text vs SCREAMING_SNAKE_CASE |
| 19 | HIGH | Deal pipeline field maps to non-existent Twenty field |
| 20 | HIGH | Metabase missing DB credentials for data source |

---

## Prioritized Fix Plan

### P0: Fix Before First Mirror Sync (blocks data migration)

| Fix | Issues | Effort |
|-----|--------|--------|
| Add complete keyOverrides for all object types in field-mapping.ts | Integration #1-14 | 2 hours |
| Add SELECT value transformer (toScreamingSnake) | Integration #18 | 1 hour |
| Fix Workload Identity namespace (twenty -> twenty-prod) | Integration #17 | 15 min |
| Fix validator API URL | Integration #15 | 5 min |
| Fix deal pipeline field name (pipeline -> pipelineType) | Integration #19 | 5 min |
| Fix checkpoint logic (don't advance past failures) | TS #5 | 30 min |

### P1: Fix Immediately (security)

| Fix | Issues | Effort |
|-----|--------|--------|
| Rotate all exposed secrets (DB password, HMAC key, Metabase password) | K8s #1,2; TS #1 | 1 hour |
| Restrict GKE master authorized networks | TF #1 | 15 min |
| Scope IAM to resource level (not project) | TF #2,3 | 30 min |
| Add security contexts to all containers | K8s #4,5,11,12 | 1 hour |

### P2: Fix This Week (reliability)

| Fix | Issues | Effort |
|-----|--------|--------|
| Pin image tags (remove :latest) | K8s #3 | 15 min |
| Add PodDisruptionBudgets | K8s #7 | 30 min |
| Add NetworkPolicies | K8s #9 | 1 hour |
| Add worker health probes | K8s #6 | 30 min |
| PgBouncer 2 replicas | K8s #8 | 15 min |
| Metabase: switch H2 to PostgreSQL | K8s #15 | 1 hour |
| Enable Cloud SQL SSL | TF #4 | 15 min |
| Add audit logging flags | TF #5 | 15 min |
| Fix 69 tests (vitest config) | Test #10 | 30 min |

### P3: Fix Next Sprint (quality)

| Fix | Issues | Effort |
|-----|--------|--------|
| Write 134 missing tests | Test #1-20 | 4 hours |
| Extract shared utilities (DRY) | TS #17,18 | 1 hour |
| Add runtime JSON validation (Zod) | TS #4 | 2 hours |
| Add CMEK encryption | TF #7,14,15,18 | 2 hours |
| Add memory-based HPA | K8s #20 | 15 min |
| Add Prometheus annotations | K8s #18 | 30 min |
