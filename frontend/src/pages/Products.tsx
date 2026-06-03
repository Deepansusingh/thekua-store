import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { productService } from "../services/productService";
import type { Product } from "../types/product";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getProducts()
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center py-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-gray-200 h-80 rounded-xl"></div>
            <div className="bg-gray-200 h-80 rounded-xl"></div>
            <div className="bg-gray-200 h-80 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-black text-neutral-900 mb-8 tracking-tight text-left">
        Our Delicious Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}