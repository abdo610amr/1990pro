export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sortOrder: number;
  active: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
  image?: string | null;
  sortOrder: number;
  active: boolean;
}
