import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client"; // Make sure path is correct
import { Coffee, ArrowRight, Loader } from "lucide-react";

export default function Home() {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // Request sorted top sellers and limited to 3 items
                const { data } = await axiosClient.get('/products?sort=top_sellers&limit=3');
                const topProducts = data.data ? data.data : data;
                
                setTrendingProducts(topProducts);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    return (
        <div className="min-h-screen font-sans text-gray-900 selection:bg-amber-200">
            
            {/* 🟢 1. HERO SECTION */}
            <section className="w-full py-32 px-4 bg-gradient-to-b from-orange-50 via-amber-50 to-white">
                <div className="max-w-5xl mx-auto text-center">
                    
                    {/* Logo Area */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-900 px-8 py-4 rounded-3xl shadow-xl flex items-center animate-bounce-slow">
                            <span className="text-green-400 text-2xl font-bold mr-2">&gt;_</span>
                            <span className="text-white text-2xl font-light mx-2">|</span>
                            <span className="text-amber-400 text-2xl font-bold ml-2">Tea</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tighter">
                        IT-Ice Tea <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Drink Shop</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-600 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Fuel your code with our premium brews. <br/>
                        The perfect blend of caffeine and algorithm.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Link to="/menu" className="bg-gray-900 text-white text-lg font-bold py-5 px-12 rounded-full shadow-xl hover:bg-black transition-all hover:scale-105">
                            Order Now 
                        </Link>
                        <Link to="/about" className="bg-white text-gray-900 text-lg font-bold py-5 px-12 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all hover:scale-105">
                            Meet the Dev
                        </Link>
                    </div>
                </div>
            </section>

            {/* 🟢 2. FEATURES SECTION */}
            <section className="w-full py-28 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Why Developers Choose Us</h2>
                            <div className="w-24 h-1.5 bg-amber-500 mx-auto mt-6 rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="p-10 rounded-[2rem] bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold mb-3 text-amber-600">High Voltage</h3>
                            <p className="text-gray-600 leading-relaxed">Strong coffee designed to keep you awake during those late-night debugging sessions.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-10 rounded-[2rem] bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold mb-3 text-blue-600">Dev Environment</h3>
                            <p className="text-gray-600 leading-relaxed">A space inspired by technology. Clean code, clean design, and even cleaner drinks.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-10 rounded-[2rem] bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold mb-3 text-green-600">Premium Quality</h3>
                            <p className="text-gray-600 leading-relaxed">We source the finest tea leaves and coffee beans. No bugs, just features.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🟢 3. TRENDING SECTION (DYNAMIC) */}
            <section className="w-full py-28 px-4 bg-gray-50 border-t border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900">Trending Products</h2>
                    
                    {loading ? (
                         <div className="flex justify-center items-center py-20">
                            <Loader className="animate-spin text-amber-500 w-10 h-10" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {trendingProducts.map((product) => {
                                // Calculate price logic
                                const prices = product.sizes?.map(s => parseFloat(s.price)) || [];
                                const minPrice = prices.length ? Math.min(...prices).toFixed(2) : "0.00";

                                return (
                                    <Link to="/menu" key={product.id} className="group relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-xl cursor-pointer bg-white border border-gray-200 block">
                                        {/* Image Background */}
                                        {product.image_url ? (
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name} 
                                                className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                                                <Coffee size={64} className="text-gray-400" />
                                            </div>
                                        )}

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-10">
                                            <h3 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                                                {product.name}
                                            </h3>
                                            <p className="text-gray-300 mb-5 text-sm line-clamp-2 font-medium">
                                                {product.description || "Freshly brewed specifically for you."}
                                            </p>
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="inline-block bg-amber-500 text-white font-bold px-4 py-2 rounded-lg text-lg shadow-lg shadow-amber-900/20">
                                                    ${minPrice}
                                                </span>
                                                <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-amber-500 transition-colors">
                                                    <ArrowRight size={20} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                            
                            {/* Fallback if no products */}
                            {trendingProducts.length === 0 && (
                                <div className="col-span-3 text-center text-gray-500">
                                    No trending products available at the moment.
                                </div>
                            )}

                        </div>
                    )}

                    <div className="mt-16 text-center">
                        <Link to="/menu" className="inline-flex items-center text-amber-600 font-bold text-lg hover:underline underline-offset-4">
                            View Full Menu <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>

                </div>
            </section>
            
            {/* Footer Spacer */}
            <div className="w-full py-10 bg-gray-900 text-white text-center">
                <p>© {new Date().getFullYear()} IT-Ice Tea Shop</p>
            </div>

        </div>
    );
}