import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { orderService } from "../services/orderService";
import type { CreateOrderRequest } from "../services/orderService";
import { ArrowLeft, CreditCard, Lock, ShieldCheck, CheckCircle, Truck, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function Checkout() {
	const { cartItems, cartTotal, clearCart } = useCart();
	const navigate = useNavigate();

	// Dynamic shipping calculations
	const shippingThreshold = 500;
	const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 50;
	const finalTotal = cartTotal + shippingCost;

	// Guest Customer & Shipping Form fields
	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [shippingStreet, setShippingStreet] = useState("");
	const [shippingCity, setShippingCity] = useState("");
	const [shippingState, setShippingState] = useState("");
	const [shippingPincode, setShippingPincode] = useState("");

	const [submitting, setSubmitting] = useState(false);
	const [successOrder, setSuccessOrder] = useState<any | null>(null);

	// Redirect to cart if empty (and not on success screen)
	useEffect(() => {
		if (cartItems.length === 0 && !successOrder) {
			navigate("/cart");
		}
	}, [cartItems, successOrder, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (cartItems.length === 0) {
			toast.error("Your cart is empty.");
			return;
		}

		// Quick basic validations
		if (
			!customerName.trim() ||
			!customerEmail.trim() ||
			!customerPhone.trim() ||
			!shippingStreet.trim() ||
			!shippingCity.trim() ||
			!shippingState.trim() ||
			!shippingPincode.trim()
		) {
			toast.error("Please fill in all required fields.");
			return;
		}

		if (customerPhone.length < 10) {
			toast.error("Please enter a valid 10-digit phone number.");
			return;
		}

		if (shippingPincode.length !== 6) {
			toast.error("Please enter a valid 6-digit Pincode.");
			return;
		}

		try {
			setSubmitting(true);

			// Format items for backend request DTO
			const items = cartItems.map((item) => ({
				variant_id: item.variant.id,
				quantity: item.quantity,
			}));

			const orderPayload: CreateOrderRequest = {
				customer_name: customerName,
				customer_email: customerEmail,
				customer_phone: customerPhone,
				items,
				shipping_address: {
					full_name: customerName, // Recipient matches customer for guest checkout
					phone: customerPhone,
					street: shippingStreet,
					city: shippingCity,
					state: shippingState,
					pincode: shippingPincode,
				},
			};

			const orderResponse = await orderService.createOrder(orderPayload);
			setSuccessOrder(orderResponse);
			clearCart(); // Clear local state cart
			toast.success("Order placed successfully!");
		} catch (err: any) {
			console.error("Order submission error:", err);
			toast.error(err.response?.data?.error || "Failed to place order. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	// Order Success Receipt Screen
	if (successOrder) {
		const orderDate = new Date().toLocaleDateString("en-IN", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		return (
			<div className="max-w-3xl mx-auto px-6 py-16 text-center">
				<div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 border border-emerald-100">
					<CheckCircle className="w-10 h-10" />
				</div>
				<h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">Order Placed Successfully!</h1>
				<p className="mt-3 text-gray-500">Thank you for your order. We are preparing to bake your fresh Thekuas.</p>

				{/* Receipt Card */}
				<div className="bg-white border rounded-2xl p-6 md:p-8 mt-10 text-left shadow-sm space-y-6">
					<div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 gap-2">
						<div>
							<span className="text-xs text-gray-400 uppercase tracking-wider">Order Number</span>
							<p className="font-extrabold text-neutral-900 text-lg">{successOrder.order_number}</p>
						</div>
						<div className="sm:text-right">
							<span className="text-xs text-gray-400 uppercase tracking-wider">Date</span>
							<p className="font-semibold text-neutral-800">{orderDate}</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
						<div>
							<h3 className="text-sm font-semibold text-neutral-950 flex items-center gap-1.5 mb-2">
								<Truck className="w-4 h-4 text-amber-600" /> Shipping Details
							</h3>
							<p className="text-sm text-neutral-800 font-medium">{successOrder.customer_name}</p>
							<p className="text-sm text-gray-500 mt-1">{successOrder.shipping_address?.street}</p>
							<p className="text-sm text-gray-500">
								{successOrder.shipping_address?.city}, {successOrder.shipping_address?.state} -{" "}
								{successOrder.shipping_address?.pincode}
							</p>
							<p className="text-sm text-gray-500 mt-1">Phone: {successOrder.customer_phone}</p>
						</div>

						<div>
							<h3 className="text-sm font-semibold text-neutral-950 flex items-center gap-1.5 mb-2">
								<Calendar className="w-4 h-4 text-blue-600" /> Delivery Estimate
							</h3>
							<p className="text-sm text-gray-600">Standard Delivery (4-7 business days)</p>
							<p className="text-xs text-gray-400 mt-2">A confirmation email has been sent to {successOrder.customer_email}.</p>
						</div>
					</div>

					{/* Summary items */}
					<div>
						<h3 className="text-sm font-semibold text-neutral-950 mb-3">Order Details</h3>
						<div className="space-y-2.5">
							{successOrder.items?.map((item: any) => (
								<div key={item.id} className="flex justify-between text-sm">
									<span className="text-gray-600">
										Product ID {item.id} <span className="text-xs text-gray-400">x{item.quantity}</span>
									</span>
									<span className="font-semibold text-neutral-900">₹{item.price * item.quantity}</span>
								</div>
							))}
							<div className="border-t pt-3 flex justify-between font-bold text-base text-neutral-950">
								<span>Total Paid</span>
								<span>₹{successOrder.total_amount}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
					<Link
						to={`/track-order?orderNumber=${successOrder.order_number}&phone=${successOrder.customer_phone}`}
						className="bg-black text-white px-8 py-3.5 rounded-xl font-bold hover:bg-neutral-800 transition text-center text-sm shadow-md"
					>
						Track Order Status
					</Link>
					<Link
						to="/"
						className="border border-neutral-200 text-neutral-700 bg-white px-8 py-3.5 rounded-xl font-semibold hover:bg-neutral-50 transition text-center text-sm"
					>
						Continue Shopping
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
			{/* Back Link */}
			<Link to="/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition mb-8">
				<ArrowLeft className="w-4 h-4" /> Back to Cart
			</Link>

			<h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-8">Checkout</h1>

			<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
				{/* Checkout Form */}
				<div className="lg:col-span-2 space-y-8 bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-sm">
					{/* Customer Details */}
					<div>
						<h2 className="text-lg font-bold text-neutral-900 border-b pb-3 mb-5">1. Contact Information</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
								<input
									type="text"
									required
									value={customerName}
									onChange={(e) => setCustomerName(e.target.value)}
									placeholder="John Doe"
									className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address *</label>
								<input
									type="email"
									required
									value={customerEmail}
									onChange={(e) => setCustomerEmail(e.target.value)}
									placeholder="john@example.com"
									className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number *</label>
								<input
									type="tel"
									required
									pattern="[0-9]{10}"
									value={customerPhone}
									onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
									placeholder="10-digit mobile number"
									className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
								/>
							</div>
						</div>
					</div>

					{/* Shipping Address */}
					<div>
						<h2 className="text-lg font-bold text-neutral-900 border-b pb-3 mb-5">2. Shipping Address</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="md:col-span-3">
								<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Street Address *</label>
								<input
									type="text"
									required
									value={shippingStreet}
									onChange={(e) => setShippingStreet(e.target.value)}
									placeholder="House No, Street, Locality"
									className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">City *</label>
								<input
									type="text"
									required
									value={shippingCity}
									onChange={(e) => setShippingCity(e.target.value)}
									placeholder="e.g. Patna"
									className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">State *</label>
								<input
									type="text"
									required
									value={shippingState}
									onChange={(e) => setShippingState(e.target.value)}
									placeholder="e.g. Bihar"
									className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pincode *</label>
								<input
									type="text"
									required
									pattern="[0-9]{6}"
									value={shippingPincode}
									onChange={(e) => setShippingPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
									placeholder="6-digit PIN"
									className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
								/>
							</div>
						</div>
					</div>

					{/* Payment Method Option */}
					<div>
						<h2 className="text-lg font-bold text-neutral-900 border-b pb-3 mb-5">3. Payment Method</h2>
						<div className="border border-black bg-neutral-950 text-white rounded-xl p-4 flex items-center justify-between shadow-sm">
							<div className="flex items-center gap-3">
								<CreditCard className="w-5 h-5 text-amber-500" />
								<div>
									<p className="text-sm font-bold">Cash on Delivery (COD)</p>
									<p className="text-[10px] text-gray-400">Pay cash when we deliver to your doorstep</p>
								</div>
							</div>
							<span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2 py-1 rounded border border-amber-500/30">
								Default
							</span>
						</div>
					</div>
				</div>

				{/* Order Summary Sidebar */}
				<div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
					<h2 className="text-lg font-bold text-neutral-900 pb-4 border-b">Order Summary</h2>

					{/* Cart Items List Mini */}
					<div className="divide-y max-h-60 overflow-y-auto mb-4">
						{cartItems.map((item) => {
							const mainImage =
								item.product.images?.find((img) => img.is_main)?.image_url || item.product.images?.[0]?.image_url || "";
							return (
								<div key={item.variant.id} className="flex justify-between py-3 gap-3">
									<div className="flex gap-2.5 items-center">
										<img src={mainImage} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
										<div>
											<p className="text-xs font-bold text-neutral-900 line-clamp-1">{item.product.name}</p>
											<p className="text-[10px] text-gray-400 mt-0.5">
												Qty: {item.quantity} | {item.variant.weight}
											</p>
										</div>
									</div>
									<span className="text-xs font-bold text-neutral-950 shrink-0">₹{item.variant.price * item.quantity}</span>
								</div>
							);
						})}
					</div>

					<div className="space-y-2 border-t pt-4 text-xs text-gray-600">
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span className="font-semibold text-neutral-950">₹{cartTotal}</span>
						</div>
						<div className="flex justify-between">
							<span>Delivery</span>
							<span className="font-semibold text-neutral-950">{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
						</div>
					</div>

					<div className="border-t mt-4 pt-4 flex justify-between items-baseline pb-2">
						<span className="font-bold text-neutral-900 text-sm">Total Amount</span>
						<span className="text-xl font-black text-neutral-950">₹{finalTotal}</span>
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="w-full mt-4 flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm active:scale-[0.98]"
					>
						{submitting ? (
							<>
								<svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
								</svg>
								Placing Order...
							</>
						) : (
							<>Place Order (COD)</>
						)}
					</button>

					<div className="mt-6 flex flex-col gap-2.5 text-[10px] text-gray-400 border-t pt-4">
						<div className="flex items-center gap-2">
							<Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
							<span>Payments are secured & trusted.</span>
						</div>
						<div className="flex items-center gap-2">
							<ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
							<span>100% Homemade and freshly prepared.</span>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}