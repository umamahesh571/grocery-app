# Step 6: Jenkins Pipeline Configuration

## 6.1 Update Jenkinsfile for Your Environment

### Update the existing Jenkinsfile with your specific details:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'  // or your private registry
        DOCKER_REPO = 'your-dockerhub-username/grocery-app'
        KUBECONFIG = credentials('kubernetes-token')
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
        GIT_REPO = 'https://github.com/your-username/grocery-delivery-app.git'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh '''
                    npm install
                    npm run build
                '''
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        script {
                            sh "docker build -t ${DOCKER_REPO}-frontend:${BUILD_TAG} ."
                            sh "docker tag ${DOCKER_REPO}-frontend:${BUILD_TAG} ${DOCKER_REPO}-frontend:latest"
                        }
                    }
                }
                
                stage('Build User Service') {
                    steps {
                        dir('microservices/user-service') {
                            script {
                                sh "docker build -t ${DOCKER_REPO}-user-service:${BUILD_TAG} ."
                                sh "docker tag ${DOCKER_REPO}-user-service:${BUILD_TAG} ${DOCKER_REPO}-user-service:latest"
                            }
                        }
                    }
                }
                
                stage('Build Product Service') {
                    steps {
                        dir('microservices/product-service') {
                            script {
                                sh "docker build -t ${DOCKER_REPO}-product-service:${BUILD_TAG} ."
                                sh "docker tag ${DOCKER_REPO}-product-service:${BUILD_TAG} ${DOCKER_REPO}-product-service:latest"
                            }
                        }
                    }
                }
                
                stage('Build Cart Service') {
                    steps {
                        dir('microservices/cart-service') {
                            script {
                                sh "docker build -t ${DOCKER_REPO}-cart-service:${BUILD_TAG} ."
                                sh "docker tag ${DOCKER_REPO}-cart-service:${BUILD_TAG} ${DOCKER_REPO}-cart-service:latest"
                            }
                        }
                    }
                }
                
                stage('Build Order Service') {
                    steps {
                        dir('microservices/order-service') {
                            script {
                                sh "docker build -t ${DOCKER_REPO}-order-service:${BUILD_TAG} ."
                                sh "docker tag ${DOCKER_REPO}-order-service:${BUILD_TAG} ${DOCKER_REPO}-order-service:latest"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS) {
                        sh "docker push ${DOCKER_REPO}-frontend:${BUILD_TAG}"
                        sh "docker push ${DOCKER_REPO}-frontend:latest"
                        sh "docker push ${DOCKER_REPO}-user-service:${BUILD_TAG}"
                        sh "docker push ${DOCKER_REPO}-user-service:latest"
                        sh "docker push ${DOCKER_REPO}-product-service:${BUILD_TAG}"
                        sh "docker push ${DOCKER_REPO}-product-service:latest"
                        sh "docker push ${DOCKER_REPO}-cart-service:${BUILD_TAG}"
                        sh "docker push ${DOCKER_REPO}-cart-service:latest"
                        sh "docker push ${DOCKER_REPO}-order-service:${BUILD_TAG}"
                        sh "docker push ${DOCKER_REPO}-order-service:latest"
                    }
                }
            }
        }
        
        stage('Update K8s Manifests') {
            steps {
                script {
                    sh """
                        sed -i 's|image: grocery-app/frontend:latest|image: ${DOCKER_REPO}-frontend:${BUILD_TAG}|g' k8s/frontend-deployment.yaml
                        sed -i 's|image: grocery-app/user-service:latest|image: ${DOCKER_REPO}-user-service:${BUILD_TAG}|g' k8s/user-service-deployment.yaml
                        sed -i 's|image: grocery-app/product-service:latest|image: ${DOCKER_REPO}-product-service:${BUILD_TAG}|g' k8s/product-service-deployment.yaml
                        sed -i 's|image: grocery-app/cart-service:latest|image: ${DOCKER_REPO}-cart-service:${BUILD_TAG}|g' k8s/cart-service-deployment.yaml
                        sed -i 's|image: grocery-app/order-service:latest|image: ${DOCKER_REPO}-order-service:${BUILD_TAG}|g' k8s/order-service-deployment.yaml
                    """
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/postgres-deployment.yaml
                        kubectl apply -f k8s/redis-deployment.yaml
                        kubectl wait --for=condition=available --timeout=300s deployment/postgres-deployment -n grocery-app
                        kubectl wait --for=condition=available --timeout=300s deployment/redis-deployment -n grocery-app
                        kubectl apply -f k8s/user-service-deployment.yaml
                        kubectl apply -f k8s/product-service-deployment.yaml
                        kubectl apply -f k8s/cart-service-deployment.yaml
                        kubectl apply -f k8s/order-service-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl apply -f k8s/ingress.yaml
                        kubectl apply -f k8s/hpa.yaml
                        kubectl wait --for=condition=available --timeout=600s deployment --all -n grocery-app
                    '''
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    sh '''
                        kubectl get pods -n grocery-app
                        kubectl get services -n grocery-app
                        kubectl get ingress -n grocery-app
                        kubectl get hpa -n grocery-app
                    '''
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker system prune -f'
        }
        
        success {
            echo 'Pipeline succeeded!'
        }
        
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

## 6.2 Create Jenkins Pipeline Job

### Create New Pipeline Job
1. Go to Jenkins Dashboard
2. Click "New Item"
3. Enter name: "grocery-app-pipeline"
4. Select "Pipeline"
5. Click "OK"

### Configure Pipeline
1. In "Pipeline" section:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: Your Git repository URL
   - Branch: */main
   - Script Path: Jenkinsfile

2. Save the configuration

## 6.3 Set up GitHub Webhook (Optional)

### Configure GitHub Webhook
1. Go to your GitHub repository
2. Settings → Webhooks
3. Add webhook:
   - Payload URL: http://your-jenkins-ip:8080/github-webhook/
   - Content type: application/json
   - Events: Push events

### Configure Jenkins for GitHub Integration
1. In your pipeline job configuration
2. Build Triggers → Check "GitHub hook trigger for GITScm polling"