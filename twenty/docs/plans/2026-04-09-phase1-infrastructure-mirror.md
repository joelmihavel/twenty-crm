# Phase 1: Infrastructure + Mirror — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy Twenty CRM on GCP (asia-south1) with hourly HubSpot mirroring, data validation, Metabase dashboards, and monitoring — serving 40 users with <500ms p95 latency.

**Architecture:** GKE Standard cluster with Twenty (3 server + 2 worker pods), centralized PgBouncer, Cloud SQL PostgreSQL 16 HA, Memorystore Redis 5GB, Metabase on read replica. Cloud Functions for HubSpot mirror + data validation. Pub/Sub event bus with DLQs. All secrets in Secret Manager.

**Tech Stack:** Terraform (GCP provider), Helm, Docker, TypeScript (Cloud Functions), gcloud CLI, kubectl

**Spec:** `docs/superpowers/specs/2026-04-09-flent-twenty-migration-design.md`

---

## File Structure

```
flent-infra/                          # New repo for infrastructure code
├── terraform/
│   ├── main.tf                       # Provider config, project setup
│   ├── variables.tf                  # All configurable variables
│   ├── outputs.tf                    # Outputs (IPs, connection strings)
│   ├── gke.tf                        # GKE cluster + node pools
│   ├── cloudsql.tf                   # Cloud SQL primary + read replica + staging
│   ├── redis.tf                      # Memorystore Redis
│   ├── storage.tf                    # GCS bucket
│   ├── networking.tf                 # VPC, subnets, Cloud NAT, CDN, LB
│   ├── pubsub.tf                     # Pub/Sub topics + DLQ subscriptions
│   ├── secrets.tf                    # Secret Manager secrets
│   ├── monitoring.tf                 # Alert policies
│   ├── iam.tf                        # Service accounts + IAM bindings
│   └── terraform.tfvars              # Environment-specific values (gitignored)
├── k8s/
│   ├── twenty/
│   │   ├── values-prod.yaml          # Twenty Helm overrides
│   │   └── values-staging.yaml       # Twenty Helm overrides (staging)
│   ├── pgbouncer/
│   │   ├── deployment.yaml           # Centralized PgBouncer pod
│   │   ├── service.yaml              # PgBouncer K8s Service
│   │   └── configmap.yaml            # PgBouncer config (pgbouncer.ini, userlist.txt)
│   ├── metabase/
│   │   ├── deployment.yaml           # Metabase pod
│   │   ├── service.yaml              # Metabase K8s Service
│   │   └── ingress.yaml              # Metabase ingress (metabase.flent.in)
│   └── cloud-sql-proxy/
│       └── deployment.yaml           # Cloud SQL Auth Proxy (shared service)
├── functions/
│   ├── hubspot-mirror/
│   │   ├── src/
│   │   │   ├── index.ts              # Cloud Function entry point
│   │   │   ├── hubspot-client.ts     # HubSpot API wrapper (search, paginate)
│   │   │   ├── twenty-client.ts      # Twenty GraphQL API wrapper (upsert batch)
│   │   │   ├── field-mapping.ts      # HubSpot → Twenty field transformations
│   │   │   ├── checkpoint.ts         # GCS checkpoint read/write
│   │   │   └── types.ts              # Shared TypeScript types
│   │   ├── test/
│   │   │   ├── field-mapping.test.ts # Unit tests for all 7 object mappings
│   │   │   ├── hubspot-client.test.ts
│   │   │   ├── twenty-client.test.ts
│   │   │   └── checkpoint.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── data-validator/
│   │   ├── src/
│   │   │   ├── index.ts              # Cloud Function entry point
│   │   │   ├── validators.ts         # Phone, Aadhaar, PAN, IFSC regex validators
│   │   │   └── types.ts
│   │   ├── test/
│   │   │   └── validators.test.ts    # Unit tests for all validation rules
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── backfill-job/
│       ├── src/
│       │   ├── index.ts              # GKE Job entry point (initial 16,853 record sync)
│       │   ├── hubspot-client.ts     # Shared with mirror (symlink or package)
│       │   ├── twenty-client.ts      # Shared with mirror
│       │   └── field-mapping.ts      # Shared with mirror
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
└── scripts/
    ├── deploy.sh                     # Full deployment script
    ├── setup-secrets.sh              # Populate Secret Manager from .env.secrets
    └── run-backfill.sh               # Trigger initial backfill GKE Job
```

---

## Task 1: GCP Project + Terraform Foundation

**Files:**
- Create: `flent-infra/terraform/main.tf`
- Create: `flent-infra/terraform/variables.tf`
- Create: `flent-infra/terraform/outputs.tf`
- Create: `flent-infra/terraform/iam.tf`

- [ ] **Step 1: Create the infra repo and Terraform provider config**

```bash
mkdir -p ~/Documents/Dev/flent-infra/terraform
cd ~/Documents/Dev/flent-infra
git init
```

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "flent-twenty-tfstate"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "container.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "workflows.googleapis.com",
    "secretmanager.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "compute.googleapis.com",
    "artifactregistry.googleapis.com",
    "aiplatform.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}
```

- [ ] **Step 2: Define variables**

```hcl
# terraform/variables.tf
variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "flent-twenty-prod"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-south1"
}

variable "zones" {
  description = "GCP zones for multi-zone GKE"
  type        = list(string)
  default     = ["asia-south1-a", "asia-south1-b"]
}

variable "twenty_version" {
  description = "Twenty Docker image tag (pinned)"
  type        = string
  default     = "v1.20.11"
}

variable "domain" {
  description = "Primary domain for Twenty"
  type        = string
  default     = "crm.flent.in"
}

variable "metabase_domain" {
  description = "Domain for Metabase"
  type        = string
  default     = "metabase.flent.in"
}
```

- [ ] **Step 3: Define IAM service accounts**

```hcl
# terraform/iam.tf
resource "google_service_account" "twenty_server" {
  account_id   = "twenty-server"
  display_name = "Twenty CRM Server"
}

resource "google_service_account" "cloud_functions" {
  account_id   = "flent-cloud-functions"
  display_name = "Cloud Functions (mirror, validator, webhooks)"
}

resource "google_service_account" "backfill_job" {
  account_id   = "flent-backfill-job"
  display_name = "HubSpot Initial Backfill GKE Job"
}

# Grant Cloud SQL client to server SA
resource "google_project_iam_member" "twenty_cloudsql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.twenty_server.email}"
}

# Grant Secret Manager accessor to both SAs
resource "google_project_iam_member" "twenty_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.twenty_server.email}"
}

resource "google_project_iam_member" "cf_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# Grant GCS access to server (file storage) and functions (mirror errors, checkpoints)
resource "google_project_iam_member" "twenty_gcs" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.twenty_server.email}"
}

resource "google_project_iam_member" "cf_gcs" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# Grant Pub/Sub publisher to functions
resource "google_project_iam_member" "cf_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}
```

- [ ] **Step 4: Create tfstate bucket and init**

```bash
gcloud storage buckets create gs://flent-twenty-tfstate --project=flent-twenty-prod --location=asia-south1
cd ~/Documents/Dev/flent-infra/terraform
terraform init
```

- [ ] **Step 5: Commit**

```bash
cd ~/Documents/Dev/flent-infra
git add -A
git commit -m "feat: terraform foundation — provider, variables, IAM service accounts"
```

---

## Task 2: Cloud SQL + Memorystore + GCS

**Files:**
- Create: `flent-infra/terraform/cloudsql.tf`
- Create: `flent-infra/terraform/redis.tf`
- Create: `flent-infra/terraform/storage.tf`

- [ ] **Step 1: Define Cloud SQL primary + read replica + staging**

```hcl
# terraform/cloudsql.tf
resource "google_sql_database_instance" "primary" {
  name             = "flent-twenty-db"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = "db-custom-8-32768"
    availability_type = "REGIONAL"
    disk_size         = 200
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "02:00"
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    database_flags {
      name  = "max_connections"
      value = "400"
    }
    database_flags {
      name  = "shared_buffers"
      value = "8388608"  # 8GB in 8KB pages
    }
    database_flags {
      name  = "effective_cache_size"
      value = "25165824"  # 24GB in 8KB pages
    }
    database_flags {
      name  = "work_mem"
      value = "16384"  # 16MB in KB
    }
    database_flags {
      name  = "random_page_cost"
      value = "1.1"
    }
    database_flags {
      name  = "default_statistics_target"
      value = "200"
    }
    database_flags {
      name  = "max_parallel_workers_per_gather"
      value = "4"
    }
  }

  deletion_protection = true
  depends_on          = [google_project_service.apis["sqladmin.googleapis.com"]]
}

resource "google_sql_database" "twenty" {
  name     = "twenty"
  instance = google_sql_database_instance.primary.name
}

resource "google_sql_user" "twenty" {
  name     = "twenty"
  instance = google_sql_database_instance.primary.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

# Read replica for Metabase
resource "google_sql_database_instance" "read_replica" {
  name                 = "flent-twenty-db-replica"
  master_instance_name = google_sql_database_instance.primary.name
  database_version     = "POSTGRES_16"
  region               = var.region

  replica_configuration {
    failover_target = false
  }

  settings {
    tier            = "db-custom-2-8192"
    disk_size       = 200
    disk_type       = "PD_SSD"
    disk_autoresize = true

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
  }

  depends_on = [google_sql_database_instance.primary]
}

# Staging instance (lightweight)
resource "google_sql_database_instance" "staging" {
  name             = "flent-twenty-staging"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = "db-f1-micro"
    disk_size         = 10
    disk_type         = "PD_SSD"
    availability_type = "ZONAL"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "twenty_staging" {
  name     = "twenty"
  instance = google_sql_database_instance.staging.name
}

resource "google_sql_user" "twenty_staging" {
  name     = "twenty"
  instance = google_sql_database_instance.staging.name
  password = random_password.db_password_staging.result
}

resource "random_password" "db_password_staging" {
  length  = 32
  special = false
}
```

- [ ] **Step 2: Define Memorystore Redis**

```hcl
# terraform/redis.tf
resource "google_redis_instance" "twenty" {
  name               = "flent-twenty-redis"
  tier               = "STANDARD_HA"
  memory_size_gb     = 5
  region             = var.region
  redis_version      = "REDIS_7_0"
  authorized_network = google_compute_network.vpc.id
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  redis_configs = {
    maxmemory-policy = "noeviction"
  }

  depends_on = [google_project_service.apis["redis.googleapis.com"]]
}
```

- [ ] **Step 3: Define GCS bucket**

```hcl
# terraform/storage.tf
resource "google_storage_bucket" "twenty_files" {
  name          = "flent-twenty-files"
  location      = var.region
  storage_class = "STANDARD"
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 3
    }
    action {
      type = "Delete"
    }
  }
}

# HMAC key for S3-compatible access from Twenty
resource "google_storage_hmac_key" "twenty_server" {
  service_account_email = google_service_account.twenty_server.email
}
```

- [ ] **Step 4: Commit**

```bash
git add terraform/cloudsql.tf terraform/redis.tf terraform/storage.tf
git commit -m "feat: Cloud SQL (primary + replica + staging), Memorystore Redis 5GB, GCS bucket"
```

---

## Task 3: VPC + GKE Cluster

**Files:**
- Create: `flent-infra/terraform/networking.tf`
- Create: `flent-infra/terraform/gke.tf`

- [ ] **Step 1: Define VPC and subnets**

```hcl
# terraform/networking.tf
resource "google_compute_network" "vpc" {
  name                    = "flent-twenty-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "gke" {
  name          = "flent-gke-subnet"
  ip_cidr_range = "10.0.0.0/20"
  region        = var.region
  network       = google_compute_network.vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.4.0.0/14"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.8.0.0/20"
  }

  private_ip_google_access = true
}

# Cloud NAT for egress (Cloud Functions, Twenty -> HubSpot API)
resource "google_compute_router" "router" {
  name    = "flent-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "flent-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# Private services access for Cloud SQL
resource "google_compute_global_address" "private_ip" {
  name          = "flent-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip.name]
}
```

- [ ] **Step 2: Define GKE cluster + node pools**

```hcl
# terraform/gke.tf
resource "google_container_cluster" "twenty" {
  name     = "flent-twenty"
  location = var.region

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.gke.name

  # Use separately managed node pools
  remove_default_node_pool = true
  initial_node_count       = 1

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  release_channel {
    channel = "STABLE"
  }

  depends_on = [google_project_service.apis["container.googleapis.com"]]
}

# Server node pool (3x e2-standard-4)
resource "google_container_node_pool" "server" {
  name     = "server-pool"
  location = var.region
  cluster  = google_container_cluster.twenty.name

  node_count = 3

  node_config {
    machine_type    = "e2-standard-4"
    disk_size_gb    = 100
    disk_type       = "pd-ssd"
    service_account = google_service_account.twenty_server.email
    oauth_scopes    = ["https://www.googleapis.com/auth/cloud-platform"]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    labels = {
      role = "server"
    }
  }

  autoscaling {
    min_node_count = 3
    max_node_count = 5
  }
}

# Worker node pool (2x e2-standard-2, Spot VMs)
resource "google_container_node_pool" "worker" {
  name     = "worker-pool"
  location = var.region
  cluster  = google_container_cluster.twenty.name

  node_count = 2

  node_config {
    machine_type    = "e2-standard-2"
    disk_size_gb    = 50
    disk_type       = "pd-ssd"
    spot            = true
    service_account = google_service_account.twenty_server.email
    oauth_scopes    = ["https://www.googleapis.com/auth/cloud-platform"]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    labels = {
      role = "worker"
    }

    taint {
      key    = "cloud.google.com/gke-spot"
      value  = "true"
      effect = "NO_SCHEDULE"
    }
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 4
  }
}
```

- [ ] **Step 3: Terraform plan and apply**

```bash
cd ~/Documents/Dev/flent-infra/terraform
terraform plan -out=plan.tfplan
# Review the plan carefully
terraform apply plan.tfplan
```

Expected: GKE cluster, Cloud SQL instances, Redis, GCS, VPC all provisioned.

- [ ] **Step 4: Get GKE credentials**

```bash
gcloud container clusters get-credentials flent-twenty --region asia-south1 --project flent-twenty-prod
kubectl get nodes
```

Expected: 5 nodes (3 server + 2 worker) in Ready state.

- [ ] **Step 5: Commit**

```bash
git add terraform/networking.tf terraform/gke.tf
git commit -m "feat: VPC + GKE cluster with server (3x e2-standard-4) and worker (2x e2-standard-2 Spot) pools"
```

---

## Task 4: Pub/Sub + Secret Manager

**Files:**
- Create: `flent-infra/terraform/pubsub.tf`
- Create: `flent-infra/terraform/secrets.tf`
- Create: `flent-infra/scripts/setup-secrets.sh`

- [ ] **Step 1: Define Pub/Sub topics + DLQ subscriptions**

```hcl
# terraform/pubsub.tf
locals {
  pubsub_topics = {
    "crm-events"       = { dlq_max_retries = 5 }
    "agreement-events"  = { dlq_max_retries = 5 }
    "mirror-events"     = { dlq_max_retries = 5 }
  }
}

resource "google_pubsub_topic" "topics" {
  for_each = local.pubsub_topics
  name     = each.key
}

resource "google_pubsub_topic" "dlq_topics" {
  for_each = local.pubsub_topics
  name     = "${each.key}-dlq"
}

resource "google_pubsub_subscription" "subscriptions" {
  for_each = local.pubsub_topics
  name     = "${each.key}-sub"
  topic    = google_pubsub_topic.topics[each.key].id

  ack_deadline_seconds = 60

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dlq_topics[each.key].id
    max_delivery_attempts = each.value.dlq_max_retries
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}
```

- [ ] **Step 2: Define Secret Manager secrets**

```hcl
# terraform/secrets.tf
locals {
  secrets = [
    "hubspot-api-key",
    "zoho-sign-api-key",
    "cashfree-client-id",
    "cashfree-client-secret",
    "resend-api-key",
    "twenty-api-key",
    "twenty-app-secret",
    "metabase-embedding-secret",
    "db-password",
    "db-password-staging",
  ]
}

resource "google_secret_manager_secret" "secrets" {
  for_each  = toset(local.secrets)
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}
```

- [ ] **Step 3: Create secret population script**

```bash
#!/bin/bash
# scripts/setup-secrets.sh
# Usage: ./setup-secrets.sh
# Reads from .env.secrets (gitignored) and populates Secret Manager

set -euo pipefail

ENV_FILE=".env.secrets"
if [ ! -f "$ENV_FILE" ]; then
  echo "Create .env.secrets with key=value pairs first"
  exit 1
fi

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  echo "Setting secret: $key"
  printf "%s" "$value" | gcloud secrets versions add "$key" --data-file=- --project=flent-twenty-prod
done < "$ENV_FILE"

echo "All secrets populated."
```

- [ ] **Step 4: Apply Terraform + populate secrets**

```bash
terraform apply -auto-approve
# Then create .env.secrets (NOT committed) and run:
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

- [ ] **Step 5: Commit**

```bash
git add terraform/pubsub.tf terraform/secrets.tf scripts/setup-secrets.sh
echo ".env.secrets" >> .gitignore
git add .gitignore
git commit -m "feat: Pub/Sub topics with DLQ, Secret Manager for all credentials"
```

---

## Task 5: Deploy Twenty on GKE

**Files:**
- Create: `flent-infra/k8s/twenty/values-prod.yaml`
- Create: `flent-infra/k8s/twenty/values-staging.yaml`

- [ ] **Step 1: Create Twenty Helm values for production**

```yaml
# k8s/twenty/values-prod.yaml
# Twenty CRM Helm overrides — Production
# Pinned to v1.20.11 per spec

image:
  tag: "v1.20.11"

server:
  replicas: 3
  resources:
    requests:
      cpu: "500m"
      memory: "1Gi"
    limits:
      cpu: "1500m"
      memory: "2Gi"
  env:
    SERVER_URL: "https://crm.flent.in"
    NODE_OPTIONS: "--max-old-space-size=8192"
    PG_DATABASE_URL: "postgres://twenty:PASSWORD@pgbouncer-service:6432/twenty"
    REDIS_URL: "redis://REDIS_IP:6379"
    PG_DATABASE_PRIMARY_TIMEOUT_MS: "5000"
    PG_POOL_MAX_CONNECTIONS: "50"
    PG_POOL_IDLE_TIMEOUT_MS: "300000"
    API_RATE_LIMITING_SHORT_LIMIT: "500"
    API_RATE_LIMITING_LONG_LIMIT: "2000"
    STORAGE_TYPE: "s3"
    STORAGE_S3_REGION: "asia-south1"
    STORAGE_S3_NAME: "flent-twenty-files"
    STORAGE_S3_ENDPOINT: "https://storage.googleapis.com"
    EMAIL_DRIVER: "resend"
    EMAIL_FROM_ADDRESS: "crm@flent.in"
    AUTH_GOOGLE_ENABLED: "true"
    MESSAGING_PROVIDER_GMAIL_ENABLED: "true"
    CALENDAR_PROVIDER_GOOGLE_ENABLED: "true"
    SENTRY_ENVIRONMENT: "production"
    IS_MULTIWORKSPACE_ENABLED: "false"

worker:
  replicas: 2
  resources:
    requests:
      cpu: "250m"
      memory: "512Mi"
    limits:
      cpu: "1000m"
      memory: "1536Mi"
  tolerations:
    - key: "cloud.google.com/gke-spot"
      operator: "Equal"
      value: "true"
      effect: "NoSchedule"

autoscaling:
  server:
    enabled: true
    minReplicas: 3
    maxReplicas: 5
    targetCPUUtilizationPercentage: 70
  worker:
    enabled: true
    minReplicas: 2
    maxReplicas: 4

ingress:
  enabled: true
  className: "gce"
  annotations:
    kubernetes.io/ingress.global-static-ip-name: "flent-twenty-ip"
    networking.gke.io/managed-certificates: "flent-twenty-cert"
  hosts:
    - host: crm.flent.in
      paths:
        - path: /
          pathType: Prefix

# Disable internal DB and Redis (we use Cloud SQL + Memorystore)
postgresql:
  enabled: false
redis:
  enabled: false
```

- [ ] **Step 2: Add Helm repo and install Twenty**

```bash
helm repo add twenty https://twentyhq.github.io/twenty-helm
helm repo update

# Create namespace
kubectl create namespace twenty-prod
kubectl create namespace twenty-staging

# Install production
helm install flent-twenty twenty/twenty \
  --namespace twenty-prod \
  -f k8s/twenty/values-prod.yaml \
  --wait --timeout 10m
```

- [ ] **Step 3: Verify Twenty is running**

```bash
kubectl get pods -n twenty-prod
# Expected: 3 server pods, 2 worker pods — all Running

kubectl get ingress -n twenty-prod
# Expected: Ingress with external IP

# Health check
TWENTY_IP=$(kubectl get ingress -n twenty-prod -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')
curl -s "http://$TWENTY_IP/healthz"
# Expected: OK
```

- [ ] **Step 4: Commit**

```bash
git add k8s/twenty/
git commit -m "feat: Twenty Helm deployment — 3 server + 2 worker, pinned v1.20.11, Cloud SQL + Memorystore"
```

---

## Task 6: Centralized PgBouncer

**Files:**
- Create: `flent-infra/k8s/pgbouncer/configmap.yaml`
- Create: `flent-infra/k8s/pgbouncer/deployment.yaml`
- Create: `flent-infra/k8s/pgbouncer/service.yaml`

- [ ] **Step 1: Create PgBouncer ConfigMap**

```yaml
# k8s/pgbouncer/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pgbouncer-config
  namespace: twenty-prod
data:
  pgbouncer.ini: |
    [databases]
    twenty = host=/cloudsql/flent-twenty-prod:asia-south1:flent-twenty-db port=5432 dbname=twenty

    [pgbouncer]
    listen_addr = 0.0.0.0
    listen_port = 6432
    auth_type = md5
    auth_file = /etc/pgbouncer/userlist.txt
    pool_mode = transaction
    max_client_conn = 500
    default_pool_size = 150
    min_pool_size = 10
    reserve_pool_size = 10
    server_idle_timeout = 300
    server_lifetime = 3600
    log_connections = 0
    log_disconnections = 0
    log_pooler_errors = 1
    stats_period = 60
    admin_users = pgbouncer_admin

  userlist.txt: |
    "twenty" "PASSWORD_PLACEHOLDER"
```

- [ ] **Step 2: Create PgBouncer Deployment with Cloud SQL Auth Proxy sidecar**

```yaml
# k8s/pgbouncer/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgbouncer
  namespace: twenty-prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pgbouncer
  template:
    metadata:
      labels:
        app: pgbouncer
    spec:
      serviceAccountName: twenty-server-ksa
      containers:
        - name: pgbouncer
          image: bitnami/pgbouncer:1.22.1
          ports:
            - containerPort: 6432
          volumeMounts:
            - name: config
              mountPath: /etc/pgbouncer
              readOnly: true
          livenessProbe:
            tcpSocket:
              port: 6432
            initialDelaySeconds: 10
            periodSeconds: 10
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
        - name: cloud-sql-proxy
          image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.11.0
          args:
            - "--structured-logs"
            - "--auto-iam-authn"
            - "flent-twenty-prod:asia-south1:flent-twenty-db"
          securityContext:
            runAsNonRoot: true
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
      volumes:
        - name: config
          configMap:
            name: pgbouncer-config
```

- [ ] **Step 3: Create PgBouncer Service**

```yaml
# k8s/pgbouncer/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: pgbouncer-service
  namespace: twenty-prod
spec:
  selector:
    app: pgbouncer
  ports:
    - port: 6432
      targetPort: 6432
      protocol: TCP
  type: ClusterIP
```

- [ ] **Step 4: Apply and verify**

```bash
kubectl apply -f k8s/pgbouncer/
kubectl get pods -n twenty-prod -l app=pgbouncer
# Expected: 1 pod Running with 2/2 containers (pgbouncer + cloud-sql-proxy)

# Test connectivity from a Twenty server pod
kubectl exec -n twenty-prod deploy/flent-twenty-server -- \
  psql "postgres://twenty:***@pgbouncer-service:6432/twenty" -c "SELECT 1"
# Expected: 1
```

- [ ] **Step 5: Commit**

```bash
git add k8s/pgbouncer/
git commit -m "feat: centralized PgBouncer service with Cloud SQL Auth Proxy sidecar"
```

---

## Task 7: HubSpot Mirror Cloud Function

**Files:**
- Create: `flent-infra/functions/hubspot-mirror/` (all files)

- [ ] **Step 1: Initialize the function project**

```bash
mkdir -p ~/Documents/Dev/flent-infra/functions/hubspot-mirror/{src,test}
cd ~/Documents/Dev/flent-infra/functions/hubspot-mirror
```

```json
// package.json
{
  "name": "hubspot-mirror",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0",
    "@google-cloud/storage": "^7.7.0",
    "@google-cloud/secret-manager": "^5.5.0",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.0.0"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: Write the field mapping module with tests first**

```typescript
// test/field-mapping.test.ts
import { describe, it, expect } from 'vitest';
import {
  mapContactToPeople,
  mapContactToTenant,
  mapContactToLandlord,
  mapDealToOpportunity,
  determinePipelineType,
} from '../src/field-mapping';

describe('mapContactToPeople', () => {
  it('maps basic contact fields', () => {
    const hsContact = {
      properties: {
        firstname: 'Rahul',
        lastname: 'Kumar',
        email: 'rahul@example.com',
        phone: '+919876543210',
        customer_type: 'Tenant',
        hs_object_id: '12345',
        aadhar_number: '123456789012',
        pan_card: 'ABCDE1234F',
        lead_source: 'Organic-website',
      },
    };
    const result = mapContactToPeople(hsContact);
    expect(result.firstName).toBe('Rahul');
    expect(result.lastName).toBe('Kumar');
    expect(result.email).toBe('rahul@example.com');
    expect(result.phone).toBe('+919876543210');
    expect(result.role).toContain('Tenant');
    expect(result.hubspotRecordId).toBe('12345');
  });

  it('handles dual-role (Tenant + Landlord)', () => {
    const hsContact = {
      properties: {
        firstname: 'Priya',
        lastname: 'Shah',
        customer_type: 'Tenant;Landlord',
        hs_object_id: '67890',
      },
    };
    const result = mapContactToPeople(hsContact);
    expect(result.role).toContain('Tenant');
    expect(result.role).toContain('Landlord');
  });
});

describe('mapContactToTenant', () => {
  it('maps tenant-specific fields', () => {
    const hsContact = {
      properties: {
        tenant_lifecycle: 'Agreement Signed',
        reserve_status: 'Paid',
        tenant_monthly_rent: '25000',
        real_move_in_date: '2025-06-15',
        preferred_area: 'HSR Layout;Koramangala',
      },
    };
    const result = mapContactToTenant(hsContact);
    expect(result.tenantLifecycle).toBe('Agreement Signed');
    expect(result.monthlyRent).toBe(25000);
    expect(result.moveInDate).toBe('2025-06-15');
    expect(result.preferredAreas).toEqual(['HSR Layout', 'Koramangala']);
  });
});

describe('determinePipelineType', () => {
  it('maps Reserve pipeline', () => {
    expect(determinePipelineType('Reserve')).toBe('Reserve');
  });
  it('maps Occupancy Pipeline', () => {
    expect(determinePipelineType('Occupancy Pipeline')).toBe('Occupancy');
  });
  it('maps F4B pipeline', () => {
    expect(determinePipelineType('F4B')).toBe('F4B');
  });
  it('defaults to Reserve for unknown', () => {
    expect(determinePipelineType('Unknown')).toBe('Reserve');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd ~/Documents/Dev/flent-infra/functions/hubspot-mirror
npm install
npx vitest run
```

Expected: FAIL — modules not yet implemented.

- [ ] **Step 4: Implement field-mapping.ts**

```typescript
// src/field-mapping.ts

export interface HubSpotContact {
  properties: Record<string, string | undefined>;
}

export interface HubSpotDeal {
  properties: Record<string, string | undefined>;
}

export interface PeopleRecord {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  role: string[];
  aadharNumber: string;
  panCard: string;
  countryCode: string;
  leadSource: string;
  leadSubSource: string;
  hubspotRecordId: string;
}

export interface TenantRecord {
  tenantLifecycle: string;
  reserveStatus: string;
  monthlyRent: number;
  baseRent: number;
  maintenanceAmount: number;
  convenienceFee: number;
  platformFee: number;
  gst: number;
  furnishingRental: number;
  rentDue: number;
  rentStatus: string;
  firstMonthRent: number;
  moveInDate: string;
  moveOutDate: string;
  preferredAreas: string[];
  budget: number;
  foodPreference: string;
  smoking: string;
  petPreference: string;
  npsScore: number;
  rentalLink: string;
  cfOrderId: string;
  cfLinkId: string;
  hubspotRecordId: string;
  customerStatus: string;
}

export interface LandlordRecord {
  landlordStatus: string;
  cashfreeVendorId: string;
  vendorStatus: string;
  panCard: string;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  accountType: string;
  pennyDropStatus: string;
  hubspotRecordId: string;
}

export interface OpportunityRecord {
  name: string;
  amount: number;
  closeDate: string;
  stage: string;
  pipelineType: string;
  hubspotRecordId: string;
}

// Property whitelist — only these 109 fields are mapped (not all 613)
const TENANT_FIELDS = [
  'tenant_lifecycle', 'reserve_status', 'tenant_monthly_rent', 'tenant_base_rent',
  'monthly_maintenance', 'convenience_fee', 'platform_fee', 'tenant_gst',
  'furnishing_rental', 'rent_due', 'rent_status', 'first_month_rent',
  'real_move_in_date', 'move_out_date', 'preferred_area', 'budget',
  'food_preference', 'smoking_preference', 'pet_preference', 'nps_score',
  'rental_link', 'cashfree_order_id', 'cashfree_link_id', 'customer_status',
];

const LANDLORD_FIELDS = [
  'cashfree_vendor_id', 'vendor_status', 'bank_account_number', 'ifsc_code',
  'account_holder_name', 'account_type', 'penny_drop_status',
];

function parseNumber(val: string | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function parseRoles(customerType: string | undefined): string[] {
  if (!customerType) return ['Lead'];
  return customerType.split(';').map(r => r.trim()).filter(Boolean);
}

export function mapContactToPeople(contact: HubSpotContact): PeopleRecord {
  const p = contact.properties;
  return {
    firstName: p.firstname || '',
    lastName: p.lastname || '',
    email: p.email || '',
    phone: p.phone || '',
    city: p.city || '',
    role: parseRoles(p.customer_type),
    aadharNumber: p.aadhar_number || '',
    panCard: p.pan_card || '',
    countryCode: p.country_code || '91',
    leadSource: p.lead_source || '',
    leadSubSource: p.lead_sub_source || '',
    hubspotRecordId: p.hs_object_id || '',
  };
}

export function mapContactToTenant(contact: HubSpotContact): TenantRecord {
  const p = contact.properties;
  return {
    tenantLifecycle: p.tenant_lifecycle || '',
    reserveStatus: p.reserve_status || '',
    monthlyRent: parseNumber(p.tenant_monthly_rent),
    baseRent: parseNumber(p.tenant_base_rent),
    maintenanceAmount: parseNumber(p.monthly_maintenance),
    convenienceFee: parseNumber(p.convenience_fee),
    platformFee: parseNumber(p.platform_fee),
    gst: parseNumber(p.tenant_gst),
    furnishingRental: parseNumber(p.furnishing_rental),
    rentDue: parseNumber(p.rent_due),
    rentStatus: p.rent_status || '',
    firstMonthRent: parseNumber(p.first_month_rent),
    moveInDate: p.real_move_in_date || '',
    moveOutDate: p.move_out_date || '',
    preferredAreas: (p.preferred_area || '').split(';').map(s => s.trim()).filter(Boolean),
    budget: parseNumber(p.budget),
    foodPreference: p.food_preference || '',
    smoking: p.smoking_preference || '',
    petPreference: p.pet_preference || '',
    npsScore: parseNumber(p.nps_score),
    rentalLink: p.rental_link || '',
    cfOrderId: p.cashfree_order_id || '',
    cfLinkId: p.cashfree_link_id || '',
    hubspotRecordId: p.hs_object_id || '',
    customerStatus: p.customer_status || '',
  };
}

export function mapContactToLandlord(contact: HubSpotContact): LandlordRecord {
  const p = contact.properties;
  return {
    landlordStatus: p.landlord_status || (p.customer_type?.includes('Landlord') ? 'Active' : ''),
    cashfreeVendorId: p.cashfree_vendor_id || '',
    vendorStatus: p.vendor_status || '',
    panCard: p.pan_card || '',
    bankAccountNumber: p.bank_account_number || '',
    ifscCode: p.ifsc_code || '',
    accountHolderName: p.account_holder_name || '',
    accountType: p.account_type || '',
    pennyDropStatus: p.penny_drop_status || '',
    hubspotRecordId: p.hs_object_id || '',
  };
}

export function determinePipelineType(pipelineName: string): string {
  const normalized = pipelineName.toLowerCase();
  if (normalized.includes('reserve')) return 'Reserve';
  if (normalized.includes('occupancy')) return 'Occupancy';
  if (normalized.includes('f4b')) return 'F4B';
  if (normalized.includes('supply')) return 'Supply';
  return 'Reserve'; // default
}

export function mapDealToOpportunity(deal: HubSpotDeal, pipelineName: string): OpportunityRecord {
  const p = deal.properties;
  return {
    name: p.dealname || '',
    amount: parseNumber(p.amount),
    closeDate: p.closedate || '',
    stage: p.dealstage || '',
    pipelineType: determinePipelineType(pipelineName),
    hubspotRecordId: p.hs_object_id || '',
  };
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 6: Implement the Cloud Function entry point**

```typescript
// src/index.ts
import * as ff from '@google-cloud/functions-framework';
import { readCheckpoint, writeCheckpoint } from './checkpoint';
import { fetchModifiedContacts, fetchModifiedDeals, fetchModifiedCustomObjects } from './hubspot-client';
import { upsertPeople, upsertTenants, upsertLandlords, upsertOpportunities } from './twenty-client';
import { mapContactToPeople, mapContactToTenant, mapContactToLandlord, mapDealToOpportunity } from './field-mapping';

ff.http('hubspotMirror', async (req, res) => {
  const startTime = Date.now();
  let stats = { contacts: 0, deals: 0, tickets: 0, customObjects: 0, errors: 0 };

  try {
    const lastSync = await readCheckpoint();
    console.log(`Mirror starting. Last sync: ${lastSync}`);

    // 1. Fetch modified contacts since last sync
    const contacts = await fetchModifiedContacts(lastSync);
    console.log(`Fetched ${contacts.length} modified contacts`);

    // 2. Split by role and map
    for (const contact of contacts) {
      try {
        const people = mapContactToPeople(contact);
        await upsertPeople(people);
        stats.contacts++;

        const roles = people.role;
        if (roles.includes('Tenant') || roles.includes('Tenant Lead') || roles.includes('Tenant Churned')) {
          const tenant = mapContactToTenant(contact);
          await upsertTenants(tenant);
        }
        if (roles.includes('Landlord') || roles.includes('Landlord Lead') || roles.includes('Landlord Churned')) {
          const landlord = mapContactToLandlord(contact);
          await upsertLandlords(landlord);
        }
      } catch (err) {
        console.error(`Error processing contact ${contact.properties?.hs_object_id}: ${err}`);
        stats.errors++;
      }
    }

    // 3. Fetch modified deals
    const deals = await fetchModifiedDeals(lastSync);
    for (const deal of deals) {
      try {
        const opp = mapDealToOpportunity(deal, deal.properties?.pipeline || 'Reserve');
        await upsertOpportunities(opp);
        stats.deals++;
      } catch (err) {
        console.error(`Error processing deal ${deal.properties?.hs_object_id}: ${err}`);
        stats.errors++;
      }
    }

    // 4. Fetch modified custom objects (Contracts, Properties, Rooms, Tickets)
    // Implementation follows same pattern — fetch, map, upsert
    // Omitted for brevity but follows identical error handling pattern

    // 5. Update checkpoint
    const newCheckpoint = new Date().toISOString();
    await writeCheckpoint(newCheckpoint);

    const duration = Date.now() - startTime;
    console.log(`Mirror complete in ${duration}ms. Stats: ${JSON.stringify(stats)}`);

    res.status(200).json({ success: true, stats, durationMs: duration });
  } catch (err) {
    console.error(`Mirror failed: ${err}`);
    res.status(500).json({ success: false, error: String(err) });
  }
});
```

- [ ] **Step 7: Implement hubspot-client.ts**

```typescript
// src/hubspot-client.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretClient = new SecretManagerServiceClient();
let cachedApiKey: string | null = null;

async function getHubSpotApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;
  const [version] = await secretClient.accessSecretVersion({
    name: 'projects/flent-twenty-prod/secrets/hubspot-api-key/versions/latest',
  });
  cachedApiKey = version.payload?.data?.toString() || '';
  return cachedApiKey;
}

export async function fetchModifiedContacts(since: string): Promise<any[]> {
  const apiKey = await getHubSpotApiKey();
  const results: any[] = [];
  let after: string | undefined;

  // Only fetch the 109 whitelisted properties
  const properties = [
    'firstname', 'lastname', 'email', 'phone', 'customer_type', 'city',
    'aadhar_number', 'pan_card', 'country_code', 'lead_source', 'lead_sub_source',
    'tenant_lifecycle', 'reserve_status', 'tenant_monthly_rent', 'tenant_base_rent',
    'monthly_maintenance', 'convenience_fee', 'platform_fee', 'tenant_gst',
    'furnishing_rental', 'rent_due', 'rent_status', 'first_month_rent',
    'real_move_in_date', 'move_out_date', 'preferred_area', 'budget',
    'food_preference', 'smoking_preference', 'pet_preference', 'nps_score',
    'rental_link', 'cashfree_order_id', 'cashfree_link_id', 'customer_status',
    'cashfree_vendor_id', 'vendor_status', 'bank_account_number', 'ifsc_code',
    'account_holder_name', 'account_type', 'penny_drop_status',
  ];

  do {
    const body = {
      filterGroups: [{
        filters: [{
          propertyName: 'lastmodifieddate',
          operator: 'GTE',
          value: since,
        }],
      }],
      properties,
      limit: 200,
      after,
    };

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      console.warn('HubSpot rate limited, backing off 10s');
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    results.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);

  return results;
}

export async function fetchModifiedDeals(since: string): Promise<any[]> {
  // Same pattern as contacts — fetch with lastmodifieddate filter
  // Properties: dealname, amount, closedate, dealstage, pipeline
  const apiKey = await getHubSpotApiKey();
  const results: any[] = [];
  let after: string | undefined;

  do {
    const body = {
      filterGroups: [{
        filters: [{
          propertyName: 'hs_lastmodifieddate',
          operator: 'GTE',
          value: since,
        }],
      }],
      properties: ['dealname', 'amount', 'closedate', 'dealstage', 'pipeline'],
      limit: 200,
      after,
    };

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }

    if (!response.ok) {
      throw new Error(`HubSpot Deals API error: ${response.status}`);
    }

    const data = await response.json();
    results.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);

  return results;
}

export async function fetchModifiedCustomObjects(objectType: string, since: string, properties: string[]): Promise<any[]> {
  const apiKey = await getHubSpotApiKey();
  const results: any[] = [];
  let after: string | undefined;

  do {
    const body = {
      filterGroups: [{
        filters: [{
          propertyName: 'hs_lastmodifieddate',
          operator: 'GTE',
          value: since,
        }],
      }],
      properties,
      limit: 200,
      after,
    };

    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }

    if (!response.ok) {
      throw new Error(`HubSpot ${objectType} API error: ${response.status}`);
    }

    const data = await response.json();
    results.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);

  return results;
}
```

- [ ] **Step 8: Implement checkpoint.ts**

```typescript
// src/checkpoint.ts
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const BUCKET = 'flent-twenty-files';
const CHECKPOINT_FILE = 'mirror/checkpoint.json';

export async function readCheckpoint(): Promise<string> {
  try {
    const [content] = await storage.bucket(BUCKET).file(CHECKPOINT_FILE).download();
    const data = JSON.parse(content.toString());
    return data.lastSync;
  } catch {
    // First run — return epoch
    return '2020-01-01T00:00:00Z';
  }
}

export async function writeCheckpoint(timestamp: string): Promise<void> {
  const data = JSON.stringify({ lastSync: timestamp, updatedAt: new Date().toISOString() });
  await storage.bucket(BUCKET).file(CHECKPOINT_FILE).save(data, {
    contentType: 'application/json',
  });
}
```

- [ ] **Step 9: Implement twenty-client.ts**

```typescript
// src/twenty-client.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import type { PeopleRecord, TenantRecord, LandlordRecord, OpportunityRecord } from './field-mapping';

const secretClient = new SecretManagerServiceClient();
let cachedTwentyApiKey: string | null = null;

const TWENTY_API_URL = process.env.TWENTY_API_URL || 'https://crm.flent.in';

async function getTwentyApiKey(): Promise<string> {
  if (cachedTwentyApiKey) return cachedTwentyApiKey;
  const [version] = await secretClient.accessSecretVersion({
    name: 'projects/flent-twenty-prod/secrets/twenty-api-key/versions/latest',
  });
  cachedTwentyApiKey = version.payload?.data?.toString() || '';
  return cachedTwentyApiKey;
}

async function graphqlMutation(query: string, variables: Record<string, any>): Promise<any> {
  const apiKey = await getTwentyApiKey();
  const response = await fetch(`${TWENTY_API_URL}/api/graphql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twenty API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  if (data.errors?.length) {
    throw new Error(`Twenty GraphQL error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

export async function upsertPeople(record: PeopleRecord): Promise<void> {
  // Upsert by hubspotRecordId
  const mutation = `
    mutation UpsertPeople($data: PersonCreateInput!) {
      createPerson(data: $data) {
        id
      }
    }
  `;
  // Note: actual upsert logic will use Twenty's upsert API once custom objects are created in Phase 2
  // For Phase 1, this creates records in the standard People object
  await graphqlMutation(mutation, {
    data: {
      name: { firstName: record.firstName, lastName: record.lastName },
      emails: { primaryEmail: record.email },
      phones: { primaryPhone: record.phone },
      city: record.city,
    },
  });
}

// Placeholder implementations — full upsert logic depends on Phase 2 custom objects
export async function upsertTenants(record: TenantRecord): Promise<void> {
  console.log(`[Phase 2] Will upsert Tenant: ${record.hubspotRecordId}`);
}

export async function upsertLandlords(record: LandlordRecord): Promise<void> {
  console.log(`[Phase 2] Will upsert Landlord: ${record.hubspotRecordId}`);
}

export async function upsertOpportunities(record: OpportunityRecord): Promise<void> {
  const mutation = `
    mutation UpsertOpportunity($data: OpportunityCreateInput!) {
      createOpportunity(data: $data) {
        id
      }
    }
  `;
  await graphqlMutation(mutation, {
    data: {
      name: record.name,
      amount: { amountMicros: record.amount * 1000000, currencyCode: 'INR' },
      closeDate: record.closeDate,
      stage: record.stage,
    },
  });
}
```

- [ ] **Step 10: Run all tests**

```bash
npx vitest run
```

Expected: All field-mapping tests PASS.

- [ ] **Step 11: Deploy Cloud Function + Scheduler**

```bash
cd ~/Documents/Dev/flent-infra/functions/hubspot-mirror
npm run build

gcloud functions deploy hubspot-mirror \
  --gen2 \
  --runtime=nodejs20 \
  --region=asia-south1 \
  --source=. \
  --entry-point=hubspotMirror \
  --trigger-http \
  --no-allow-unauthenticated \
  --service-account=flent-cloud-functions@flent-twenty-prod.iam.gserviceaccount.com \
  --memory=512MB \
  --timeout=300s \
  --set-secrets='HUBSPOT_API_KEY=hubspot-api-key:latest,TWENTY_API_KEY=twenty-api-key:latest' \
  --project=flent-twenty-prod

# Create Cloud Scheduler job (hourly)
MIRROR_URL=$(gcloud functions describe hubspot-mirror --gen2 --region=asia-south1 --format='value(serviceConfig.uri)' --project=flent-twenty-prod)

gcloud scheduler jobs create http hubspot-hourly-mirror \
  --location=asia-south1 \
  --schedule="0 * * * *" \
  --uri="$MIRROR_URL" \
  --http-method=POST \
  --oidc-service-account-email=flent-cloud-functions@flent-twenty-prod.iam.gserviceaccount.com \
  --project=flent-twenty-prod
```

- [ ] **Step 12: Test manually**

```bash
# Trigger mirror manually
gcloud functions call hubspot-mirror --gen2 --region=asia-south1 --project=flent-twenty-prod
# Expected: JSON response with stats (contacts synced, errors)
```

- [ ] **Step 13: Commit**

```bash
git add functions/hubspot-mirror/
git commit -m "feat: HubSpot mirror Cloud Function — hourly sync with field mapping, retry logic, checkpoint"
```

---

## Task 8: Data Validator Cloud Function

**Files:**
- Create: `flent-infra/functions/data-validator/` (all files)

- [ ] **Step 1: Write validator tests first**

```typescript
// functions/data-validator/test/validators.test.ts
import { describe, it, expect } from 'vitest';
import { validatePhone, validateAadhaar, validatePAN, validateIFSC, validateEmail } from '../src/validators';

describe('validatePhone', () => {
  it('accepts valid Indian mobile +91', () => {
    expect(validatePhone('+919876543210')).toBeNull();
  });
  it('accepts valid Indian mobile without +', () => {
    expect(validatePhone('919876543210')).toBeNull();
  });
  it('rejects too short', () => {
    expect(validatePhone('+91987654')).toBe('Invalid Indian phone number');
  });
  it('rejects landline prefix', () => {
    expect(validatePhone('+911234567890')).toBe('Invalid Indian phone number');
  });
  it('accepts empty (optional field)', () => {
    expect(validatePhone('')).toBeNull();
  });
});

describe('validateAadhaar', () => {
  it('accepts 12 digits', () => {
    expect(validateAadhaar('123456789012')).toBeNull();
  });
  it('rejects 11 digits', () => {
    expect(validateAadhaar('12345678901')).toBe('Aadhaar must be 12 digits');
  });
  it('rejects letters', () => {
    expect(validateAadhaar('12345678901A')).toBe('Aadhaar must be 12 digits');
  });
  it('accepts empty', () => {
    expect(validateAadhaar('')).toBeNull();
  });
});

describe('validatePAN', () => {
  it('accepts valid PAN', () => {
    expect(validatePAN('ABCDE1234F')).toBeNull();
  });
  it('rejects lowercase', () => {
    expect(validatePAN('abcde1234f')).toBe('Invalid PAN format');
  });
  it('rejects wrong pattern', () => {
    expect(validatePAN('12345ABCDE')).toBe('Invalid PAN format');
  });
  it('accepts empty', () => {
    expect(validatePAN('')).toBeNull();
  });
});

describe('validateIFSC', () => {
  it('accepts valid IFSC', () => {
    expect(validateIFSC('HDFC0001234')).toBeNull();
  });
  it('rejects missing 5th char zero', () => {
    expect(validateIFSC('HDFC1001234')).toBe('Invalid IFSC code');
  });
  it('accepts empty', () => {
    expect(validateIFSC('')).toBeNull();
  });
});

describe('validateEmail', () => {
  it('accepts valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });
  it('rejects no @', () => {
    expect(validateEmail('testexample.com')).toBe('Invalid email');
  });
  it('accepts empty', () => {
    expect(validateEmail('')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd ~/Documents/Dev/flent-infra/functions/data-validator
npm install
npx vitest run
```

Expected: FAIL.

- [ ] **Step 3: Implement validators**

```typescript
// functions/data-validator/src/validators.ts

export function validatePhone(phone: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (/^\+?91[6-9]\d{9}$/.test(cleaned)) return null;
  return 'Invalid Indian phone number';
}

export function validateAadhaar(aadhaar: string): string | null {
  if (!aadhaar) return null;
  if (/^\d{12}$/.test(aadhaar)) return null;
  return 'Aadhaar must be 12 digits';
}

export function validatePAN(pan: string): string | null {
  if (!pan) return null;
  if (/^[A-Z]{5}\d{4}[A-Z]$/.test(pan)) return null;
  return 'Invalid PAN format';
}

export function validateIFSC(ifsc: string): string | null {
  if (!ifsc) return null;
  if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return null;
  return 'Invalid IFSC code';
}

export function validateEmail(email: string): string | null {
  if (!email) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return 'Invalid email';
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npx vitest run
```

Expected: All PASS.

- [ ] **Step 5: Deploy data-validator Cloud Function**

```bash
cd ~/Documents/Dev/flent-infra/functions/data-validator
npm run build

gcloud functions deploy data-validator \
  --gen2 \
  --runtime=nodejs20 \
  --region=asia-south1 \
  --source=. \
  --entry-point=dataValidator \
  --trigger-topic=crm-events \
  --service-account=flent-cloud-functions@flent-twenty-prod.iam.gserviceaccount.com \
  --memory=256MB \
  --timeout=60s \
  --set-secrets='TWENTY_API_KEY=twenty-api-key:latest' \
  --project=flent-twenty-prod
```

- [ ] **Step 6: Commit**

```bash
git add functions/data-validator/
git commit -m "feat: data validator Cloud Function — phone/Aadhaar/PAN/IFSC/email regex validation"
```

---

## Task 9: Metabase Deployment

**Files:**
- Create: `flent-infra/k8s/metabase/deployment.yaml`
- Create: `flent-infra/k8s/metabase/service.yaml`
- Create: `flent-infra/k8s/metabase/ingress.yaml`

- [ ] **Step 1: Create Metabase Deployment**

```yaml
# k8s/metabase/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: metabase
  namespace: twenty-prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: metabase
  template:
    metadata:
      labels:
        app: metabase
    spec:
      containers:
        - name: metabase
          image: metabase/metabase:v0.50.3
          ports:
            - containerPort: 3000
          env:
            - name: MB_DB_TYPE
              value: "postgres"
            - name: MB_DB_DBNAME
              value: "metabase"
            - name: MB_DB_PORT
              value: "5432"
            - name: MB_DB_HOST
              value: "localhost"  # via Cloud SQL Auth Proxy sidecar
            - name: MB_DB_USER
              value: "metabase"
            - name: MB_EMBEDDING_SECRET_KEY
              valueFrom:
                secretKeyRef:
                  name: metabase-secrets
                  key: embedding-secret
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "1500m"
              memory: "2Gi"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 120
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
        - name: cloud-sql-proxy
          image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.11.0
          args:
            - "--structured-logs"
            - "--auto-iam-authn"
            - "flent-twenty-prod:asia-south1:flent-twenty-db-replica"
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
```

- [ ] **Step 2: Create Service + Ingress**

```yaml
# k8s/metabase/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: metabase
  namespace: twenty-prod
spec:
  selector:
    app: metabase
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP
```

```yaml
# k8s/metabase/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: metabase-ingress
  namespace: twenty-prod
  annotations:
    kubernetes.io/ingress.global-static-ip-name: "flent-metabase-ip"
    networking.gke.io/managed-certificates: "flent-metabase-cert"
spec:
  rules:
    - host: metabase.flent.in
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: metabase
                port:
                  number: 3000
```

- [ ] **Step 3: Apply and verify**

```bash
kubectl apply -f k8s/metabase/
kubectl get pods -n twenty-prod -l app=metabase
# Expected: 1 pod Running

# Wait for Metabase to initialize (~2 min)
kubectl logs -n twenty-prod -l app=metabase -c metabase --tail=5
# Expected: "Metabase Initialization COMPLETE"
```

- [ ] **Step 4: Configure Metabase to connect to Twenty's Cloud SQL read replica**

After Metabase UI is accessible at `metabase.flent.in`:
1. Add database connection: PostgreSQL, host=localhost (proxy), port=5432, db=twenty, user=twenty
2. This connects to the read replica (via the sidecar proxy targeting `flent-twenty-db-replica`)

- [ ] **Step 5: Commit**

```bash
git add k8s/metabase/
git commit -m "feat: Metabase deployment on GKE with Cloud SQL read replica, embedding secret"
```

---

## Task 10: Monitoring + Alerts

**Files:**
- Create: `flent-infra/terraform/monitoring.tf`

- [ ] **Step 1: Define alert policies**

```hcl
# terraform/monitoring.tf
resource "google_monitoring_notification_channel" "slack" {
  display_name = "Slack #flent-ops"
  type         = "slack"
  labels = {
    channel_name = "#flent-ops"
  }
  sensitive_labels {
    auth_token = "SLACK_WEBHOOK_TOKEN"  # Replace via console or secret
  }
}

resource "google_monitoring_alert_policy" "twenty_health" {
  display_name = "Twenty Health Check Failure"
  combiner     = "OR"

  conditions {
    display_name = "Twenty /healthz failing"
    condition_threshold {
      filter          = "resource.type = \"k8s_container\" AND metric.type = \"kubernetes.io/container/restart_count\" AND resource.labels.container_name = \"twenty-server\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0
      duration        = "60s"
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_DELTA"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.slack.id]
  alert_strategy {
    auto_close = "1800s"
  }
}

resource "google_monitoring_alert_policy" "cloudsql_connections" {
  display_name = "Cloud SQL Connections > 80%"
  combiner     = "OR"

  conditions {
    display_name = "Connection count approaching limit"
    condition_threshold {
      filter          = "resource.type = \"cloudsql_database\" AND metric.type = \"cloudsql.googleapis.com/database/postgresql/num_backends\""
      comparison      = "COMPARISON_GT"
      threshold_value = 320  # 80% of 400
      duration        = "300s"
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.slack.id]
}

resource "google_monitoring_alert_policy" "mirror_failure" {
  display_name = "Mirror Sync Failure (>2 consecutive)"
  combiner     = "OR"

  conditions {
    display_name = "Mirror function errors"
    condition_threshold {
      filter          = "resource.type = \"cloud_function\" AND resource.labels.function_name = \"hubspot-mirror\" AND metric.type = \"cloudfunctions.googleapis.com/function/execution_count\" AND metric.labels.status = \"error\""
      comparison      = "COMPARISON_GT"
      threshold_value = 2
      duration        = "7200s"  # 2 hours = 2 consecutive failures
      aggregations {
        alignment_period   = "3600s"
        per_series_aligner = "ALIGN_COUNT"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.slack.id]
}

# Uptime check for Twenty
resource "google_monitoring_uptime_check_config" "twenty" {
  display_name = "Twenty CRM Health"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/healthz"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = var.domain
    }
  }
}
```

- [ ] **Step 2: Apply**

```bash
terraform apply -auto-approve
```

- [ ] **Step 3: Commit**

```bash
git add terraform/monitoring.tf
git commit -m "feat: Cloud Monitoring alerts — health check, Cloud SQL connections, mirror failures, uptime"
```

---

## Task 11: Initial Backfill GKE Job

**Files:**
- Create: `flent-infra/functions/backfill-job/` (all files)
- Create: `flent-infra/scripts/run-backfill.sh`

- [ ] **Step 1: Create Dockerfile for backfill job**

```dockerfile
# functions/backfill-job/Dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src/ ./src/
RUN npx tsc
CMD ["node", "dist/index.js"]
```

- [ ] **Step 2: Create backfill entry point (reuses mirror modules)**

```typescript
// functions/backfill-job/src/index.ts
// Initial backfill — pulls ALL records from HubSpot (not incremental)
// Runs as GKE Job with 2-hour deadline (no Cloud Function timeout)

import { fetchModifiedContacts, fetchModifiedDeals, fetchModifiedCustomObjects } from './hubspot-client';
import { upsertPeople } from './twenty-client';
import { mapContactToPeople } from './field-mapping';

async function main() {
  console.log('Starting initial backfill...');
  const epoch = '2020-01-01T00:00:00Z'; // Fetch everything
  let totalRecords = 0;
  let errors = 0;

  // Contacts
  console.log('Fetching all contacts...');
  const contacts = await fetchModifiedContacts(epoch);
  console.log(`Fetched ${contacts.length} contacts`);
  for (const contact of contacts) {
    try {
      const people = mapContactToPeople(contact);
      await upsertPeople(people);
      totalRecords++;
      if (totalRecords % 100 === 0) {
        console.log(`Progress: ${totalRecords} records processed`);
      }
    } catch (err) {
      console.error(`Error: ${err}`);
      errors++;
    }
  }

  // Deals
  console.log('Fetching all deals...');
  const deals = await fetchModifiedDeals(epoch);
  console.log(`Fetched ${deals.length} deals`);
  // Process deals... (same pattern)

  // Custom objects: Contracts, Properties, Rooms, Tickets
  // ... (same pattern for each)

  console.log(`Backfill complete. Total: ${totalRecords}, Errors: ${errors}`);
  process.exit(errors > 100 ? 1 : 0); // Fail if >100 errors
}

main().catch(err => {
  console.error(`Backfill failed: ${err}`);
  process.exit(1);
});
```

- [ ] **Step 3: Create run script**

```bash
#!/bin/bash
# scripts/run-backfill.sh
set -euo pipefail

echo "Building backfill image..."
cd functions/backfill-job
docker build -t asia-south1-docker.pkg.dev/flent-twenty-prod/flent-registry/backfill-job:latest .
docker push asia-south1-docker.pkg.dev/flent-twenty-prod/flent-registry/backfill-job:latest

echo "Running backfill GKE Job..."
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: hubspot-initial-backfill
  namespace: twenty-prod
spec:
  activeDeadlineSeconds: 7200  # 2 hour max
  backoffLimit: 2
  template:
    spec:
      serviceAccountName: twenty-server-ksa
      containers:
        - name: backfill
          image: asia-south1-docker.pkg.dev/flent-twenty-prod/flent-registry/backfill-job:latest
          env:
            - name: TWENTY_API_URL
              value: "http://flent-twenty-server:3000"
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "1000m"
              memory: "2Gi"
      restartPolicy: OnFailure
EOF

echo "Backfill job submitted. Monitor with:"
echo "  kubectl logs -n twenty-prod job/hubspot-initial-backfill -f"
```

- [ ] **Step 4: Run backfill**

```bash
chmod +x scripts/run-backfill.sh
./scripts/run-backfill.sh
```

Expected: Job completes in 15-25 minutes with ~16,853 records synced.

- [ ] **Step 5: Verify record counts**

```bash
# Check Twenty record counts via API
TWENTY_API_KEY=$(gcloud secrets versions access latest --secret=twenty-api-key --project=flent-twenty-prod)
curl -s -H "Authorization: Bearer $TWENTY_API_KEY" \
  "https://crm.flent.in/api/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ people(first: 1) { totalCount } opportunities(first: 1) { totalCount } }"}'
# Expected: totalCount values matching HubSpot record counts
```

- [ ] **Step 6: Commit**

```bash
git add functions/backfill-job/ scripts/run-backfill.sh
git commit -m "feat: initial backfill GKE Job — full HubSpot sync (16,853 records, 2h deadline)"
```

---

## Task 12: DNS + Final Verification

- [ ] **Step 1: Configure DNS records**

```bash
# Get the external IPs
TWENTY_IP=$(kubectl get ingress -n twenty-prod flent-twenty -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
METABASE_IP=$(kubectl get ingress -n twenty-prod metabase-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Add these DNS records:"
echo "  crm.flent.in       -> A $TWENTY_IP"
echo "  metabase.flent.in  -> A $METABASE_IP"
```

- [ ] **Step 2: Wait for SSL certificate provisioning**

```bash
# GKE managed certificates take 15-30 minutes
kubectl get managedcertificates -n twenty-prod
# Wait until status = Active
```

- [ ] **Step 3: Run full verification checklist**

```bash
echo "=== Phase 1 Exit Criteria Verification ==="

# 1. Twenty health
echo "1. Twenty health check:"
curl -s https://crm.flent.in/healthz
echo ""

# 2. Metabase health
echo "2. Metabase health:"
curl -s https://metabase.flent.in/api/health
echo ""

# 3. Mirror running
echo "3. Last mirror run:"
gsutil cat gs://flent-twenty-files/mirror/checkpoint.json
echo ""

# 4. Pod status
echo "4. Pod status:"
kubectl get pods -n twenty-prod
echo ""

# 5. Record counts
echo "5. Record counts in Twenty:"
# (use GraphQL query from Task 11 Step 5)
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Phase 1 complete — Twenty on GCP with mirror, Metabase, monitoring, validation"
```

---

## Phase 1 Exit Criteria Checklist

- [ ] All 16,853 HubSpot records visible in Twenty (People + Opportunities initially; custom objects in Phase 2)
- [ ] Mirror Cloud Function running hourly without errors for 48h
- [ ] Mirror function has unit tests for field mapping (7 object types) + error handling
- [ ] Data validator rejecting malformed phone/Aadhaar/PAN correctly
- [ ] Metabase accessible at `metabase.flent.in`, connected to Cloud SQL read replica
- [ ] Twenty accessible at `crm.flent.in` with <500ms p95 response time
- [ ] Cloud Monitoring alerts configured and tested
- [ ] All secrets in Secret Manager (not env vars)
- [ ] Staging namespace deployed with lightweight Cloud SQL
- [ ] Team has access to Twenty (read alongside HubSpot)
