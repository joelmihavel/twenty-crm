# ---------------------------------------------------------------------------
# Secret Manager — application secrets
# ---------------------------------------------------------------------------
locals {
  secrets = toset([
    "hubspot-api-key",
    "zoho-sign-api-key",
    "cashfree-client-id",
    "cashfree-client-secret",
    "resend-api-key",
    "twenty-api-key",
    "twenty-app-secret",
    "metabase-embedding-secret",
  ])
}

resource "google_secret_manager_secret" "app_secrets" {
  for_each  = local.secrets
  secret_id = each.value
  project   = var.project_id

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  labels = {
    environment = "production"
    managed-by  = "terraform"
    app         = "twenty-crm"
  }

  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}

# ---------------------------------------------------------------------------
# Store database passwords in Secret Manager
# ---------------------------------------------------------------------------
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"
  project   = var.project_id

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  labels = {
    environment = "production"
    managed-by  = "terraform"
    app         = "twenty-crm"
    type        = "database"
  }

  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

resource "google_secret_manager_secret" "db_password_staging" {
  secret_id = "db-password-staging"
  project   = var.project_id

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  labels = {
    environment = "staging"
    managed-by  = "terraform"
    app         = "twenty-crm"
    type        = "database"
  }

  depends_on = [google_project_service.apis["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret_version" "db_password_staging" {
  secret      = google_secret_manager_secret.db_password_staging.id
  secret_data = random_password.db_password_staging.result
}
