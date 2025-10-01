import * as z from "zod";

const idRegex = /^[a-zA-Z0-9#]+$/
const nameRegex = /^[a-zA-Z0-9\s]+$/
const imageUrlRegex = /^https?:\/\/[^\s]+$/i

// Base schema för pk och sk
const BaseSchema = {
  pk: z.string().min(4).max(50).regex(idRegex),
  sk: z.string().min(4).max(50).regex(idRegex),
}

// User
const UserSchema = z.object({
  ...BaseSchema,
  name: z.string().min(2).max(50).regex(nameRegex),
  amount: z.undefined(),
  AmountInStock: z.undefined(),
  image: z.undefined(),
  price: z.undefined(),
  productId: z.undefined(),
  userId: z.string().min(1).max(50).regex(idRegex),
})

// Product
const ProductSchema = z.object({
  ...BaseSchema,
  name: z.string().min(2).max(50).regex(nameRegex),
  amount: z.undefined(),
  AmountInStock: z.number().nonnegative().max(9999),
  image: z.string().regex(imageUrlRegex, "URL must be a valid image URL").trim(),
  price: z.number().min(1).max(99999),
  productId: z.string().min(1).max(50).regex(idRegex),
  userId: z.undefined(),
})

// Cart
const CartSchema = z.object({
  ...BaseSchema,
  name: z.undefined(),
  amount: z.number().nonnegative().max(9999),
  AmountInStock: z.undefined(),
  image: z.undefined(),
  price: z.undefined(),
  productId: z.string().min(1).max(50).regex(idRegex),
  userId: z.string().min(1).max(50).regex(idRegex),
})

export { UserSchema, ProductSchema, CartSchema }
