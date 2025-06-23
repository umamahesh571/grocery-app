# Step 4: Docker Registry Setup

## 4.1 Option A: Use Docker Hub (Recommended for simplicity)

### Create Docker Hub Account
1. Go to https://hub.docker.com
2. Create account if you don't have one
3. Create repository: `grocery-app`

### Configure Jenkins with Docker Hub
Already done in Jenkins setup - credentials are configured.

## 4.2 Option B: Private Docker Registry (Optional)

### Install Private Registry on Jenkins Server
```bash
# On Jenkins server
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# Configure Docker to use insecure registry
sudo nano /etc/docker/daemon.json
```

Add to daemon.json:
```json
{
  "insecure-registries": ["<jenkins-server-ip>:5000"]
}
```

```bash
sudo systemctl restart docker
```

## 4.3 Test Docker Registry Access

### From Jenkins Server
```bash
# Test Docker Hub login
docker login

# Or test private registry
docker tag hello-world <jenkins-server-ip>:5000/hello-world
docker push <jenkins-server-ip>:5000/hello-world
```

## 4.4 Configure Registry in Kubernetes

### Create Docker Registry Secret
```bash
# On master node
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=<your-dockerhub-username> \
  --docker-password=<your-dockerhub-password> \
  --docker-email=<your-email> \
  -n grocery-app
```

### Update Deployment Files
The Kubernetes deployment files need to reference your actual registry:

```bash
# Update image references in deployment files
sed -i 's|grocery-app/|<your-dockerhub-username>/grocery-app-|g' k8s/*.yaml
```