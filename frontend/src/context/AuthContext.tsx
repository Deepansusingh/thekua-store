import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth";

interface AuthUser {
	id: number;
	name: string;
	email: string;
	role: string;
}

interface AuthContextType {
	user: AuthUser | null;
	token: string | null;
	login: (payload: LoginRequest) => Promise<AuthResponse>;
	register: (payload: RegisterRequest) => Promise<AuthResponse>;
	adminLogin: (payload: LoginRequest) => Promise<AuthResponse>;
	logout: () => void;
	isAuthenticated: boolean;
	isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Load session on startup
	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			try {
				setToken(storedToken);
				setUser(JSON.parse(storedUser));
			} catch (e) {
				console.error("Failed to parse stored user", e);
				localStorage.removeItem("token");
				localStorage.removeItem("user");
			}
		}
		setLoading(false);
	}, []);

	const login = async (payload: LoginRequest) => {
		const data = await authService.login(payload);
		if (data.token) {
			localStorage.setItem("token", data.token);
			const userData = {
				id: data.id,
				name: data.name,
				email: data.email,
				role: data.role,
			};
			localStorage.setItem("user", JSON.stringify(userData));
			setToken(data.token);
			setUser(userData);
		}
		return data;
	};

	const adminLogin = async (payload: LoginRequest) => {
		const data = await authService.adminLogin(payload);
		if (data.token) {
			localStorage.setItem("token", data.token);
			const userData = {
				id: data.id,
				name: data.name,
				email: data.email,
				role: data.role,
			};
			localStorage.setItem("user", JSON.stringify(userData));
			setToken(data.token);
			setUser(userData);
		}
		return data;
	};

	const register = async (payload: RegisterRequest) => {
		const data = await authService.register(payload);
		if (data.token) {
			localStorage.setItem("token", data.token);
			const userData = {
				id: data.id,
				name: data.name,
				email: data.email,
				role: data.role,
			};
			localStorage.setItem("user", JSON.stringify(userData));
			setToken(data.token);
			setUser(userData);
		}
		return data;
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setToken(null);
		setUser(null);
	};

	const value: AuthContextType = {
		user,
		token,
		login,
		register,
		adminLogin,
		logout,
		isAuthenticated: !!token,
		isAdmin: user?.role === "admin",
	};

	if (loading) {
		return null; // Avoid rendering children before session restore check completes
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
