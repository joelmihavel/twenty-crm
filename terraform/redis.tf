# ---------------------------------------------------------------------------
# Memorystore for Redis — Standard HA
# ---------------------------------------------------------------------------
resource "google_redis_instance" "twenty" {
  name               = "flent-twenty-redis"
  project            = var.project_id
  region             = var.region
  tier               = "STANDARD_HA"
  memory_size_gb     = 5
  redis_version      = "REDIS_7_0"
  display_name       = "Twenty CRM Redis"
  authorized_network = google_compute_network.vpc.id

  redis_configs = {
    maxmemory-policy = "noeviction"
  }

  transit_encryption_mode = "SERVER_AUTHENTICATION"

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 22
        minutes = 0
        seconds = 0
        nanos   = 0
      }
    }
  }

  labels = {
    environment = "production"
    managed-by  = "terraform"
    app         = "twenty-crm"
  }

  depends_on = [
    google_project_service.apis["redis.googleapis.com"],
    google_compute_network.vpc,
  ]
}
