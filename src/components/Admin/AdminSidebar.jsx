import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
import { AiOutlineUsergroupAdd, } from "react-icons/ai";
import {
  FiGrid,
  FiTrendingUp,
  FiLogOut,
  FiShield,
  FiMenu,
  FiX,
  FiSettings,
   FiBarChart2,
  FiInbox
} from "react-icons/fi";

// Destructure open and setOpen directly from component props
const AdminSidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(
          "http://localhost:2000/api/admin/full-data",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();
        if (res.ok) {
          setAdmin(result.admin);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (token) fetchAdmin();
  }, [token]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      isActive
        ? "bg-amber-500 text-black font-semibold"
        : "text-gray-250 hover:bg-slate-800 hover:text-white"
    }`;

  const handleLogout = () => {
  Swal.fire({
    title: "Exit System?",
    text: "Are you sure you want to terminate your administrative session?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#334155",
    confirmButtonText: "Yes, Terminate",
    background: "#0f172a",
    color: "#f1f5f9",
  }).then((result) => {
    if (result.isConfirmed) {

      // clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      // force reload auth state
      window.location.href = "/login";
    }
  });
};

  const handleProfileClick = () => {
    navigate("/admin/shop-settings");
    closeMenu();
  };

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* Top Navigation Header (Global across both desktop and mobile platforms) */}
      <div className="flex items-center justify-between bg-slate-500 text-white px-4 py-3 border-b border-slate-800 fixed top-0 left-0 right-0 h-16 z-30">
        
        {/* Interactive Profile Information */}
        <div 
          onClick={handleProfileClick}
          className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500 flex items-center justify-center text-black font-bold">
            {admin?.logo ? (
              <img
                src={`http://localhost:2000/uploads/${admin.logo}`}
                alt="Shop Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <FiShield />
            )}
          </div>

          <div>
            <h1 className="text-sm font-bold group-hover:text-amber-400 transition-colors">
              {admin?.shopOwnerName || "Admin"}
            </h1>
            <p className="text-[11px] text-slate-400">
              {admin?.shopName || "Shop Name"}
            </p>
          </div>
        </div>

        {/* Global Layout Controller Button */}
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg bg-slate-800 text-white transition-colors duration-200"
        >
          {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Backdrop Dimmer Overlay (Handled specifically on mobile screens) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Content Panel Container */}
      <aside
        className={`
          fixed top-16 left-0 z-50
          h-[calc(100vh-4rem)]
          w-72 bg-slate-500 border-r border-slate-800 text-white
          p-5 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Desktop Profile Link Representation */}
        <div className="mb-8 hidden md:block">
          <div  
            onClick={handleProfileClick}
            className="flex items-center gap-3 mb-2 cursor-pointer group hover:translate-x-1 transition-transform"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden bg-amber-500 flex items-center justify-center text-black font-bold shrink-0">
              {admin?.logo ? (
                <img
                  src={`http://localhost:2000/uploads/${admin.logo}`}
                  alt="Shop Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiShield />
              )}
            </div>

            <div className="overflow-hidden">
              <h1 className="text-lg font-bold group-hover:text-amber-400 transition-colors truncate">
                {admin?.shopOwnerName || "Admin"}
              </h1>
              <p className="text-xs text-green-200 truncate">
                {admin?.shopName || "Shop Name"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Map Links */}
        <nav className="flex-1 space-y-2">
          <NavLink to="dashboard" className={linkClass} onClick={closeMenu}>
            <FiGrid /> Dashboard
          </NavLink>

          <NavLink to="live-market" className={linkClass} onClick={closeMenu}>
            <FiTrendingUp /> Live Market
          </NavLink>

          <NavLink to="shop-settings" className={linkClass} onClick={closeMenu}>
            <FiSettings /> Shop Setting
          </NavLink>

          <NavLink to="client" className={linkClass} onClick={closeMenu}>
            <AiOutlineUsergroupAdd /> Add Client
          </NavLink>

          <NavLink to="market-rates-control" className={linkClass} onClick={closeMenu}>
            <FiBarChart2 /> Market Rate
          </NavLink>

           <NavLink to="shoptrades" className={linkClass} onClick={closeMenu}>
            <FiInbox /> Customer Request
          </NavLink>
        </nav>

        {/* Logout Control Action Button */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold"
        >
          <FiLogOut /> Logout
        </button>
      </aside>
    </>
  );
};

export default AdminSidebar;