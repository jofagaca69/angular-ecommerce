export interface User {
  _id: string;
  username: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: string;
}
