# Step 3: Kubernetes Cluster Setup

## 3.1 Prepare All Nodes (Master + Workers)

### Run on ALL nodes (Master + 3 Workers)

```bash
# Connect to each instance
ssh -i your-key.pem ubuntu@<instance-ip>

# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install docker-ce -y

# Configure Docker daemon
sudo mkdir -p /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl enable docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# Install kubeadm, kubelet, kubectl
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF

sudo apt update
sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# Disable swap
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# Configure kernel modules
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF

sudo sysctl --system
```

## 3.2 Initialize Master Node

### On Master Node Only
```bash
# Get master node private IP
MASTER_IP=$(hostname -I | awk '{print $1}')

# Initialize cluster
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=$MASTER_IP

# Configure kubectl for ubuntu user
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install Flannel CNI
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# Get join command for worker nodes
kubeadm token create --print-join-command
```

### Save the join command output - you'll need it for worker nodes!

## 3.3 Join Worker Nodes

### On Each Worker Node
```bash
# Use the join command from master node output
sudo kubeadm join <master-ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

## 3.4 Verify Cluster

### On Master Node
```bash
# Check nodes
kubectl get nodes

# Check system pods
kubectl get pods -n kube-system

# Check cluster info
kubectl cluster-info
```

Expected output should show all 4 nodes (1 master + 3 workers) in Ready state.

## 3.5 Install Ingress Controller

### Install NGINX Ingress Controller
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

## 3.6 Install Metrics Server (for HPA)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch metrics server for self-signed certificates (development only)
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Verify metrics server
kubectl get pods -n kube-system | grep metrics-server
```

## 3.7 Configure kubectl on Jenkins Server

### Copy kubeconfig from Master to Jenkins
```bash
# On master node, copy the config
cat ~/.kube/config

# On Jenkins server, create kubeconfig
sudo mkdir -p /var/lib/jenkins/.kube
sudo nano /var/lib/jenkins/.kube/config
# Paste the config content here

# Set ownership
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube

# Test kubectl access from Jenkins server
sudo -u jenkins kubectl get nodes
```

## 3.8 Create Jenkins Service Account in Kubernetes

```bash
# On master node, create service account for Jenkins
kubectl create namespace jenkins

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: jenkins
  namespace: jenkins
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: jenkins
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: jenkins
  namespace: jenkins
EOF

# Get service account token
kubectl create token jenkins -n jenkins --duration=8760h
```

### Add Kubernetes Credentials to Jenkins
1. Go to Jenkins → Manage Jenkins → Manage Credentials
2. Add Credential:
   - Kind: Secret text
   - ID: kubernetes-token
   - Secret: <paste-the-token-here>