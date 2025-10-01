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
GET /api/products/:productId
```

### Add a new Product

```bash
POST /api/products/

Content-Type: application/json

{
        "productId": "1",
        "name": "Lollipop",
        "price": 15,
        "image": "https://media.gettyimages.com/id/182859150/sv/foto/single-lollipop.jpg",
        "AmountInStock": 100
    }
```

### Update a Product

```bash
PUT /api/products/:productId

Content-Type: application/json

{
        "name": "Lollipop",
        "price": 19,
        "image": "https://media.gettyimages.com/id/182859150/sv/foto/single-lollipop.jpg",
        "AmountInStock": 300
    }
```

### Delete a Product

```bash
DELETE /api/products/:productId
```

---

## 🛒 Cart

### Get all Cart Items

```bash
GET /api/cart/
```

### Get a specific Users Cart

```bash
GET /api/cart/:userId
```

### Delete a Product in Cart

```bash
DELETE /api/cart/:userId/:productId
```

### Delete a Cart

```bash
DELETE /api/cart/:userId
```

---

## 👤 Users

### Get all Users

```bash
GET /api/users/
```

### Get a specific User

```bash
GET /api/users/:userId
```

### Create a new User

```bash
POST /api/users/
Content-Type: application/json

{
  "name": "candylover"
}

```

### Update a User

```bash
Put /api/users/:userId

Content-Type: application/json

{
  "name": "snacklover"
}
```

### Delete a User

```bash
DELETE /api/users/:userId
```

---
