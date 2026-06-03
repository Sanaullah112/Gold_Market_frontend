import React, { useState } from "react";
import { useAuth } from "../pages/context/ContextApi";
import Swal from "sweetalert2";
import { 
  FiUser, FiMail, FiLock, FiPhone, FiSliders, FiCheckSquare, FiUserPlus
} from "react-icons/fi";

const AddClient = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    role: "user", 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Map selected administrative privileges to clear text statuses
    const finalStatus = formData.role === "admin" ? "Admin" : "User";

    try {
      const res = await fetch( `${import.meta.env.VITE_API_URL}/api/user/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status: finalStatus
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Registration failed");

      setFormData({ name: "", email: "", password: "", contact: "", role: "user" });

      Swal.fire({
        title: "Account Provisioned",
        text: `Successfully initialized ${finalStatus} account for ${result.user?.name}`,
        icon: "success",
        confirmButtonColor: "#f59e0b", 
        background: "#09090b",
        color: "#f4f4f5",
      });

    } catch (err) {
      Swal.fire({
        title: "Provisioning Failed",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#dc2626", 
        background: "#09090b",
        color: "#f4f4f5",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-6 md:p-12 selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-zinc-900 rounded-2xl border border-white/5">
            <FiUserPlus className="text-amber-500" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter">
              Provision <span className="text-amber-500">New User</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-mono">
              Identity & Access Management Node
            </p>
          </div>
        </div>

        <div className="bg-zinc-800/40 border border-white/10 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormInput
                icon={<FiUser />}
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />

              <FormInput
                icon={<FiMail />}
                label="Secure Email Vector"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="client@domain.com"
                required
              />

              <FormInput
                icon={<FiLock />}
                label="Access Key (Password)"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
              />

              <FormInput
                icon={<FiPhone />}
                label="Comms Hotline"
                name="contact"
                type="text"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+00 300 1234567"
              />

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">
                  Privilege Allocation
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors">
                    <FiSliders />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="user" className="bg-zinc-950 text-zinc-300">Standard User / Client</option>
                    <option value="admin" className="bg-zinc-950 text-zinc-300">System Admin</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-black py-5 rounded-[1.5rem] hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-50 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Deploying Credentials...
                  </>
                ) : (
                  <>
                    <FiCheckSquare size={16} /> Authorize Account Creation
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

const FormInput = ({ icon, label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
      />
    </div>
  </div>
);

export default AddClient;