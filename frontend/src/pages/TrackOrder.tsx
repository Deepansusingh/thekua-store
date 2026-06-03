import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { orderService } from "../services/orderService";
import { Search, MapPin, Phone, Package, CheckCircle, Clock, Truck, ShieldCheck, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface OrderItem {
	id: number;
	variant_id: number;
	quantity: number;
	price: number;
}

interface OrderAddress {
	full_name: string;
	phone: string;
	street: string;
	city: string;
	state: string;
	pincode: string;
}

interface OrderData {
	id: number;
	order_number: string;
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	shipping_address: any;
	total_amount: number;
	payment_status: string;
	order_status: string;
	created_at: string;
	items?: OrderItem[];
}

export default function TrackOrder() {
	const [searchParams] = useSearchParams();

	const [orderNumber, setOrderNumber] = useState("");
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [order, setOrder] = useState<OrderData | null>(null);

	// Pre-populate fields from search query
	useEffect(() => {
		const queryOrder = searchParams.get("orderNumber");
		const queryPhone = searchParams.get("phone");
		if (queryOrder) {
			setOrderNumber(queryOrder);
		}
		if (queryPhone) {
			setPhone(queryPhone);
		}
	}, [searchParams]);

	// Auto-track if both fields are prefilled in search query
	useEffect(() => {
		const queryOrder = searchParams.get("orderNumber");
		const queryPhone = searchParams.get("phone");
		if (queryOrder && queryPhone) {
			handleTrack(queryOrder, queryPhone);
		}
	}, [searchParams]);

	const handleTrack = async (num: string, ph: string) => {
		if (!num.trim()) {
			toast.error("Please enter a valid order number.");
			return;
		}
		if (!ph.trim()) {
			toast.error("Please enter the associated phone number.");
			return;
		}

		try {
			setLoading(true);
			setOrder(null);
			const data = await orderService.trackOrder(num.trim(), ph.trim());
			setOrder(data);
			toast.success("Order retrieved successfully!");
		} catch (err: any) {
			console.error("Tracking error:", err);
			toast.error(err.response?.data?.error || "Order not found. Please check details.");
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleTrack(orderNumber, phone);
	};

	// Parse shipping address safely
	const getParsedAddress = (addr: any): OrderAddress | null => {
		if (!addr) return null;
		if (typeof addr === "string") {
			try {
				return JSON.parse(addr);
			} catch {
				return null;
			}
		}
		return addr as OrderAddress;
	};

	const parsedAddress = order ? getParsedAddress(order.shipping_address) : null;

	// Calculate Stepper Index
	const getStatusStepIndex = (status: string): number => {
		switch (status.toLowerCase()) {
			case "pending":
			case "confirmed":
				return 0;
			case "preparing":
				return 1;
			case "shipped":
			case "out_for_delivery":
				return 2;
			case "delivered":
				return 3;
			default:
				return 0;
		}
	};

	const stepIndex = order ? getStatusStepIndex(order.order_status) : 0;
	const isCancelled = order?.order_status.toLowerCase() === "cancelled";

	const steps = [
		{ label: "Order Placed", desc: "We've received your order", icon: Clock },
		{ label: "Preparing", desc: "Baking fresh custom batches", icon: Package },
		{ label: "Shipped", desc: "Order is on its way", icon: Truck },
		{ label: "Delivered", desc: "Enjoy your fresh sweets!", icon: ShieldCheck },
	];

	return (
		<div className="max-w-4xl mx-auto px-6 py-8 md:py-16">
			{/* Header */}
			<div className="text-center mb-10">
				<h1 className="text-3xl font-black text-neutral-900 tracking-tight">Track Your Order</h1>
				<p className="text-sm text-gray-500 mt-2">Enter your order details below to monitor delivery progress</p>
			</div>

			{/* Tracking Search Card */}
			<div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm mb-10">
				<form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
					<div>
						<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Order Number</label>
						<input
							type="text"
							required
							placeholder="e.g. ORD-123456"
							value={orderNumber}
							onChange={(e) => setOrderNumber(e.target.value)}
							className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-neutral-50"
						/>
					</div>

					<div>
						<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Associated Phone Number</label>
						<input
							type="tel"
							required
							placeholder="10-digit mobile number"
							value={phone}
							onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
							className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-neutral-50"
						/>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="w-full flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-xl transition cursor-pointer text-sm"
						>
							<Search className="w-4 h-4" />
							{loading ? "Searching..." : "Track Status"}
						</button>
					</div>
				</form>
			</div>

			{/* Tracking Results */}
			{order && (
				<div className="space-y-8 animate-fadeIn">
					{/* Status Alert Banner */}
					<div
						className={`rounded-2xl p-5 border flex items-start gap-4 ${
							isCancelled
								? "bg-red-50 border-red-200 text-red-800"
								: order.order_status.toLowerCase() === "delivered"
								? "bg-emerald-50 border-emerald-200 text-emerald-800"
								: "bg-amber-50 border-amber-200 text-amber-900"
						}`}
					>
						{isCancelled ? (
							<XCircle className="w-6 h-6 shrink-0 mt-0.5" />
						) : order.order_status.toLowerCase() === "delivered" ? (
							<CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
						) : (
							<Clock className="w-6 h-6 shrink-0 mt-0.5" />
						)}
						<div>
							<h3 className="font-extrabold text-sm uppercase tracking-wider">
								Status: {order.order_status}
							</h3>
							<p className="text-xs mt-1 opacity-90">
								{isCancelled
									? "This order has been cancelled. Please reach out to support for queries."
									: order.order_status.toLowerCase() === "delivered"
									? "Your order has been delivered successfully. Thank you for shopping with us!"
									: "Your freshly crafted order is currently in progress. We'll update you as it ships."}
							</p>
						</div>
					</div>

					{/* Stepper Timeline (Only if not cancelled) */}
					{!isCancelled && (
						<div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm">
							<h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-8">Delivery Progress</h2>
							<div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
								{/* Horizontal line for desktop stepper */}
								<div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-neutral-100 z-0">
									<div
										className="h-full bg-amber-600 transition-all duration-500"
										style={{ width: `${(stepIndex / 3) * 100}%` }}
									></div>
								</div>

								{steps.map((step, idx) => {
									const StepIcon = step.icon;
									const isCompleted = idx <= stepIndex;
									const isActive = idx === stepIndex;

									return (
										<div key={idx} className="flex md:flex-col items-center gap-4 md:text-center z-10">
											<div
												className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
													isCompleted
														? "bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/25"
														: "bg-white border-neutral-200 text-neutral-400"
												} ${isActive ? "scale-105 ring-4 ring-amber-100" : ""}`}
											>
												<StepIcon className="w-6 h-6" />
											</div>
											<div>
												<h4 className={`text-sm font-extrabold tracking-tight ${isCompleted ? "text-neutral-900" : "text-gray-400"}`}>
													{step.label}
												</h4>
												<p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Order Info & Summary Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Left / Center: Order Items & Delivery Details */}
						<div className="md:col-span-2 space-y-6">
							{/* Order Items */}
							<div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
								<h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
									<Package className="w-4 h-4" /> Ordered Items
								</h3>
								<div className="divide-y divide-neutral-100">
									{order.items && order.items.length > 0 ? (
										order.items.map((item) => (
											<div key={item.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
												<div>
													<h4 className="text-sm font-bold text-neutral-900">
														Product Variant ID: {item.variant_id}
													</h4>
													<p className="text-xs text-gray-400 mt-0.5">
														Price: ₹{item.price} • Qty: {item.quantity}
													</p>
												</div>
												<span className="text-sm font-extrabold text-neutral-900">
													₹{item.price * item.quantity}
												</span>
											</div>
										))
									) : (
										<p className="text-sm text-gray-500 py-2">Item details unavailable.</p>
									)}
								</div>
							</div>

							{/* Delivery Details */}
							{parsedAddress && (
								<div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
									<h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
										<MapPin className="w-4 h-4" /> Shipping Address
									</h3>
									<div className="text-sm space-y-1.5 text-neutral-800">
										<p className="font-extrabold text-neutral-950">{parsedAddress.full_name}</p>
										<p className="opacity-90">{parsedAddress.street}</p>
										<p className="opacity-90">
											{parsedAddress.city}, {parsedAddress.state} - {parsedAddress.pincode}
										</p>
										<p className="pt-2 text-xs flex items-center gap-1.5 text-neutral-500">
											<Phone className="w-3.5 h-3.5" /> {parsedAddress.phone}
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Right: Order Summary Details */}
						<div className="space-y-6">
							<div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
								<h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Summary</h3>
								<div className="text-xs space-y-4">
									<div>
										<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order Number</span>
										<span className="text-sm font-extrabold text-neutral-950 block mt-0.5">{order.order_number}</span>
									</div>

									<div>
										<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order Placed</span>
										<span className="text-sm font-semibold text-neutral-800 block mt-0.5">
											{new Date(order.created_at).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>

									<div>
										<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Payment Status</span>
										<span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 border-amber-100 text-amber-800">
											{order.payment_status}
										</span>
									</div>

									<div className="pt-4 border-t border-neutral-100">
										<div className="flex justify-between items-baseline mb-2">
											<span className="text-gray-400 font-medium">Delivery Charges</span>
											<span className="text-gray-900 font-semibold text-sm">
												{order.total_amount >= 500 ? "FREE" : "₹40"}
											</span>
										</div>
										<div className="flex justify-between items-baseline pt-1">
											<span className="text-gray-900 font-bold">Total paid</span>
											<span className="text-lg font-black text-neutral-950">₹{order.total_amount}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}