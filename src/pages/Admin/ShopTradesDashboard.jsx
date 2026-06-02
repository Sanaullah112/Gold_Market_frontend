import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUser,
  FiPhone,
  FiHash,
  FiShoppingBag,
  FiDollarSign,
  FiFilter,
  FiActivity,
} from "react-icons/fi";
import { useAuth } from "../context/ContextApi";

const ShopTradesDashboard = () => {
  // Replace placeholder with active dashboard state user logic context tracking

  const [trades, setTrades] = useState([]);
  const [filterType, setFilterType] = useState("buy"); // Default view selection
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { shopId, token } = useAuth();

  useEffect(() => {
    if (!shopId) return;

  const fetchFilteredTrades = async () => {
  try {
    setLoading(true);

    const response = await axios.get(
      `http://localhost:2000/api/admin/shop/${shopId}/trades?type=${filterType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setTrades(response.data.data);
    }
  } catch (err) {
    console.log(err);
    setError(err.response?.data?.message || "Failed to load trades");
  } finally {
    setLoading(false);
  }
};

    fetchFilteredTrades();
  }, [filterType, shopId]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <FiActivity className="text-[#ba34eb]" /> Order Activity Console
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review incoming client request queues and user profiles.
            </p>
          </div>

          {/* DYNAMIC TOGGLE FILTER CONTROL */}
          <div className="flex items-center gap-1 bg-[#111] p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => setFilterType("buy")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterType === "buy"
                  ? "bg-[#ba34eb] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FiShoppingBag /> Buy Requests
            </button>
            <button
              onClick={() => setFilterType("sell")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterType === "sell"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FiDollarSign /> Sell Requests
            </button>
          </div>
        </div>

        {/* MESSAGES SYSTEM ALERT LAYERS */}
        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* RUNTIME LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 bg-[#0a0a0a] border border-white/5 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0a0a]/50 border border-white/5 rounded-3xl backdrop-blur-md">
            <FiFilter className="mx-auto text-4xl text-slate-600 mb-3" />
            <p className="text-slate-400 text-sm font-semibold">
              No active {filterType} trade orders found matching this parameter
              state.
            </p>
          </div>
        ) : (
          /* TRADES GRID DISPATCH BLOCK */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trades.map((item) => {
              const customer = item.userId;
              return (
                <div
                  key={item._id}
                  className="bg-[#0a0a0a]/90 border border-white/5 rounded-3xl p-6 transition-all hover:border-white/10 hover:shadow-xl flex flex-col justify-between"
                >
                  {/* CUSTOMER METRICS OVERVIEW STRIP */}
                  <div className="flex items-start gap-4">
                    {/* CUSTOMER IMAGE / AVATAR LAYER */}
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                      {customer?.profilePic ? (
                        <img
                          src={`http://localhost:2000/uploads/${customer.profilePic}`}
                          alt="Customer Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 font-bold uppercase text-lg">
                          {customer?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>

                    {/* CORE CUSTOMER ACCOUNT METRICS */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block mb-1.5 ${
                          item.type === "buy"
                            ? "bg-[#ba34eb]/10 text-[#ba34eb]"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        Client Order: {item.type}
                      </span>
                      <h3 className="text-base font-bold text-white truncate tracking-wide">
                        {customer?.name || "Anonymous Client"}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-1 truncate">
                        <FiHash className="shrink-0" /> ID:{" "}
                        {customer?._id || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* CUSTOMER TERMINAL DATA SPECS */}
                  <div className="my-5 py-4 border-y border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <FiPhone /> Phone Vector
                      </span>
                      <span className="text-slate-300 font-medium">
                        {customer?.phone || "No Registry Trace"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Commodity Target</span>
                      <span className="text-white font-bold">{item.metal}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Calculated Volume</span>
                      <span className="text-slate-300 font-mono font-bold">
                        {item.weight} Tola
                      </span>
                    </div>
                  </div>

                  {/* PRICE SUMMARY VALUE BLOCK */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3">
                    <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                      Total Clearing Value
                    </span>
                    <span
                      className={`text-base font-black font-mono ${
                        item.type === "buy" ? "text-[#ba34eb]" : "text-cyan-400"
                      }`}
                    >
                      PKR {item.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopTradesDashboard;
