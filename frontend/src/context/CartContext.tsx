import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Product, ProductVariant } from "../types/product";

export interface CartItem {
	product: Product;
	variant: ProductVariant;
	quantity: number;
}

interface CartContextType {
	cartItems: CartItem[];
	addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
	removeFromCart: (variantId: number) => void;
	updateQuantity: (variantId: number, quantity: number) => void;
	clearCart: () => void;
	cartCount: number;
	cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [cartItems, setCartItems] = useState<CartItem[]>(() => {
		const stored = localStorage.getItem("cart");
		return stored ? JSON.parse(stored) : [];
	});

	useEffect(() => {
		localStorage.setItem("cart", JSON.stringify(cartItems));
	}, [cartItems]);

	const addToCart = (product: Product, variant: ProductVariant, quantity: number) => {
		setCartItems((prev) => {
			const existingIndex = prev.findIndex((item) => item.variant.id === variant.id);
			if (existingIndex > -1) {
				const updated = [...prev];
				const newQty = updated[existingIndex].quantity + quantity;
				// Cap at stock if available
				updated[existingIndex].quantity = variant.stock ? Math.min(newQty, variant.stock) : newQty;
				return updated;
			}
			return [...prev, { product, variant, quantity }];
		});
	};

	const removeFromCart = (variantId: number) => {
		setCartItems((prev) => prev.filter((item) => item.variant.id !== variantId));
	};

	const updateQuantity = (variantId: number, quantity: number) => {
		setCartItems((prev) =>
			prev.map((item) =>
				item.variant.id === variantId
					? { ...item, quantity: Math.max(1, item.variant.stock ? Math.min(quantity, item.variant.stock) : quantity) }
					: item
			)
		);
	};

	const clearCart = () => {
		setCartItems([]);
	};

	const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

	const cartTotal = cartItems.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);

	return (
		<CartContext.Provider
			value={{
				cartItems,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
				cartCount,
				cartTotal,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
