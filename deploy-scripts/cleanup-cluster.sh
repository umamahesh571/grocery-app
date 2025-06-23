#!/bin/bash

# Grocery Delivery App - Kubernetes Cluster Cleanup Script

set -e

echo "🧹 Cleaning up Grocery Delivery App Kubernetes resources..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Confirm deletion
read -p "Are you sure you want to delete all grocery-app resources? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Cleanup cancelled"
    exit 1
fi

# Delete HPA
print_status "Removing auto-scaling policies..."
kubectl delete -f k8s/hpa.yaml --ignore-not-found=true

# Delete ingress
print_status "Removing ingress and load balancer..."
kubectl delete -f k8s/ingress.yaml --ignore-not-found=true

# Delete application deployments
print_status "Removing application deployments..."
kubectl delete -f k8s/frontend-deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/user-service-deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/product-service-deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/cart-service-deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/order-service-deployment.yaml --ignore-not-found=true

# Delete databases
print_status "Removing databases..."
kubectl delete -f k8s/postgres-deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/redis-deployment.yaml --ignore-not-found=true

# Delete namespace (this will delete everything in it)
print_status "Removing namespace..."
kubectl delete namespace grocery-app --ignore-not-found=true

print_status "🎉 Cleanup complete!"
echo ""
print_warning "Note: Persistent volumes may still exist. Run the following to remove them:"
echo "kubectl get pv | grep grocery-app"
echo "kubectl delete pv <pv-name>"