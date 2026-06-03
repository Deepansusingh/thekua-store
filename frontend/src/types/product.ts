export interface ProductVariant {
  id: number;
  weight: string;
  price: number;
  stock: number;
}

export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  is_main: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  is_featured: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
}