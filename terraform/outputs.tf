# ---------------------------------------------------------------------------
# Cloud SQL
# ---------------------------------------------------------------------------
output "cloudsql_primary_ip" {
  description = "Cloud SQL primary instance private IP"
  value       = google_sql_database_instance.primary.private_ip_address
}

output "cloudsql_replica_ip" {
  description = "Cloud SQL read replica private IP"
  value       = google_sql_database_instance.read_replica.private_ip_address
}

output "cloudsql_staging_ip" {
  description = "Cloud SQL staging instance private IP"
  value       = google_sql_database_instance.staging.private_ip_address
}

output "cloudsql_connection_name" {
  description = "Cloud SQL primary connection name (project:region:instance)"
  value       = google_sql_database_instance.primary.connection_name
}

output "cloudsql_replica_connection_name" {
  description = "Cloud SQL read replica connection name"
  value       = google_sql_database_instance.read_replica.connection_name
}

# ---------------------------------------------------------------------------
# Redis
# ---------------------------------------------------------------------------
output "redis_host" {
  description = "Memorystore Redis host IP"
  value       = google_redis_instance.twenty.host
}

output "redis_port" {
  description = "Memorystore Redis port"
  value       = google_redis_instance.twenty.port
}

output "redis_auth_string" {
  description = "Redis AUTH string (for transit encryption)"
  value       = google_redis_instance.twenty.auth_string
  sensitive   = true
}

# ---------------------------------------------------------------------------
# GCS / HMAC
# ---------------------------------------------------------------------------
output "gcs_bucket_name" {
  description = "GCS bucket name for Twenty file storage"
  value       = google_storage_bucket.twenty_files.name
}

output "hmac_access_id" {
  description = "HMAC access key ID for S3-compatible GCS access"
  value       = google_storage_hmac_key.twenty_hmac.access_id
}

output "hmac_secret" {
  description = "HMAC secret key for S3-compatible GCS access"
  value       = google_storage_hmac_key.twenty_hmac.secret
  sensitive   = true
}

# ---------------------------------------------------------------------------
# GKE
# ---------------------------------------------------------------------------
output "gke_cluster_name" {
  description = "GKE cluster name"
  value       = google_container_cluster.primary.name
}

output "gke_cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "gke_cluster_ca_certificate" {
  description = "GKE cluster CA certificate (base64)"
  value       = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

# ---------------------------------------------------------------------------
# VPC
# ---------------------------------------------------------------------------
output "vpc_id" {
  description = "VPC network ID"
  value       = google_compute_network.vpc.id
}

output "subnet_id" {
  description = "GKE subnet ID"
  value       = google_compute_subnetwork.gke_subnet.id
}

# ---------------------------------------------------------------------------
# Service Accounts
# ---------------------------------------------------------------------------
output "twenty_server_sa_email" {
  description = "Twenty server service account email"
  value       = google_service_account.twenty_server.email
}

output "cloud_functions_sa_email" {
  description = "Cloud Functions service account email"
  value       = google_service_account.cloud_functions.email
}

output "backfill_job_sa_email" {
  description = "Backfill job service account email"
  value       = google_service_account.backfill_job.email
}

# ---------------------------------------------------------------------------
# Database passwords (sensitive)
# ---------------------------------------------------------------------------
output "db_password_prod" {
  description = "Production database password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "db_password_staging" {
  description = "Staging database password"
  value       = random_password.db_password_staging.result
  sensitive   = true
}
