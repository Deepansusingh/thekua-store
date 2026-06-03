import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { productService } from "../services/productService";
import type { Product, ProductVariant } from "../types/product";
import { ShoppingBag, Minus, Plus, ChevronRight, Award, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetail() {
	const { id } = useParams<{ id: string }>();
	const { addToCart } = useCart();
	const [product, setProduct] = useState<Product | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
	const [selectedImage, setSelectedImage] = useState<string>("");
	const [quantity, setQuantity] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProduct() {
			if (!id) return;
			try {
				setLoading(true);
				setError(null);
				const data = await productService.getProduct(id);
				setProduct(data);

				// Set default image and variant
				if (data) {
					const mainImg = data.images?.find((img: any) => img.is_main)?.image_url || data.images?.[0]?.image_url || "";
					setSelectedImage(mainImg);

					if (data.variants && data.variants.length > 0) {
						// Select first available variant or just first variant
						const firstAvailable = data.variants.find((v: any) => v.stock > 0);
						setSelectedVariant(firstAvailable || data.variants[0]);
					}
				}
			} catch (err: any) {
				console.error("Error fetching product:", err);
				setError("Failed to load product. Please try again.");
			} finally {
				setLoading(false);
			}
		}

		fetchProduct();
	}, [id]);

	const handleVariantChange = (variant: ProductVariant) => {
		setSelectedVariant(variant);
		setQuantity(1); // Reset quantity
	};

	const handleQuantityChange = (val: number) => {
		if (!selectedVariant) return;
		const newQty = quantity + val;
		if (newQty < 1) return;
		if (selectedVariant.stock && newQty > selectedVariant.stock) {
			toast.error(`Only ${selectedVariant.stock} items available in this size.`);
			return;
		}
		setQuantity(newQty);
	};

	const handleAddToCart = () => {
		if (!product || !selectedVariant) return;

		addToCart(product, selectedVariant, quantity);
		toast.success(`Added ${quantity} x ${product.name} (${selectedVariant.weight}) to cart!`);
	};

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
				{/* Breadcrumb Skeleton */}
				<div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Left Column Skeleton */}
					<div className="space-y-4">
						<div className="bg-gray-200 rounded-2xl h-96 w-full"></div>
						<div className="flex gap-4">
							<div className="bg-gray-200 rounded-lg h-20 w-20"></div>
							<div className="bg-gray-200 rounded-lg h-20 w-20"></div>
							<div className="bg-gray-200 rounded-lg h-20 w-20"></div>
						</div>
					</div>

					{/* Right Column Skeleton */}
					<div className="space-y-6">
						<div className="h-8 bg-gray-200 rounded w-3/4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/4"></div>
						<div className="h-6 bg-gray-200 rounded w-1/3"></div>
						<div className="space-y-2">
							<div className="h-4 bg-gray-200 rounded w-full"></div>
							<div className="h-4 bg-gray-200 rounded w-full"></div>
							<div className="h-4 bg-gray-200 rounded w-2/3"></div>
						</div>
						<div className="space-y-2 pt-4">
							<div className="h-4 bg-gray-200 rounded w-1/4"></div>
							<div className="flex gap-3">
								<div className="h-10 bg-gray-200 rounded-lg w-16"></div>
								<div className="h-10 bg-gray-200 rounded-lg w-16"></div>
							</div>
						</div>
						<div className="h-12 bg-gray-200 rounded-xl w-full pt-4"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-20 text-center">
				<h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Product Not Found</h2>
				<p className="mt-4 text-gray-500 max-w-md mx-auto">
					The product you are looking for does not exist, or could not be loaded at this time.
				</p>
				<div className="mt-8">
					<Link
						to="/products"
						className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-800 transition"
					>
						Back to Products
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
			{/* Breadcrumbs */}
			<div className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
				<Link to="/" className="hover:text-black transition">
					Home
				</Link>
				<ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
				<Link to="/products" className="hover:text-black transition">
					Products
				</Link>
				<ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
				<span className="text-gray-900 font-medium truncate">{product.name}</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
				{/* Left Column: Image Gallery */}
				<div className="space-y-4">
					<div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border shadow-sm">
						<img
							src={selectedImage}
							alt={product.name}
							className="w-full h-full object-cover transition-all duration-300"
						/>
					</div>

					{/* Thumbnail List */}
					{product.images && product.images.length > 1 && (
						<div className="flex gap-3 overflow-x-auto py-1">
							{product.images.map((img) => (
								<button
									key={img.id}
									onClick={() => setSelectedImage(img.image_url)}
									className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
										selectedImage === img.image_url ? "border-black scale-95" : "border-transparent hover:border-gray-300"
									}`}
								>
									<img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover" />
								</button>
							))}
						</div>
					)}
				</div>

				{/* Right Column: Product Info & Purchase Controls */}
				<div className="flex flex-col justify-between">
					<div>
						{/* Category & Badge */}
						<div className="flex items-center gap-3">
							<span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider">
								{product.category}
							</span>
							{product.is_featured && (
								<span className="px-3 py-1 bg-neutral-900 text-white text-xs font-semibold rounded-full uppercase tracking-wider">
									Best Seller
								</span>
							)}
						</div>

						{/* Product Title */}
						<h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mt-4 tracking-tight leading-tight">
							{product.name}
						</h1>

						{/* Price Display */}
						<div className="mt-5 flex items-baseline gap-4">
							{selectedVariant ? (
								<>
									<span className="text-3xl font-black text-neutral-950">₹{selectedVariant.price}</span>
									<span className="text-sm text-gray-500">Includes all taxes</span>
								</>
							) : (
								<span className="text-lg text-gray-500">Pricing unavailable</span>
							)}
						</div>

						{/* Stock Status Badge */}
						<div className="mt-4">
							{selectedVariant ? (
								selectedVariant.stock > 0 ? (
									selectedVariant.stock <= 5 ? (
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800">
											<span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
											Only {selectedVariant.stock} left in stock - order soon!
										</span>
									) : (
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800">
											<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
											In Stock
										</span>
									)
								) : (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-800">
										<span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
										Out of Stock
									</span>
								)
							) : null}
						</div>

						{/* Product Description */}
						<div className="mt-6 border-t pt-6">
							<h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Description</h3>
							<p className="mt-2 text-gray-600 leading-relaxed text-sm md:text-base">{product.description}</p>
						</div>

						{/* Variants (Pack Size) Selector */}
						{product.variants && product.variants.length > 0 && (
							<div className="mt-6 pt-6 border-t">
								<h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Select Pack Size</h3>
								<div className="flex flex-wrap gap-3 mt-3">
									{product.variants.map((v) => {
										const isSelected = selectedVariant?.id === v.id;
										const isOutOfStock = v.stock <= 0;

										return (
											<button
												key={v.id}
												disabled={isOutOfStock}
												onClick={() => handleVariantChange(v)}
												className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 relative flex flex-col items-center justify-center shrink-0 min-w-24 ${
													isSelected
														? "border-black bg-black text-white shadow-sm"
														: isOutOfStock
														? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
														: "border-gray-200 text-neutral-800 hover:border-gray-400 bg-white"
												}`}
											>
												<span>{v.weight}</span>
												<span className={`text-[10px] mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
													₹{v.price}
												</span>
												{isOutOfStock && (
													<span className="absolute -top-2 -right-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase">
														Sold Out
													</span>
												)}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Quantity Selector */}
						{selectedVariant && selectedVariant.stock > 0 && (
							<div className="mt-6 pt-6 border-t">
								<h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">Quantity</h3>
								<div className="inline-flex items-center border border-gray-200 rounded-xl bg-white shadow-sm">
									<button
										onClick={() => handleQuantityChange(-1)}
										disabled={quantity <= 1}
										className="p-3 text-neutral-500 hover:text-black hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-l-xl transition"
									>
										<Minus className="w-4 h-4" />
									</button>
									<span className="w-12 text-center font-bold text-neutral-900 text-sm select-none">{quantity}</span>
									<button
										onClick={() => handleQuantityChange(1)}
										disabled={!!(selectedVariant.stock && quantity >= selectedVariant.stock)}
										className="p-3 text-neutral-500 hover:text-black hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-r-xl transition"
									>
										<Plus className="w-4 h-4" />
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Actions Area */}
					<div className="mt-8 pt-6 border-t space-y-4">
						{selectedVariant && selectedVariant.stock > 0 ? (
							<div className="flex flex-col sm:flex-row gap-4">
								<button
									onClick={handleAddToCart}
									className="flex-grow flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-neutral-800 transition shadow-md active:scale-[0.98]"
								>
									<ShoppingBag className="w-5 h-5" />
									Add to Cart
								</button>
								<Link
									to="/cart"
									className="sm:w-1/3 flex items-center justify-center border-2 border-neutral-200 text-neutral-800 px-6 py-4 rounded-xl font-bold hover:border-black hover:bg-neutral-50 transition text-center"
								>
									Go to Cart
								</Link>
							</div>
						) : (
							<button
								disabled
								className="w-full bg-gray-100 text-gray-400 px-8 py-4 rounded-xl font-bold cursor-not-allowed text-center uppercase tracking-wide border"
							>
								Currently Unavailable
							</button>
						)}

						{/* Value Props / Trust Indicators */}
						<div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs text-gray-500">
							<div className="flex flex-col items-center p-2 rounded-xl bg-neutral-50 border border-neutral-100">
								<Award className="w-5 h-5 text-amber-600 mb-1" />
								<span className="font-semibold text-neutral-800">Premium Quality</span>
								<span className="text-[9px] mt-0.5">100% Pure Ghee</span>
							</div>
							<div className="flex flex-col items-center p-2 rounded-xl bg-neutral-50 border border-neutral-100">
								<ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
								<span className="font-semibold text-neutral-800">Fresh & Hygienic</span>
								<span className="text-[9px] mt-0.5">Homemade Recipe</span>
							</div>
							<div className="flex flex-col items-center p-2 rounded-xl bg-neutral-50 border border-neutral-100">
								<Truck className="w-5 h-5 text-blue-600 mb-1" />
								<span className="font-semibold text-neutral-800">Express Delivery</span>
								<span className="text-[9px] mt-0.5">All Over India</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}