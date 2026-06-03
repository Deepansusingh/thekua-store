# Thekua Store - E-Commerce Application

A production-ready e-commerce web application for selling traditional Thekua online across India.

## 📋 Project Overview

Thekua Store is a full-stack e-commerce platform built with modern technologies, featuring:
- Customer and Admin roles
- Guest checkout
- Product management with variants
- Order tracking
- Payment integration (Razorpay ready)
- Fully responsive UI
- Clean architecture

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query

**Backend:**
- Golang 1.21+
- Gin Framework
- GORM
- PostgreSQL
- JWT Authentication
- Clean Architecture

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL
- Nginx (reverse proxy)

## 📁 Project Structure

```
thekua-store/
├── backend/                    # Golang backend
│   ├── cmd/
│   │   └── main.go            # Entry point
│   ├── internal/
│   │   ├── domain/            # Entity models
│   │   ├── dto/               # Data transfer objects
│   │   ├── repository/        # Database layer
│   │   ├── service/           # Business logic
│   │   ├── handler/           # HTTP handlers
│   │   ├── middleware/        # Middleware
│   │   └── config/            # Configuration
│   ├── migrations/            # Database migrations
│   ├── pkg/
│   │   ├── logger/            # Logging
│   │   └── utils/             # Utilities
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── .env.example
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   ├── layouts/           # Layout components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/                # Static assets
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
├── docker-compose.yml         # Main docker compose
└── .env.example              # Environment variables
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Deepansusingh/thekua-store.git
   cd thekua-store
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - PostgreSQL: localhost:5432

## 🔐 User Roles

### Customer
- Register and login
- Browse products
- Add to cart
- Checkout (guest or logged-in)
- Track orders
- View order history

### Admin
- Manage products and variants
- Manage inventory
- View and manage orders
- View customer information
- Update order status

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/admin-login` - Admin login

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details

### Admin
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - List orders
- `PUT /api/admin/orders/:id/status` - Update order status

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/track/:orderNumber` - Track order

## 📋 Database Schema

### Tables
- `users` - User accounts
- `addresses` - Delivery addresses
- `products` - Product catalog
- `product_images` - Product images
- `product_variants` - Product variants (250g, 500g, 1kg)
- `carts` - Shopping carts
- `cart_items` - Cart items
- `orders` - Orders
- `order_items` - Order line items
- `payments` - Payment records

## 🐳 Docker Setup

### Docker Compose Services
- `db` - PostgreSQL database
- `backend` - Golang API server
- `frontend` - React application
- `nginx` - Reverse proxy

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

## 🧪 Testing

```bash
# Backend tests
cd backend
go test ./...

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Production Build

```bash
# Build Docker images
docker-compose -f docker-compose.yml build

# Push to registry
docker tag thekua-store-backend your-registry/thekua-store-backend:latest
docker push your-registry/thekua-store-backend:latest
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For support, email support@thekuastore.com or create an issue.
