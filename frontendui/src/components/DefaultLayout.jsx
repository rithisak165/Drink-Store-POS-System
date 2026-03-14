import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';
import axiosClient from '../axios-client';
import { useState, useEffect } from 'react';
import { Coffee, ShoppingCart, LayoutDashboard, LogIn, LogOut, Home, UtensilsCrossed, Info, Phone, User } from 'lucide-react';

export default function DefaultLayout() {
    const { token, cart, user, setUser, setToken } = useStateContext();
    const location = useLocation();

    useEffect(() => {
        if (token && !user?.id) {
            axiosClient.get('/user')
                .then(({ data }) => setUser(data))
                .catch(() => {
                    setToken(null);
                    setUser({});
                });
        }
    }, [token]);

    const isHome = location.pathname === '/';
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const isActive = (path) => location.pathname === path;

    // --- LOGOUT FUNCTION ---
    const onLogout = (ev) => {
        ev.preventDefault();

        axiosClient.post('/logout')
            .then(() => {
                setUser({});
                setToken(null);
                closeMenu(); // Close mobile menu if open
            })
            .catch(err => {
                console.error(err);
                // Even if API fails, clear local state to "force" logout on frontend
                setUser({});
                setToken(null);
            });
    };

    return (
        <div className={`relative min-h-screen font-sans text-gray-800 selection:bg-amber-500 selection:text-white overflow-x-hidden 
            ${isHome ? 'bg-amber-50' : 'bg-white'}`}>

            <nav className="fixed top-0 left-0 right-0 z-50 shadow-md transition-all duration-300 bg-amber-500 border-b border-amber-600">

                <div className="container mx-auto px-6 py-4 flex justify-between items-center">

                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-3 group z-50 relative">
                        <div className="bg-white p-2 rounded-xl shadow-md group-hover:scale-105 transition transform duration-300">
                            <Coffee className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-xl font-extrabold text-white tracking-wide transition">
                            DrinkShop
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink to="/" label="Home" active={isActive('/')} />
                        <NavLink to="/menu" label="Menu" active={isActive('/menu')} />
                        <NavLink to="/about" label="About" active={isActive('/about')} />
                        <NavLink to="/contact" label="Contact" active={isActive('/contact')} />
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-4 md:gap-6 z-50 relative">
                        {/* Cart icon in Header (desktop) */}
                        <Link to="/cart" className="relative group hidden md:block">
                            <div className={`p-2 rounded-full transition-all duration-300 text-white hover:bg-amber-400 hover:shadow-inner`}>
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-amber-600 shadow ring-2 ring-amber-500 transform transition group-hover:scale-110">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Desktop Auth Section */}
                        <div className="hidden md:flex items-center gap-3">
                            {token ? (
                                <>
                                    {/* 1. Show Dashboard OR Name */}
                                    {user.role === 'admin' ? (
                                        <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-100 text-amber-600 shadow-lg transition-all">
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span className="text-sm font-bold">Dashboard</span>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600 border border-white/40 text-white shadow-sm cursor-default">
                                            <User className="w-4 h-4" />
                                            <span className="text-sm font-bold">{user.name}</span>
                                        </div>
                                    )}

                                    {/* 2. Logout Button */}
                                    <button
                                        onClick={onLogout}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition-all"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/40 bg-amber-600 hover:bg-white hover:text-amber-600 text-white transition-all shadow-sm">
                                    <LogIn className="w-4 h-4" />
                                    <span className="text-sm font-bold">Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className={`relative z-0 pt-20 min-h-screen pb-24 md:pb-10
                ${isHome ? 'w-full' : 'container mx-auto px-4'}`}>
                <Outlet />
            </main>

            {/* ✅ MOBILE BOTTOM TAB BAR */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                {/* Glassmorphism backing */}
                <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_32px_rgba(0,0,0,0.08)]">
                    <div className="flex items-stretch justify-around h-16">
                        <BottomTabLink to="/" icon={<Home size={22} />} label="Home" active={isActive('/')} />
                        <BottomTabLink to="/menu" icon={<UtensilsCrossed size={22} />} label="Menu" active={isActive('/menu')} />

                        {/* Cart Tab - center elevated pill */}
                        <Link to="/cart" className="flex flex-col items-center justify-center relative -mt-5 px-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
                                isActive('/cart')
                                    ? 'bg-amber-600 scale-105 shadow-amber-500/40'
                                    : 'bg-amber-500 hover:bg-amber-600 hover:scale-105'
                            }`}>
                                <ShoppingCart size={24} className="text-white" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 mt-1">Cart</span>
                        </Link>

                        <BottomTabLink to="/about" icon={<Info size={22} />} label="About" active={isActive('/about')} />

                        {/* Account / Profile Tab */}
                        {token ? (
                            user.role === 'admin' ? (
                                <BottomTabLink to="/admin/dashboard" icon={<LayoutDashboard size={22} />} label="Admin" active={isActive('/admin/dashboard')} />
                            ) : (
                                <button
                                    onClick={onLogout}
                                    className="flex flex-col items-center justify-center flex-1 gap-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <LogOut size={22} />
                                    <span className="text-[10px] font-semibold">Logout</span>
                                </button>
                            )
                        ) : (
                            <BottomTabLink to="/login" icon={<LogIn size={22} />} label="Login" active={isActive('/login')} />
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

// Helper for Desktop Links
function NavLink({ to, label, active }) {
    return (
        <Link to={to} className="relative group px-1 py-1">
            <span className={`text-sm font-bold uppercase tracking-widest transition-colors duration-300 
                ${active ? 'text-white' : 'text-amber-100 group-hover:text-white'}`}>
                {label}
            </span>
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-white transform transition-transform duration-300 origin-left 
                ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
            />
        </Link>
    );
}

// Helper for Bottom Tab Links
function BottomTabLink({ to, icon, label, active }) {
    return (
        <Link to={to} className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200 ${
            active ? 'text-amber-600 scale-105' : 'text-gray-400 hover:text-amber-500'
        }`}>
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                active ? 'bg-amber-100' : ''
            }`}>
                {icon}
            </div>
            <span className="text-[10px] font-semibold">{label}</span>
        </Link>
    );
}