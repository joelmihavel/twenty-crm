# ---------------------------------------------------------------------------
# Service Accounts
# ---------------------------------------------------------------------------
resource "google_service_account" "twenty_server" {
  account_id   = "twenty-server"
  display_name = "Twenty CRM Server"
  description  = "Service account for Twenty CRM server workloads on GKE"
  project      = var.project_id
}

resource "google_service_account" "cloud_functions" {
  account_id   = "flent-cloud-functions"
  display_name = "Flent Cloud Functions"
  description  = "Service account for Cloud Functions (HubSpot mirror, data validator)"
  project      = var.project_id
}

resource "google_service_account" "backfill_job" {
  account_id   = "flent-backfill-job"
  display_name = "Flent Backfill Job"
  description  = "Service account for the HubSpot backfill batch job"
  project      = var.project_id
}

# ---------------------------------------------------------------------------
# IAM Bindings — twenty-server
# ---------------------------------------------------------------------------
resource "google_project_iam_member" "twenty_server_cloudsql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.twenty_server.email}"
}

# Scoped secret access — twenty-server only needs app-secret and db-password
resource "google_secret_manager_secret_iam_member" "twenty_server_app_secret" {
  secret_id = "twenty-app-secret"
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.twenty_server.email}"
}

resource "google_secret_manager_secret_iam_member" "twenty_server_db_password" {
  secret_id = "db-password"
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.twenty_server.email}"
}

# Scoped storage — bucket-level only
resource "google_storage_bucket_iam_member" "twenty_server_storage" {
  bucket = google_storage_bucket.twenty_files.name
  role   = "roles/storage.objectUser"
  member = "serviceAccount:${google_service_account.twenty_server.email}"
}

resource "google_project_iam_member" "twenty_server_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.twenty_server.email}"
}

# ---------------------------------------------------------------------------
# IAM Bindings — cloud-functions
# ---------------------------------------------------------------------------
resource "google_project_iam_member" "functions_cloudsql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# Scoped secret access — cloud functions need hubspot-api-key, twenty-api-key, resend-api-key
resource "google_secret_manager_secret_iam_member" "functions_hubspot_key" {
  secret_id = "hubspot-api-key"
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_functions.email}"
}

resource "google_secret_manager_secret_iam_member" "functions_twenty_key" {
  secret_id = "twenty-api-key"
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_functions.email}"
}

resource "google_secret_manager_secret_iam_member" "functions_resend_key" {
  secret_id = "resend-api-key"
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# Scoped storage — bucket-level only
resource "google_storage_bucket_iam_member" "functions_storage" {
  bucket = google_storage_bucket.twenty_files.name
  role   = "roles/storage.objectUser"
  member = "serviceAccount:${google_service_account.cloud_functions.email}"
}

resource "google_project_iam_member" "functions_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.cloud_functions.email}"
}

# ---------------------------------------------------------------------------
# IAM Bindings — backfill-job
# ---------------------------------------------------------------------------
resource "google_project_iam_member" "backfill_cloudsql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backfill_job.email}"
}

# Scoped secret access — backfill needs hubspot-api-key, twenty-api-key
resource "google_secret_manager_secret_iam_member" "backfill_hubspot_key" {
  secret_id = "hubspot-api-key"
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backfill_job.email}"
}

resource "google_secret_manager_secret_iam_member" "backfill_twenty_key" {
  secret_id = "twenty-api-key"
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backfill_job.email}"
}

resource "google_project_iam_member" "backfill_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.backfill_job.email}"
}

# ---------------------------------------------------------------------------
# Workload Identity bindings for GKE
# ---------------------------------------------------------------------------
resource "google_service_account_iam_member" "twenty_server_workload_identity" {
  service_account_id = google_service_account.twenty_server.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[twenty-prod/twenty-server]"

  depends_on = [google_container_cluster.primary]
}

resource "google_service_account_iam_member" "backfill_workload_identity" {
  service_account_id = google_service_account.backfill_job.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[twenty-prod/backfill-job]"

  depends_on = [google_container_cluster.primary]
}

# ---------------------------------------------------------------------------
# Pub/Sub needs permission to publish to DLQ topics
# ---------------------------------------------------------------------------
data "google_project" "current" {
  project_id = var.project_id
}

resource "google_project_iam_member" "pubsub_publisher_for_dlq" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:service-${data.google_project.current.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "pubsub_subscriber_for_dlq" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:service-${data.google_project.current.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}
