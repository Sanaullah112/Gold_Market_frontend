import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi";
import img from "../assets/gold.jpg";
import { useAuth } from "../pages/context/ContextApi"; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false); // Dropdown state
  const navigate = useNavigate();
  
  // Extract changeTheme instead of toggleTheme
  const { 
    isLoggedIn, 
    isSuperAdmin, 
    isAdmin, 
    logout, 
    theme, 
    changeTheme 
  } = useAuth();

  // Define your theme options
  const themes = [
    { id: "light", name: "Light", color: "bg-white border-gray-300" },
    { id: "dark", name: "Dark", color: "bg-gray-800 border-gray-700" },
    { id: "blue", name: "Deep Blue", color: "bg-blue-900 border-blue-700" },
    { id: "emerald", name: "Emerald", color: "bg-emerald-800 border-emerald-600" },
  ];

  const linkClasses = ({ isActive }) =>
    isActive
      ? "text-amber-500 font-bold border-b-2 border-amber-500 pb-1"
      : "text-gray-700 dark:text-gray-200 html.theme-blue:text-blue-200 html.theme-emerald:text-emerald-200 hover:text-amber-500 transition";

  const mobileLinkClasses = ({ isActive }) =>
    isActive
      ? "block px-3 py-2 rounded-xl text-base font-bold bg-amber-500/10 text-amber-500 border-l-4 border-amber-500"
      : "block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-amber-500 transition";

  const handleLogout = () => {
    logout(); 
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 html.theme-blue:bg-slate-900 html.theme-emerald:bg-emerald-900 shadow-md border-b border-gray-200 dark:border-gray-800 relative z-50 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-3">
            <img src={img} alt="Gold Market" className="w-10 h-10 rounded-full object-cover border border-amber-500 shadow-sm"/>
            <span className="font-extrabold text-lg text-gray-900 dark:text-white html.theme-blue:text-white html.theme-emerald:text-white tracking-wide">
              Gold Market
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={linkClasses}>Home</NavLink>
            <NavLink to="/tmr" className={linkClasses}>TMR</NavLink>

            {isSuperAdmin && <NavLink to="/super-admin/dashboard" className={linkClasses}>Super Admin</NavLink>}
            {isAdmin && <NavLink to="/admin/dashboard" className={linkClasses}>Admin Panel</NavLink>}

            {!isLoggedIn ? (
              <NavLink to="/login" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 transition shadow-md">
                <FiUser /> Login
              </NavLink>
            ) : (
              <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition shadow-md">
                <FiLogOut /> Logout
              </button>
            )}

            {/* MULTI-THEME DROPDOWN SELECTOR */}
            <div className="relative">
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)} 
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium capitalize border border-gray-200 dark:border-gray-700 transition"
              >
                <span className={`w-3 h-3 rounded-full ${themes.find(t => t.id === theme)?.color}`}></span>
                Theme
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 z-50">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        changeTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        theme === t.id ? "font-bold text-amber-500" : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border ${t.color}`}></span>
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Action Bar Buttons */}
          <div className="md:hidden flex items-center gap-3">
            {/* Simple Inline Dot Pickers for Quick Mobile Toggles */}
            <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  className={`w-5 h-5 rounded-full border transition-transform ${t.color} ${
                    theme === t.id ? "scale-125 border-amber-500 ring-2 ring-amber-500/20" : "border-transparent"
                  }`}
                  title={t.name}
                />
              ))}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-200 text-2xl p-1 outline-none">
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pt-2 pb-4 space-y-2 absolute top-16 left-0 w-full shadow-lg z-50">
          <NavLink to="/" onClick={() => setIsOpen(false)} className={mobileLinkClasses}>Home</NavLink>

          {isSuperAdmin && <NavLink to="/super-admin/dashboard" onClick={() => setIsOpen(false)} className={mobileLinkClasses}>Super Admin</NavLink>}
          {isAdmin && <NavLink to="/admin/dashboard" onClick={() => setIsOpen(false)} className={mobileLinkClasses}>Admin Panel</NavLink>}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            {!isLoggedIn ? (
              <NavLink to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 transition shadow-sm">
                <FiUser /> Login
              </NavLink>
            ) : (
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition shadow-sm">
                <FiLogOut /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;