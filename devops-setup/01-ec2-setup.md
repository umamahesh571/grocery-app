# Step 1: EC2 Instance Setup

## 1.1 Create Jenkins Master Instance

### Launch EC2 Instance for Jenkins
```bash
# Instance specifications:
# - Instance Type: t3.medium (2 vCPU, 4GB RAM)
# - AMI: Ubuntu 22.04 LTS
# - Storage: 20GB GP3
# - Security Group: Allow ports 22, 8080, 443
```

### Security Group Configuration
```bash
# Create security group for Jenkins
aws ec2 create-security-group \
    --group-name jenkins-sg \
    --description "Security group for Jenkins server"

# Add inbound rules
aws ec2 authorize-security-group-ingress \
    --group-name jenkins-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name jenkins-sg \
    --protocol tcp \
    --port 8080 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name jenkins-sg \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

## 1.2 Create Kubernetes Cluster Instances

### Master Node
```bash
# Instance specifications:
# - Instance Type: t3.medium (2 vCPU, 4GB RAM)
# - AMI: Ubuntu 22.04 LTS
# - Storage: 20GB GP3
# - Security Group: k8s-master-sg
```

### Worker Nodes (3 instances)
```bash
# Instance specifications:
# - Instance Type: t3.small (2 vCPU, 2GB RAM)
# - AMI: Ubuntu 22.04 LTS
# - Storage: 20GB GP3
# - Security Group: k8s-worker-sg
```

### Kubernetes Security Groups
```bash
# Master node security group
aws ec2 create-security-group \
    --group-name k8s-master-sg \
    --description "Security group for Kubernetes master"

# Worker node security group
aws ec2 create-security-group \
    --group-name k8s-worker-sg \
    --description "Security group for Kubernetes workers"

# Master node rules
aws ec2 authorize-security-group-ingress --group-name k8s-master-sg --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name k8s-master-sg --protocol tcp --port 6443 --cidr 10.0.0.0/16
aws ec2 authorize-security-group-ingress --group-name k8s-master-sg --protocol tcp --port 2379-2380 --cidr 10.0.0.0/16
aws ec2 authorize-security-group-ingress --group-name k8s-master-sg --protocol tcp --port 10250 --cidr 10.0.0.0/16
aws ec2 authorize-security-group-ingress --group-name k8s-master-sg --protocol tcp --port 10259 --cidr 10.0.0.0/16
aws ec2 authorize-security-group-ingress --group-name k8s-master-sg --protocol tcp --port 10257 --cidr 10.0.0.0/16

# Worker node rules
aws ec2 authorize-security-group-ingress --group-name k8s-worker-sg --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name k8s-worker-sg --protocol tcp --port 10250 --cidr 10.0.0.0/16
aws ec2 authorize-security-group-ingress --group-name k8s-worker-sg --protocol tcp --port 30000-32767 --cidr 0.0.0.0/0
```

## 1.3 Launch Instances

### Using AWS CLI
```bash
# Launch Jenkins instance
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-groups jenkins-sg \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Jenkins-Master}]'

# Launch Kubernetes master
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-groups k8s-master-sg \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=K8s-Master}]'

# Launch Kubernetes workers
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 3 \
    --instance-type t3.small \
    --key-name your-key-pair \
    --security-groups k8s-worker-sg \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=K8s-Worker}]'
```

## 1.4 Connect to Instances

```bash
# Get instance IPs
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' --output table

# SSH to instances
ssh -i your-key.pem ubuntu@<instance-ip>
```