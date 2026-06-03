import { Link } from "react-router-dom";
import type { Product } from "../types/product";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const mainImage =
    product.images?.find((img) => img.is_main)?.image_url ||
    product.images?.[0]?.image_url;

  const startingPrice =
    product.variants?.length > 0
      ? Math.min(
          ...product.variants.map((v) => v.price)
        )
      : 0;

  return (
    <div className="rounded-xl border overflow-hidden shadow hover:shadow-lg transition flex flex-col h-full bg-white">
      <Link to={`/products/${product.id}`} className="block overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-60 object-cover hover:scale-105 transition duration-300"
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${product.id}`} className="hover:text-amber-700 transition">
          <h2 className="font-bold text-lg md:text-xl line-clamp-1">
            {product.name}
          </h2>
        </Link>

        <p className="text-gray-500 mt-2 line-clamp-3 text-sm flex-grow">
          {product.description}
        </p>

        <div className="mt-4 flex justify-between items-center pt-2 border-t">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Starting at</span>
            <span className="font-bold text-lg text-neutral-900">
              ₹{startingPrice}
            </span>
          </div>

          <Link
            to={`/products/${product.id}`}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition shadow-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}