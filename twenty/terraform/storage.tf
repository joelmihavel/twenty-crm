# ---------------------------------------------------------------------------
# GCS Bucket — Twenty CRM file storage
# ---------------------------------------------------------------------------
resource "google_storage_bucket" "twenty_files" {
  name          = "flent-twenty-files"
  project       = var.project_id
  location      = var.region
  storage_class = "STANDARD"
  force_destroy = false

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

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

  lifecycle_rule {
    condition {
      age = 365
      with_state = "ARCHIVED"
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["https://${var.domain}"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["Content-Type", "Content-Disposition"]
    max_age_seconds = 3600
  }

  labels = {
    environment = "production"
    managed-by  = "terraform"
    app         = "twenty-crm"
  }

  depends_on = [google_project_service.apis["storage.googleapis.com"]]
}

# ---------------------------------------------------------------------------
# HMAC key for S3-compatible access from Twenty
# ---------------------------------------------------------------------------
resource "google_storage_hmac_key" "twenty_hmac" {
  project               = var.project_id
  service_account_email = google_service_account.twenty_server.email
}
