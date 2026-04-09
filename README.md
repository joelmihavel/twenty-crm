# Flent Twenty CRM

Self-hosted Twenty CRM on GCP for Flent's property & co-living management operations. Migrating from HubSpot.

## Architecture

```
GKE Cluster (asia-south1) — flent-twenty
├── Twenty Server (3 pods, HPA 3-5)
├── Twenty Worker (2 pods, Spot VMs, HPA 2-4)
├── PgBouncer (centralized, 150 pool)
└── Metabase (read replica analytics)

Cloud SQL PostgreSQL 16 (8vCPU/32GB, HA)
├── Primary: flent-twenty-db
├── Read Replica: flent-twenty-db-replica (Metabase)
└── Staging: flent-twenty-staging

Memorystore Redis 5GB (STANDARD_HA)
Cloud Functions: hubspot-mirror (hourly), data-validator (Pub/Sub)
Pub/Sub: 6 topics + 3 DLQ
Secret Manager: 10 secrets
```

## Repository Structure

```
.
├── terraform/          # GCP infrastructure as code (82 resources)
├── k8s/
│   ├── twenty/         # Twenty CRM K8s manifests
│   ├── pgbouncer/      # Centralized PgBouncer service
│   └── metabase/       # Metabase analytics deployment
├── functions/
│   ├── hubspot-mirror/ # Hourly HubSpot sync (45 tests, 120 field mappings)
│   └── data-validator/ # Phone/Aadhaar/PAN/IFSC validation (76 tests)
├── docs/
│   ├── evaluation/     # HubSpot vs Twenty comparison (50-dimension gap analysis)
│   ├── specs/          # Migration design spec (CEO + Eng reviewed)
│   ├── plans/          # Phase implementation plans
│   └── gaps/           # Feature parity analysis data
└── scripts/            # Deployment and setup scripts
```

## Quick Start

```bash
# Get GKE credentials
gcloud container clusters get-credentials flent-twenty --region asia-south1 --project flent-twenty-prod

# Check status
kubectl get pods -n twenty-prod

# Port-forward to Twenty
kubectl port-forward -n twenty-prod svc/twenty-server 3000:3000
# Open http://localhost:3000

# Port-forward to Metabase
kubectl port-forward -n twenty-prod svc/metabase 3001:3000
# Open http://localhost:3001
```

## Migration Phases

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1**: Infrastructure + Mirror | **COMPLETE** | GKE, Cloud SQL, Redis, Twenty, Metabase, Cloud Functions |
| **Phase 2**: Custom Data Model + Views | Planned | 7 objects, 17 views, 9 roles, RBAC |
| **Phase 3**: Workflows + Integrations | Planned | Zoho Sign, Cal.com, 30 workflows |
| **Phase 4**: Payment Operations | Planned | Cashfree rent collection + landlord payouts |
| **Phase 5**: WhatsApp + Cutover | Planned | Galabox/Superchat, full team migration |

## Cost

~$1,337/mo for 40 users (vs $4,800-6,800/mo HubSpot equivalent)

## GCP Project

- Project: `flent-twenty-prod`
- Region: `asia-south1` (Mumbai)
- Domain: `crm.flent.in` (pending DNS)
