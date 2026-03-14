import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../axios-client';
import { useStateContext } from '../../contexts/ContextProvider';
import { Coffee, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

export default function Signup() {
    const nameRef = useRef();
    const emailRef = useRef();
    const phoneRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmationRef = useRef();

    const { setUser, setToken } = useStateContext();
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const onSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);

        const payload = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            phone: phoneRef.current.value,
            password: passwordRef.current.value,
            password_confirmation: passwordConfirmationRef.current.value,
        };

        axiosClient.post('/register', payload)
            .then(({ data }) => {
                setSuccess(true);
                setTimeout(() => {
                    setUser(data.user);
                    setToken(data.token);
                }, 1200);
            })
            .catch((err) => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors || { email: [response.data.message] });
                } else if (response && response.status === 500) {
                    setErrors({ server: [response.data.message || 'Internal Server Error'] });
                } else {
                    console.error(err);
                }
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fdf4e7 0%, #fff8ee 50%, #fdf2e3 100%)' }}>
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row" style={{ boxShadow: '0 32px 80px rgba(180,100,0,0.15)' }}>

                {/* === LEFT PANEL === */}
                <div className="w-full md:w-2/5 relative flex flex-col justify-between p-10 text-white overflow-hidden" style={{ background: 'linear-gradient(160deg, #92400e 0%, #b45309 50%, #d97706 100%)' }}>
                    {/* Decorative circles */}
                    <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10" style={{ background: 'white' }} />
                    <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full opacity-10" style={{ background: 'white' }} />

                    {/* Logo */}
                    <div className="relative z-10 flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <Coffee size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-wide">DrinkStore</span>
                    </div>

                    {/* Headline */}
                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                            Start Your<br />Coffee Journey
                        </h2>
                        <p className="text-base opacity-80 leading-relaxed mb-8">
                            Create a free account and enjoy exclusive deals, order tracking, and a personalized menu.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-3">
                            {['Free account — always', 'Order history & tracking', 'Exclusive member discounts'].map((b) => (
                                <div key={b} className="flex items-center gap-3 text-sm font-medium opacity-90">
                                    <CheckCircle size={16} className="flex-shrink-0" />
                                    {b}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="relative z-10 mt-8">
                        <p className="text-xs opacity-60 text-center">Already have an account?</p>
                        <Link
                            to="/login"
                            className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            Sign In Instead <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>

                {/* === RIGHT PANEL === */}
                <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-800">Create Account</h2>
                        <p className="text-gray-400 text-sm mt-1">Fill in your details below to get started</p>
                    </div>

                    {/* Success State */}
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                                <CheckCircle size={40} style={{ color: '#b45309' }} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h3>
                            <p className="text-gray-500 text-sm">Redirecting you to your dashboard...</p>
                        </div>
                    ) : (
                        <>
                            {/* Error Banner */}
                            {errors && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-xl">
                                    {Object.keys(errors).map(key => (
                                        <p key={key} className="text-red-700 text-sm">{errors[key][0]}</p>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">

                                {/* Full Name */}
                                <div className="relative">
                                    <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        ref={nameRef}
                                        type="text"
                                        name="name"
                                        autoComplete="off"
                                        required
                                        placeholder="Full Name"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                    />
                                </div>

                                {/* Email */}
                                <div className="relative">
                                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        ref={emailRef}
                                        type="email"
                                        name="email"
                                        autoComplete="new-password"
                                        required
                                        placeholder="Email Address"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="relative">
                                    <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        ref={phoneRef}
                                        type="tel"
                                        name="phone"
                                        autoComplete="off"
                                        required
                                        placeholder="Phone Number"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                    />
                                </div>

                                {/* Password Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            ref={passwordRef}
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            autoComplete="new-password"
                                            required
                                            placeholder="Password"
                                            className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                        />
                                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            ref={passwordConfirmationRef}
                                            type={showConfirm ? 'text' : 'password'}
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            required
                                            placeholder="Confirm"
                                            className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600">
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all transform active:scale-95 mt-2"
                                    style={{
                                        background: loading
                                            ? '#d1d5db'
                                            : 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                                        boxShadow: loading ? 'none' : '0 8px 24px rgba(180,100,0,0.35)',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? 'Creating Account...' : <><span>Create Account</span><ArrowRight size={18} /></>}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-gray-500">
                                Already have an account?{' '}
                                <Link to="/login" className="font-bold" style={{ color: '#b45309' }}>Sign In</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}