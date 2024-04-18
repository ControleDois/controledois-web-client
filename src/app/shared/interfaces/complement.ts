import { Product } from "./product.interface";

export interface Complement {
  name: string;
  required: boolean;
  minimum: number;
  maximum: number;
  products: Product[];
}
