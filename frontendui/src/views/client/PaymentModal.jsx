import { useEffect, useState } from 'react';
import { X, CheckCircle, Loader2, Smartphone, Copy, Check } from 'lucide-react';
import axiosClient from "../../axios-client";

// ========================================================
// 🔧 CHANGE THESE to your real Bakong merchant details!
// ========================================================
const BAKONG_ACCOUNT_ID = '855964221831@abab';   // e.g. myshop@aclb
const MERCHANT_NAME = 'RITHISAK MENG';
const MERCHANT_CITY = 'Phnom Penh';
// ========================================================

// --- Minimal KHQR / EMV QR string builder ---
function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function tlv(tag, value) {
    const len = value.length.toString().padStart(2, '0');
    return `${tag}${len}${value}`;
}

function buildKHQR(amount) {
    const amountStr = parseFloat(amount).toFixed(2);
    // Merchant account info
    const merchantAccountInfo =
        tlv('00', 'KHQR') +
        tlv('01', BAKONG_ACCOUNT_ID) +
        tlv('02', MERCHANT_NAME);
    const merchantAccountInfoBlock = tlv('29', merchantAccountInfo);

    let payload =
        tlv('00', '01') +                       // Payload format indicator
        tlv('01', '11') +                        // Point of initiation (static=11, dynamic=12)
        merchantAccountInfoBlock +
        tlv('52', '5999') +                      // Merchant category code
        tlv('53', '840') +                       // Currency (840 = USD)
        tlv('54', amountStr) +                   // Amount
        tlv('58', 'KH') +                        // Country code
        tlv('59', MERCHANT_NAME.substring(0, 25)) +
        tlv('60', MERCHANT_CITY.substring(0, 15)) +
        '6304';                                  // CRC placeholder

    payload += crc16(payload);
    return payload;
}

// Use a free QR code image API (no npm needed)
function qrImageUrl(text) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}&margin=10&format=png`;
}

export default function PaymentModal({ total, orderId, onPaymentFinished, onCancel }) {
    const [qrString, setQrString] = useState('');
    const [qrReady, setQrReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [step, setStep] = useState('qr'); // 'qr' | 'confirming' | 'done'
    const [timeLeft, setTimeLeft] = useState(150); // 2 minutes 30 seconds
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (step !== 'qr' || timeLeft <= 0 || !orderId) return;

        // Auto-Polling backend for payment status!
        const checkStatus = async () => {
            try {
                const { data } = await axiosClient.get(`/client/orders/${orderId}/status`);
                if (data.status === 'success' && data.order_status === 'paid') {
                    setStep('done');
                }
            } catch (err) {
                console.error("Failed to check status", err);
            }
        };

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        const pollTimer = setInterval(checkStatus, 3000); // Check every 3s

        return () => {
            clearInterval(timer);
            clearInterval(pollTimer);
        };
    }, [step, timeLeft, orderId]);

    useEffect(() => {
        if (step === 'done') {
            const doneTimer = setTimeout(() => {
                onPaymentFinished();
            }, 3000);
            return () => clearTimeout(doneTimer);
        }
    }, [step, onPaymentFinished]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        try {
            const str = buildKHQR(total);
            setQrString(str);
            setQrReady(true);
        } catch (e) {
            console.error('KHQR generation error:', e);
        }
    }, [total]);

    const handleCopy = () => {
        if (qrString) {
            navigator.clipboard.writeText(qrString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSimulatePayment = async () => {
        setLoading(true);
        setStep('confirming');
        try {
            // Secretly hits the webhook to simulate Bank confirmation
            await axiosClient.post(`/client/orders/${orderId}/webhook`);
            setStep('done');
        } catch {
            setStep('qr');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform scale-105"
                style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-widest text-amber-900 bg-white">
                            KHQR
                        </div>
                        <span className="text-white font-bold text-base">Bakong Payment</span>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-white/70 hover:text-white transition p-1 rounded-full hover:bg-white/20"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 'done' ? (
                        <div className="flex flex-col items-center py-10 text-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-green-100">
                                <CheckCircle size={44} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Order Placed!</h3>
                            <p className="text-gray-500 text-sm">Thank you! Your order is being prepared.</p>
                        </div>
                    ) : step === 'confirming' ? (
                        <div className="flex flex-col items-center py-14 text-center">
                            <Loader2 size={48} className="text-amber-600 animate-spin mb-4" />
                            <p className="text-gray-600 font-medium">Placing your order...</p>
                        </div>
                    ) : (
                        <>
                            {/* Amount */}
                            <div className="text-center mb-5">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">Total Amount</p>
                                <p className="text-5xl font-extrabold text-gray-900">${total.toFixed(2)}</p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <p className="text-xs text-gray-400">USD · Bakong KHQR</p>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    {timeLeft > 0 ? (
                                        <p className="text-xs font-semibold text-amber-600 animate-pulse">Expires in {formatTime(timeLeft)}</p>
                                    ) : (
                                        <p className="text-xs font-bold text-red-500">EXPIRED</p>
                                    )}
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mb-4">
                                <div className="relative p-3 rounded-2xl border-4 border-amber-100 bg-white shadow-inner">
                                    {qrReady ? (
                                        <>
                                            <img
                                                src={qrImageUrl(qrString)}
                                                alt="KHQR Code"
                                                width={200}
                                                height={200}
                                                className={`rounded-lg transition-opacity duration-300 ${timeLeft <= 0 ? 'opacity-20 grayscale' : 'opacity-100'}`}
                                            />
                                            {timeLeft <= 0 && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <div className="bg-red-500 text-white rounded-full p-2 mb-2">
                                                        <X size={32} />
                                                    </div>
                                                    <p className="text-red-500 font-bold text-sm">QR Code Expired</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-[200px] h-[200px] flex items-center justify-center">
                                            <Loader2 size={36} className="text-amber-500 animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Instruction banner */}
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-sm text-amber-800">
                                <Smartphone size={17} className="flex-shrink-0 mt-0.5 text-amber-600" />
                                <span>Open <strong>Bakong</strong>, <strong>Wing</strong>, or any KHQR-compatible app and scan the code above.</span>
                            </div>

                            {/* Copy */}
                            <button
                                onClick={handleCopy}
                                disabled={timeLeft <= 0}
                                className={`w-full flex items-center justify-center gap-2 py-2 mb-4 rounded-xl text-xs border border-dashed transition ${timeLeft <= 0
                                    ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                                    : 'text-gray-400 border-gray-200 hover:border-amber-400 hover:text-amber-700'
                                    }`}
                            >
                                {copied
                                    ? <><Check size={13} className="text-green-500" /> Copied!</>
                                    : <><Copy size={13} /> Copy KHQR String</>
                                }
                            </button>

                            {/* Auto-Verification Feedback */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-center items-center py-3.5 rounded-xl bg-amber-50 text-amber-800 font-semibold text-sm border border-amber-200 shadow-sm">
                                    <Loader2 size={18} className="animate-spin mr-2 text-amber-600" />
                                    Awaiting payment completion...
                                </div>
                                
                                <button
                                    onClick={handleSimulatePayment}
                                    disabled={loading || timeLeft <= 0}
                                    className="pt-4 pb-2 text-xs text-center font-semibold text-gray-400 hover:text-amber-600 transition"
                                >
                                    🛠️ Developer: Simulate Webhook Payment
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
