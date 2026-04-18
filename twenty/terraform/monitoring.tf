# ---------------------------------------------------------------------------
# Notification channel — email
# ---------------------------------------------------------------------------
resource "google_monitoring_notification_channel" "email" {
  display_name = "Flent Ops Email"
  type         = "email"
  project      = var.project_id

  labels = {
    email_address = var.notification_email
  }
}

# ---------------------------------------------------------------------------
# Uptime check — Twenty CRM /healthz
# ---------------------------------------------------------------------------
resource "google_monitoring_uptime_check_config" "twenty_healthz" {
  display_name = "Twenty CRM Healthz"
  project      = var.project_id
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

# ---------------------------------------------------------------------------
# Alert — Uptime check failure
# ---------------------------------------------------------------------------
resource "google_monitoring_alert_policy" "uptime_alert" {
  display_name = "Twenty CRM Down"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Uptime check failure"
    condition_threshold {
      filter          = "resource.type = \"uptime_url\" AND metric.type = \"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id = \"${google_monitoring_uptime_check_config.twenty_healthz.uptime_check_id}\""
      comparison      = "COMPARISON_GT"
      threshold_value = 1
      duration        = "300s"

      aggregations {
        alignment_period     = "1200s"
        per_series_aligner   = "ALIGN_NEXT_OLDER"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields      = ["resource.label.*"]
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

# ---------------------------------------------------------------------------
# Alert — Cloud SQL connections approaching max (> 320 of 400 = 80%)
# ---------------------------------------------------------------------------
resource "google_monitoring_alert_policy" "cloudsql_connections" {
  display_name = "Cloud SQL Connections > 80%"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Active connections > 320"
    condition_threshold {
      filter          = "resource.type = \"cloudsql_database\" AND metric.type = \"cloudsql.googleapis.com/database/postgresql/num_backends\" AND resource.labels.database_id = \"${var.project_id}:flent-twenty-db\""
      comparison      = "COMPARISON_GT"
      threshold_value = 320
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  documentation {
    content   = "Cloud SQL instance flent-twenty-db has exceeded 80% connection utilization (320/400). Consider scaling up or reviewing connection pooling configuration."
    mime_type = "text/markdown"
  }

  alert_strategy {
    auto_close = "3600s"
  }
}

# ---------------------------------------------------------------------------
# Alert — Mirror function consecutive errors
# ---------------------------------------------------------------------------
resource "google_monitoring_alert_policy" "mirror_function_errors" {
  display_name = "Mirror Function Consecutive Errors"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Mirror function error rate"
    condition_threshold {
      filter          = "resource.type = \"cloud_function\" AND resource.labels.function_name = \"hubspot-mirror\" AND metric.type = \"cloudfunctions.googleapis.com/function/execution_count\" AND metric.labels.status != \"ok\""
      comparison      = "COMPARISON_GT"
      threshold_value = 5
      duration        = "300s"

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_SUM"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  documentation {
    content   = "The hubspot-mirror Cloud Function has had more than 5 errors in the last 5 minutes. Check the function logs for details."
    mime_type = "text/markdown"
  }

  alert_strategy {
    auto_close = "3600s"
  }
}
