import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Sparkles, ArrowRight, Leaf, ShieldCheck, Award, Heart, CheckCircle2, ChevronRight } from "lucide-react";

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

export default function Home() {
	const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				const response = await api.get("/products");
				if (response.data && response.data.products) {
					// Display all available products (up to 6) to make the store look rich and diverse
					const allProducts = response.data.products;
					setFeaturedProducts(allProducts.slice(0, 6));
				}
			} catch (err) {
				console.error("Error fetching products:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, []);

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			{/* ------------------------------------------------------------- */}
			{/* 1. Hero Section */}
			{/* ------------------------------------------------------------- */}
			<section className="relative overflow-hidden bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-white py-16 md:py-24 border-b border-neutral-100">
				<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
					{/* Text Column */}
					<div className="lg:col-span-7 space-y-6 text-left">
						<div className="inline-flex items-center gap-1.5 bg-amber-100/60 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-200/50">
							<Sparkles className="w-3.5 h-3.5" />
							100% Traditional Recipe
						</div>
						<h1 className="text-4xl md:text-6xl font-black tracking-tight text-neutral-900 leading-tight">
							Taste the Heritage of <br />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600">
								Handmade Bihar Thekua
							</span>
						</h1>
						<p className="text-base md:text-lg text-neutral-600 max-w-xl leading-relaxed">
							Prepared with wood-pressed whole wheat, organic jaggery, and pure country ghee. Molded by hand using traditional wooden stamps, and baked fresh daily with no artificial additives.
						</p>
						<div className="flex flex-wrap gap-4 pt-2">
							<Link
								to="/products"
								className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition shadow-lg hover:shadow-xl active:scale-[0.98]"
							>
								Explore Our Sweets
								<ArrowRight className="w-4 h-4" />
							</Link>
							<Link
								to="/track-order"
								className="flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 font-bold py-3.5 px-6 rounded-2xl text-sm border border-neutral-200 transition shadow-sm active:scale-[0.98]"
							>
								Track Order Status
							</Link>
						</div>

						{/* Small Trust Badges */}
						<div className="grid grid-cols-3 gap-4 pt-8 border-t border-neutral-200/50 max-w-lg">
							<div className="flex items-center gap-2">
								<Leaf className="w-5 h-5 text-amber-700 flex-shrink-0" />
								<span className="text-xs font-bold text-neutral-700">100% Natural</span>
							</div>
							<div className="flex items-center gap-2">
								<ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
								<span className="text-xs font-bold text-neutral-700">Zero Preservatives</span>
							</div>
							<div className="flex items-center gap-2">
								<Award className="w-5 h-5 text-amber-700 flex-shrink-0" />
								<span className="text-xs font-bold text-neutral-700">Pure Desi Ghee</span>
							</div>
						</div>
					</div>

					{/* Image Column */}
					<div className="lg:col-span-5 relative">
						<div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2.5rem] blur-xl opacity-30 animate-pulse-slow"></div>
						<div className="relative bg-white border border-neutral-200/60 p-3 rounded-[2.5rem] shadow-xl overflow-hidden aspect-square">
							<img
								src="/images/thekua-hero.png"
								alt="Handmade traditional Bihari Thekua cookies serving showcase"
								className="w-full h-full object-cover rounded-[2rem] hover:scale-105 transition-transform duration-700"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* ------------------------------------------------------------- */}
			{/* 2. The Legend of Thekua (Origin Section) */}
			{/* ------------------------------------------------------------- */}
			<section className="py-20 md:py-28 bg-white">
				<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
					{/* Decorative Side Collage / Text */}
					<div className="lg:col-span-6 space-y-6 text-left">
						<h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
							The Ancient Origin of <br />
							<span className="text-amber-800">Bihar’s Sacred Sweet</span>
						</h2>
						<div className="space-y-4 text-neutral-600 text-sm md:text-base leading-relaxed">
							<p>
								<strong>Thekua</strong> (also known as <em>Khajuria</em> or <em>Thikari</em>) is a legendary dry sweet originating from the heart of Bihar, Jharkhand, and the Terai region of Nepal. It has been a culinary masterpiece for thousands of years, prepared as the ultimate <strong>prasad</strong> (divine offering) during the ancient Vedic festival of Chhath Puja to worship the Sun God.
							</p>
							<p>
								Traditionally molded on hand-carved wooden blocks called <em>thoka</em>, each sweet is stamped with beautiful motifs of leaves and flowers. The design represents the connection with nature, gratitude, and purity.
							</p>
							<p>
								What makes Thekua truly exceptional is its natural longevity. Historically carried by travelers and monks, it is crafted without a single drop of water or preservatives, allowing it to stay crisp and flavorful for weeks.
							</p>
						</div>
						<div className="pt-2">
							<Link
								to="/products"
								className="text-amber-800 hover:text-amber-900 font-extrabold flex items-center gap-1 group"
							>
								Explore Traditional Flavors
								<ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
							</Link>
						</div>
					</div>

					{/* Image Showcase & Features Grid */}
					<div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 text-left space-y-3">
							<div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800">
								<Heart className="w-5 h-5" />
							</div>
							<h4 className="font-extrabold text-neutral-900 text-sm">Divine Offering</h4>
							<p className="text-xs text-gray-500 leading-relaxed">
								Revered as the holy offering of Chhath Puja, representing the peak of culinary purity and devotion.
							</p>
						</div>

						<div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 text-left space-y-3">
							<div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800">
								<Sparkles className="w-5 h-5" />
							</div>
							<h4 className="font-extrabold text-neutral-900 text-sm">Hand-Stamped Artistry</h4>
							<p className="text-xs text-gray-500 leading-relaxed">
								Individually stamped with traditional wooden molds, giving each piece its iconic rustic leaf texture.
							</p>
						</div>

						<div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 text-left space-y-3">
							<div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800">
								<ShieldCheck className="w-5 h-5" />
							</div>
							<h4 className="font-extrabold text-neutral-900 text-sm">Naturally Long-Lasting</h4>
							<p className="text-xs text-gray-500 leading-relaxed">
								Bake-sealed with pure ghee, keeping it naturally fresh and crunchy for up to 30 days without refrigeration.
							</p>
						</div>

						<div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 text-left space-y-3">
							<div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800">
								<Leaf className="w-5 h-5" />
							</div>
							<h4 className="font-extrabold text-neutral-900 text-sm">No Refined Sugar</h4>
							<p className="text-xs text-gray-500 leading-relaxed">
								Sweetened organically with mineral-rich sugarcane jaggery (Gur) instead of chemical white sugar.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ------------------------------------------------------------- */}
			{/* 3. Pure Ingredients & Health Benefits */}
			{/* ------------------------------------------------------------- */}
			<section className="py-20 md:py-28 bg-neutral-50/60 border-y border-neutral-100">
				<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
					{/* Left: Ingredients Image */}
					<div className="lg:col-span-5 relative">
						<div className="relative bg-white border border-neutral-200/60 p-3 rounded-[2.5rem] shadow-xl overflow-hidden aspect-square">
							<img
								src="/images/thekua-ingredients.png"
								alt="Natural ingredients ghee jaggery cardamom whole wheat"
								className="w-full h-full object-cover rounded-[2rem]"
							/>
						</div>
					</div>

					{/* Right: Health Benefits & Ingredient Detail */}
					<div className="lg:col-span-7 text-left space-y-6">
						<h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
							Pure Ingredients, <br />
							<span className="text-amber-800">Honest Health Benefits</span>
						</h2>
						<p className="text-sm md:text-base text-neutral-600 leading-relaxed">
							Unlike modern mass-produced cookies loaded with refined white flour (Maida), palm oil, and high fructose corn syrup, our Thekuas are nutritional powerhouses built on simple, whole food ingredients:
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
							<div className="flex gap-3">
								<CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
								<div>
									<h4 className="font-extrabold text-sm text-neutral-900">Organic Jaggery (Gur)</h4>
									<p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
										A natural source of iron and potassium that helps cleanse the respiratory system, detoxify the liver, and release energy steadily.
									</p>
								</div>
							</div>

							<div className="flex gap-3">
								<CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
								<div>
									<h4 className="font-extrabold text-sm text-neutral-900">Wood-Pressed Atta</h4>
									<p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
										Whole wheat flour provides healthy dietary fibers that regulate digestive tracts, prevent spikes in blood sugar, and keep you full.
									</p>
								</div>
							</div>

							<div className="flex gap-3">
								<CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
								<div>
									<h4 className="font-extrabold text-sm text-neutral-900">Pure Country Ghee</h4>
									<p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
										Rich in butyric acid and fat-soluble vitamins (A, D, E, K), supporting optimal gut lining, joint health, and overall immunity.
									</p>
								</div>
							</div>

							<div className="flex gap-3">
								<CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
								<div>
									<h4 className="font-extrabold text-sm text-neutral-900">Aromatic Cardamom & Saunf</h4>
									<p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
										Loaded with antioxidant properties that promote digestive wellness, cool the body, and sweeten your breath naturally.
									</p>
								</div>
							</div>
						</div>

						{/* Ghee note box */}
						<div className="bg-amber-100/40 border border-amber-200/50 rounded-2xl p-4 text-xs text-amber-950 font-bold leading-relaxed max-w-2xl mt-8">
							⚠️ NO PALM OIL • NO REFINED WHITE SUGAR • NO ARTIFICIAL COLOURS OR PRESERVATIVES. Just honest, grandmother-approved nutrition in every single crunchy bite.
						</div>
					</div>
				</div>
			</section>

			{/* ------------------------------------------------------------- */}
			{/* 4. Featured Sweets */}
			{/* ------------------------------------------------------------- */}
			<section className="py-20 md:py-28 bg-white">
				<div className="max-w-7xl mx-auto px-6 text-center space-y-12">
					<div className="max-w-xl mx-auto space-y-3">
						<h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">Our Signature Varieties</h2>
						<p className="text-xs md:text-sm text-neutral-500 leading-relaxed">
							Explore our authentic varieties made with love, tradition, and fresh ingredients.
						</p>
					</div>

					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{[1, 2, 3].map((n) => (
								<div key={n} className="bg-neutral-50 border h-80 rounded-3xl animate-pulse"></div>
							))}
						</div>
					) : featuredProducts.length === 0 ? (
						<p className="text-sm text-neutral-400 italic">No products available at the moment.</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{featuredProducts.map((p) => {
								const img = p.images?.find((i) => i.is_main)?.image_url || p.images?.[0]?.image_url;
								const startingPrice = p.variants && p.variants.length > 0
									? Math.min(...p.variants.map((v) => v.price))
									: 0;

								return (
									<div
										key={p.id}
										className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between text-left group"
									>
										<div>
											<div className="w-full aspect-video rounded-2xl overflow-hidden bg-neutral-100 border mb-4">
												{img ? (
													<img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
												) : (
													<div className="w-full h-full flex items-center justify-center font-bold text-amber-700 bg-amber-50 text-sm">
														Traditional Sweet
													</div>
												)}
											</div>
											<h3 className="font-extrabold text-neutral-900 text-base mb-1.5 leading-tight">{p.name}</h3>
											<p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{p.description}</p>
										</div>

										<div className="flex justify-between items-center border-t border-neutral-100 pt-4 mt-2">
											<div>
												<span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Starting at</span>
												<span className="font-black text-neutral-900 text-base">₹{startingPrice}</span>
											</div>
											<Link
												to={`/products/${p.id}`}
												className="flex items-center gap-1 bg-black text-white hover:bg-neutral-800 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
											>
												View Sweet
												<ChevronRight className="w-3.5 h-3.5" />
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</section>

			{/* ------------------------------------------------------------- */}
			{/* 5. Customer Testimonials */}
			{/* ------------------------------------------------------------- */}
			<section className="py-20 bg-neutral-50/60 border-t border-neutral-100 text-center">
				<div className="max-w-7xl mx-auto px-6 space-y-12">
					<div className="max-w-xl mx-auto space-y-3">
						<h2 className="text-3xl font-black text-neutral-900 tracking-tight">Loved by Generations</h2>
						<p className="text-xs md:text-sm text-neutral-500 leading-relaxed">
							Here is what members of our Thekua family have to say about our traditional recipe.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between">
							<p className="text-xs text-neutral-600 italic leading-relaxed">
								"As someone raised in Patna, finding authentic Chhath-Puja style Thekua in Bangalore was impossible. Finding this store has been a blessing. It tastes exactly like what my mother makes at home. Pure nostalgia!"
							</p>
							<div className="mt-4 pt-4 border-t border-neutral-100">
								<h5 className="font-extrabold text-xs text-neutral-900">Tushar Singh</h5>
								<span className="text-[10px] text-gray-400 font-semibold block">Bangalore</span>
							</div>
						</div>

						<div className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between">
							<p className="text-xs text-neutral-600 italic leading-relaxed">
								"The jaggery variant is my favorite guilt-free evening snack. It is crispy, mildly sweet, and goes perfectly with a cup of tea. Knowing it contains no palm oil makes it a perfect replacement for cookies."
							</p>
							<div className="mt-4 pt-4 border-t border-neutral-100">
								<h5 className="font-extrabold text-xs text-neutral-900">Payal Raghav</h5>
								<span className="text-[10px] text-gray-400 font-semibold block">Delhi NCR</span>
							</div>
						</div>

						<div className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between">
							<p className="text-xs text-neutral-600 italic leading-relaxed">
								"Ordered the dry fruit variant for my family. Everyone, from my kids to grandparents, absolutely loved the authentic ghee flavor. They arrived safely packed and super fresh. Highly recommended!"
							</p>
							<div className="mt-4 pt-4 border-t border-neutral-100">
								<h5 className="font-extrabold text-xs text-neutral-900">Shristi</h5>
								<span className="text-[10px] text-gray-400 font-semibold block">Mumbai</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}