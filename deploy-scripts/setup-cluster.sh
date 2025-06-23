#!/bin/bash

# Grocery Delivery App - Kubernetes Cluster Setup Script

set -e

echo "🚀 Setting up Grocery Delivery App Kubernetes Cluster..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot access Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

print_status "Kubernetes cluster is accessible"

# Create namespace
print_status "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Deploy PostgreSQL
print_status "Deploying PostgreSQL database..."
kubectl apply -f k8s/postgres-deployment.yaml

# Deploy Redis
print_status "Deploying Redis cache..."
kubectl apply -f k8s/redis-deployment.yaml

# Wait for databases to be ready
print_status "Waiting for databases to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres-deployment -n grocery-app
kubectl wait --for=condition=available --timeout=300s deployment/redis-deployment -n grocery-app

# Deploy microservices
print_status "Deploying microservices..."
kubectl apply -f k8s/user-service-deployment.yaml
kubectl apply -f k8s/product-service-deployment.yaml
kubectl apply -f k8s/cart-service-deployment.yaml
kubectl apply -f k8s/order-service-deployment.yaml

# Deploy frontend
print_status "Deploying frontend application..."
kubectl apply -f k8s/frontend-deployment.yaml

# Wait for all deployments to be ready
print_status "Waiting for all services to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment --all -n grocery-app

# Deploy ingress and load balancer
print_status "Setting up ingress and load balancer..."
kubectl apply -f k8s/ingress.yaml

# Deploy HPA (Horizontal Pod Autoscaler)
print_status "Setting up auto-scaling..."
kubectl apply -f k8s/hpa.yaml

# Get deployment status
print_status "Deployment Status:"
kubectl get pods -n grocery-app -o wide
echo ""
kubectl get services -n grocery-app
echo ""
kubectl get ingress -n grocery-app

# Get load balancer info
print_status "Load Balancer Information:"
kubectl get service grocery-app-loadbalancer -n grocery-app

# Instructions for accessing the app
echo ""
print_status "🎉 Deployment Complete!"
echo ""
echo -e "${BLUE}To access your application:${NC}"
echo "1. Add the following to your /etc/hosts file:"
echo "   <EXTERNAL-IP> grocery-app.local"
echo ""
echo "2. Access the application at: http://grocery-app.local"
echo ""
echo -e "${BLUE}To monitor your deployment:${NC}"
echo "kubectl get pods -n grocery-app --watch"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo "kubectl logs -f deployment/frontend-deployment -n grocery-app"
echo ""
echo -e "${BLUE}To scale services:${NC}"
echo "kubectl scale deployment frontend-deployment --replicas=5 -n grocery-app"