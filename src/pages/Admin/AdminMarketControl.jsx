import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../context/ContextApi"; // Adjust this import path to point to your context file location

const AdminMarketControl = () => {
  // --- CONSUMING STATE DRIVERS FROM YOUR CONTEXT API ---
  const { shopId, role, isSuperAdmin } = useAuth();

  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [basePrices, setBasePrices] = useState({ gold: 0, silver: 0, pkr: 278.50 });
  
  // New State for handling the shop agreement text input
  const [agreementText, setAgreementText] = useState("");

  // Structured State Form Data Layout
  const [formData, setFormData] = useState({
    metals: {
      gold24K: { sell: 0, buy: 0 },
      gold21K: { sell: 0, buy: 0 },
      silver: { sell: 0, buy: 0 }
    },
    currencies: {
      usd: { sell: 0, buy: 0 },
      sar: { sell: 0, buy: 0 },
      aed: { sell: 0, buy: 0 },
      gbp: { sell: 0, buy: 0 },
      eur: { sell: 0, buy: 0 }
    }
  });

  // Fetch current live baseline prices from the server stream
  useEffect(() => {
    const fetchLiveFeed = async () => {
      try {
        const res = await axios.get( `${import.meta.env.VITE_API_URL}/api/market/live`);
        if (res.data.success) {
          setBasePrices({
            gold: res.data.data.gold_ounce_usd || 0,
            silver: res.data.data.silver_ounce_usd || 0,
            pkr: res.data.data.usd?.to_pkr || 278.50
          });
        }
      } catch (err) {
        console.error("Failed to load live baseline metrics:", err);
      }
    };
    fetchLiveFeed();
  }, []);

  // Load shops list overview conditionally based on dynamic Context API Auth roles
  useEffect(() => {
    if (isSuperAdmin) {
      axios.get( `${import.meta.env.VITE_API_URL}/api/market-rates`)
        .then((res) => {
          if (res.data.shops && res.data.shops.length > 0) {
            setShops(res.data.shops);
            setSelectedShopId(res.data.shops[0]._id);
            loadShopDataIntoForm(res.data.shops[0]);
          }
        })
        .catch(err => console.error("Error fetching shops list:", err));
    } else if (shopId && shopId !== "null" && shopId !== "undefined") {
      setSelectedShopId(shopId);
      axios.get( `${import.meta.env.VITE_API_URL}/api/market-rates/${shopId}`)
        .then((res) => {
          if (res.data.shop) {
            loadShopDataIntoForm(res.data.shop);
          }
        })
        .catch(err => console.error("Error fetching individual shop info:", err));
    }
  }, [isSuperAdmin, shopId]);

  const loadShopDataIntoForm = (shop) => {
    if (shop) {
      setAgreementText(shop.agreementText || ""); // Load existing agreement text if present
      setFormData({
        metals: shop.metals || {
          gold24K: { sell: 0, buy: 0 },
          gold21K: { sell: 0, buy: 0 },
          silver: { sell: 0, buy: 0 }
        },
        currencies: shop.currencies || {
          usd: { sell: 0, buy: 0 },
          sar: { sell: 0, buy: 0 },
          aed: { sell: 0, buy: 0 },
          gbp: { sell: 0, buy: 0 },
          eur: { sell: 0, buy: 0 }
        }
      });
    }
  };

  const handleNestedInputChange = (category, item, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category][item],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    let runtimeId = selectedShopId;
    if ((!runtimeId || runtimeId === "null") && !isSuperAdmin) {
      runtimeId = shopId;
    }

    if (!runtimeId || runtimeId === "null" || runtimeId === "undefined") {
      Swal.fire({
        title: "Submission Blocked",
        text: "No valid active Target Shop ID was found inside your global Auth context profile.",
        icon: "warning",
        background: "#0f172a",
        color: "#f1f5f9",
        confirmButtonColor: "#f59e0b"
      });
      return;
    }

    // Combine standard rate structured values with the text field inside payload
    const submissionPayload = {
      ...formData,
      agreementText: agreementText 
    };

    try {
      const res = await axios.put( `${import.meta.env.VITE_API_URL}/api/market-rates/update/${runtimeId}`, submissionPayload);
      if (res.data.success) {
        Swal.fire({
          title: "Rates & Agreement Saved!",
          text: "Live showcase dashboard updated successfully.",
          icon: "success",
          background: "#0f172a",
          color: "#f1f5f9",
          confirmButtonColor: "#f59e0b"
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ 
        title: "Error Updating rates", 
        text: err.response?.data?.message || "Internal network processing failure validation crash.",
        icon: "error",
        background: "#0f172a",
        color: "#f1f5f9"
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white shadow-2xl">
      <h2 className="text-xl font-bold text-amber-500 mb-2">Update Shop Rates Panel</h2>
      <p className="text-xs text-slate-400 mb-4">Manage real-time gold base weight limits and foreign cash conversions.</p>

      {/* Live Market Indices Status Bar Indicator */}
      <div className="grid grid-cols-3 gap-3 bg-slate-950 border border-slate-800/80 rounded-xl p-3 mb-6 text-center font-mono text-xs">
        <div>
          <span className="block text-[10px] text-slate-500 uppercase font-sans font-semibold">Live Gold (Oz)</span>
          <span className="text-amber-400 font-bold">${basePrices.gold ? basePrices.gold.toFixed(2) : "0.00"}</span>
        </div>
        <div className="border-x border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-sans font-semibold">Live Silver (Oz)</span>
          <span className="text-slate-300 font-bold">${basePrices.silver ? basePrices.silver.toFixed(2) : "0.00"}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500 uppercase font-sans font-semibold">USD / PKR</span>
          <span className="text-cyan-400 font-bold">{basePrices.pkr ? basePrices.pkr.toFixed(2) : "0.00"}</span>
        </div>
      </div>

      <form onSubmit={handleUpdateSubmit} className="space-y-6">
        {/* Conditional Super Admin Selector Module */}
        {isSuperAdmin && shops.length > 0 && (
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Select Target Shop</label>
            <select
              value={selectedShopId}
              onChange={(e) => {
                setSelectedShopId(e.target.value);
                const matched = shops.find(s => s._id === e.target.value);
                loadShopDataIntoForm(matched);
              }}
              className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-amber-500 outline-none"
            >
              {shops.map(s => <option key={s._id} value={s._id}>{s.name} ({s.city})</option>)}
            </select>
          </div>
        )}

        {/* --- NEW SHOP OWNER AGREEMENT TEXT AREA SECTION --- */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
            Shop Customer Terms Agreement
          </label>
          <textarea
            rows="3"
            placeholder="Enter policy conditions or legal terms customers must accept before placing order requests with your shop..."
            value={agreementText}
            onChange={(e) => setAgreementText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600 resize-none leading-relaxed"
          />
        </div>

        {/* --- METALS BLOCK INPUT SECTION --- */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4 uppercase tracking-wider">Commodities & Metals Rate Structure</h3>
          <div className="space-y-3">
            {Object.keys(formData.metals).map((metalKey) => (
              <div key={metalKey} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-slate-800/20 p-3 rounded-xl border border-slate-800/60">
                <span className="text-sm font-medium text-slate-400 capitalize">{metalKey.replace("gold", "Gold ")}</span>
                <input
                  type="number"
                  placeholder="Sell Price"
                  value={formData.metals[metalKey].sell || ""}
                  onChange={(e) => handleNestedInputChange("metals", metalKey, "sell", e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-amber-400 focus:border-amber-500 outline-none font-mono"
                />
                <input
                  type="number"
                  placeholder="Buy Price"
                  value={formData.metals[metalKey].buy || ""}
                  onChange={(e) => handleNestedInputChange("metals", metalKey, "buy", e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-cyan-400 focus:border-cyan-500 outline-none font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        {/* --- CURRENCIES INPUT SECTION --- */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4 uppercase tracking-wider">Fiat Currency Conversion Layout</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(formData.currencies).map((curKey) => (
              <div key={curKey} className="bg-slate-800/20 p-3 rounded-xl border border-slate-800/60 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">{curKey} Exchange</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Sell"
                    value={formData.currencies[curKey].sell || ""}
                    onChange={(e) => handleNestedInputChange("currencies", curKey, "sell", e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-amber-400 font-mono focus:border-amber-500 outline-none"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Buy"
                    value={formData.currencies[curKey].buy || ""}
                    onChange={(e) => handleNestedInputChange("currencies", curKey, "buy", e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-cyan-400 font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-sm rounded-xl transition shadow-lg"
        >
          Push Rate Updates & Terms Globally
        </button>
      </form>
    </div>
  );
};

export default AdminMarketControl;