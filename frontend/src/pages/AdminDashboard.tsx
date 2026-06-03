import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import type { CreateProductRequest, UpdateProductRequest, ProductVariantRequest } from "../services/adminService";
import { api } from "../services/api";
import { Package, Plus, Trash2, Edit, X, Settings, ShoppingBag, PlusCircle, Check, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Variant {
	id: number;
	weight: string;
	price: number;
	stock: number;
}

interface Image {
	id: number;
	image_url: string;
	is_main: boolean;
}

interface Product {
	id: number;
	name: string;
	slug: string;
	description: string;
	category: string;
	is_featured: boolean;
	variants?: Variant[];
	images?: Image[];
}

interface OrderItem {
	id: number;
	variant_id: number;
	quantity: number;
	price: number;
}

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
	items?: OrderItem[];
}

export default function AdminDashboard() {
	const { user, isAdmin, logout } = useAuth();
	const navigate = useNavigate();

	const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
	const [products, setProducts] = useState<Product[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [loadingProducts, setLoadingProducts] = useState(false);
	const [loadingOrders, setLoadingOrders] = useState(false);

	// Modal and form states
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [productForm, setProductForm] = useState<CreateProductRequest>({
		name: "",
		slug: "",
		description: "",
		category: "Wheat",
		is_featured: false,
	});

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newVariantForm, setNewVariantForm] = useState<ProductVariantRequest>({
		weight: "",
		price: 0,
		stock: 0,
	});
	const [activeProductForVariant, setActiveProductForVariant] = useState<number | null>(null);

	// Variant editing state
	const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
	const [variantEditForm, setVariantEditForm] = useState<ProductVariantRequest>({
		weight: "",
		price: 0,
		stock: 0,
	});

	// Check Admin authorization
	useEffect(() => {
		if (!isAdmin) {
			toast.error("Unauthorized! Admins only.");
			navigate("/login");
		}
	}, [isAdmin, navigate]);

	// Fetch Products & Orders
	useEffect(() => {
		if (isAdmin) {
			fetchProducts();
			fetchOrders();
		}
	}, [isAdmin]);

	const fetchProducts = async () => {
		try {
			setLoadingProducts(true);
			const response = await api.get("/products");
			// The backend response format is { products: [...] }
			if (response.data && response.data.products) {
				setProducts(response.data.products);
			} else {
				setProducts([]);
			}
		} catch (err) {
			console.error("Error fetching products:", err);
			toast.error("Failed to fetch products.");
		} finally {
			setLoadingProducts(false);
		}
	};

	const fetchOrders = async () => {
		try {
			setLoadingOrders(true);
			const data = await adminService.listOrders();
			if (data && data.orders) {
				setOrders(data.orders);
			} else {
				setOrders([]);
			}
		} catch (err) {
			console.error("Error fetching orders:", err);
			toast.error("Failed to load admin orders.");
		} finally {
			setLoadingOrders(false);
		}
	};

	// -------------------------------------------------------------
	// Product Actions
	// -------------------------------------------------------------
	const handleCreateProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await adminService.createProduct(productForm);
			toast.success("Product created! Now add variants.");
			setIsCreateModalOpen(false);
			setProductForm({ name: "", slug: "", description: "", category: "Wheat", is_featured: false });
			fetchProducts();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to create product.");
		}
	};

	const handleUpdateProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingProduct) return;

		try {
			const updatePayload: UpdateProductRequest = {
				name: productForm.name,
				description: productForm.description,
				category: productForm.category,
				is_featured: productForm.is_featured,
			};
			await adminService.updateProduct(editingProduct.id, updatePayload);
			toast.success("Product updated successfully!");
			setEditingProduct(null);
			fetchProducts();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to update product.");
		}
	};

	const handleDeleteProduct = async (id: number) => {
		if (!window.confirm("Are you sure you want to delete this product? All variants will be deleted.")) return;

		try {
			await adminService.deleteProduct(id);
			toast.success("Product deleted successfully.");
			fetchProducts();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to delete product.");
		}
	};

	// -------------------------------------------------------------
	// Variant Actions
	// -------------------------------------------------------------
	const handleAddVariant = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!activeProductForVariant) return;

		try {
			await adminService.createVariant(activeProductForVariant, newVariantForm);
			toast.success("Variant created successfully!");
			setActiveProductForVariant(null);
			setNewVariantForm({ weight: "", price: 0, stock: 0 });
			fetchProducts();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to add variant.");
		}
	};

	const handleStartEditVariant = (variant: Variant) => {
		setEditingVariantId(variant.id);
		setVariantEditForm({
			weight: variant.weight,
			price: variant.price,
			stock: variant.stock,
		});
	};

	const handleSaveVariant = async (variantId: number) => {
		try {
			await adminService.updateVariant(variantId, variantEditForm);
			toast.success("Variant price and stock updated!");
			setEditingVariantId(null);
			fetchProducts();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to update variant.");
		}
	};

	const handleDeleteVariant = async (variantId: number) => {
		if (!window.confirm("Delete this variant?")) return;

		try {
			await adminService.deleteVariant(variantId);
			toast.success("Variant deleted.");
			fetchProducts();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to delete variant.");
		}
	};

	// -------------------------------------------------------------
	// Order Actions
	// -------------------------------------------------------------
	const handleStatusChange = async (orderId: number, newStatus: string) => {
		try {
			await adminService.updateOrderStatus(orderId, newStatus);
			toast.success(`Order status updated to ${newStatus}`);
			fetchOrders();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to update order status.");
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
			{/* Admin Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 mb-8 gap-4">
				<div>
					<h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
						<Settings className="w-8 h-8 text-amber-600 animate-spin-slow" />
						Admin Portal
					</h1>
					<p className="text-sm text-gray-500 mt-1">
						Welcome, <span className="font-bold text-neutral-800">{user?.name}</span> • Manage store inventory and orders.
					</p>
				</div>
				<button
					onClick={logout}
					className="bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-700 font-bold px-4 py-2 rounded-xl transition text-xs cursor-pointer border border-neutral-200"
				>
					Sign Out
				</button>
			</div>

			{/* Tabs Navigation */}
			<div className="flex border-b border-neutral-200 mb-8 gap-1 bg-neutral-100/60 p-1 rounded-2xl max-w-sm">
				<button
					onClick={() => setActiveTab("products")}
					className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer w-1/2 justify-center ${
						activeTab === "products"
							? "bg-white text-black shadow-sm"
							: "text-neutral-500 hover:text-neutral-800"
					}`}
				>
					<Package className="w-4 h-4" />
					Inventory
				</button>
				<button
					onClick={() => setActiveTab("orders")}
					className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer w-1/2 justify-center ${
						activeTab === "orders"
							? "bg-white text-black shadow-sm"
							: "text-neutral-500 hover:text-neutral-800"
					}`}
				>
					<ShoppingBag className="w-4 h-4" />
					Orders
				</button>
			</div>

			{/* ------------------------------------------------------------- */}
			{/* Inventory Tab */}
			{/* ------------------------------------------------------------- */}
			{activeTab === "products" && (
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-black text-neutral-900 tracking-tight">Manage Sweets & Variants</h2>
						<button
							onClick={() => {
								setProductForm({ name: "", slug: "", description: "", category: "Wheat", is_featured: false });
								setEditingProduct(null);
								setIsCreateModalOpen(true);
							}}
							className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
						>
							<Plus className="w-4 h-4" /> Add Product
						</button>
					</div>

					{loadingProducts ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{[1, 2].map((n) => (
								<div key={n} className="bg-neutral-50 border h-64 rounded-3xl animate-pulse"></div>
							))}
						</div>
					) : products.length === 0 ? (
						<div className="text-center py-16 border border-dashed rounded-3xl bg-neutral-50 text-neutral-400">
							<AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
							<p className="text-sm font-semibold">No products found. Click "Add Product" to get started.</p>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{products.map((product) => {
								const mainImg = product.images?.find((img) => img.is_main)?.image_url || product.images?.[0]?.image_url;
								return (
									<div key={product.id} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
										<div>
											<div className="flex justify-between items-start gap-4 mb-4">
												<div className="flex items-center gap-3">
													{mainImg ? (
														<img src={mainImg} alt={product.name} className="w-14 h-14 rounded-2xl object-cover border border-neutral-200" />
													) : (
														<div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center border font-bold text-xs">
															Sweet
														</div>
													)}
													<div>
														<h3 className="text-base font-extrabold text-neutral-900 leading-tight">{product.name}</h3>
														<span className="inline-block bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
															{product.category}
														</span>
														{product.is_featured && (
															<span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full ml-1">
																Featured
															</span>
														)}
													</div>
												</div>
												<div className="flex gap-2">
													<button
														onClick={() => {
															setEditingProduct(product);
															setProductForm({
																name: product.name,
																slug: product.slug,
																description: product.description,
																category: product.category,
																is_featured: product.is_featured,
															});
														}}
														className="text-neutral-500 hover:text-black p-1.5 hover:bg-neutral-50 rounded-lg transition cursor-pointer"
														title="Edit Details"
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDeleteProduct(product.id)}
														className="text-neutral-400 hover:text-red-600 p-1.5 hover:bg-neutral-50 rounded-lg transition cursor-pointer"
														title="Delete Product"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</div>
											<p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">{product.description}</p>

											{/* Variants Inventory */}
											<div className="border-t border-neutral-100 pt-4">
												<div className="flex justify-between items-center mb-3">
													<h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Inventory & Weights</h4>
													<button
														onClick={() => setActiveProductForVariant(product.id)}
														className="text-amber-800 hover:text-amber-900 font-bold text-xs flex items-center gap-1 cursor-pointer"
													>
														<PlusCircle className="w-3.5 h-3.5" /> Add Weight
													</button>
												</div>

												{/* Variants List */}
												<div className="space-y-2.5">
													{product.variants && product.variants.length > 0 ? (
														product.variants.map((v) => {
															const isEditing = editingVariantId === v.id;
															return (
																<div key={v.id} className="flex justify-between items-center p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 text-xs">
																	{isEditing ? (
																		<div className="grid grid-cols-3 gap-2 w-full pr-2">
																			<div>
																				<label className="block text-[9px] text-gray-400 font-bold mb-0.5">Weight</label>
																				<input
																					type="text"
																					value={variantEditForm.weight}
																					onChange={(e) => setVariantEditForm({ ...variantEditForm, weight: e.target.value })}
																					className="w-full border rounded px-1.5 py-0.5 bg-white font-bold"
																				/>
																			</div>
																			<div>
																				<label className="block text-[9px] text-gray-400 font-bold mb-0.5">Price (₹)</label>
																				<input
																					type="number"
																					value={variantEditForm.price}
																					onChange={(e) => setVariantEditForm({ ...variantEditForm, price: parseFloat(e.target.value) || 0 })}
																					className="w-full border rounded px-1.5 py-0.5 bg-white font-bold"
																				/>
																			</div>
																			<div>
																				<label className="block text-[9px] text-gray-400 font-bold mb-0.5">Stock (Qty)</label>
																				<input
																					type="number"
																					value={variantEditForm.stock}
																					onChange={(e) => setVariantEditForm({ ...variantEditForm, stock: parseInt(e.target.value) || 0 })}
																					className="w-full border rounded px-1.5 py-0.5 bg-white font-bold"
																				/>
																			</div>
																		</div>
																	) : (
																		<div className="flex gap-4 items-center">
																			<span className="font-extrabold text-neutral-800">{v.weight}</span>
																			<span className="text-gray-400">|</span>
																			<span className="font-semibold text-neutral-700">₹{v.price}</span>
																			<span className="text-gray-400">|</span>
																			<span className={`font-extrabold ${v.stock === 0 ? "text-red-500" : "text-emerald-700"}`}>
																				{v.stock === 0 ? "Out of Stock" : `${v.stock} units`}
																			</span>
																		</div>
																	)}

																	{/* Actions */}
																	<div className="flex gap-1">
																		{isEditing ? (
																			<>
																				<button
																					onClick={() => handleSaveVariant(v.id)}
																					className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded cursor-pointer"
																				>
																					<Check className="w-4 h-4" />
																				</button>
																				<button
																					onClick={() => setEditingVariantId(null)}
																					className="text-neutral-400 hover:text-neutral-600 p-1 hover:bg-neutral-100 rounded cursor-pointer"
																				>
																					<X className="w-4 h-4" />
																				</button>
																			</>
																		) : (
																			<>
																				<button
																					onClick={() => handleStartEditVariant(v)}
																					className="text-neutral-500 hover:text-black p-1 hover:bg-white rounded cursor-pointer"
																					title="Edit Variant"
																				>
																					<Edit className="w-3.5 h-3.5" />
																				</button>
																				<button
																					onClick={() => handleDeleteVariant(v.id)}
																					className="text-neutral-400 hover:text-red-600 p-1 hover:bg-white rounded cursor-pointer"
																					title="Delete Variant"
																				>
																					<Trash2 className="w-3.5 h-3.5" />
																				</button>
																			</>
																		)}
																	</div>
																</div>
															);
														})
													) : (
														<p className="text-xs text-neutral-400 italic">No variants added yet.</p>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* ------------------------------------------------------------- */}
			{/* Orders Tab */}
			{/* ------------------------------------------------------------- */}
			{activeTab === "orders" && (
				<div className="space-y-6">
					<h2 className="text-xl font-black text-neutral-900 tracking-tight">Order Status Updates</h2>

					{loadingOrders ? (
						<div className="space-y-4">
							{[1, 2].map((n) => (
								<div key={n} className="bg-neutral-50 h-24 rounded-2xl animate-pulse"></div>
							))}
						</div>
					) : orders.length === 0 ? (
						<div className="text-center py-16 border border-dashed rounded-3xl bg-neutral-50 text-neutral-400">
							<AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
							<p className="text-sm font-semibold">No customer orders recorded yet.</p>
						</div>
					) : (
						<div className="border border-neutral-200 rounded-3xl overflow-hidden bg-white shadow-sm">
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs border-collapse">
									<thead>
										<tr className="bg-neutral-50 text-gray-500 font-extrabold uppercase border-b border-neutral-100">
											<th className="px-6 py-4">Order Number</th>
											<th className="px-6 py-4">Customer Details</th>
											<th className="px-6 py-4">Date Placed</th>
											<th className="px-6 py-4">Total Amount</th>
											<th className="px-6 py-4">Payment</th>
											<th className="px-6 py-4">Order Status</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-neutral-100">
										{orders.map((order) => (
											<tr key={order.id} className="hover:bg-neutral-50/50">
												<td className="px-6 py-4 font-extrabold text-neutral-900">{order.order_number}</td>
												<td className="px-6 py-4 space-y-0.5">
													<p className="font-bold text-neutral-800">{order.customer_name}</p>
													<p className="text-gray-400 text-[10px]">{order.customer_email} • {order.customer_phone}</p>
												</td>
												<td className="px-6 py-4 text-neutral-600">
													{new Date(order.created_at).toLocaleDateString("en-IN", {
														day: "numeric",
														month: "short",
														year: "numeric",
													})}
												</td>
												<td className="px-6 py-4 font-bold text-neutral-900">₹{order.total_amount}</td>
												<td className="px-6 py-4">
													<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
														order.payment_status.toLowerCase() === "paid"
															? "bg-emerald-50 border-emerald-100 text-emerald-800"
															: "bg-amber-50 border-amber-100 text-amber-800"
													}`}>
														{order.payment_status}
													</span>
												</td>
												<td className="px-6 py-4">
													<select
														value={order.order_status}
														onChange={(e) => handleStatusChange(order.id, e.target.value)}
														className="border border-neutral-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:border-black bg-white cursor-pointer"
													>
														<option value="pending">Pending</option>
														<option value="confirmed">Confirmed</option>
														<option value="preparing">Preparing</option>
														<option value="shipped">Shipped</option>
														<option value="out_for_delivery">Out for Delivery</option>
														<option value="delivered">Delivered</option>
														<option value="cancelled">Cancelled</option>
													</select>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}

			{/* ------------------------------------------------------------- */}
			{/* Product Modal (Create / Edit Details) */}
			{/* ------------------------------------------------------------- */}
			{(isCreateModalOpen || editingProduct) && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
					<div className="bg-white border rounded-3xl max-w-lg w-full p-6 md:p-8 relative shadow-2xl">
						<button
							onClick={() => {
								setIsCreateModalOpen(false);
								setEditingProduct(null);
							}}
							className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
						>
							<X className="w-5 h-5" />
						</button>

						<h3 className="text-xl font-black text-neutral-900 mb-6">
							{editingProduct ? `Edit ${editingProduct.name}` : "Create New Product"}
						</h3>

						<form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
							<div>
								<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Name</label>
								<input
									type="text"
									required
									value={productForm.name}
									onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
									placeholder="e.g. Dry Fruit Thekua"
									className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
								/>
							</div>

							{!editingProduct && (
								<div>
									<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Slug (Unique Path ID)</label>
									<input
										type="text"
										required
										value={productForm.slug}
										onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
										placeholder="e.g. dry-fruit-thekua"
										className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
									/>
								</div>
							)}

							<div>
								<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
								<select
									value={productForm.category}
									onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
									className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
								>
									<option value="Wheat">Wheat</option>
									<option value="Jaggery">Jaggery</option>
									<option value="Sugar Free">Sugar Free</option>
									<option value="Special Mix">Special Mix</option>
								</select>
							</div>

							<div>
								<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
								<textarea
									required
									rows={3}
									value={productForm.description}
									onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
									placeholder="Describe the sweet ingredients and texture..."
									className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
								></textarea>
							</div>

							<div className="flex items-center gap-2 pt-2">
								<input
									type="checkbox"
									id="is_featured"
									checked={productForm.is_featured}
									onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
									className="accent-black h-4 w-4 rounded cursor-pointer"
								/>
								<label htmlFor="is_featured" className="text-xs font-bold text-neutral-700 cursor-pointer select-none">
									Display on Homepage (Featured Product)
								</label>
							</div>

							<div className="flex gap-3 pt-6">
								<button
									type="submit"
									className="flex-1 bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl text-sm transition cursor-pointer"
								>
									{editingProduct ? "Save Changes" : "Create Product"}
								</button>
								<button
									type="button"
									onClick={() => {
										setIsCreateModalOpen(false);
										setEditingProduct(null);
									}}
									className="flex-1 border border-neutral-200 text-neutral-600 font-semibold py-3.5 rounded-xl text-sm hover:bg-neutral-50 transition cursor-pointer"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ------------------------------------------------------------- */}
			{/* Add Variant Modal */}
			{/* ------------------------------------------------------------- */}
			{activeProductForVariant !== null && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
					<div className="bg-white border rounded-3xl max-w-sm w-full p-6 relative shadow-2xl">
						<button
							onClick={() => setActiveProductForVariant(null)}
							className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
						>
							<X className="w-5 h-5" />
						</button>

						<h3 className="text-lg font-black text-neutral-900 mb-6">Add Weight Variant</h3>

						<form onSubmit={handleAddVariant} className="space-y-4">
							<div>
								<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Weight (Weight/Size)</label>
								<input
									type="text"
									required
									placeholder="e.g. 500g, 1kg, 250g"
									value={newVariantForm.weight}
									onChange={(e) => setNewVariantForm({ ...newVariantForm, weight: e.target.value })}
									className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
								/>
							</div>

							<div>
								<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
								<input
									type="number"
									required
									min="1"
									value={newVariantForm.price || ""}
									onChange={(e) => setNewVariantForm({ ...newVariantForm, price: parseFloat(e.target.value) || 0 })}
									placeholder="e.g. 299"
									className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
								/>
							</div>

							<div>
								<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Initial Stock Quantity</label>
								<input
									type="number"
									required
									min="0"
									value={newVariantForm.stock || "0"}
									onChange={(e) => setNewVariantForm({ ...newVariantForm, stock: parseInt(e.target.value) || 0 })}
									placeholder="e.g. 50"
									className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
								/>
							</div>

							<div className="flex gap-3 pt-6">
								<button
									type="submit"
									className="flex-1 bg-black hover:bg-neutral-800 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
								>
									Add Variant
								</button>
								<button
									type="button"
									onClick={() => setActiveProductForVariant(null)}
									className="flex-1 border border-neutral-200 text-neutral-600 font-semibold py-3 rounded-xl text-xs hover:bg-neutral-50 transition cursor-pointer"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
