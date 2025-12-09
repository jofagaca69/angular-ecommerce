export interface Sale {
  _id: string;
  userId: string;
  username?: string;
  products: SaleProduct[];
  total: number;
  status: string;
  createdAt: string;
}

export interface SaleProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
