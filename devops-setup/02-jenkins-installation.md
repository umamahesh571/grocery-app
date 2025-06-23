# Step 2: Jenkins Installation and Configuration

## 2.1 Install Jenkins on Ubuntu

### Connect to Jenkins Instance
```bash
ssh -i your-key.pem ubuntu@<jenkins-instance-ip>
```

### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Java
```bash
sudo apt install openjdk-11-jdk -y
java -version
```

### Install Jenkins
```bash
# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package index
sudo apt update

# Install Jenkins
sudo apt install jenkins -y

# Start and enable Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo systemctl status jenkins
```

### Configure Firewall
```bash
sudo ufw allow 8080
sudo ufw allow OpenSSH
sudo ufw enable
```

## 2.2 Initial Jenkins Setup

### Get Initial Admin Password
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Access Jenkins Web Interface
```
http://<jenkins-instance-ip>:8080
```

### Install Suggested Plugins
- Select "Install suggested plugins"
- Wait for installation to complete

### Create Admin User
- Username: admin
- Password: your-secure-password
- Full name: Jenkins Admin
- Email: your-email@domain.com

## 2.3 Install Additional Tools on Jenkins Server

### Install Docker
```bash
# Install Docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install docker-ce -y

# Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Install kubectl
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

### Install Node.js and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
node --version
npm --version
```

### Install Git
```bash
sudo apt install git -y
git --version
```

## 2.4 Configure Jenkins Plugins

### Install Required Plugins
Go to Jenkins Dashboard → Manage Jenkins → Manage Plugins → Available

Install these plugins:
- Docker Pipeline
- Kubernetes CLI
- Pipeline: Stage View
- Blue Ocean
- GitHub Integration
- NodeJS Plugin
- Docker Commons Plugin
- Kubernetes Plugin

### Configure Global Tools
Go to Manage Jenkins → Global Tool Configuration

#### Configure NodeJS
- Add NodeJS installation
- Name: NodeJS-18
- Version: NodeJS 18.x

#### Configure Docker
- Add Docker installation
- Name: Docker
- Install automatically: Yes

## 2.5 Configure Jenkins Credentials

### Add Docker Hub Credentials
1. Go to Manage Jenkins → Manage Credentials
2. Click on "Jenkins" → "Global credentials"
3. Add Credential:
   - Kind: Username with password
   - ID: docker-hub-credentials
   - Username: your-dockerhub-username
   - Password: your-dockerhub-password

### Add GitHub Credentials (if using private repo)
1. Add Credential:
   - Kind: Username with password
   - ID: github-credentials
   - Username: your-github-username
   - Password: your-github-token