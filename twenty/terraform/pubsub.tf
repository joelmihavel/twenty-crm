# ---------------------------------------------------------------------------
# Pub/Sub Topics
# ---------------------------------------------------------------------------
locals {
  pubsub_topics = toset(["crm-events", "agreement-events", "mirror-events"])
}

# Main topics
resource "google_pubsub_topic" "main" {
  for_each = local.pubsub_topics

  name    = each.value
  project = var.project_id

  message_retention_duration = "604800s"  # 7 days

  labels = {
    environment = "production"
    managed-by  = "terraform"
    app         = "twenty-crm"
  }

  depends_on = [google_project_service.apis["pubsub.googleapis.com"]]
}

# Dead letter topics
resource "google_pubsub_topic" "dlq" {
  for_each = local.pubsub_topics

  name    = "${each.value}-dlq"
  project = var.project_id

  message_retention_duration = "1209600s"  # 14 days

  labels = {
    environment = "production"
    managed-by  = "terraform"
    app         = "twenty-crm"
    type        = "dead-letter"
  }

  depends_on = [google_project_service.apis["pubsub.googleapis.com"]]
}

# Subscriptions with dead letter policy
resource "google_pubsub_subscription" "main" {
  for_each = local.pubsub_topics

  name    = "${each.value}-sub"
  project = var.project_id
  topic   = google_pubsub_topic.main[each.value].id

  ack_deadline_seconds       = 60
  message_retention_duration = "604800s"  # 7 days

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dlq[each.value].id
    max_delivery_attempts = 5
  }

  expiration_policy {
    ttl = ""  # Never expire
  }

  labels = {
    environment = "production"
    managed-by  = "terraform"
    app         = "twenty-crm"
  }
}

# DLQ subscriptions (for monitoring / reprocessing)
resource "google_pubsub_subscription" "dlq" {
  for_each = local.pubsub_topics

  name    = "${each.value}-dlq-sub"
  project = var.project_id
  topic   = google_pubsub_topic.dlq[each.value].id

  ack_deadline_seconds       = 60
  message_retention_duration = "1209600s"  # 14 days

  expiration_policy {
    ttl = ""  # Never expire
  }

  labels = {
    environment = "production"
    managed-by  = "terraform"
    app         = "twenty-crm"
    type        = "dead-letter"
  }
}
