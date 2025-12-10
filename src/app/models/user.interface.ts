export interface User {
  _id: string;
  username: string;
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
  role?: string;
}
