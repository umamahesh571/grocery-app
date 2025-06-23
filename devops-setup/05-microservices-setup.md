# Step 5: Create Microservices

## 5.1 Create Microservice Structure

### Create directories for microservices
```bash
mkdir -p microservices/{user-service,product-service,cart-service,order-service}
```

## 5.2 User Service

### Create User Service
```bash
# microservices/user-service/package.json
cat > microservices/user-service/package.json << 'EOF'
{
  "name": "user-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
EOF

# microservices/user-service/server.js
cat > microservices/user-service/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock user data
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+91-9876543210' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+91-9876543211' }
];

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'user-service' });
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.post('/users', (req, res) => {
  const newUser = {
    id: String(users.length + 1),
    ...req.body
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
EOF

# microservices/user-service/Dockerfile
cat > microservices/user-service/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF
```

## 5.3 Product Service

```bash
# microservices/product-service/package.json
cat > microservices/product-service/package.json << 'EOF'
{
  "name": "product-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
EOF

# microservices/product-service/server.js
cat > microservices/product-service/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock product data
const products = [
  {
    id: '1',
    name: 'Fresh Bananas',
    price: 40,
    category: 'Vegetables & Fruits',
    unit: '1 dozen',
    inStock: true,
    rating: 4.5
  },
  {
    id: '2',
    name: 'Organic Milk',
    price: 65,
    category: 'Dairy & Bakery',
    unit: '1L',
    inStock: true,
    rating: 4.8
  }
];

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'product-service' });
});

app.get('/products', (req, res) => {
  const { category, search } = req.query;
  let filteredProducts = products;
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(filteredProducts);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});
EOF

# microservices/product-service/Dockerfile
cat > microservices/product-service/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF
```

## 5.4 Cart Service

```bash
# microservices/cart-service/package.json
cat > microservices/cart-service/package.json << 'EOF'
{
  "name": "cart-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "redis": "^4.6.7",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
EOF

# microservices/cart-service/server.js
cat > microservices/cart-service/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock cart storage (in production, use Redis)
const carts = {};

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'cart-service' });
});

app.get('/cart/:userId', (req, res) => {
  const cart = carts[req.params.userId] || [];
  res.json(cart);
});

app.post('/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  const { productId, quantity } = req.body;
  
  if (!carts[userId]) {
    carts[userId] = [];
  }
  
  const existingItem = carts[userId].find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[userId].push({ productId, quantity });
  }
  
  res.json(carts[userId]);
});

app.delete('/cart/:userId/:productId', (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;
  
  if (carts[userId]) {
    carts[userId] = carts[userId].filter(item => item.productId !== productId);
  }
  
  res.json(carts[userId] || []);
});

app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
});
EOF

# microservices/cart-service/Dockerfile
cat > microservices/cart-service/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF
```

## 5.5 Order Service

```bash
# microservices/order-service/package.json
cat > microservices/order-service/package.json << 'EOF'
{
  "name": "order-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
EOF

# microservices/order-service/server.js
cat > microservices/order-service/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock order storage
const orders = [];

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'order-service' });
});

app.get('/orders/:userId', (req, res) => {
  const userOrders = orders.filter(order => order.userId === req.params.userId);
  res.json(userOrders);
});

app.post('/orders', (req, res) => {
  const newOrder = {
    id: String(orders.length + 1),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.get('/orders/:userId/:orderId', (req, res) => {
  const order = orders.find(o => o.id === req.params.orderId && o.userId === req.params.userId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});
EOF

# microservices/order-service/Dockerfile
cat > microservices/order-service/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF
```