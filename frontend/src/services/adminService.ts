import { api } from "./api";

export interface CreateProductRequest {
	name: string;
	slug: string;
	description: string;
	category: string;
	is_featured: boolean;
}

export interface UpdateProductRequest {
	name: string;
	description: string;
	category: string;
	is_featured: boolean;
}

export interface ProductVariantRequest {
	weight: string;
	price: number;
	stock: number;
}

export const adminService = {
	async listOrders() {
		const response = await api.get("/admin/orders");
		return response.data;
	},

	async updateOrderStatus(orderId: number, status: string) {
		const response = await api.put(`/admin/orders/${orderId}/status`, { status });
		return response.data;
	},

	async createProduct(payload: CreateProductRequest) {
		const response = await api.post("/admin/products", payload);
		return response.data;
	},

	async updateProduct(productId: number, payload: UpdateProductRequest) {
		const response = await api.put(`/admin/products/${productId}`, payload);
		return response.data;
	},

	async deleteProduct(productId: number) {
		const response = await api.delete(`/admin/products/${productId}`);
		return response.data;
	},

	async createVariant(productId: number, payload: ProductVariantRequest) {
		const response = await api.post(`/admin/products/${productId}/variants`, payload);
		return response.data;
	},

	async updateVariant(variantId: number, payload: ProductVariantRequest) {
		const response = await api.put(`/admin/products/variants/${variantId}`, payload);
		return response.data;
	},

	async deleteVariant(variantId: number) {
		const response = await api.delete(`/admin/products/variants/${variantId}`);
		return response.data;
	},
};
