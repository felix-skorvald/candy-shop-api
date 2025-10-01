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

### Delete a product

```bash
DELETE /api/products/:productId
```

## 🛒 Cart

### Get all Cart Items

```bash
GET /api/cart/
```

### Get a specific Users Cart

```bash
GET /api/cart/:userId
```

### Delete a Cart

```bash
DELETE /api/cart/:userId
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
