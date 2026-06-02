import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import {
  FiGrid,
  FiTrendingUp,
  FiLogOut,
  FiShield,
  FiMenu,
  FiX,
} from "react-icons/fi";

// Destructure open and setOpen coming from the Parent Layout
const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();

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
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    });
  };

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-500 text-white px-4 py-3 border-b border-slate-800 fixed top-0 left-0 right-0 h-16 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">
            <FiShield />
          </div>
          <div>
            <h1 className="text-sm font-bold">Super Admin</h1>
            <p className="text-[11px] text-slate-400">Gold Market Control</p>
          </div>
        </div>

        {/* Dynamic Menu Button */}
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg bg-slate-800 text-white transition-colors duration-200"
        >
          {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Dimmed Overlay (Mobile Only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Drawer */}
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
        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">
              <FiShield />
            </div>
            <div>
              <h1 className="text-lg font-bold">Super Admin</h1>
              <p className="text-xs text-green-200">Gold Market Control</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-2">
          <NavLink to="dashboard" className={linkClass} onClick={closeMenu}>
            <FiGrid /> Dashboard
          </NavLink>

          <NavLink to="live-market" className={linkClass} onClick={closeMenu}>
            <FiTrendingUp /> Live Market
          </NavLink>

          <NavLink to="transactions" className={linkClass} onClick={closeMenu}>
            <FiTrendingUp /> Transactions
          </NavLink>

          <NavLink to="admin-management" className={linkClass} onClick={closeMenu}>
            <AiOutlineUsergroupAdd /> Admin Management
          </NavLink>
          
          <NavLink to="admin-client" className={linkClass} onClick={closeMenu}>
            <AiOutlineUsergroupAdd /> Client Management
          </NavLink>

          <NavLink to="market-rates-control" className={linkClass} onClick={closeMenu}>
            <AiOutlineUsergroupAdd /> Market Management
          </NavLink>
        </nav>

        {/* Logout */}
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

export default Sidebar;