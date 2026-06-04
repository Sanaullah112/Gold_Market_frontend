import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Client/Home";
import Currency from "./pages/Client/Currency";

import Login from "./pages/Login"; // Combined auth gateway
import SignUp from "./pages/SignUp";
import AllShop from "./pages/Client/AllShop";

// Super Admin Layouts & Components
import SuperAdminLogin from "./components/SuperAdmin/SuperAdminLogin";
import SuperAdminLayout from "./components/SuperAdmin/SuperAdminLayout";
import ProtectedSuperAdminRoute from "./components/ProtectedSuperAdminRoute";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import AdminPanel from "./pages/SuperAdmin/AdminPanel"; // Your live market page
import TransactionsPage from "./pages/SuperAdmin/TransactionsPage";
import AdminManagement from "./pages/SuperAdmin/AdminManagement";

// Normal Shop Admin Layouts & Components
import AdminLayout from "./components/Admin/AdminLayout";
import ProtectedAdminRoute from "./components/Admin/ProtectedAdminRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ShopSettings from "./pages/Admin/ShopSetting";

// Global Shared Admin Sub-pages
import AddClient from "./pages/AddClient";
import AdminMarketControl from "./pages/Admin/AdminMarketControl"; // The new update form panel
import ShopTradesDashboard from "./pages/Admin/ShopTradesDashboard";
import Footer from "./components/Footer";
import GoldConverterPage from "./pages/Client/TMR";

const App = () => {
  const location = useLocation();

  // Hide main public navigation menu inside workspace dashboards
  const hideNavbar =
    location.pathname.startsWith("/super-admin") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* --- Public Client Facing Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/currency" element={<Currency />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/all-shop" element={<AllShop />} />
        <Route path="/tmr" element={<GoldConverterPage />} />

        {/* --- Super Admin Isolated Workspace Entry --- */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />

        {/* --- Super Admin Protected Dynamic Panel Layout Workspace --- */}
        <Route
          path="/super-admin"
          element={
            <ProtectedSuperAdminRoute>
              <SuperAdminLayout />
            </ProtectedSuperAdminRoute>
          }
        >
          {/* Automatically redirect from base path /super-admin to dashboard view */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          {/* FIXED: Removed the absolute '/super-admin/' prefixes on these child routes */}
          <Route path="live-market" element={<AdminPanel />} />
          <Route
            path="market-rates-control"
            element={<AdminMarketControl />}
          />{" "}
          {/* Global controls */}
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="admin-management" element={<AdminManagement />} />
          <Route path="admin-client" element={<AddClient />} />
        </Route>

        {/* --- Local Shop Admin Protected Workspace Layout --- */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          {/* Automatically redirect from base path /admin to dashboard view */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="live-market" element={<AdminPanel />} />
          <Route
            path="market-rates-control"
            element={<AdminMarketControl />}
          />{" "}
          {/* Specific shop controls */}
          <Route path="shop-settings" element={<ShopSettings />} />
          <Route path="client" element={<AddClient />} />
          <Route path="shoptrades" element={<ShopTradesDashboard />} />
        </Route>

        {/* Fallback Catch All redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!hideNavbar && <Footer />}
    </>
  );
};

export default App;
