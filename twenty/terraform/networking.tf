# ---------------------------------------------------------------------------
# VPC
# ---------------------------------------------------------------------------
resource "google_compute_network" "vpc" {
  name                    = "flent-twenty-vpc"
  project                 = var.project_id
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"

  depends_on = [google_project_service.apis["compute.googleapis.com"]]
}

# ---------------------------------------------------------------------------
# Subnet with secondary ranges for GKE pods and services
# ---------------------------------------------------------------------------
resource "google_compute_subnetwork" "gke_subnet" {
  name                     = "flent-gke-subnet"
  project                  = var.project_id
  region                   = var.region
  network                  = google_compute_network.vpc.id
  ip_cidr_range            = "10.0.0.0/20"
  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "gke-pods"
    ip_cidr_range = "10.4.0.0/14"
  }

  secondary_ip_range {
    range_name    = "gke-services"
    ip_cidr_range = "10.8.0.0/20"
  }

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# ---------------------------------------------------------------------------
# Cloud Router + NAT for egress from private nodes
# ---------------------------------------------------------------------------
resource "google_compute_router" "router" {
  name    = "flent-twenty-router"
  project = var.project_id
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "flent-twenty-nat"
  project                            = var.project_id
  region                             = var.region
  router                             = google_compute_router.router.name
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# ---------------------------------------------------------------------------
# Private services access for Cloud SQL
# ---------------------------------------------------------------------------
resource "google_compute_global_address" "private_services_range" {
  name          = "flent-private-services"
  project       = var.project_id
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 20
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_services_range.name]

  depends_on = [google_project_service.apis["servicenetworking.googleapis.com"]]
}

# ---------------------------------------------------------------------------
# Firewall rules
# ---------------------------------------------------------------------------

# Allow GCP health check ranges (for load balancers and ingress)
resource "google_compute_firewall" "allow_health_checks" {
  name    = "flent-allow-health-checks"
  project = var.project_id
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080", "10256"]
  }

  source_ranges = [
    "35.191.0.0/16",   # GCP health check
    "130.211.0.0/22",  # GCP health check
  ]

  target_tags = ["gke-flent-twenty"]
}

# Allow internal traffic within the VPC
resource "google_compute_firewall" "allow_internal" {
  name    = "flent-allow-internal"
  project = var.project_id
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["443", "3000", "5432", "6378", "6432", "10250", "10256"]
  }

  allow {
    protocol = "udp"
    ports    = ["53"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [
    "10.0.0.0/20",  # Subnet
    "10.4.0.0/14",  # Pods
    "10.8.0.0/20",  # Services
  ]
}
