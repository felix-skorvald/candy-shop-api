interface IdParam {
    id: string;
}

interface User {
  userId: string;
  name: string;
  pk: string;
  sk: string;
}

interface CreateUserBody {
  userId: string;
  name: string;
}

interface CreateUserResponse {
  message: string;
  user: {
    userId: string;
    name: string;
  };
}


interface UpdateUserResponse {
  message: string;
  user: User;
}

interface DeleteUserResponse {
  message: string;
  user: User;
}

interface ErrorResponse {
  message: string;
  errors?: unknown;
}

// Product interfaces
interface Product {
  productId: string;
  name: string;
  price: number;
  image: string;
  AmountInStock: number;
  pk: string;
  sk: string;
}

interface CreateProductBody {
  productId: string;
  name: string;
  price: number;
  image: string;
  AmountInStock: number;
}

interface CreateProductResponse {
  message: string;
  product: Product;
}

interface UpdateProductBody {
  name?: string;
  price?: number;
  image?: string;
  AmountInStock?: number;
}

interface UpdateProductResponse {
  message: string;
  product: Product;
}

interface DeleteProductResponse {
  message: string;
  product: Product;
}

interface ProductIdParam {
  productId: string;
}

export type { 
  IdParam, 
  User, 
  CreateUserBody, 
  CreateUserResponse, 
  UpdateUserResponse, 
  DeleteUserResponse, 
  ErrorResponse,
  Product,
  CreateProductBody,
  CreateProductResponse,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductResponse,
  ProductIdParam
};

