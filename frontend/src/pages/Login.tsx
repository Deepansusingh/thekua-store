import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [isAdminMode, setIsAdminMode] = useState(false);

	const { login, adminLogin } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim() || !password.trim()) {
			toast.error("Please enter both email and password.");
			return;
		}

		try {
			setSubmitting(true);
			if (isAdminMode) {
				await adminLogin({ email, password });
				toast.success("Welcome back, Administrator.");
				navigate("/admin/dashboard");
			} else {
				await login({ email, password });
				toast.success("Welcome back! Logged in successfully.");
				navigate("/");
			}
		} catch (err: any) {
			console.error("Login error:", err);
			toast.error(err.response?.data?.error || "Invalid email or password.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="max-w-md w-full mx-auto px-6 py-12 md:py-20 flex flex-col justify-center min-h-[70vh]">
			<div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 text-amber-600">
						<Lock className="w-5 h-5" />
					</div>
					<h1 className="text-2xl font-black text-neutral-900 tracking-tight">
						{isAdminMode ? "Admin Portal" : "Welcome Back"}
					</h1>
					<p className="text-xs text-gray-400 mt-1.5">
						{isAdminMode ? "Sign in to manage inventory & orders" : "Sign in to your account to manage orders"}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
								<Mail className="w-4 h-4" />
							</span>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder={isAdminMode ? "admin@example.com" : "you@example.com"}
								className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
							/>
						</div>
					</div>

					<div>
						<label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
								<Lock className="w-4 h-4" />
							</span>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
							/>
						</div>
					</div>

					{/* Admin Toggle */}
					<div className="flex items-center justify-between pt-1">
						<label className="flex items-center gap-2 text-xs text-neutral-600 font-bold cursor-pointer select-none">
							<input
								type="checkbox"
								checked={isAdminMode}
								onChange={(e) => setIsAdminMode(e.target.checked)}
								className="accent-black h-4 w-4 rounded cursor-pointer"
							/>
							Login as Administrator
						</label>
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="w-full mt-4 flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow active:scale-[0.98] text-sm cursor-pointer"
					>
						{submitting ? "Signing in..." : "Sign In"}
						{!submitting && <ArrowRight className="w-4 h-4" />}
					</button>
				</form>

				{/* Footer links */}
				<p className="mt-8 text-center text-xs text-gray-500">
					Don't have an account?{" "}
					<Link to="/register" className="font-bold text-amber-700 hover:text-amber-800 underline transition ml-1">
						Create one here
					</Link>
				</p>
			</div>
		</div>
	);
}