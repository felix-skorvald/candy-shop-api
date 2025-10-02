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

export type { IdParam, User, CreateUserBody, CreateUserResponse, UpdateUserResponse, DeleteUserResponse, ErrorResponse };

