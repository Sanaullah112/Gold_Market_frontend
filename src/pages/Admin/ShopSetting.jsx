import React, { useEffect, useState } from "react";
import { useAuth } from "../../pages/context/ContextApi";
import Swal from "sweetalert2"; // IMPORT SWEETALERT2
import { 
  FiShoppingBag, 
  FiMapPin, 
  FiPhone, 
  FiUploadCloud, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiSettings,
  FiEye
} from "react-icons/fi";

const ShopSettings = () => {
  const { token } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    shopName: "",
    shopAddress: "",
    shopContact: "",
    logo: null,
  });

  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch( `${import.meta.env.VITE_API_URL}/api/admin/full-data`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setAdmin(result.admin);
        setFormData({
          shopName: result.admin.shopName || "",
          shopAddress: result.admin.shopAddress || "",
          shopContact: result.admin.shopContact || "",
          logo: null,
        });

        if (result.admin.logo) {
          setPreview( `${import.meta.env.VITE_API_URL}/uploads/${result.admin.logo}`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchAdminData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, logo: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();
      data.append("shopName", formData.shopName);
      data.append("shopAddress", formData.shopAddress);
      data.append("shopContact", formData.shopContact);
      if (formData.logo) data.append("logo", formData.logo);

      const res = await fetch( `${import.meta.env.VITE_API_URL}/api/admin/update-shop`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");

      setAdmin(result.data);
      if (result.data.logo) setPreview( `${import.meta.env.VITE_API_URL}/uploads/${result.data.logo}`);
      
      setMessage("Configurations saved successfully.");

      // SweetAlert2 Success Alert
      Swal.fire({
        title: "System Synchronized",
        text: "Configurations saved successfully.",
        icon: "success",
        confirmButtonColor: "#10b981", // Emerald-500 matching theme accent
        background: "#09090b",
        color: "#f4f4f5",
      });

    } catch (err) {
      setError(err.message);

      // SweetAlert2 Error Alert
      Swal.fire({
        title: "Sync Error",
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

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Fetching System Params...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-6 md:p-12 selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-zinc-900 rounded-2xl border border-white/5">
            <FiSettings className="text-emerald-500 animate-[spin_4s_linear_infinite]" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter">System <span className="text-emerald-500">Settings</span></h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-mono">Infrastructure Management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Side */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Alert Notifications */}
              {message && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl animate-pulse">
                  <FiCheckCircle /> <span className="text-sm font-medium">{message}</span>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl">
                  <FiAlertCircle /> <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6 backdrop-blur-md">
                
                {/* Inputs */}
                <CustomInput 
                  icon={<FiShoppingBag />} 
                  label="Legal Shop Name" 
                  name="shopName" 
                  value={formData.shopName} 
                  onChange={handleChange} 
                  placeholder="e.g. Nexus Tech Store"
                />

                <CustomInput 
                  icon={<FiMapPin />} 
                  label="Operational Address" 
                  name="shopAddress" 
                  value={formData.shopAddress} 
                  onChange={handleChange} 
                  placeholder="Complete physical location"
                />

                <CustomInput 
                  icon={<FiPhone />} 
                  label="Business Contact Number" 
                  name="shopContact" 
                  value={formData.shopContact} 
                  onChange={handleChange} 
                  placeholder="+00 000 000000"
                />

                {/* File Upload Area */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Brand Identity (Logo)</label>
                  <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-zinc-500 group-hover:text-emerald-500">
                      <FiUploadCloud size={30} className="mb-2" />
                      <p className="text-xs font-medium">Click to upload new brand asset</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFile} />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-5 rounded-[1.5rem] hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.2em]"
                >
                  {loading ? "Synchronizing..." : "Save Configurations"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side Preview */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-900 border border-white/5 rounded-[3rem] p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-10">
                <FiEye className="text-emerald-500" />
                <h2 className="text-lg font-bold text-white tracking-tight">Real-time Preview</h2>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative group mb-8">
                  <div className="absolute -inset-1.5 bg-emerald-500/20 rounded-[2.5rem] blur opacity-40 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative w-48 h-48 bg-black rounded-[2.2rem] border border-white/10 overflow-hidden flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <FiShoppingBag className="text-zinc-800" size={60} />
                    )}
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <PreviewItem label="Broadcast Name" value={formData.shopName || "Unset Entity"} />
                  <PreviewItem label="Logistics Route" value={formData.shopAddress || "Global Node"} />
                  <PreviewItem label="Comms Channel" value={formData.shopContact || "Offline"} />
                </div>

                <div className="mt-8 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 w-full">
                  <p className="text-[10px] text-emerald-500 font-bold uppercase text-center tracking-widest">Previewing Production Environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const CustomInput = ({ icon, label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
      />
    </div>
  </div>
);

const PreviewItem = ({ label, value }) => (
  <div className="bg-black/50 border border-white/5 p-4 rounded-2xl">
    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-zinc-200 text-sm font-bold truncate tracking-tight">{value}</p>
  </div>
);

export default ShopSettings;