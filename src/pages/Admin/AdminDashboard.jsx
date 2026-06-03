import React, { useEffect, useState } from "react";
import { useAuth } from "../../pages/context/ContextApi";
import Swal from "sweetalert2"; // IMPORT SWEETALERT2
import {
  FiShoppingBag,
  FiMail,
  FiPhone,
  FiTarget,
  FiMapPin,
  FiCalendar,
  FiAlertCircle,
  FiChevronRight,
  FiCpu,
  FiZap,
} from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch( `${import.meta.env.VITE_API_URL}/api/admin/full-data`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Session Expired");
        setAdmin(result.admin);

        // SweetAlert2 Toast Welcome Notification
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
          background: "#09090b",
          color: "#f4f4f5",
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: "success",
          iconColor: "#f59e0b", // CHANGED TO AMBER / GOLD
          title: `Welcome back, ${result.admin?.shopOwnerName || "Admin"}`,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAdminData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-zinc-500 font-mono text-xs tracking-[0.3em] uppercase">
            Booting Core...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#050505]">
        <div className="bg-zinc-900 border border-red-500/20 p-8 rounded-3xl text-center">
          <FiAlertCircle className="text-red-500 mx-auto mb-4" size={40} />
          <p className="text-zinc-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 p-4 md:p-8 lg:p-16 selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-[1px] w-8 bg-emerald-500"></span>
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]">
                Master Control
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tighter">
              The{" "}
              <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8">
                Dashboard
              </span>
            </h1>
            {/* The New Styled P Tag */}
            <p className="mt-4 text-zinc-500 text-sm font-medium tracking-wide">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 font-bold uppercase tracking-tighter">
                {admin?.shopOwnerName || "Administrator"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-white font-bold text-sm">
                {admin?.shopOwnerName}
              </p>
              <p className="text-[10px] font-mono text-zinc-600">
                ID: {admin?.shopOwnerCNIC?.slice(-6)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl">
              <FiCpu className="text-emerald-500" size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info Side */}
          <div className="lg:col-span-2 space-y-10">
            {/* Minimal Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[280px]">
              <ModernCard
                icon={<FiShoppingBag />}
                label="Business Title"
                value={admin?.shopName}
              />
              <ModernCard
                icon={<FiPhone />}
                label="System Contact"
                value={admin?.shopContact}
              />
              <ModernCard
                icon={<FiMail />}
                label="Secure Email"
                value={admin?.shopOwnerEmail}
              />
              <ModernCard
                icon={<FiTarget />}
                label="Authentication"
                value={admin?.shopOwnerCNIC}
              />
            </div>

            {/* Profile Detail Box */}
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-10">
                <div className="flex items-center gap-3 mb-8">
                  <FiZap className="text-emerald-500 fill-emerald-500/20" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Vitals & Infrastructure
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <InfoRow
                      icon={<FiMapPin />}
                      label="Operational Base"
                      value={admin?.shopAddress}
                    />
                    <InfoRow
                      icon={<FiCalendar />}
                      label="Activation Date"
                      value={new Date(admin?.createdAt).toDateString()}
                    />
                  </div>
                  <div className="p-6 rounded-3xl bg-zinc-950/50 border border-white/5">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">
                      Core Mission
                    </p>
                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                      "
                      {admin?.description ||
                        "Strategic commerce partner delivering excellence."}
                      "
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Sidebar */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-white/5 rounded-[3rem] p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 rounded-[2rem] bg-black border border-white/10 p-1 group">
                  <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-zinc-900 relative">
                    {admin?.logo ? (
                      <img
                        src={` ${import.meta.env.VITE_API_URL}/uploads/${admin.logo}`}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800">
                        <FiShoppingBag size={40} />
                      </div>
                    )}
                  </div>
                </div>
                <RiVerifiedBadgeFill
                  className="absolute -bottom-2 -right-2 text-emerald-500 bg-black rounded-full p-0.5"
                  size={32}
                />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight mb-1">
                {admin?.shopName}
              </h3>
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                {admin?.role}
              </p>

              <div className="space-y-4">
                <StatusTag
                  label="Global Status"
                  value={admin?.isActive ? "ACTIVE" : "INACTIVE"}
                  isOnline={admin?.isActive}
                />
                <StatusTag
                  label="System Authority"
                  value={admin?.createdBy || "ROOT"}
                />
              </div>

              <button className="w-full mt-12 py-5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                Configure Node <FiChevronRight />
              </button>
            </div>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl text-center">
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                Storage Efficiency
              </p>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full mt-3 overflow-hidden">
                <div className="h-full w-[78%] bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const ModernCard = ({ icon, label, value }) => (
  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] hover:bg-zinc-900 transition-colors group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-black rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-white font-bold  text-sm">
          {value || "---"}
        </p>
      </div>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex gap-4">
    <div className="text-emerald-500 mt-1">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <p className="text-zinc-200 text-sm font-medium leading-relaxed">
        {value || "Not Set"}
      </p>
    </div>
  </div>
);

const StatusTag = ({ label, value, isOnline }) => (
  <div className="flex justify-between items-center px-6 py-4 bg-black/50 rounded-2xl border border-white/5">
    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
      {label}
    </span>
    <span
      className={`text-[10px] font-black ${isOnline ? "text-emerald-500" : "text-zinc-400"}`}
    >
      {value}
    </span>
  </div>
);

export default AdminDashboard;
