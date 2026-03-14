import { useStateContext } from "../../contexts/ContextProvider";
import { useState } from "react";
import axiosClient from "../../axios-client";
import { useNavigate } from "react-router-dom";
import PaymentModal from "./PaymentModal";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    Coffee,
    ArrowRight,
    AlertCircle,
    X
} from 'lucide-react';

export default function Cart() {
    const { cart, removeFromCart, updateCartQuantity, token } = useStateContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [toast, setToast] = useState(null);

    // Safety: Ensure cart is an array
    const safeCart = Array.isArray(cart) ? cart : [];

    // Calculate Grand Total
    const grandTotal = safeCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Creates the pending order FIRST, then opens the modal
    const handleCheckout = async () => {
        if (safeCart.length === 0) return;
        if (!token) {
            showToast("Please log in or register to complete your checkout.");
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                total_amount: grandTotal,
                items: safeCart.map(item => {
                    let finalSizeId = item.size_id || (item.id !== item.product_id ? item.id : null);
                    return {
                        product_id: item.product_id,
                        size: item.size || "Standard",
                        size_id: finalSizeId,
                        quantity: item.quantity,
                        price: item.price
                    };
                })
            };

            const { data } = await axiosClient.post('/client/orders', payload);
            setOrderId(data.order_id);
            setLoading(false);
            setShowModal(true); // Open Modal with generated Order ID
        } catch (err) {
            console.error("Checkout Error:", err);
            setLoading(false);
            const message = err.response?.data?.message || "Failed to place order.";
            showToast(message);
        }
    };


    const handlePaymentFinished = () => {
        localStorage.removeItem('CART_ITEMS');
        setShowModal(false);
        window.location.reload();
    };

    // 🟢 EMPTY CART STATE (Glass Style)
    if (safeCart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center pt-20 pb-10">
                <div className="bg-white/80 backdrop-blur-md p-12 rounded-3xl shadow-xl text-center border border-white/50 max-w-md w-full">
                    <div className="bg-amber-100 p-6 rounded-full inline-block mb-6 shadow-inner">
                        <Coffee size={64} className="text-amber-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added any caffeine yet.</p>

                    <a href="/menu" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition transform">
                        Browse Menu <ArrowRight size={20} />
                    </a>
                </div>
            </div>
        );
    }

    // 🟢 ACTIVE CART STATE
    return (
        <>
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all animate-fadeIn
                    ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 transition">
                        <X size={16} />
                    </button>
                </div>
            )}
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/40 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-lg text-white shadow-md">
                            <ShoppingBag size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Your Order</h1>
                    </div>
                    <span className="bg-white text-amber-600 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm border border-amber-100">
                        {safeCart.length} Items
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 🟢 LEFT: ITEMS LIST */}
                    <div className="lg:col-span-2 space-y-4">
                        {safeCart.map((item, index) => (
                            <div key={index} className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 flex gap-4 transition hover:shadow-lg hover:bg-white/90">

                                {/* Image */}
                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-inner border border-gray-200">
                                    {item.image || item.image_url ? (
                                        <img src={item.image || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Coffee size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 leading-tight">{item.name}</h3>
                                        {/* Display Size Name */}
                                        <p className="text-amber-600 text-sm font-medium">
                                            {item.size || "Standard Size"}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-end mt-2">
                                        <div className="font-extrabold text-gray-900 text-xl">
                                            ${parseFloat(item.price).toFixed(2)}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center bg-gray-100/80 rounded-lg p-1 border border-gray-200">
                                            <button
                                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="p-1.5 hover:bg-white rounded-md transition text-gray-600 disabled:opacity-30 hover:shadow-sm"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                className="p-1.5 hover:bg-white rounded-md transition text-gray-600 hover:shadow-sm"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition self-start"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 🟢 RIGHT: SUMMARY */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/60 sticky top-28">
                            <h3 className="text-xl font-extrabold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Subtotal</span>
                                    <span>${grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Taxes (Estimated)</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-300">
                                    <span className="text-lg font-bold text-gray-800">Total</span>
                                    <span className="text-3xl font-extrabold text-amber-600">${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95
                            ${loading
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-amber-500/30 hover:to-amber-700'}`
                                }
                            >
                                {loading ? "Processing..." : <>Checkout Now <ArrowRight size={20} /></>}
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4">
                                Secure Checkout powered by CoffeeShop
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KHQR Payment Modal */}
            {showModal && orderId && (
                <PaymentModal
                    total={grandTotal}
                    orderId={orderId}
                    onPaymentFinished={handlePaymentFinished}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </>
    );
}