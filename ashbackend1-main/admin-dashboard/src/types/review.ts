export interface Review {
  id: number;
  product_id: number;
  name: string;
  rating: number;
  comment: string | null;
}
