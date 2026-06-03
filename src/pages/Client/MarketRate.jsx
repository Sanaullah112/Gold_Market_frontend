
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../context/ContextApi";
import { FaWhatsapp, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import {
  FiChevronRight,
  FiChevronLeft,
  FiMail,
  FiSliders,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";

const MarketRate = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [shops, setShops] = useState([]);
  const [liveBase, setLiveBase] = useState({
    gold: 0,
    silver: 0,
    pkr: 278.5,
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [isPaused, setIsPaused] = useState(false);
  const [streamDirection, setStreamDirection] = useState("forward"); // "forward" | "reverse"
  
  // --- CIRCULAR SLIDESHOW INDEX DRIVER ---
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- TRADE MODAL DRIVERS ---
  const [selectedShop, setSelectedShop] = useState(null);
  const [tradeType, setTradeType] = useState("buy");
  const [selectedMetal, setSelectedMetal] = useState("Gold 24K");
  const [tradeWeight, setTradeWeight] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // --- AGREEMENT GATEKEEPER STATES ---
  const [pendingAgreementShop, setPendingAgreementShop] = useState(null);
  const [viewedAgreements, setViewedAgreements] = useState([]);

  const swalConfig = {
    background: "#18181b",
    color: "#fff",
    confirmButtonColor: "#f59e0b",
    customClass: {
      popup: "border border-zinc-800 rounded-3xl",
      title: "font-serif text-xl tracking-wide text-white",
      htmlContainer: "font-sans text-xs text-zinc-400",
      confirmButton: "rounded-xl font-bold uppercase tracking-wider text-xs px-5 py-2.5",
    }
  };

  // --- FETCH USER AGREEMENTS ---
  useEffect(() => {
    const fetchAgreements = async () => {
      if (!token) {
        setViewedAgreements([]);
        return;
      }
      try {
        const res = await axios.get( `${import.meta.env.VITE_API_URL}/api/user/agreements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setViewedAgreements(res.data.shopIds || []);
        }
      } catch (e) {
        console.error("Failed to fetch user agreements:", e);
      }
    };
    fetchAgreements();
  }, [token]);

  // --- REAL-TIME MARKET & SHOPS STREAM DATA SYNC ---
  useEffect(() => {
    const syncAllDataStreams = async () => {
      try {
        const marketRes = await axios.get( `${import.meta.env.VITE_API_URL}/api/market/live`);
        if (marketRes.data.success) {
          setLiveBase({
            gold: marketRes.data.data.gold_ounce_usd || 0,
            silver: marketRes.data.data.silver_ounce_usd || 0,
            pkr: marketRes.data.data.usd?.to_pkr || 278.5,
          });
        }

        const shopsRes = await axios.get( `${import.meta.env.VITE_API_URL}/api/market-rates`);
        if (shopsRes.data.success) {
          setShops(shopsRes.data.shops || []);
        }
      } catch (err) {
        console.error("Data stream synchronization failure:", err);
      } finally {
        setLoading(false);
      }
    };

    syncAllDataStreams();
    const interval = setInterval(syncAllDataStreams, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- AUTOMATIC SLIDESHOW MATRIX ROTATION TRIGGER ---
  useEffect(() => {
    if (isPaused || shops.length === 0) return;

    const autoRotationTimer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (streamDirection === "forward") {
          return (prevIndex + 1) % shops.length;
        } else {
          return (prevIndex - 1 + shops.length) % shops.length;
        }
      });
    }, 4000); // Rotates node view every 4 seconds

    return () => clearInterval(autoRotationTimer);
  }, [isPaused, streamDirection, shops.length]);

  const getMetalPrice = (shop, metalKey, type, backupPurity, backupAdjust) => {
    if (shop?.metals?.[metalKey]?.[type]) {
      return Math.round(Number(shop.metals[metalKey][type]));
    }
    const baseOunce = metalKey.includes("silver") ? liveBase.silver : liveBase.gold;
    if (!baseOunce) return 0;

    const numericAdjustment = Number(backupAdjust || 0);
    const adjustedPrice = baseOunce + numericAdjustment;
    const usdTola = (adjustedPrice / 2.667) * backupPurity;
    const pkrTola = usdTola * liveBase.pkr;
    const spread = type === "sell" ? 1.012 : 0.988;

    return Math.round(pkrTola * spread);
  };

  // --- DYNAMIC ASCENDING FILTER SORT LOGIC ---
  const processedShops = (() => {
    let arrangedShops = [...shops];
    if (sortBy === "default") return arrangedShops;

    return arrangedShops.sort((shopA, shopB) => {
      let priceA = 0;
      let priceB = 0;
      switch (sortBy) {
        case "gold24k":
          priceA = getMetalPrice(shopA, "gold24K", "sell", 1, shopA.goldAdjustment);
          priceB = getMetalPrice(shopB, "gold24K", "sell", 1, shopB.goldAdjustment);
          break;
        case "gold21k":
          priceA = getMetalPrice(shopA, "gold21K", "sell", 0.875, shopA.goldAdjustment);
          priceB = getMetalPrice(shopB, "gold21K", "sell", 0.875, shopB.goldAdjustment);
          break;
        case "silver":
          priceA = getMetalPrice(shopA, "silver", "sell", 1, shopA.silverAdjustment);
          priceB = getMetalPrice(shopB, "silver", "sell", 1, shopB.silverAdjustment);
          break;
        case "usd":
          priceA = Number(shopA.currencies?.usd?.sell || shopA.currencies?.USD?.sell || 0);
          priceB = Number(shopB.currencies?.usd?.sell || shopB.currencies?.USD?.sell || 0);
          if (priceA === 0) return 1;
          if (priceB === 0) return -1;
          break;
        default:
          return 0;
      }
      return priceA - priceB;
    });
  })();

  const handleActionClick = (shop) => {
    if (!token) {
      Swal.fire({
        ...swalConfig,
        icon: "warning",
        title: "Authentication Required",
        text: "You need to be logged in to send trade requests or view specific vendor agreements.",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Stay on Page",
        reverseButtons: true,
        customClass: {
          ...swalConfig.customClass,
          cancelButton: "rounded-xl font-bold uppercase tracking-wider text-xs px-5 py-2.5 bg-zinc-800 text-zinc-300 mr-2 hover:bg-zinc-700 transition-colors",
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (shop.agreementText && shop.agreementText.trim() !== "" && !viewedAgreements.includes(shop._id)) {
      setPendingAgreementShop(shop);
    } else {
      openTradeModal(shop);
    }
  };

  const acceptAgreementTerms = async () => {
    if (!pendingAgreementShop) return;
    const shopId = pendingAgreementShop._id;
    try {
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/user/agreements`,
          { shopId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setViewedAgreements([...viewedAgreements, shopId]);
      const currentShopContext = pendingAgreementShop;
      setPendingAgreementShop(null);
      openTradeModal(currentShopContext);
    } catch (err) {
      console.error("Agreement acceptance failed:", err);
      Swal.fire({ ...swalConfig, icon: "error", title: "Submission Failed", text: "Could not save agreement acceptance." });
    }
  };

  const openTradeModal = (shop) => {
    setSelectedShop(shop);
    setTradeType("buy");
    setSelectedMetal("Gold 24K");
    setTradeWeight(1);
  };

  const getCurrentUnitPrice = (shop, metalLabel, actionType) => {
    if (!shop) return 0;
    if (metalLabel === "Gold 24K") return getMetalPrice(shop, "gold24K", actionType, 1, shop.goldAdjustment);
    if (metalLabel === "Gold 21K") return getMetalPrice(shop, "gold21K", actionType, 0.875, shop.goldAdjustment);
    if (metalLabel === "Silver 999") return getMetalPrice(shop, "silver", actionType, 1, shop.silverAdjustment);
    return 0;
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const unitPrice = getCurrentUnitPrice(selectedShop, selectedMetal, tradeType);
      const computedTotal = unitPrice * Number(tradeWeight);

      const payload = {
        shopId: selectedShop.adminId?._id || selectedShop.adminId,
        type: tradeType,
        metal: selectedMetal,
        weight: Number(tradeWeight),
        totalPrice: computedTotal,
      };

      await axios.post( `${import.meta.env.VITE_API_URL}/api/admin/trades/new`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({ ...swalConfig, icon: "success", title: "Order Request Dispatched", text: "Your trade request has been securely transmitted." });
      setSelectedShop(null);
    } catch (err) {
      Swal.fire({ ...swalConfig, icon: "error", title: "Transaction Declined", text: err.response?.data?.message || "Trade parameters rejection." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetMatrix = () => {
    setSortBy("default");
    setSelectedShop(null);
    setPendingAgreementShop(null);
    setIsPaused(false);
    setStreamDirection("forward");
    setCurrentIndex(0);
    
    Swal.fire({
      ...swalConfig,
      icon: "success",
      title: "Stream Synchronized",
      text: "Nexus real-time processing nodes have been restored to default configuration.",
      timer: 1500,
      showConfirmButton: false
    });
  };

  // --- MANUAL CAROUSEL SLIDE CONTROL CONTROLLERS ---
  const handlePrevSlide = () => {
    if (processedShops.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + processedShops.length) % processedShops.length);
  };

  const handleNextSlide = () => {
    if (processedShops.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % processedShops.length);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs tracking-widest text-cyan-400 font-mono">LOADING NEXUS REALTIME MARKET DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-5 lg:px-8 py-5 sm:py-8 text-white bg-zinc-950 overflow-hidden relative">
      
      {/* Live Market Cards Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md backdrop-blur-sm">
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest mb-1 font-semibold">Live Gold (Oz)</p>
            <h2 className="text-xl font-bold text-amber-400 font-mono">${liveBase.gold?.toFixed(2)}</h2>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md backdrop-blur-sm">
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest mb-1 font-semibold">Live Silver (Oz)</p>
            <h2 className="text-xl font-bold text-slate-300 font-mono">${liveBase.silver?.toFixed(2)}</h2>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md backdrop-blur-sm">
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest mb-1 font-semibold">USD / PKR Exchange</p>
            <h2 className="text-xl font-bold text-cyan-400 font-mono">{liveBase.pkr?.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Control Configuration Header Panel */}
      <div className="max-w-7xl mx-auto mb-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <FiSliders className="text-amber-500 text-lg" />
          <div>
            <h3 className="text-sm font-bold text-zinc-200 tracking-wider">NEXUS STREAM ENGINE v3.0</h3>
            <p className="text-[11px] text-zinc-500">Infinite streaming matrices sorted dynamically in ascending sequence</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-[220px]">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentIndex(0); // Snap index focus back to zero position on sorting modifications
            }}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-amber-500/50 transition-colors cursor-pointer font-medium font-mono"
          >
            <option value="default">Default Node Ordering</option>
            <option value="gold24k">Ascending: Gold 24K Matrix</option>
            <option value="gold21k">Ascending: Gold 21K Matrix</option>
            <option value="silver">Ascending: Silver 999 Matrix</option>
            <option value="usd">Ascending: Fiat Exchange</option>
          </select>
          <button
            type="button"
            onClick={handleResetMatrix}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-xs font-bold font-mono px-4 py-2.5 rounded-xl transition-all whitespace-nowrap active:scale-95"
          >
            RESET MATRIX
          </button>
          <NavLink to='/all-shop' className='bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-xs text-center font-bold font-mono px-4 py-2.5 rounded-xl transition-all whitespace-nowrap active:scale-95'>All shopsRes</NavLink>
        </div>
      </div>

      {/* --- STREAM INTERACTION OVERLAY PANEL --- */}
      <div className="max-w-7xl mx-auto mb-2 flex justify-end items-center gap-2 px-1">
        <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mr-auto">
          Status: {isPaused ? "Paused Matrix" : streamDirection === "reverse" ? "Reversing Stream" : "Live Streaming"}
        </span>
        <button
          type="button"
          onClick={() => setStreamDirection(streamDirection === "forward" ? "reverse" : "forward")}
          className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all uppercase ${
            streamDirection === "reverse" 
              ? "bg-amber-500 text-black border-amber-600" 
              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          {streamDirection === "reverse" ? "◀ Forward Feed" : "◀ Rewind Feed"}
        </button>
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all uppercase ${
            isPaused 
              ? "bg-cyan-500 text-black border-cyan-600" 
              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          {isPaused ? "▶ Resume Stream" : "⏸ Pause"}
        </button>
      </div>

      {/* --- REVOLVING 3D CIRCULAR PERSPECTIVE SLIDESHOW CONTAINER --- */}
      <div 
        className="w-full relative overflow-hidden py-12 flex flex-col items-center justify-center min-h-[560px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {processedShops.length === 0 ? (
          <div className="w-full max-w-2xl text-center py-12 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 flex flex-col items-center justify-center gap-3">
            <p className="text-xs text-zinc-500 tracking-widest uppercase font-mono">No Processing Nodes Online</p>
            <button 
              onClick={handleResetMatrix}
              className="text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider px-4 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors"
            >
              Return to Main Feed
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl relative flex items-center justify-center h-[460px]">
            
            {/* Left Manual Steering Trigger Button */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-2 sm:left-4 z-40 bg-zinc-900/80 border border-zinc-800 hover:border-amber-500 text-zinc-400 hover:text-amber-400 p-3 rounded-full transition-all backdrop-blur-md active:scale-90 group"
            >
              <FiChevronLeft size={20} className="transform group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Circular Rotational Mapping Window */}
            <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
              {processedShops.map((shop, idx) => {
                // Determine the logical spacing layout indices relative to the central index focus
                let offset = idx - currentIndex;
                
                // Handle loop wrapping offsets configurations elegantly
                if (offset < -processedShops.length / 2) offset += processedShops.length;
                if (offset > processedShops.length / 2) offset -= processedShops.length;

                const absOffset = Math.abs(offset);
                
                // Only render elements within standard view peripheral bounds (Active, Left, Right)
                if (absOffset > 2) return null;

                // Dynamic CSS spatial computing properties mapping
                const isActive = idx === currentIndex;
                const scale = isActive ? 1 : 0.82 - absOffset * 0.08;
                const rotateY = offset * -32; 
                const translateX = offset * 320; 
                const zIndex = 30 - absOffset;
                const opacity = isActive ? 1 : 0.65 - absOffset * 0.2;

                return (
                  <div
                    key={`circular-${shop._id}-${idx}`}
                    style={{
                      transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                      zIndex: zIndex,
                      opacity: opacity,
                    }}
                    className={`absolute w-[290px] sm:w-[360px] shrink-0 bg-[#0b0c10]/95 backdrop-blur-md border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out flex flex-col ${
                      isActive 
                        ? "border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.18)]" 
                        : "border-zinc-800/80 pointer-events-none select-none"
                    }`}
                  >
                    {/* Profile Card Header Component */}
                    <div className="p-5 border-b border-zinc-800/80 bg-zinc-950/40">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0 flex items-center justify-center shadow-inner">
                          {shop.adminId?.logo ? (
                            <img
                              src={ `${import.meta.env.VITE_API_URL}/uploads/${shop.adminId.logo}`}
                              alt="Shop Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black text-lg font-black uppercase">
                              {shop.name?.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h2 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide truncate">
                              {shop.name}
                            </h2>
                            {shop.isVerified && (
                              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                ✓ Secure
                              </span>
                            )}
                          </div>
                          <div className="flex items-start gap-1.5 mt-1 text-xs text-zinc-400">
                            <FaMapMarkerAlt className="mt-0.5 text-amber-500 shrink-0 text-[10px]" />
                            <p className="font-sans text-zinc-400/90">{shop.city || "Pakistan"}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
                            <FiMail className="text-cyan-500 shrink-0 text-[11px]" />
                            <p className="truncate text-[11px] text-zinc-500">{shop.adminId?.shopOwnerEmail || "Unverified Core"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rates Table Block */}
                    <div className="p-5 flex-1 space-y-4">
                      <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/60 overflow-hidden shadow-sm">
                        <div className="grid grid-cols-3 bg-zinc-950/80 text-[9px] uppercase tracking-widest text-zinc-400 font-bold px-3 py-2 border-b border-zinc-800/60">
                          <span>Terminal</span>
                          <span className="text-center text-amber-400">Sell / Tola</span>
                          <span className="text-center text-cyan-400">Buy / Tola</span>
                        </div>

                        {[
                          { key: "gold24K", label: "Gold 24K", purity: 1, adjust: shop.goldAdjustment },
                          { key: "gold21K", label: "Gold 21K", purity: 0.875, adjust: shop.goldAdjustment },
                          { key: "silver", label: "Silver 999", purity: 1, adjust: shop.silverAdjustment },
                        ].map((item, index) => (
                          <div key={index} className="grid grid-cols-3 items-center px-3 py-2 border-t border-zinc-800/60 text-xs font-medium">
                            <span className="text-zinc-400 font-sans">{item.label}</span>
                            <span className="text-center text-amber-500 font-bold font-mono text-[11px]">
                              {getMetalPrice(shop, item.key, "sell", item.purity, item.adjust).toLocaleString()}
                            </span>
                            <span className="text-center text-cyan-500 font-bold font-mono text-[11px]">
                              {getMetalPrice(shop, item.key, "buy", item.purity, item.adjust).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Currencies block */}
                      {shop.currencies && Object.keys(shop.currencies).length > 0 && (
                        <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800/30 overflow-hidden">
                          <div className="grid grid-cols-3 bg-zinc-950/40 text-[9px] uppercase tracking-widest text-zinc-500 font-bold px-3 py-1.5 border-b border-zinc-800/40">
                            <span>Fiat</span>
                            <span className="text-center text-amber-500/70">Cash Sell</span>
                            <span className="text-center text-cyan-500/70">Cash Buy</span>
                          </div>
                          {Object.entries(shop.currencies).slice(0, 2).map(([curKey, value]) => (
                            <div key={curKey} className="grid grid-cols-3 items-center px-3 py-1.5 border-t border-zinc-800/20 text-[10px] font-mono">
                              <span className="text-zinc-500 uppercase font-sans font-bold">{curKey}</span>
                              <span className="text-center text-amber-500/80">{value.sell ? Number(value.sell).toFixed(2) : "0.00"}</span>
                              <span className="text-center text-cyan-400/80">{value.buy ? Number(value.buy).toFixed(2) : "0.00"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Operational Action Footer */}
                    <div className="p-5 border-t border-zinc-800/60 bg-zinc-950/30 mt-auto">
                      <div className="flex gap-2">
                        <a
                          href={`https://wa.me/${
                            shop.whatsapp
                              ? shop.whatsapp.replace(/[^0-9]/g, "").replace(/^0/, "92")
                              : ""
                          }?text=${encodeURIComponent(
                            `Assalam-o-Alaikum ${shop.name || "Vendor"},\n\nI am contacting you through Nexus Protocol. I'm interested in reviewing your live market rates. Could you please provide more information?`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600/90 hover:bg-emerald-600 transition-colors duration-200 rounded-xl py-2 text-xs font-bold text-white shadow-sm"
                        >
                          WhatsApp
                        </a>

                        {shop.phone && (
                          <a
                            href={`tel:${shop.phone}`}
                            className="flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors duration-200 rounded-xl px-3 py-2 text-zinc-400 hover:text-white"
                          >
                            <FaPhoneAlt className="text-xs" />
                          </a>
                        )}

                        <button
                          onClick={() => handleActionClick(shop)}
                          className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 border border-amber-600 text-zinc-950 transition-all duration-200 rounded-xl px-4 py-2 font-bold group"
                        >
                          <FiChevronRight className="text-sm font-black transform group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Manual Steering Trigger Button */}
            <button
              onClick={handleNextSlide}
              className="absolute right-2 sm:right-4 z-40 bg-zinc-900/80 border border-zinc-800 hover:border-amber-500 text-zinc-400 hover:text-amber-400 p-3 rounded-full transition-all backdrop-blur-md active:scale-90 group"
            >
              <FiChevronRight size={20} className="transform group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* --- CAROUSEL BULLET DOT INDICATORS LINK TRACK --- */}
        {processedShops.length > 0 && (
          <div className="flex items-center gap-2 mt-4 max-w-full overflow-x-auto py-2 px-4">
            {processedShops.map((_, dotIdx) => (
              <button
                key={`bullet-indicator-${dotIdx}`}
                onClick={() => setCurrentIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex ? "w-6 bg-amber-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
                title={`Focus Node Matrix ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- BUSINESS AGREEMENT MODAL SCREEN --- */}
      {pendingAgreementShop && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg relative shadow-2xl">
            <button onClick={() => setPendingAgreementShop(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><FiX size={22} /></button>
            <div className="flex items-center gap-3 mb-3">
              <FiCheckCircle className="text-amber-500 text-2xl shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Vendor Terms & Business Agreement</h3>
                <p className="text-xs text-zinc-400">Required by: <span className="text-amber-400 font-semibold">{pendingAgreementShop.name}</span></p>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 my-4 max-h-[200px] overflow-y-auto">
              <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">{pendingAgreementShop.agreementText}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPendingAgreementShop(null)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl uppercase">Decline</button>
              <button type="button" onClick={acceptAgreementTerms} className="flex-[2] py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black uppercase rounded-xl">I Agree & Accept Terms</button>
            </div>
          </div>
        </div>
      )}

      {/* --- TRANSACTION REQUEST CONTROL FORM MODAL --- */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setSelectedShop(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><FiX size={20} /></button>
            <h3 className="text-base font-bold text-white mb-1">Submit Order Request</h3>
            <p className="text-xs text-zinc-400 mb-4">To: <span className="text-amber-400 font-semibold">{selectedShop.name}</span></p>

            <form onSubmit={handleTradeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-zinc-500 tracking-wider font-bold mb-1">Request Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button type="button" onClick={() => setTradeType("buy")} className={`py-1.5 text-xs font-bold rounded-lg transition-all ${tradeType === "buy" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}>Buy (From Shop)</button>
                  <button type="button" onClick={() => setTradeType("sell")} className={`py-1.5 text-xs font-bold rounded-lg transition-all ${tradeType === "sell" ? "bg-blue-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}>Sell (To Shop)</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-zinc-500 tracking-wider font-bold mb-1">Select Metal Commodity</label>
                <select value={selectedMetal} onChange={(e) => setSelectedMetal(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
                  <option value="Gold 24K">Gold 24K</option>
                  <option value="Gold 21K">Gold 21K</option>
                  <option value="Silver 999">Silver 999</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-zinc-500 tracking-wider font-bold mb-1">Weight Volume (Tola)</label>
                <input type="number" min="0.01" step="any" value={tradeWeight} onChange={(e) => setTradeWeight(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono" required />
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs text-zinc-400">Estimated Total:</span>
                <span className="text-sm font-black font-mono text-amber-400">PKR {(getCurrentUnitPrice(selectedShop, selectedMetal, tradeType) * Number(tradeWeight || 0)).toLocaleString()}</span>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all disabled:opacity-50">
                {submitting ? "Processing..." : "Send Transaction Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketRate;
