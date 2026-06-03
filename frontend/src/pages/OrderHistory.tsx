import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { ShoppingBag, Calendar, ArrowRight, Clock, CheckCircle, Truck, Package, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Order {
	id: number;
	order_number: string;
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	total_amount: number;
	payment_status: string;
	order_status: string;
	created_at: string;
}

export default function OrderHistory() {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isAuthenticated || !user?.email) {
			toast.error("Please login to view your order history.");
			navigate("/login");
			return;
		}

		const fetchOrders = async () => {
			try {
				setLoading(true);
				const data = await orderService.getCustomerOrders(user.email);
				setOrders(data || []);
			} catch (err) {
				console.error("Error loading order history:", err);
				toast.error("Failed to load your order history.");
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, [isAuthenticated, user, navigate]);

	const getStatusConfig = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return {
					text: "Pending",
					color: "bg-orange-50 border-orange-100 text-orange-800",
					icon: <Clock className="w-3.5 h-3.5" />,
				};
			case "confirmed":
				return {
					text: "Confirmed",
					color: "bg-blue-50 border-blue-100 text-blue-800",
					icon: <CheckCircle className="w-3.5 h-3.5" />,
				};
			case "preparing":
				return {
					text: "Preparing",
					color: "bg-amber-50 border-amber-100 text-amber-800",
					icon: <Clock className="w-3.5 h-3.5" />,
				};
			case "shipped":
			case "out_for_delivery":
				return {
					text: "In Transit",
					color: "bg-indigo-50 border-indigo-100 text-indigo-800",
					icon: <Truck className="w-3.5 h-3.5" />,
				};
			case "delivered":
				return {
					text: "Delivered",
					color: "bg-emerald-50 border-emerald-100 text-emerald-800",
					icon: <CheckCircle className="w-3.5 h-3.5" />,
				};
			case "cancelled":
				return {
					text: "Cancelled",
					color: "bg-red-50 border-red-100 text-red-800",
					icon: <AlertCircle className="w-3.5 h-3.5" />,
				};
			default:
				return {
					text: status,
					color: "bg-neutral-50 border-neutral-100 text-neutral-800",
					icon: <Package className="w-3.5 h-3.5" />,
				};
		}
	};

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto px-6 py-16 text-center">
				<div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
				<p className="text-sm text-neutral-500 font-semibold">Loading order history...</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-6 py-12 min-h-[75vh]">
			{/* Page Header */}
			<div className="mb-10">
				<h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2.5">
					<ShoppingBag className="w-8 h-8 text-amber-600" />
					Your Orders
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					Review details and live delivery status for all orders under <span className="font-semibold text-neutral-800">{user?.email}</span>.
				</p>
			</div>

			{orders.length === 0 ? (
				<div className="text-center py-20 border border-dashed rounded-3xl bg-neutral-50/50">
					<Package className="w-16 h-16 mx-auto mb-4 text-neutral-300 stroke-[1.5]" />
					<h3 className="text-base font-extrabold text-neutral-800">No Orders Found</h3>
					<p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto">
						You haven't placed any orders yet. Head over to our products page to place your first sweet order!
					</p>
					<Link
						to="/products"
						className="inline-block mt-6 bg-black hover:bg-neutral-800 text-white text-xs font-bold py-3 px-6 rounded-xl transition shadow"
					>
						Browse Products
					</Link>
				</div>
			) : (
				<div className="space-y-6">
					{orders.map((order) => {
						const status = getStatusConfig(order.order_status);
						return (
							<div
								key={order.id}
								className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-3xl p-6 transition shadow-sm hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
							>
								{/* Left: Summary */}
								<div className="space-y-3 flex-1">
									<div className="flex flex-wrap items-center gap-3">
										<span className="font-black text-neutral-900 text-sm tracking-tight">
											{order.order_number}
										</span>
										<span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${status.color}`}>
											{status.icon}
											{status.text}
										</span>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-neutral-500">
										<div className="flex items-center gap-1.5">
											<Calendar className="w-3.5 h-3.5 text-neutral-400" />
											{new Date(order.created_at).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</div>
										<div>
											Total: <span className="font-bold text-neutral-800">₹{order.total_amount}</span>
										</div>
										<div className="col-span-2 md:col-span-1">
											Payment: <span className="font-bold text-neutral-800 uppercase">{order.payment_status}</span>
										</div>
									</div>
								</div>

								{/* Right: Actions */}
								<div>
									<Link
										to={`/track-order?orderNumber=${order.order_number}&phone=${order.customer_phone}`}
										className="flex items-center gap-2 bg-neutral-50 hover:bg-amber-50 hover:text-amber-800 text-neutral-700 font-bold px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-amber-200 transition text-xs shadow-sm cursor-pointer select-none group"
									>
										Track Order
										<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
