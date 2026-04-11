#!/bin/bash
# deploy-and-register.sh
#
# Copies the registration script and seed data into the Twenty server pod,
# then executes it. Requires kubectl access to the twenty-prod namespace.
#
# Usage:
#   ./deploy-and-register.sh [--dry-run]
#
# Prerequisites:
#   - kubectl configured with access to the twenty-prod namespace
#   - flent-seed-data.json generated (run extract-seed-data.js first)

set -euo pipefail

NAMESPACE="${NAMESPACE:-twenty-prod}"
DEPLOYMENT="${DEPLOYMENT:-twenty-server}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POD_DEST="/tmp/flent-register"
DRY_RUN_FLAG=""

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN_FLAG="DRY_RUN=1"
  echo "[DRY RUN] Will only show what would be created"
fi

# Verify seed data exists
if [[ ! -f "$SCRIPT_DIR/flent-seed-data.json" ]]; then
  echo "Error: flent-seed-data.json not found. Run extract-seed-data.js first."
  exit 1
fi

# Find the pod
echo "Finding pod in namespace $NAMESPACE..."
POD=$(kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)

if [[ -z "$POD" ]]; then
  # Try with deployment selector
  POD=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Running -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
fi

if [[ -z "$POD" ]]; then
  echo "Error: Could not find a running pod in namespace $NAMESPACE"
  echo "Try setting DEPLOYMENT env var to match your pod labels"
  exit 1
fi

echo "Using pod: $POD"

# Create directory in pod
echo "Preparing pod directory..."
kubectl exec -n "$NAMESPACE" "$POD" -- mkdir -p "$POD_DEST"

# Copy files
echo "Copying scripts to pod..."
kubectl cp "$SCRIPT_DIR/register-entities.js" "$NAMESPACE/$POD:$POD_DEST/register-entities.js"
kubectl cp "$SCRIPT_DIR/flent-seed-data.json" "$NAMESPACE/$POD:$POD_DEST/flent-seed-data.json"

# Execute
echo ""
echo "=== Executing registration script ==="
echo ""
kubectl exec -n "$NAMESPACE" "$POD" -- env \
  NODE_PATH=/app/node_modules \
  SEED_DATA_PATH="$POD_DEST/flent-seed-data.json" \
  SERVER_URL=http://localhost:3000 \
  $DRY_RUN_FLAG \
  node "$POD_DEST/register-entities.js"

echo ""
echo "=== Done ==="

# Cleanup
echo "Cleaning up pod files..."
kubectl exec -n "$NAMESPACE" "$POD" -- rm -rf "$POD_DEST"
echo "Cleanup complete."
