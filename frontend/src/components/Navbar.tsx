import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <nav className="sticky top-0 bg-white border-b z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        <Link
          to="/"
          className="text-2xl font-bold hover:opacity-85 transition"
        >
          Thekua Store
        </Link>

        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-gray-600 transition">Home</Link>
          <Link to="/products" className="hover:text-gray-600 transition">Products</Link>
          <Link to="/track-order" className="hover:text-gray-600 transition">Track Order</Link>
          {isAuthenticated && !isAdmin && (
            <Link to="/order-history" className="hover:text-gray-600 transition">
              Order History
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" className="text-amber-700 hover:text-amber-800 font-extrabold transition">
              Admin Portal
            </Link>
          )}
          <Link to="/cart" className="relative hover:text-gray-600 transition pr-2">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 px-3 py-1.5 rounded-lg">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-neutral-500 hover:text-red-600 transition p-1.5 hover:bg-neutral-50 rounded-lg cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-black text-white px-4 py-1.5 rounded-lg text-sm hover:bg-neutral-800 transition font-semibold">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}