import React, { useEffect, useState } from "react";
import Swal from "sweetalert2"; 
import { 
  FiUserPlus, 
  FiUsers, 
  FiShoppingBag, 
  FiMapPin, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiCreditCard, 
  FiLock, 
  FiFileText,
  FiActivity,
  FiShield
} from "react-icons/fi";

const AdminManagement = () => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    shopName: "",
    shopAddress: "",
    shopOwnerName: "",
    shopContact: "",
    shopOwnerEmail: "",
    shopOwnerCNIC: "",
    description: "",
    password: "",
  });

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // SweetAlert Custom Toast Configuration
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "#0f172a",
    color: "#f1f5f9",
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    }
  });

  const fetchAdmins = async () => {
    try {
      const res = await fetch( `${import.meta.env.VITE_API_URL}/api/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load admins");
      setAdmins(data.data || []);
    } catch (err) {
      Toast.fire({ icon: "error", title: err.message });
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch( `${import.meta.env.VITE_API_URL}/api/admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create admin");

      // Success Alert Box
      Swal.fire({
        icon: "success",
        title: "Admin Provisioned",
        text: "New administrator account established successfully.",
        background: "#0f172a",
        color: "#f1f5f9",
        confirmButtonColor: "#ba34eb"
      });

      setFormData({
        shopName: "", shopAddress: "", shopOwnerName: "",
        shopContact: "", shopOwnerEmail: "", shopOwnerCNIC: "",
        description: "", password: "",
      });
      fetchAdmins();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Provisioning Failed",
        text: err.message,
        background: "#0f172a",
        color: "#f1f5f9",
        confirmButtonColor: "#e11d48"
      });
    } finally {
      setLoading(false);
    }
  };

  // Interactive Confirmation & State Toggle with SweetAlert
  const toggleStatus = async (id, currentStatus, shopName) => {
    const actionText = currentStatus ? "Revoke Access" : "Grant Access";
    const confirmButtonColor = currentStatus ? "#e11d48" : "#ba34eb";

    Swal.fire({
      title: `${actionText}?`,
      text: `Are you sure you want to alter clearance levels for ${shopName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: "#334155",
      confirmButtonText: `Yes, ${actionText}`,
      background: "#0f172a",
      color: "#f1f5f9",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch( `${import.meta.env.VITE_API_URL}/api/admin/toggle-status/${id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to update status");

          Toast.fire({
            icon: "success",
            title: `Clearance updated successfully.`
          });
          
          fetchAdmins();
        } catch (err) {
          Toast.fire({
            icon: "error",
            title: err.message
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <FiShield className="text-[#ba34eb]" /> 
              Super Admin Control Center
            </h1>
            <p className="text-slate-400 mt-1">Manage partner shops and administrative privileges.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
              <div className="bg-[#ba34eb]/20 p-2 rounded-lg">
                <FiUsers className="text-[#ba34eb]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Admins</p>
                <p className="text-xl font-bold text-white">{admins.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          
          {/* Form Side */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-[#ba34eb] flex items-center justify-center shadow-[0_0_15px_rgba(186,52,235,0.4)]">
                  <FiUserPlus className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-bold text-white">Register New Admin</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={<FiShoppingBag />} placeholder="Shop Name" value={formData.shopName} onChange={(val) => setFormData({...formData, shopName: val})} />
                  <InputField icon={<FiUser />} placeholder="Owner Name" value={formData.shopOwnerName} onChange={(val) => setFormData({...formData, shopOwnerName: val})} />
                </div>
                
                <InputField icon={<FiMapPin />} placeholder="Full Shop Address" value={formData.shopAddress} onChange={(val) => setFormData({...formData, shopAddress: val})} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={<FiPhone />} placeholder="Contact Number" value={formData.shopContact} onChange={(val) => setFormData({...formData, shopContact: val})} />
                  <InputField icon={<FiCreditCard />} placeholder="Owner CNIC" value={formData.shopOwnerCNIC} onChange={(val) => setFormData({...formData, shopOwnerCNIC: val})} />
                </div>

                <InputField icon={<FiMail />} type="email" placeholder="Email Address" value={formData.shopOwnerEmail} onChange={(val) => setFormData({...formData, shopOwnerEmail: val})} />
                <InputField icon={<FiLock />} type="password" placeholder="Access Password" value={formData.password} onChange={(val) => setFormData({...formData, password: val})} />
                
                <div className="relative group">
                  <FiFileText className="absolute left-4 top-4 text-slate-500 group-focus-within:text-[#ba34eb] transition-colors" />
                  <textarea
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-[#ba34eb]/50 focus:ring-4 focus:ring-[#ba34eb]/10 transition-all text-sm min-h-[100px] resize-none"
                    placeholder="Brief shop description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#ba34eb] to-[#7928ca] hover:shadow-[0_0_20px_rgba(186,52,235,0.3)] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiUserPlus /> Provision Admin</>}
                </button>
              </form>
            </div>
          </div>

          {/* Table Side */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <FiActivity className="text-[#ba34eb] text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Active Directory</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 uppercase tracking-widest text-[10px] font-black border-b border-slate-800">
                    <tr>
                      <th className="pb-4 px-2">Shop & Owner</th>
                      <th className="pb-4 px-2">Contact Info</th>
                      <th className="pb-4 px-2">Status</th>
                      <th className="pb-4 px-2 text-right">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {admins.length > 0 ? (
                      admins.map((admin) => (
                        <tr key={admin._id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-5 px-2">
                            <p className="font-bold text-white group-hover:text-[#ba34eb] transition-colors">{admin.shopName}</p>
                            <p className="text-xs text-slate-500">{admin.shopOwnerName}</p>
                          </td>
                          <td className="py-5 px-2">
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 text-slate-300 text-xs">
                                <FiMail className="text-[10px] text-[#ba34eb]" /> {admin.shopOwnerEmail}
                              </span>
                              <span className="text-slate-500 text-xs">{admin.shopContact}</span>
                            </div>
                          </td>
                          <td className="py-5 px-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                admin.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                              }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${admin.isActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                              {admin.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="py-5 px-2 text-right">
                            <button
                              onClick={() => toggleStatus(admin._id, admin.isActive, admin.shopName)}
                              className={`px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all active:scale-95 ${
                                admin.isActive 
                                  ? "bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white" 
                                  : "bg-[#ba34eb] text-white hover:bg-[#c55ae6]"
                              }`}
                            >
                              {admin.isActive ? "Revoke Access" : "Grant Access"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-20">
                            <FiUsers size={48} />
                            <p className="text-lg font-medium tracking-tight">No administrators registered</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ icon, type = "text", placeholder, value, onChange }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#ba34eb] transition-colors">
      {icon}
    </div>
    <input
      type={type}
      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#ba34eb]/50 focus:ring-4 focus:ring-[#ba34eb]/10 transition-all text-sm placeholder:text-slate-600"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    />
  </div>
);

export default AdminManagement;