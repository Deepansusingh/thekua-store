import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const { register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
			toast.error("Please fill in all fields.");
			return;
		}

		if (phone.length < 10) {
			toast.error("Please enter a valid 10-digit phone number.");
			return;
		}

		if (password.length < 6) {
			toast.error("Password must be at least 6 characters.");
			return;
		}

		try {
			setSubmitting(true);
			await register({ name, email, phone, password });
			toast.success("Account created successfully! Welcome.");
			navigate("/");
		} catch (err: any) {
			console.error("Registration error:", err);
			toast.error(err.response?.data?.error || "Failed to create account. Email may already be in use.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="max-w-md w-full mx-auto px-6 py-12 md:py-16 flex flex-col justify-center min-h-[70vh]">
			<div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 text-amber-600">
						<User className="w-5 h-5" />
					</div>
					<h1 className="text-2xl font-black text-neutral-900 tracking-tight">Create Account</h1>
					<p className="text-xs text-gray-400 mt-1.5 font-medium">Register to start ordering freshly baked Thekuas</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
								<User className="w-4 h-4" />
							</span>
							<input
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="John Doe"
								className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
							/>
						</div>
					</div>

					<div>
						<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
								<Mail className="w-4 h-4" />
							</span>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
							/>
						</div>
					</div>

					<div>
						<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
								<Phone className="w-4 h-4" />
							</span>
							<input
								type="tel"
								required
								pattern="[0-9]{10}"
								value={phone}
								onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
								placeholder="10-digit mobile number"
								className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
							/>
						</div>
					</div>

					<div>
						<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
								<Lock className="w-4 h-4" />
							</span>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Min 6 characters"
								className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black transition bg-neutral-50"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="w-full mt-4 flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow active:scale-[0.98] text-sm"
					>
						{submitting ? "Creating Account..." : "Create Account"}
						{!submitting && <ArrowRight className="w-4 h-4" />}
					</button>
				</form>

				{/* Footer links */}
				<p className="mt-8 text-center text-xs text-gray-500">
					Already have an account?{" "}
					<Link to="/login" className="font-bold text-amber-700 hover:text-amber-800 underline transition ml-1">
						Sign in here
					</Link>
				</p>
			</div>
		</div>
	);
}