# Step 7: Execute Complete Deployment

## 7.1 Prepare Your Code Repository

### Push Code to GitHub
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - Grocery delivery app with microservices"

# Add remote repository
git remote add origin https://github.com/your-username/grocery-delivery-app.git
git branch -M main
git push -u origin main
```

## 7.2 Update Kubernetes Manifests

### Update image references in deployment files
```bash
# Replace with your Docker Hub username
DOCKER_USERNAME="your-dockerhub-username"

# Update all deployment files
sed -i "s|grocery-app/frontend:latest|${DOCKER_USERNAME}/grocery-app-frontend:latest|g" k8s/frontend-deployment.yaml
sed -i "s|grocery-app/user-service:latest|${DOCKER_USERNAME}/grocery-app-user-service:latest|g" k8s/user-service-deployment.yaml
sed -i "s|grocery-app/product-service:latest|${DOCKER_USERNAME}/grocery-app-product-service:latest|g" k8s/product-service-deployment.yaml
sed -i "s|grocery-app/cart-service:latest|${DOCKER_USERNAME}/grocery-app-cart-service:latest|g" k8s/cart-service-deployment.yaml
sed -i "s|grocery-app/order-service:latest|${DOCKER_USERNAME}/grocery-app-order-service:latest|g" k8s/order-service-deployment.yaml
```

### Commit and push changes
```bash
git add .
git commit -m "Update Docker image references"
git push origin main
```

## 7.3 Execute Jenkins Pipeline

### Trigger Pipeline Build
1. Go to Jenkins Dashboard
2. Click on "grocery-app-pipeline"
3. Click "Build Now"

### Monitor Pipeline Execution
1. Click on the build number (e.g., #1)
2. Click "Console Output" to see logs
3. Monitor each stage execution

### Expected Pipeline Flow
1. ✅ Checkout - Clone repository
2. ✅ Build Frontend - npm install & build
3. ✅ Build Docker Images - Build all 5 images
4. ✅ Push Docker Images - Push to Docker Hub
5. ✅ Update K8s Manifests - Update image tags
6. ✅ Deploy to Kubernetes - Apply all manifests
7. ✅ Verify Deployment - Check pod status

## 7.4 Verify Deployment

### Check Kubernetes Cluster
```bash
# On master node, check deployment status
kubectl get pods -n grocery-app
kubectl get services -n grocery-app
kubectl get ingress -n grocery-app
kubectl get hpa -n grocery-app

# Check logs if any pod is not running
kubectl logs -f deployment/frontend-deployment -n grocery-app
kubectl logs -f deployment/user-service-deployment -n grocery-app
```

### Expected Output
```
NAME                                        READY   STATUS    RESTARTS   AGE
cart-service-deployment-xxx                 2/2     Running   0          5m
frontend-deployment-xxx                     3/3     Running   0          5m
order-service-deployment-xxx                2/2     Running   0          5m
postgres-deployment-xxx                     1/1     Running   0          6m
product-service-deployment-xxx              3/3     Running   0          5m
redis-deployment-xxx                        1/1     Running   0          6m
user-service-deployment-xxx                 2/2     Running   0          5m
```

## 7.5 Access the Application

### Get Load Balancer IP
```bash
kubectl get service grocery-app-loadbalancer -n grocery-app
```

### Configure Local Access
```bash
# Add to /etc/hosts (replace with actual external IP)
echo "<EXTERNAL-IP> grocery-app.local" | sudo tee -a /etc/hosts
```

### Test Application
```bash
# Test frontend
curl -H "Host: grocery-app.local" http://<EXTERNAL-IP>

# Test API endpoints
curl -H "Host: grocery-app.local" http://<EXTERNAL-IP>/api/users/health
curl -H "Host: grocery-app.local" http://<EXTERNAL-IP>/api/products/health
curl -H "Host: grocery-app.local" http://<EXTERNAL-IP>/api/cart/health
curl -H "Host: grocery-app.local" http://<EXTERNAL-IP>/api/orders/health
```

### Access Web Application
Open browser and go to: `http://grocery-app.local`

## 7.6 Monitor Application

### Check Application Metrics
```bash
# Check HPA status
kubectl get hpa -n grocery-app

# Check resource usage
kubectl top pods -n grocery-app
kubectl top nodes
```

### View Application Logs
```bash
# Frontend logs
kubectl logs -f deployment/frontend-deployment -n grocery-app

# Service logs
kubectl logs -f deployment/user-service-deployment -n grocery-app
kubectl logs -f deployment/product-service-deployment -n grocery-app
```

## 7.7 Test Auto-scaling

### Generate Load (Optional)
```bash
# Install Apache Bench for load testing
sudo apt install apache2-utils -y

# Generate load on frontend
ab -n 1000 -c 10 http://grocery-app.local/

# Check if HPA scales up
kubectl get hpa -n grocery-app --watch
```

## 7.8 Troubleshooting Common Issues

### If Pods are Not Starting
```bash
# Check pod events
kubectl describe pod <pod-name> -n grocery-app

# Check node resources
kubectl describe nodes

# Check if images are pulled correctly
kubectl get events -n grocery-app --sort-by='.lastTimestamp'
```

### If Services are Not Accessible
```bash
# Check service endpoints
kubectl get endpoints -n grocery-app

# Test service connectivity
kubectl run test-pod --image=busybox -it --rm -- /bin/sh
# Inside the pod:
# wget -qO- http://frontend-service.grocery-app.svc.cluster.local
```

### If Ingress is Not Working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress configuration
kubectl describe ingress grocery-app-ingress -n grocery-app
```

## 7.9 Production Considerations

### SSL/TLS Setup
```bash
# Install cert-manager for automatic SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Configure Let's Encrypt issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@domain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Backup Strategy
```bash
# Backup etcd (on master node)
sudo ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

# Backup persistent volumes
kubectl get pv
```

### Monitoring Setup
```bash
# Deploy Prometheus and Grafana
kubectl apply -f monitoring/prometheus-config.yaml

# Access Grafana (port-forward)
kubectl port-forward service/grafana 3000:3000 -n monitoring
```

🎉 **Congratulations!** Your grocery delivery app is now deployed with a complete DevOps pipeline using Jenkins CI/CD and Kubernetes!