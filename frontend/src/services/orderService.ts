import { api } from "./api";

export interface AddressRequest {
	full_name: string;
	phone: string;
	street: string;
	city: string;
	state: string;
	pincode: string;
}

export interface OrderItemRequest {
	variant_id: number;
	quantity: number;
}

export interface CreateOrderRequest {
	items: OrderItemRequest[];
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	shipping_address: AddressRequest;
}

export const orderService = {
	async createOrder(request: CreateOrderRequest) {
		const response = await api.post("/orders", request);
		return response.data;
	},

	async getOrder(id: string) {
		const response = await api.get(`/orders/${id}`);
		return response.data;
	},

	async trackOrder(orderNumber: string, phone: string) {
		const response = await api.get(`/orders/track/${orderNumber}?phone=${phone}`);
		return response.data;
	},

	async getCustomerOrders(email: string) {
		const response = await api.get(`/orders/customer?email=${email}`);
		return response.data;
	},
};
