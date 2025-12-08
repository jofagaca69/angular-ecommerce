import { Category } from "./category.interface";

export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
  image?: string;
  categories: Category[] | string[]
}