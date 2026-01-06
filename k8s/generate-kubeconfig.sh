#!/bin/bash
set -e

NAMESPACE="danklinux"
SERVICE_ACCOUNT="dlx-docs-deployer"
OUTPUT_FILE="${1:-dlx-docs-kubeconfig.yaml}"

# Check if RBAC resources exist
if ! kubectl get serviceaccount "$SERVICE_ACCOUNT" -n "$NAMESPACE" &>/dev/null; then
    echo "ServiceAccount not found. Creating RBAC resources..."
    kubectl apply -f "$(dirname "$0")/rbac.yaml"
fi

# Get cluster info from current config
CLUSTER_NAME=$(kubectl config view --minify -o jsonpath='{.clusters[0].name}')
CLUSTER_SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
CLUSTER_CA=$(kubectl config view --minify --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')

# Create a long-lived token (1 year)
echo "Creating token..."
TOKEN=$(kubectl create token "$SERVICE_ACCOUNT" -n "$NAMESPACE" --duration=8760h)

# Generate kubeconfig
cat > "$OUTPUT_FILE" <<EOF
apiVersion: v1
kind: Config
clusters:
- name: ${CLUSTER_NAME}
  cluster:
    certificate-authority-data: ${CLUSTER_CA}
    server: ${CLUSTER_SERVER}
contexts:
- name: ${SERVICE_ACCOUNT}
  context:
    cluster: ${CLUSTER_NAME}
    namespace: ${NAMESPACE}
    user: ${SERVICE_ACCOUNT}
current-context: ${SERVICE_ACCOUNT}
users:
- name: ${SERVICE_ACCOUNT}
  user:
    token: ${TOKEN}
EOF

echo "Kubeconfig written to: $OUTPUT_FILE"
