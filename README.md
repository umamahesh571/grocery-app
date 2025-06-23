# 🛒 FreshMart - Grocery Delivery App

A modern, production-ready grocery delivery application built with React, TypeScript, and deployed using microservices architecture on Kubernetes with complete DevOps pipeline.

## 🚀 Features

### Frontend Features
- **Modern UI/UX**: Clean, Zepto-inspired design with smooth animations
- **Real-time Search**: Instant product search with category filtering
- **Smart Cart Management**: Dynamic cart with quantity controls and price calculations
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Express Delivery**: 10-minute delivery simulation with slot selection
- **Category Navigation**: Intuitive product browsing by categories

### Technical Features
- **Microservices Architecture**: Scalable, loosely-coupled services
- **Containerized Deployment**: Docker containers for all services
- **Kubernetes Orchestration**: Production-ready K8s configurations
- **CI/CD Pipeline**: Complete Jenkins pipeline with automated testing
- **Auto-scaling**: Horizontal Pod Autoscaler for dynamic scaling
- **Load Balancing**: Ingress controller with load balancer
- **Monitoring**: Prometheus and Grafana integration
- **Security**: Container scanning, SAST, and security policies

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Gateway    │    │ Load Balancer   │
│   (React)       │◄──►│   (Nginx)       │◄──►│   (K8s LB)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ User Service │ │Product Svc  │ │ Cart Svc   │
        │ (Node.js)    │ │ (Node.js)   │ │ (Node.js)  │
        └──────────────┘ └─────────────┘ └────────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ PostgreSQL   │ │ PostgreSQL  │ │   Redis    │
        └──────────────┘ └─────────────┘ └────────────┘
```

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend (Microservices)
- **Node.js** with Express
- **PostgreSQL** for user, product, and order data
- **Redis** for cart and session management
- **Nginx** as API Gateway

### DevOps & Infrastructure
- **Docker** for containerization
- **Kubernetes** for orchestration
- **Jenkins** for CI/CD pipeline
- **Prometheus** for monitoring
- **Grafana** for visualization
- **Horizontal Pod Autoscaler** for scaling

## 🚀 Quick Start

### Local Development

1. **Clone and Install**
```bash
git clone <repository-url>
cd grocery-delivery-app
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Build for Production**
```bash
npm run build
```

### Docker Deployment

1. **Build and Run with Docker Compose**
```bash
docker-compose up -d
```

2. **Access the Application**
```
Frontend: http://localhost:3000
API Gateway: http://localhost:8080
```

### Kubernetes Deployment

1. **Setup Cluster**
```bash
chmod +x deploy-scripts/setup-cluster.sh
./deploy-scripts/setup-cluster.sh
```

2. **Access Application**
```bash
# Add to /etc/hosts
<EXTERNAL-IP> grocery-app.local

# Access at: http://grocery-app.local
```

3. **Monitor Deployment**
```bash
kubectl get pods -n grocery-app --watch
```

4. **Cleanup**
```bash
chmod +x deploy-scripts/cleanup-cluster.sh
./deploy-scripts/cleanup-cluster.sh
```

## 📊 Monitoring & Observability

### Prometheus Metrics
- Request rate and response time
- Error rates and success rates
- CPU and memory usage
- Pod restart frequency

### Grafana Dashboards
- Application overview
- Service performance metrics
- Infrastructure monitoring
- Alert management

### Health Checks
All services include health check endpoints for monitoring and load balancing.

## 🔧 CI/CD Pipeline

The Jenkins pipeline includes:

1. **Code Quality**
   - ESLint for code quality
   - Security scanning
   - SAST analysis

2. **Build & Test**
   - Frontend build
   - Unit test execution
   - Docker image creation

3. **Security**
   - Container vulnerability scanning
   - Kubernetes security validation

4. **Deployment**
   - Staging deployment
   - Integration testing
   - Production deployment (with approval)

5. **Monitoring**
   - Health checks
   - Performance monitoring
   - Rollback capability

## 📈 Scaling & Performance

### Auto-scaling Configuration
- **Frontend**: 2-10 replicas based on CPU/Memory
- **Product Service**: 2-8 replicas (high traffic expected)
- **User Service**: 1-5 replicas
- **Cart Service**: 1-6 replicas
- **Order Service**: 1-5 replicas

### Performance Optimizations
- Image compression and caching
- Static asset optimization
- Database connection pooling
- Redis caching for frequently accessed data
- CDN integration ready

## 🔒 Security Features

- Container security scanning
- Kubernetes security policies
- CORS configuration
- Security headers implementation
- Secret management
- Network policies

## 🌟 Production Readiness

This application is designed for production deployment with:

- **High Availability**: Multi-replica deployments
- **Fault Tolerance**: Health checks and auto-restart
- **Scalability**: Horizontal auto-scaling
- **Monitoring**: Comprehensive observability
- **Security**: Multi-layer security implementation
- **Performance**: Optimized for fast load times
- **Maintenance**: Easy updates and rollbacks

## 📝 Environment Variables

Key environment variables for configuration:

```bash
# Database
DB_HOST=postgres-service
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=redis-service
REDIS_PORT=6379

# Application
NODE_ENV=production
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for modern grocery delivery experiences**