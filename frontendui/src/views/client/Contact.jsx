import { useState } from "react";
import { 
    Mail, 
    Phone, 
    MapPin, 
    Send, 
    Github, 
    Linkedin, 
    Facebook,
    CheckCircle,
    Loader2
} from "lucide-react";

export default function Contact() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState("idle"); // idle, loading, success

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("loading");

        // Simulate API call
        setTimeout(() => {
            setStatus("success");
            setFormData({ name: "", email: "", message: "" });
            
            // Reset status after 3 seconds
            setTimeout(() => setStatus("idle"), 3000);
        }, 2000);
    };

    return (
        <div className="relative min-h-screen font-sans text-gray-900 scroll-smooth py-8 px-4 flex items-center justify-center">
            {/* 🟢 MAIN CARD CONTAINER */}
            <div className="relative z-10 w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100">
                
                {/* LEFT SIDE: CONTACT INFO (Dark Theme) */}
                <div className="md:w-5/12 bg-gray-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Decorative Circle */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div>
                        <h2 className="text-3xl font-extrabold mb-4">Let's chat.</h2>
                        <p className="text-gray-400 mb-10 leading-relaxed">
                            Have a bug to report? Or just want to order a coffee for your team? 
                            Drop us a line or visit our shop.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group cursor-pointer">
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Phone</h3>
                                    <p className="text-gray-400">+855 964221831</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group cursor-pointer">
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Email</h3>
                                    <p className="text-gray-400">bitthork165@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group cursor-pointer">
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Location</h3>
                                    <p className="text-gray-400">Norton University, Phnom Penh</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="mt-10">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Follow Us</p>
                        <div className="flex gap-4">
                            <a href="https://github.com/rithisak165" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition-all hover:-translate-y-1"><Github size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white transition-all hover:-translate-y-1"><Linkedin size={18} /></a>
                            <a href="https://www.facebook.com/share/174Xr2kMZS/?mibextid=wwXIfr" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all hover:-translate-y-1"><Facebook size={18} /></a>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: FORM & MAP (Light Glass Theme) */}
                <div className="md:w-7/12 p-10 bg-white/60 relative">
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Your Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Rithisak..." 
                                    className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Email Address</label>
                                <input 
                                    required
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="dev@example.com" 
                                    className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Message</label>
                            <textarea 
                                required
                                rows="4"
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                placeholder="I'd like to order 50 coffees for my hackathon..." 
                                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition shadow-sm resize-none"
                            ></textarea>
                        </div>

                        <button 
                            disabled={status === "loading" || status === "success"}
                            type="submit" 
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${status === "success" 
                                    ? "bg-green-500 hover:bg-green-600 scale-100" 
                                    : "bg-gray-900 hover:bg-black hover:-translate-y-1"
                                }`}
                        >
                            {status === "loading" ? (
                                <> <Loader2 className="animate-spin" /> Sending... </>
                            ) : status === "success" ? (
                                <> <CheckCircle /> Message Sent! </>
                            ) : (
                                <> Send Message <Send size={18} /> </>
                            )}
                        </button>
                    </form>

                    {/* Fake Map Section (Visual Only) */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Find us on map</p>
                        <div className="w-full h-32 rounded-xl overflow-hidden shadow-inner opacity-80 grayscale hover:grayscale-0 transition duration-500 cursor-pointer border border-gray-200">
                             {/* Placeholder Map Image */}
                            <img 
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop" 
                                className="w-full h-full object-cover" 
                                alt="Map"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}