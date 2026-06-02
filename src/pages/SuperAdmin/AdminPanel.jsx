import React, { useState, useEffect } from "react";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";

const AdminPanel = () => {
  // Store live base prices fetched from server
  const [basePrices, setBasePrices] = useState({ gold: 0, silver: 0 });

  // Separate states for values and operation types
  const [goldValue, setGoldValue] = useState("");
  const [goldType, setGoldType] = useState("add"); // 'add' or 'subtract'

  const [silverValue, setSilverValue] = useState("");
  const [silverType, setSilverType] = useState("add"); // 'add' or 'subtract'

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch current live prices on component load
  useEffect(() => {
    const fetchCurrentPrices = async () => {
      try {
        // Assuming your GET route returns live data
        const res = await fetch("http://localhost:2000/api/market/live");
        const result = await res.json();
        if (result.success) {
          setBasePrices({
            gold: result.data.gold_ounce_usd,
            silver: result.data.silver_ounce_usd,
          });
        }
      } catch (err) {
        console.log("Failed to load base prices", err);
      }
    };
    fetchCurrentPrices();
  }, []);

const handleUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  setError("");

  const finalGoldAdjustment =
    goldType === "subtract"
      ? -Math.abs(Number(goldValue))
      : Math.abs(Number(goldValue));

  const finalSilverAdjustment =
    silverType === "subtract"
      ? -Math.abs(Number(silverValue))
      : Math.abs(Number(silverValue));

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:2000/api/super/admin/adjust", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        goldAdjustment: finalGoldAdjustment,
        silverAdjustment: finalSilverAdjustment,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update prices");
    }

    setMessage(
      `Success! Updated Prices → Gold: $${data.data.updatedPrices.gold.toFixed(
        2
      )} | Silver: $${data.data.updatedPrices.silver.toFixed(2)}`
    );

    setBasePrices({
      gold: data.data.currentLivePrices.gold,
      silver: data.data.currentLivePrices.silver,
    });

    setGoldValue("");
    setSilverValue("");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Helper to calculate preview prices
  const getPreview = (base, val, type) => {
    if (!base) return "0.00";
    const num = Number(val) || 0;
    const final = type === "add" ? base + num : base - num;
    return final.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
      <div className="bg-slate-800 w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-wide">
            Live Market Price Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Easily Add (Premium) or Subtract (Discount) from real-time base rates.
          </p>
        </div>

        {/* NOTIFICATIONS */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* ================= GOLD SECTION ================= */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-amber-400 font-bold tracking-wider text-sm sm:text-base">
                🥇 GOLD (XAU/USD)
              </span>
              <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">
                Base: <strong className="text-white">${basePrices.gold.toFixed(2)}</strong>
              </span>
            </div>

            {/* TOGGLE ADD / SUBTRACT */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setGoldType("add")}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 text-xs sm:text-sm transition-all ${
                  goldType === "add"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <AiOutlineArrowUp /> Add Price (+)
              </button>

              <button
                type="button"
                onClick={() => setGoldType("subtract")}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 text-xs sm:text-sm transition-all ${
                  goldType === "subtract"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <AiOutlineArrowDown /> Subtract Price (-)
              </button>
            </div>

            {/* INPUT & PREVIEW */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Adjustment Amount ($)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 15.50"
                  value={goldValue}
                  onChange={(e) => setGoldValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
                <span className="absolute right-3 top-3 text-xs text-slate-400 font-mono">
                  Preview:{" "}
                  <strong className={goldType === "add" ? "text-emerald-400" : "text-rose-400"}>
                    ${getPreview(basePrices.gold, goldValue, goldType)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* ================= SILVER SECTION ================= */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-300 font-bold tracking-wider text-sm sm:text-base">
                🥈 SILVER (XAG/USD)
              </span>
              <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">
                Base: <strong className="text-white">${basePrices.silver.toFixed(2)}</strong>
              </span>
            </div>

            {/* TOGGLE ADD / SUBTRACT */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSilverType("add")}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 text-xs sm:text-sm transition-all ${
                  silverType === "add"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <AiOutlineArrowUp /> Add Price (+)
              </button>

              <button
                type="button"
                onClick={() => setSilverType("subtract")}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 text-xs sm:text-sm transition-all ${
                  silverType === "subtract"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <AiOutlineArrowDown /> Subtract Price (-)
              </button>
            </div>

            {/* INPUT & PREVIEW */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Adjustment Amount ($)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 0.50"
                  value={silverValue}
                  onChange={(e) => setSilverValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
                <span className="absolute right-3 top-3 text-xs text-slate-400 font-mono">
                  Preview:{" "}
                  <strong className={silverType === "add" ? "text-emerald-400" : "text-rose-400"}>
                    ${getPreview(basePrices.silver, silverValue, silverType)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-xl hover:shadow-amber-500/20 transition-all duration-300 disabled:opacity-50 tracking-wide"
          >
            {loading ? "Publishing to Live Network..." : "🚀 Publish Price Adjustments"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AdminPanel;