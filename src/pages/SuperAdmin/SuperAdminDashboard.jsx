import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiActivity,
  FiClock,
  FiShoppingCart,
  FiSettings,
  FiArrowRight,
  FiUsers, 
} from "react-icons/fi";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [market, setMarket] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [adminCount, setAdminCount] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [marketRes, txRes, adminRes] = await Promise.all([
        fetch( `${import.meta.env.VITE_API_URL}/api/super/admin/updated`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch( `${import.meta.env.VITE_API_URL}/api/super/admin/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch( `${import.meta.env.VITE_API_URL}/api/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const marketData = await marketRes.json();
      const txData = await txRes.json();
      const adminData = await adminRes.json();

      if (!marketRes.ok) throw new Error(marketData.message || "Failed to load market data");
      if (!txRes.ok) throw new Error(txData.message || "Failed to load transactions");
      
      setMarket(marketData.data);
      setTransactions(txData.data || []);
      setAdminCount(adminData.admins?.length || adminData.data?.length || 0);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0.00";
    return Number(value).toFixed(2);
  };

  const getActionClass = (val) =>
    Number(val) >= 0 ? "text-emerald-400" : "text-rose-400";

  const totalTx = transactions.length;
  const buyCount = transactions.filter((t) => t.action === "buy").length;
  const sellCount = transactions.filter((t) => t.action === "sell").length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-[#ba34eb]/30 to-black shadow-[0_0_40px_rgba(186,52,235,0.15)] p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%)] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide">
                Super Admin Dashboard
              </h1>
              <p className="text-slate-300 mt-2 text-sm md:text-base">
                Gold Market live control panel with market summary and transaction overview.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/super-admin/transactions")}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-[#ba34eb] font-semibold hover:bg-slate-100 transition"
              >
                <FiShoppingCart /> Transactions
              </button>

              <button
                onClick={() => navigate("/super-admin/admin-management")}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#ba34eb] text-white font-semibold hover:bg-[#c55ae6] transition"
              >
                <FiUsers /> Admin Management
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard
                title="Total Admins"
                value={adminCount}
                icon={<FiUsers />}
                color="from-blue-500 to-indigo-600"
              />
              <StatCard
                title="Total Transactions"
                value={totalTx}
                icon={<FiActivity />}
                color="from-[#ba34eb] to-[#c55ae6]"
              />
              <StatCard
                title="Buy Orders"
                value={buyCount}
                icon={<FiTrendingDown />}
                color="from-emerald-500 to-emerald-600"
              />
              <StatCard
                title="Sell Orders"
                value={sellCount}
                icon={<FiTrendingUp />}
                color="from-rose-500 to-rose-600"
              />
            </div>

            {/* MARKET CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <MarketCard
                title="Gold"
                basePrice={market?.gold}
                adjustment={market?.goldAdjustment}
                updatedPrice={market?.updatedPrices?.gold}
                color="text-amber-400"
                bg="from-amber-500/20 to-black"
              />
              <MarketCard
                title="Silver"
                basePrice={market?.silver}
                adjustment={market?.silverAdjustment}
                updatedPrice={market?.updatedPrices?.silver}
                color="text-slate-200"
                bg="from-slate-400/20 to-black"
              />
            </div>

            {/* RECENT TRANSACTIONS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Recent Transactions</h2>
                  <p className="text-sm text-slate-400">Latest activity from super admin.</p>
                </div>
                <button
                  onClick={() => navigate("/super-admin/transactions")}
                  className="inline-flex items-center gap-2 text-sm text-[#c55ae6] hover:text-white transition"
                >
                  View all <FiArrowRight />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Gold Adj.</th>
                      <th className="py-3 pr-4">Silver Adj.</th>
                      <th className="py-3 pr-4">Current Gold</th>
                      <th className="py-3 pr-4">Current Silver</th>
                      <th className="py-3 pr-4">Updated Gold</th>
                      <th className="py-3 pr-4">Updated Silver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.slice(0, 5).map((item) => (
                        <tr key={item._id} className="border-b border-slate-800">
                          <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className={`py-3 pr-4 ${getActionClass(item.goldAdjustment)}`}>
                            {Number(item.goldAdjustment) >= 0 ? "+" : ""}{formatNumber(item.goldAdjustment)}
                          </td>
                          <td className={`py-3 pr-4 ${getActionClass(item.silverAdjustment)}`}>
                            {Number(item.silverAdjustment) >= 0 ? "+" : ""}{formatNumber(item.silverAdjustment)}
                          </td>
                          <td className="py-3 pr-4 text-slate-300">${formatNumber(item.currentLivePrices?.gold)}</td>
                          <td className="py-3 pr-4 text-slate-300">${formatNumber(item.currentLivePrices?.silver)}</td>
                          <td className="py-3 pr-4 text-white font-semibold">${formatNumber(item.updatedPrices?.gold)}</td>
                          <td className="py-3 pr-4 text-white font-semibold">${formatNumber(item.updatedPrices?.silver)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-500">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl hover:scale-[1.01] transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <h3 className="text-2xl md:text-3xl font-extrabold mt-2">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

const MarketCard = ({ title, basePrice, adjustment, updatedPrice, color, bg }) => (
  <div className={`rounded-3xl border border-white/10 bg-gradient-to-br ${bg} p-5 md:p-6 shadow-xl`}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className={`text-sm font-semibold ${color}`}>{title} Market</p>
        <h3 className="text-2xl md:text-3xl font-bold mt-1">{title}</h3>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${color} bg-white/10`}>Live</div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
        <p className="text-xs text-slate-400">Base</p>
        <p className="text-lg font-bold mt-1">${Number(basePrice || 0).toFixed(2)}</p>
      </div>
      <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
        <p className="text-xs text-slate-400">Adj.</p>
        <p className={`text-lg font-bold mt-1 ${Number(adjustment) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {Number(adjustment) >= 0 ? "+" : ""}{Number(adjustment || 0).toFixed(2)}
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
        <p className="text-xs text-slate-400">Final</p>
        <p className="text-lg font-bold mt-1 text-white">${Number(updatedPrice || 0).toFixed(2)}</p>
      </div>
    </div>
  </div>
);

export default SuperAdminDashboard;