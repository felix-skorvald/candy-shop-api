# 🍬 Candy Shop API

The **Candy Shop API** allows you to manage products, users, and shopping carts.  
It provides full CRUD functionality (`GET`, `POST`, `PUT`, `DELETE`) for each resource.

Base URL:

---

## 📦 Products

### Get all Products

```bash
GET /api/products/
```

### Get a specific Product

```bash
GET /api/products/:id
```

## 🛒 Cart

### Get all Carts

```bash
GET /api/cart/
```

## 👤 Users

### Create a new User

```bash
POST /api/users
Content-Type: application/json

{
  "name": "candylover"
}

```
