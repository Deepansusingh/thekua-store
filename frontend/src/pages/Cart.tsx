import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../context/CartContext";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function Cart() {
	const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

	// Dynamic shipping: free above ₹500, else ₹50 flat
	const shippingThreshold = 500;
	const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 50;
	const finalTotal = cartTotal + shippingCost;

	const handleQuantityChange = (item: CartItem, val: number) => {
		const newQty = item.quantity + val;
		if (newQty < 1) return;
		if (item.variant.stock && newQty > item.variant.stock) {
			toast.error(`Only ${item.variant.stock} items in stock for this pack size.`);
			return;
		}
		updateQuantity(item.variant.id, newQty);
	};

	const handleRemove = (item: CartItem) => {
		removeFromCart(item.variant.id);
		toast.success(`Removed ${item.product.name} from cart.`);
	};

	if (cartItems.length === 0) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-20 text-center">
				<div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 border border-amber-100">
					<ShoppingBag className="w-10 h-10" />
				</div>
				<h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Your Cart is Empty</h2>
				<p className="mt-4 text-gray-500 max-w-md mx-auto">
					It looks like you haven't added any delicious Thekua to your cart yet. Let's find something delicious!
				</p>
				<div className="mt-8">
					<Link
						to="/products"
						className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-800 transition"
					>
						Browse Products
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
			<h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-8">Shopping Cart ({cartCount} items)</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
				{/* Cart Items List */}
				<div className="lg:col-span-2 space-y-4">
					{cartItems.map((item) => {
						const mainImage =
							item.product.images?.find((img) => img.is_main)?.image_url || item.product.images?.[0]?.image_url || "";
						const itemSubtotal = item.variant.price * item.quantity;

						return (
							<div
								key={item.variant.id}
								className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl gap-4 shadow-sm hover:shadow transition"
							>
								{/* Product Details info */}
								<div className="flex gap-4 items-center">
									<img src={mainImage} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover border shrink-0" />
									<div>
										<Link
											to={`/products/${item.product.id}`}
											className="font-bold text-neutral-900 hover:text-amber-700 transition line-clamp-1"
										>
											{item.product.name}
										</Link>
										<p className="text-xs text-gray-500 mt-1">Pack size: {item.variant.weight}</p>
										<p className="text-sm font-bold text-neutral-900 mt-1 sm:hidden">₹{item.variant.price} each</p>
									</div>
								</div>

								{/* Controls (Qty, Subtotal, Remove) */}
								<div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 sm:gap-10 border-t sm:border-t-0 pt-3 sm:pt-0">
									{/* Quantity selectors */}
									<div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
										<button
											onClick={() => handleQuantityChange(item, -1)}
											disabled={item.quantity <= 1}
											className="p-2 text-neutral-500 hover:text-black disabled:opacity-30 transition"
										>
											<Minus className="w-3.5 h-3.5" />
										</button>
										<span className="w-8 text-center text-xs font-bold text-neutral-900">{item.quantity}</span>
										<button
											onClick={() => handleQuantityChange(item, 1)}
											disabled={!!(item.variant.stock && item.quantity >= item.variant.stock)}
											className="p-2 text-neutral-500 hover:text-black disabled:opacity-30 transition"
										>
											<Plus className="w-3.5 h-3.5" />
										</button>
									</div>

									{/* Pricing subtotal */}
									<div className="text-right min-w-[70px]">
										<span className="text-sm font-black text-neutral-950">₹{itemSubtotal}</span>
										<p className="text-[10px] text-gray-400 hidden sm:block">₹{item.variant.price} each</p>
									</div>

									{/* Remove button */}
									<button
										onClick={() => handleRemove(item)}
										className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
										title="Remove item"
									>
										<Trash2 className="w-4.5 h-4.5" />
									</button>
								</div>
							</div>
						);
					})}
				</div>

				{/* Order Summary Panel */}
				<div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
					<h2 className="text-lg font-bold text-neutral-900 pb-4 border-b">Order Summary</h2>

					<div className="space-y-3 mt-4 text-sm text-gray-600">
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span className="font-semibold text-neutral-950">₹{cartTotal}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="flex flex-col">
								<span>Delivery</span>
								{cartTotal < shippingThreshold && (
									<span className="text-[10px] text-amber-600 font-semibold">Free delivery above ₹500</span>
								)}
							</span>
							<span className="font-semibold text-neutral-950">{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
						</div>
					</div>

					<div className="border-t mt-4 pt-4 flex justify-between items-baseline">
						<span className="font-bold text-neutral-900">Total</span>
						<span className="text-2xl font-black text-neutral-950">₹{finalTotal}</span>
					</div>

					<div className="mt-6 space-y-3">
						<Link
							to="/checkout"
							className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-neutral-800 transition shadow active:scale-[0.98] text-center text-sm"
						>
							Proceed to Checkout
							<ArrowRight className="w-4 h-4" />
						</Link>

						<Link
							to="/products"
							className="w-full block border border-neutral-200 text-neutral-700 py-3 rounded-xl font-semibold hover:border-gray-400 text-center text-sm transition"
						>
							Continue Shopping
						</Link>
					</div>

					<div className="mt-6 flex flex-col gap-2.5 text-[11px] text-gray-500 border-t pt-4">
						<div className="flex items-center gap-2">
							<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
							<span>Secure SSL encrypted checkout</span>
						</div>
						<div className="flex items-center gap-2">
							<ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
							<span>100% Satisfaction Guarantee</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}