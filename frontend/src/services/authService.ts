import { api } from "./api";
import type { LoginRequest, RegisterRequest } from "../types/auth";

export const authService = {
	async login(payload: LoginRequest) {
		const response = await api.post("/auth/login", payload);
		return response.data;
	},

	async register(payload: RegisterRequest) {
		const response = await api.post("/auth/register", payload);
		return response.data;
	},

	async adminLogin(payload: LoginRequest) {
		const response = await api.post("/auth/admin-login", payload);
		return response.data;
	},
};
