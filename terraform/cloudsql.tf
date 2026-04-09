# ---------------------------------------------------------------------------
# Random password for the "twenty" database user
# ---------------------------------------------------------------------------
resource "random_password" "db_password" {
  length  = 32
  special = true
  # Avoid characters that cause shell escaping issues
  override_special = "!#$%&*()-_=+[]{}|:,.<>?"
}

resource "random_password" "db_password_staging" {
  length  = 24
  special = true
  override_special = "!#$%&*()-_=+[]{}|:,.<>?"
}

# ---------------------------------------------------------------------------
# Cloud SQL — Primary (Production)
# ---------------------------------------------------------------------------
resource "google_sql_database_instance" "primary" {
  name                = "flent-twenty-db"
  project             = var.project_id
  region              = var.region
  database_version    = "POSTGRES_16"
  deletion_protection = true

  settings {
    tier              = "db-custom-8-32768"
    availability_type = "REGIONAL"
    disk_size         = 200
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc.id
      enable_private_path_for_google_cloud_services = true
      require_ssl                                   = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"  # 7:30 AM IST
      location                       = var.region
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7

      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    maintenance_window {
      day          = 7  # Sunday
      hour         = 22 # 3:30 AM IST
      update_track = "stable"
    }

    database_flags {
      name  = "max_connections"
      value = "400"
    }

    database_flags {
      name  = "shared_buffers"
      value = "1048576"  # 8GB in 8KB pages (8 * 1024 * 1024 / 8 = 1048576)
    }

    database_flags {
      name  = "effective_cache_size"
      value = "2936012"  # ~22.4GB — max allowed for db-custom-8-32768 (8KB pages)
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

    # Audit logging
    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }
    database_flags {
      name  = "log_connections"
      value = "on"
    }
    database_flags {
      name  = "log_disconnections"
      value = "on"
    }
    database_flags {
      name  = "log_lock_waits"
      value = "on"
    }
    insights_config {
      query_insights_enabled  = true
      query_plans_per_minute  = 5
      query_string_length     = 4096
      record_application_tags = true
      record_client_address   = true
    }

    user_labels = {
      environment = "production"
      managed-by  = "terraform"
      app         = "twenty-crm"
    }
  }

  depends_on = [
    google_service_networking_connection.private_vpc_connection,
    google_project_service.apis["sqladmin.googleapis.com"],
  ]
}

# ---------------------------------------------------------------------------
# Cloud SQL — Read Replica (for Metabase analytics)
# ---------------------------------------------------------------------------
resource "google_sql_database_instance" "read_replica" {
  name                 = "flent-twenty-db-replica"
  project              = var.project_id
  region               = var.region
  database_version     = "POSTGRES_16"
  master_instance_name = google_sql_database_instance.primary.name
  deletion_protection  = false

  replica_configuration {
    failover_target = false
  }

  settings {
    tier            = "db-custom-2-8192"
    disk_size       = 200
    disk_type       = "PD_SSD"
    disk_autoresize = true

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc.id
      enable_private_path_for_google_cloud_services = true
      require_ssl                                   = true
    }

    # Replica must match primary's max_connections (400).
    # Cloud SQL does not allow a replica to have a lower value.
    database_flags {
      name  = "max_connections"
      value = "400"
    }

    database_flags {
      name  = "max_parallel_workers_per_gather"
      value = "4"
    }

    insights_config {
      query_insights_enabled  = true
      query_plans_per_minute  = 5
      query_string_length     = 4096
      record_application_tags = true
      record_client_address   = true
    }

    user_labels = {
      environment = "production"
      managed-by  = "terraform"
      app         = "metabase-analytics"
      role        = "read-replica"
    }
  }

  depends_on = [google_sql_database_instance.primary]
}

# ---------------------------------------------------------------------------
# Cloud SQL — Staging
# ---------------------------------------------------------------------------
resource "google_sql_database_instance" "staging" {
  name                = "flent-twenty-staging"
  project             = var.project_id
  region              = var.region
  database_version    = "POSTGRES_16"
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    disk_size         = 10
    disk_type         = "PD_HDD"
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc.id
      enable_private_path_for_google_cloud_services = true
      require_ssl                                   = true
    }

    backup_configuration {
      enabled = false
    }

    database_flags {
      name  = "max_connections"
      value = "50"
    }

    user_labels = {
      environment = "staging"
      managed-by  = "terraform"
      app         = "twenty-crm"
    }
  }

  depends_on = [
    google_service_networking_connection.private_vpc_connection,
    google_project_service.apis["sqladmin.googleapis.com"],
  ]
}

# ---------------------------------------------------------------------------
# Databases
# ---------------------------------------------------------------------------
resource "google_sql_database" "twenty_prod" {
  name     = "twenty"
  project  = var.project_id
  instance = google_sql_database_instance.primary.name
}

resource "google_sql_database" "twenty_staging" {
  name     = "twenty"
  project  = var.project_id
  instance = google_sql_database_instance.staging.name
}

# ---------------------------------------------------------------------------
# Database users
# ---------------------------------------------------------------------------
resource "google_sql_user" "twenty_prod" {
  name     = "twenty"
  project  = var.project_id
  instance = google_sql_database_instance.primary.name
  password = random_password.db_password.result
}

resource "google_sql_user" "twenty_staging" {
  name     = "twenty"
  project  = var.project_id
  instance = google_sql_database_instance.staging.name
  password = random_password.db_password_staging.result
}
