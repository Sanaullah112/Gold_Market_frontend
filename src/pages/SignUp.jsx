import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../pages/context/ContextApi";
import Swal from "sweetalert2"; // IMPORT SWEETALERT2
import { 
  FiUser, FiMail, FiLock, FiPhone, FiArrowRight, 
  FiGlobe, FiCamera, FiPlus
} from "react-icons/fi";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file)); // Formats temporary system view path
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Optional Visual Guard: Warn if an avatar hasn't been uploaded yet
    if (!profileImage) {
      const confirmation = await Swal.fire({
        title: "Missing Avatar",
        text: "You haven't uploaded an identity verification image. Proceed anyway?",
        icon: "question",
        background: "#0f172a",
        color: "#f1f5f9",
        showCancelButton: true,
        confirmButtonColor: "#ba34eb",
        cancelButtonColor: "#334155",
        confirmButtonText: "Yes, continue",
        cancelButtonText: "Upload Image"
      });
      
      if (!confirmation.isConfirmed) return;
    }

    setLoading(true);

    // 2. Open non-closable loader while multipart streams clear
    Swal.fire({
      title: "Creating Identity...",
      text: "Uploading system profiles to central database secure ledger.",
      background: "#0f172a",
      color: "#f1f5f9",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Construct FormData to support raw binary media data streams
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("password", formData.password);
      
      if (profileImage) {
        payload.append("profilePic", profileImage);
      }

      const res = await fetch("http://localhost:2000/api/admin/client", {
        method: "POST",
        body: payload, // Send multipart stream directly without headers wrapper
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      // 3. Success Notification
      Swal.fire({
        icon: "success",
        title: "Identity Verified",
        text: "Account registered successfully within the network.",
        background: "#0f172a",
        color: "#f1f5f9",
        confirmButtonColor: "#ba34eb",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        if (data.token) {
          login(data.token, "user", data.user || { name: formData.name });
          navigate("/");
        } else {
          navigate("/login");
        }
      }, 2000);
      
    } catch (err) {
      // 4. Fallback Error Notification
      Swal.fire({
        icon: "error",
        title: "Registration Rejected",
        text: err.message,
        background: "#0f172a",
        color: "#f1f5f9",
        confirmButtonColor: "#e11d48",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-slate-200 selection:bg-[#ba34eb] selection:text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ba34eb]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden m-4 relative z-10">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1a1a1a] to-[#050505] border-r border-white/5">
          <div className="flex items-center gap-2 text-[#ba34eb] font-bold text-xl tracking-tighter">
            <FiGlobe className="animate-spin-slow" /> CORE SYSTEMS
          </div>
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba34eb] to-blue-400">Digital Assets.</span>
            </h1>
            <p className="text-slate-400 max-w-sm">Secure your position in the global market with our encrypted administrative protocol.</p>
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-[0.2em]">© 2026 NEXUS PROTOCOL v3.0</div>
        </div>

        <div className="p-8 md:p-14 lg:p-16 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Enter your credentials to gain access.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* PROFILE IMAGE AVATAR UPLOADER SELECTOR */}
            <div className="flex flex-col items-center justify-center mb-6">
              <label className="relative group cursor-pointer block">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-700 bg-zinc-900 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#ba34eb]/50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-zinc-500 group-hover:text-zinc-400">
                      <FiCamera className="mx-auto text-xl mb-1" />
                      <span className="text-[10px] font-bold block uppercase tracking-wide">Avatar</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 bg-[#ba34eb] text-white rounded-full shadow-md transform translate-x-1 translate-y-1">
                  <FiPlus size={12} className="font-black" />
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
              <p className="text-[11px] text-zinc-500 font-medium mt-2">Identity Verification Reference Image</p>
            </div>

            <InputField icon={<FiUser />} name="name" placeholder="Full Identity Name" value={formData.name} onChange={handleChange} />
            <InputField icon={<FiMail />} name="email" type="email" placeholder="Network Email Address" value={formData.email} onChange={handleChange} />
            <InputField icon={<FiPhone />} name="phone" type="number" placeholder="Contact Phone Terminal" value={formData.phone} onChange={handleChange} />
            <InputField icon={<FiLock />} name="password" type="password" placeholder="Access Password Key" value={formData.password} onChange={handleChange} />

            <button
              disabled={loading}
              className="w-full mt-6 group relative px-8 py-4 bg-[#ba34eb] text-white font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? "PROCESSING..." : <>JOIN NETWORK <FiArrowRight /></>}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Known Entity? <button onClick={() => navigate("/login")} className="text-[#ba34eb] hover:text-white font-bold underline-offset-4 hover:underline transition-all">RE-AUTHENTICATE</button>
          </p>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#ba34eb] transition-colors">{icon}</div>
    <input
      {...props}
      required
      className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#ba34eb]/50 focus:ring-4 focus:ring-[#ba34eb]/5 transition-all text-sm placeholder:text-slate-600"
    />
  </div>
);

export default SignUp;