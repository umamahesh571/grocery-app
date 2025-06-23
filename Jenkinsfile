pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_REPO = 'grocery-app'
        KUBECONFIG = credentials('kubeconfig')
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Code Quality & Security') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm install'
                        sh 'npm run lint'
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        sh 'npm audit --audit-level=high'
                    }
                }
                
                stage('SAST Scan') {
                    steps {
                        // Static Application Security Testing
                        sh 'echo "Running SAST scan..."'
                        // Add your SAST tool here (e.g., SonarQube, Checkmarx)
                    }
                }
            }
        }
        
        stage('Build & Test') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        sh 'npm run build'
                        archiveArtifacts artifacts: 'dist/**', fingerprint: true
                    }
                }
                
                stage('Unit Tests') {
                    steps {
                        sh 'echo "Running unit tests..."'
                        // Add your test command here
                        // sh 'npm test'
                    }
                    post {
                        always {
                            // publishTestResults testResultsPattern: 'test-results.xml'
                            echo "Test results would be published here"
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        script {
                            def frontendImage = docker.build("${DOCKER_REGISTRY}/${DOCKER_REPO}/frontend:${BUILD_TAG}")
                            docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS) {
                                frontendImage.push()
                                frontendImage.push("latest")
                            }
                        }
                    }
                }
                
                stage('Build Microservices Images') {
                    steps {
                        script {
                            def services = ['user-service', 'product-service', 'cart-service', 'order-service']
                            services.each { service ->
                                if (fileExists("microservices/${service}/Dockerfile")) {
                                    dir("microservices/${service}") {
                                        def serviceImage = docker.build("${DOCKER_REGISTRY}/${DOCKER_REPO}/${service}:${BUILD_TAG}")
                                        docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS) {
                                            serviceImage.push()
                                            serviceImage.push("latest")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scanning') {
            parallel {
                stage('Container Security Scan') {
                    steps {
                        script {
                            // Use tools like Trivy, Clair, or Anchore
                            sh """
                                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                                    aquasec/trivy:latest image \\
                                    ${DOCKER_REGISTRY}/${DOCKER_REPO}/frontend:${BUILD_TAG}
                            """
                        }
                    }
                }
                
                stage('Kubernetes Security Scan') {
                    steps {
                        sh 'echo "Scanning Kubernetes manifests for security issues..."'
                        // Add tools like kube-score, kube-bench, or Polaris
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                script {
                    sh """
                        # Update image tags in Kubernetes manifests
                        sed -i 's|image: grocery-app/frontend:latest|image: ${DOCKER_REGISTRY}/${DOCKER_REPO}/frontend:${BUILD_TAG}|g\' k8s/*-deployment.yaml
                        
                        # Apply Kubernetes manifests
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/postgres-deployment.yaml
                        kubectl apply -f k8s/redis-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl apply -f k8s/user-service-deployment.yaml
                        kubectl apply -f k8s/product-service-deployment.yaml
                        kubectl apply -f k8s/cart-service-deployment.yaml
                        kubectl apply -f k8s/order-service-deployment.yaml
                        kubectl apply -f k8s/ingress.yaml
                        kubectl apply -f k8s/hpa.yaml
                        
                        # Wait for deployments to be ready
                        kubectl wait --for=condition=available --timeout=300s deployment --all -n grocery-app
                    """
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    sh """
                        # Wait for services to be ready
                        sleep 30
                        
                        # Run API integration tests
                        echo "Running integration tests..."
                        # Add your integration test commands here
                        
                        # Health checks
                        kubectl get pods -n grocery-app
                        kubectl get services -n grocery-app
                        kubectl get ingress -n grocery-app
                    """
                }
            }
        }
        
        stage('Performance Tests') {
            steps {
                script {
                    sh """
                        echo "Running performance tests..."
                        # Add tools like JMeter, k6, or Artillery
                        # Example with k6:
                        # k6 run performance-tests/load-test.js
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Blue-Green or Canary deployment strategy
                    input message: 'Deploy to Production?', ok: 'Deploy'
                    
                    sh """
                        # Switch to production namespace/context
                        kubectl config use-context production-cluster
                        
                        # Apply production configurations
                        kubectl apply -f k8s-production/
                        
                        # Gradual rollout (Canary deployment)
                        kubectl patch deployment frontend-deployment -n grocery-app-prod \\
                            -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","image":"${DOCKER_REGISTRY}/${DOCKER_REPO}/frontend:${BUILD_TAG}"}]}}}}'
                        
                        # Monitor rollout
                        kubectl rollout status deployment/frontend-deployment -n grocery-app-prod --timeout=600s
                    """
                }
            }
        }
    }
    
    post {
        always {
            // Clean up
            sh 'docker system prune -f'
            
            // Archive logs
            archiveArtifacts artifacts: 'logs/**', allowEmptyArchive: true
        }
        
        success {
            echo 'Pipeline succeeded!'
            // Send success notifications (Slack, email, etc.)
        }
        
        failure {
            echo 'Pipeline failed!'
            // Send failure notifications and rollback if necessary
            script {
                if (env.BRANCH_NAME == 'main') {
                    sh 'kubectl rollout undo deployment/frontend-deployment -n grocery-app-prod'
                }
            }
        }
        
        unstable {
            echo 'Pipeline is unstable!'
        }
    }
}
                }
            }
        }
    }
}