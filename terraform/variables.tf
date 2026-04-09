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
  description = "GCP zones for multi-zone deployment"
  type        = list(string)
  default     = ["asia-south1-a", "asia-south1-b"]
}

variable "twenty_version" {
  description = "Twenty CRM Docker image version"
  type        = string
  default     = "v1.20.11"
}

variable "domain" {
  description = "Domain name for CRM"
  type        = string
  default     = "crm.flent.in"
}

variable "notification_email" {
  description = "Email for monitoring alert notifications"
  type        = string
  default     = "atrishabh@flent.in"
}
