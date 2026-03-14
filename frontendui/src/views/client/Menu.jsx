import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";
import { Search, X, Coffee, Filter, ArrowRight, Lock, Clock, AlertCircle } from "lucide-react";

export default function Menu() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useStateContext();

    // --- STORE STATUS STATE ---
    const [storeSettings, setStoreSettings] = useState(null);
    const [isStoreOpen, setIsStoreOpen] = useState(true); // Default true prevents flash of "Closed"

    // --- FILTER STATE ---
    const [filters, setFilters] = useState({
        search: '',
        minPrice: '',
        maxPrice: '',
        categoryId: 'All',
        sortBy: 'default'
    });

    // --- MODAL STATE ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3500);
    };

    // 1. Fetch Data on Mount
    useEffect(() => {
        fetchData();
    }, []);

    // 2. Real-Time Clock Check (Runs every minute)
    useEffect(() => {
        if (storeSettings) checkShopStatus(); // Check immediately when settings load

        const interval = setInterval(() => {
            if (storeSettings) checkShopStatus();
        }, 60000); // Re-check every 60 seconds

        return () => clearInterval(interval);
    }, [storeSettings]);

    // --- HELPER: Check Time Logic ---
    const checkShopStatus = () => {
        if (!storeSettings || !storeSettings.open_at || !storeSettings.close_at) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [openH, openM] = storeSettings.open_at.split(':');
        const openMinutes = parseInt(openH) * 60 + parseInt(openM);

        const [closeH, closeM] = storeSettings.close_at.split(':');
        const closeMinutes = parseInt(closeH) * 60 + parseInt(closeM);

        let isOpen = false;

        // Handle Overnight shifts (e.g. Open 18:00, Close 02:00)
        if (closeMinutes < openMinutes) {
            isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
        } else {
            // Standard day shift (e.g. Open 08:00, Close 20:00)
            isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
        }

        setIsStoreOpen(isOpen);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch everything in parallel
            const [productRes, categoryRes, settingsRes] = await Promise.all([
                axiosClient.get('/products'),
                axiosClient.get('/categories'),
                axiosClient.get('/public/settings') // Ensure this route exists in Laravel
            ]);
            
            setProducts(productRes.data.data ? productRes.data.data : productRes.data);
            setCategories(categoryRes.data.data ? categoryRes.data.data : categoryRes.data);
            setStoreSettings(settingsRes.data);
            
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- FILTER HANDLERS ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            minPrice: '',
            maxPrice: '',
            categoryId: 'All',
            sortBy: 'default'
        });
    };

    // --- FILTER LOGIC ---
    const filteredProducts = products.filter(product => {
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.categoryId !== 'All' && String(product.category_id) !== String(filters.categoryId)) return false;

        const prices = product.sizes?.map(s => parseFloat(s.price)) || [];
        const minProductPrice = prices.length ? Math.min(...prices) : 0;

        if (filters.minPrice && minProductPrice < parseFloat(filters.minPrice)) return false;
        if (filters.maxPrice && minProductPrice > parseFloat(filters.maxPrice)) return false;

        return true;
    }).sort((a, b) => {
        const getPrice = (p) => {
            const prices = p.sizes?.map(s => parseFloat(s.price)) || [];
            return prices.length ? Math.min(...prices) : 0;
        };
        if (filters.sortBy === 'price-asc') return getPrice(a) - getPrice(b);
        if (filters.sortBy === 'price-desc') return getPrice(b) - getPrice(a);
        return 0;
    });

    // --- MODAL HANDLERS ---
    const openModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        if (product.sizes && product.sizes.length > 0) {
            setSelectedSize(product.sizes[0]);
        } else {
            setSelectedSize(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setSelectedSize(null);
    };

    const handleConfirmAdd = () => {
        if (!isStoreOpen) {
            showToast("Sorry, the store is currently closed.");
            return;
        }

        if (!selectedSize && selectedProduct.sizes.length > 0) {
            showToast("Please select a size.");
            return;
        }

        const priceToUse = selectedSize ? parseFloat(selectedSize.price) : 0;
        const nameToUse = selectedSize ? `${selectedProduct.name} (${selectedSize.size})` : selectedProduct.name;
        const idToUse = selectedSize ? selectedSize.id : selectedProduct.id;
        const sizeToUse = selectedSize ? selectedSize.size : "Standard";

        const cartItem = {
            id: idToUse,
            product_id: selectedProduct.id,
            name: nameToUse,
            price: priceToUse,
            image: selectedProduct.image_url,
            quantity: quantity,
            size: sizeToUse
        };

        addToCart(cartItem);
        closeModal();
    };

    const inputWrapperClass = "relative group";
    const labelClass = "block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wide group-focus-within:text-amber-600 transition-colors";
    const inputClass = "w-full bg-gray-50 text-gray-800 text-sm rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-amber-500 focus:bg-white px-4 py-3 outline-none transition-all shadow-sm";

    return (
        <div className="w-full min-h-screen pb-20 font-sans">

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-red-500 text-white text-sm font-semibold animate-fadeIn">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{toast}</span>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 transition">
                        <X size={16} />
                    </button>
                </div>
            )}
            
            {/* --- HERO HEADER --- */}
            <div className="bg-white pt-10 pb-8 px-4 mb-4 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="container mx-auto text-center max-w-2xl relative z-10">
                    <span className="text-amber-500 font-bold tracking-widest text-xs uppercase mb-2 block">Premium Coffee & Pastries</span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
                        Order Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Favorites</span>
                    </h1>
                    
                    {/* --- STATUS BANNERS --- */}
                    {!loading && storeSettings && (
                        !isStoreOpen ? (
                            <div className="mt-6 inline-flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-6 py-3 rounded-full animate-pulse shadow-sm">
                                <Lock size={18} />
                                <span className="font-bold text-sm">
                                    Store Closed. Opens at {storeSettings.open_at}.
                                </span>
                            </div>
                        ) : (
                            <div className="mt-6 inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-2 rounded-full">
                                <Clock size={16} />
                                <span className="font-semibold text-xs">
                                    Open until {storeSettings.close_at}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8">
                
                {/* --- FILTER CONTROL BAR --- */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-12 border border-gray-100 relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                        <Filter size={18} className="text-amber-500" /> Filter Menu
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className={inputWrapperClass}>
                            <label className={labelClass}>Search</label>
                            <div className="relative">
                                <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search..." className={`${inputClass} pl-10`} />
                                <Search className="absolute left-3.5 top-3.5 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        <div className={inputWrapperClass}>
                            <label className={labelClass}>Category</label>
                            <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className={`${inputClass} appearance-none cursor-pointer`}>
                                <option value="All">All Items</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={inputWrapperClass}>
                            <label className={labelClass}>Price Range</label>
                            <div className="flex items-center gap-2">
                                <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange} className={inputClass} />
                                <span className="text-gray-300 font-light">/</span>
                                <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange} className={inputClass} />
                            </div>
                        </div>

                        <div className={inputWrapperClass}>
                            <label className={labelClass}>Sort By</label>
                            <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className={`${inputClass} appearance-none cursor-pointer`}>
                                <option value="default">Relevance</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {(filters.search || filters.minPrice || filters.maxPrice || filters.categoryId !== 'All' || filters.sortBy !== 'default') && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                            <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
                                <X size={14} /> Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 opacity-60">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-amber-500 mb-4"></div>
                        <p className="text-gray-400 font-medium">Brewing the menu...</p>
                    </div>
                )}

                {/* --- PRODUCT GRID --- */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => {
                                const prices = product.sizes?.map(s => parseFloat(s.price)) || [];
                                const minPrice = prices.length ? Math.min(...prices).toFixed(2) : "0.00";

                                return (
                                    <div key={product.id} className="group border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col h-full overflow-hidden">
                                        
                                        {/* Image Section */}
                                        <div onClick={() => openModal(product)} className="cursor-pointer h-56 w-full relative overflow-hidden bg-gray-100">
                                            {product.image_url ? (
                                                <img 
                                                    src={product.image_url} 
                                                    alt={product.name} 
                                                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isStoreOpen ? 'grayscale opacity-80' : ''}`} 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Coffee size={48} />
                                                </div>
                                            )}
                                            {/* Closed Overlay */}
                                            {!isStoreOpen && (
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
                                                    <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Closed</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <div onClick={() => openModal(product)} className="cursor-pointer flex justify-between items-start mb-2 gap-4">
                                                <h5 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight group-hover:text-amber-600 transition-colors">
                                                    {product.name}
                                                </h5>
                                                <span className={`text-xl font-bold shrink-0 ${!isStoreOpen ? 'text-gray-400' : 'text-amber-600'}`}>
                                                    ${minPrice}
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                                {product.description || "Freshly brewed to perfection."}
                                            </p>

                                            {/* Card Button */}
                                            <button 
                                                onClick={() => openModal(product)}
                                                className={`mt-auto flex items-center justify-center w-full font-bold rounded-xl text-sm px-5 py-3 transition-all duration-200 shadow-md 
                                                ${isStoreOpen 
                                                    ? 'text-white bg-amber-500 hover:bg-amber-600 hover:shadow-lg active:scale-95' 
                                                    : 'text-gray-400 bg-gray-100 cursor-not-allowed shadow-none border border-gray-200'}`}
                                            >
                                                {isStoreOpen ? (
                                                    <>Add to Order <ArrowRight size={16} className="ml-2" /></>
                                                ) : (
                                                    <><Lock size={16} className="mr-2" /> Store Closed</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <Coffee className="text-gray-300 w-16 h-16 mb-4" />
                                <h3 className="text-xl font-bold text-gray-800">No items found</h3>
                                <p className="text-gray-500">Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- PRODUCT DETAIL MODAL --- */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={closeModal}></div>
                    
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-fadeIn max-h-[90vh]">
                        
                        {/* Modal Image Side */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
                             {selectedProduct.image_url ? (
                                <img src={selectedProduct.image_url} className={`w-full h-full object-cover ${!isStoreOpen ? 'grayscale' : ''}`} alt={selectedProduct.name} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Coffee size={64} /></div>
                            )}
                            <button onClick={closeModal} className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition md:hidden"><X size={20} /></button>
                        </div>

                        {/* Modal Content Side */}
                        <div className="w-full md:w-1/2 p-8 flex flex-col bg-white overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedProduct.name}</h2>
                                    <p className="text-amber-600 font-bold text-sm uppercase tracking-wider mt-1">Customize Your Drink</p>
                                </div>
                                <button onClick={closeModal} className="hidden md:block text-gray-400 hover:text-gray-800 transition bg-gray-100 p-2 rounded-full"><X size={20} /></button>
                            </div>

                            <p className="text-gray-500 text-sm leading-relaxed mb-8">{selectedProduct.description}</p>
                            
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Select Size</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 ? (
                                        selectedProduct.sizes.map(size => {
                                            const isSelected = selectedSize && String(selectedSize.id) === String(size.id);
                                            return (
                                                <div 
                                                    key={size.id} 
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`cursor-pointer flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden
                                                    ${isSelected ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-100 hover:border-amber-200 bg-white'}`}
                                                >
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-500' : 'border-gray-300'}`}>
                                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                                                        </div>
                                                        <span className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{size.size}</span>
                                                    </div>
                                                    <span className={`font-bold text-lg relative z-10 ${isSelected ? 'text-amber-600' : 'text-gray-400'}`}>${size.price}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">Out of stock.</div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4">
                                <div className={`flex items-center bg-gray-100 rounded-full px-2 py-1 shadow-inner ${!isStoreOpen ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="w-10 h-10 rounded-full text-gray-600 font-bold hover:bg-white hover:shadow-sm transition">-</button>
                                    <span className="font-bold text-gray-900 w-8 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-full text-gray-600 font-bold hover:bg-white hover:shadow-sm transition">+</button>
                                </div>
                                
                                <button 
                                    onClick={handleConfirmAdd} 
                                    disabled={!isStoreOpen}
                                    className={`flex-1 font-bold py-4 rounded-full shadow-xl transition-all transform flex justify-between px-8 items-center group
                                    ${isStoreOpen 
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 active:scale-95' 
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                                >
                                    {isStoreOpen ? (
                                        <>
                                            <span>Add to Order</span>
                                            <span className="bg-white/20 px-2 py-1 rounded text-sm group-hover:bg-white/30 transition">
                                                ${selectedSize ? (selectedSize.price * quantity).toFixed(2) : '0.00'}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="w-full text-center flex items-center justify-center gap-2">
                                            <Lock size={18} /> Store Closed
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}