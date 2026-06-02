import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../pages/context/ContextApi"; // IMPORT CONTEXT
import Swal from "sweetalert2"; // IMPORT SWEETALERT2
import {
  FiMail,
  FiLock,
  FiShield,
  FiKey,
  FiArrowRight,
  FiUser, // Icon for User
  FiUserCheck, // Icon for Admin
} from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // EXTRACT LOGIN FUNCTION

  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    secretKey: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = "";
      let bodyData = {};

      if (role === "superadmin") {
        endpoint = "http://localhost:2000/api/super/admin/login";
        bodyData = { secretKey: formData.secretKey };
      } else if (role === "admin") {
        endpoint = "http://localhost:2000/api/admin/login";
        bodyData = {
          shopOwnerEmail: formData.email,
          password: formData.password,  
        };
      } else {
        // Updated route path to the admin client endpoint route
        endpoint = "http://localhost:2000/api/admin/loginClients";
        bodyData = { email: formData.email, password: formData.password };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Custom-themed SweetAlert Success Toast
      Swal.fire({
        icon: "success",
        title: "Access Granted",
        text: "Authorization successful. Redirecting...",
        background: "#0f172a",
        color: "#f1f5f9",
        confirmButtonColor: "#ba34eb",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        if (role === "superadmin") {
          login(data.token, "superadmin", data.user);
          navigate("/super-admin/dashboard");
        } else if (role === "admin") {
          login(
            data.token,
            "admin",
            {
              ...data.user,
              shopId: data.shopId,
            },
            data.shopId,
          );
          navigate("/admin/dashboard");
        } else if (role === "user") {
          // Destructures response data fields safely matching your client auth signature
          login(data.token, "user", data.user, data.shopRateId || null);
          navigate("/");
        }
      }, 1500);
    } catch (err) {
      // Custom-themed SweetAlert Error Box
      Swal.fire({
        icon: "error",
        title: "Authentication Failed",
        text: err.message,
        background: "#0f172a",
        color: "#f1f5f9",
        confirmButtonColor: "#e11d48",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to render role icons
  const getRoleIcon = (r) => {
    switch (r) {
      case "user":
        return <FiUser className="mb-0.5" />;
      case "admin":
        return <FiUserCheck className="mb-0.5" />;
      case "superadmin":
        return <FiShield className="mb-0.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-slate-200 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#ba34eb]/10 rounded-full blur-[150px]" />

      <div className="w-full max-w-md bg-slate-500/45 backdrop-blur-2xl border border-yellow-700 p-8 rounded-[2.5rem] shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ba34eb]/20 text-[#ba34eb] mb-4">
            <FiShield size={28} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Portal Access
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Select authorization level to continue
          </p>
        </div>

        {/* Role Switcher with Icons */}
        <div className="flex bg-[#111] p-1.5 rounded-2xl border border-white/5 mb-8">
          {["user", "admin", "superadmin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold rounded-xl transition-all ${
                role === r
                  ? "bg-[#ba34eb] text-white shadow-lg shadow-[#ba34eb]/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {getRoleIcon(r)}
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "superadmin" ? (
            <div className="relative group">
              <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#ba34eb]" />
              <input
                type="password"
                name="secretKey"
                placeholder="Access Secret Key"
                value={formData.secretKey}
                onChange={handleChange}
                required
                className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#ba34eb]/50 focus:ring-4 focus:ring-[#ba34eb]/5 transition-all text-sm"
              />
            </div>
          ) : (
            <>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#ba34eb]" />
                <input
                  type="email"
                  name="email"
                  placeholder="Network Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#ba34eb]/50 focus:ring-4 focus:ring-[#ba34eb]/5 transition-all text-sm"
                />
              </div>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#ba34eb]" />
                <input
                  type="password"
                  name="password"
                  placeholder="Access Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#ba34eb]/50 focus:ring-4 focus:ring-[#ba34eb]/5 transition-all text-sm"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ba34eb] hover:bg-[#c55ae6] py-4 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#ba34eb]/20"
          >
            {loading ? (
              "AUTHORIZING..."
            ) : (
              <>
                AUTHENTICATE <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          New Entity?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-[#ba34eb] font-bold hover:underline"
          >
            SignUp
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;