# Shopping E-Commerce Project

Full-stack e-commerce app built with Nuxt.js 2 (frontend) and Node.js/Express (backend) with MongoDB.

---

## Project Structure

```
shopping/
├── backend/    Node.js + Express API
└── frontend/   Nuxt.js 2 app
```

---

## Installation

### Prerequisites
- Node.js >= 16
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if your API runs on a different port
npm run dev
```

Frontend: http://localhost:3000
Backend API: http://localhost:5000

---

## Environment Variables

### backend/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopping_db
JWT_SECRET=your_secret_here
JWT_EXPIRE=30d
NODE_ENV=development
```

### frontend/.env
```
API_BASE_URL=http://localhost:5000/api/v1
```

---

## API Endpoints

### Auth
| Method | Endpoint              | Access  | Description     |
|--------|-----------------------|---------|-----------------|
| POST   | /api/v1/auth/register | Public  | Register user   |
| POST   | /api/v1/auth/login    | Public  | Login user      |
| GET    | /api/v1/auth/me       | Private | Get current user|

### Products
| Method | Endpoint               | Access      | Description        |
|--------|------------------------|-------------|--------------------|
| GET    | /api/v1/products       | Public      | List products      |
| GET    | /api/v1/products/:id   | Public      | Get product        |
| POST   | /api/v1/products       | Admin       | Create product     |
| PUT    | /api/v1/products/:id   | Admin       | Update product     |
| DELETE | /api/v1/products/:id   | Admin       | Delete product     |

Query params for GET /products: `?search=`, `?category=`, `?page=`, `?limit=`

### Categories
| Method | Endpoint                  | Access | Description      |
|--------|---------------------------|--------|------------------|
| GET    | /api/v1/categories        | Public | List categories  |
| POST   | /api/v1/categories        | Admin  | Create category  |
| PUT    | /api/v1/categories/:id    | Admin  | Update category  |
| DELETE | /api/v1/categories/:id    | Admin  | Delete category  |

### Cart
| Method | Endpoint                | Access  | Description          |
|--------|-------------------------|---------|----------------------|
| POST   | /api/v1/cart/validate   | Private | Validate cart items  |

### Orders
| Method | Endpoint                      | Access  | Description          |
|--------|-------------------------------|---------|----------------------|
| POST   | /api/v1/orders                | Private | Place order          |
| GET    | /api/v1/orders/my             | Private | Get my orders        |
| GET    | /api/v1/orders                | Admin   | Get all orders       |
| PUT    | /api/v1/orders/:id/status     | Admin   | Update order status  |

---

## Creating an Admin User

Register normally, then update the user's role in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## Features

- JWT Authentication (register/login)
- Product listing with search & category filter, pagination
- Product detail page
- Cart (client-side, localStorage)
- Checkout with order placement & stock decrement
- Admin dashboard: manage products, categories, orders
- Route protection via Nuxt middleware
