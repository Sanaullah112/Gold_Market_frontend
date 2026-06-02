import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Imported useNavigate
import axios from "axios";
import Swal from "sweetalert2"; 
import { useAuth } from "../context/ContextApi"; 
import { FaWhatsapp, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import {
  FiChevronRight,
  FiMail,
  FiPlus,
  FiSliders,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";

const MarketRate = () => {
  const navigate = useNavigate(); // Initialize navigate hook
  const { token, user } = useAuth();

  const [shops, setShops] = useState([]);
  const [liveBase, setLiveBase] = useState({
    gold: 0,
    silver: 0,
    pkr: 278.5,
  });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortBy, setSortBy] = useState("default");

  // --- TRADE MODAL DRIVERS ---
  const [selectedShop, setSelectedShop] = useState(null);
  const [tradeType, setTradeType] = useState("buy");
  const [selectedMetal, setSelectedMetal] = useState("Gold 24K");
  const [tradeWeight, setTradeWeight] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // --- AGREEMENT GATEKEEPER STATES ---
  const [pendingAgreementShop, setPendingAgreementShop] = useState(null);
  const [viewedAgreements, setViewedAgreements] = useState([]);

  // Custom configuration object for SweetAlert2 dark theme matching your UI
  const swalConfig = {
    background: "#18181b", // zinc-900
    color: "#fff",
    confirmButtonColor: "#f59e0b", // amber-500
    customClass: {
      popup: "border border-zinc-800 rounded-3xl",
      title: "font-serif text-xl tracking-wide text-white",
      htmlContainer: "font-sans text-xs text-zinc-400",
      confirmButton: "rounded-xl font-bold uppercase tracking-wider text-xs px-5 py-2.5",
    }
  };

  // Fetch viewed agreements registry from backend for the logged-in user
  useEffect(() => {
    const fetchAgreements = async () => {
      if (!token) {
        setViewedAgreements([]);
        return;
      }
      try {
        const res = await axios.get("http://localhost:2000/api/user/agreements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setViewedAgreements(res.data.shopIds || []);
        } else {
          setViewedAgreements([]);
        }
      } catch (e) {
        console.error("Failed to fetch user agreements:", e);
        setViewedAgreements([]);
      }
    };
    fetchAgreements();
  }, [token]);

  useEffect(() => {
    const syncAllDataStreams = async () => {
      try {
        const marketRes = await axios.get(
          "http://localhost:2000/api/market/live",
        );
        if (marketRes.data.success) {
          setLiveBase({
            gold: marketRes.data.data.gold_ounce_usd || 0,
            silver: marketRes.data.data.silver_ounce_usd || 0,
            pkr: marketRes.data.data.usd?.to_pkr || 278.5,
          });
        }

        const shopsRes = await axios.get(
          "http://localhost:2000/api/market-rates",
        );
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

  // --- ACTION GUARD APPLIED HERE ---
  const handleActionClick = (shop) => {
    // If user is not logged in, show SweetAlert2 prompt with choices
    if (!token) {
      Swal.fire({
        ...swalConfig,
        icon: "warning",
        title: "Authentication Required",
        text: "You need to be logged in to send trade requests or view specific vendor agreements.",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Stay on Page",
        reverseButtons: true, // Puts the primary 'Login' button on the right side
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

    // If logged in, proceed with standard logic
    if (
      shop.agreementText &&
      shop.agreementText.trim() !== "" &&
      !viewedAgreements.includes(shop._id)
    ) {
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
          "http://localhost:2000/api/user/agreements",
          { shopId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Update local state
      const updatedLogs = [...viewedAgreements, shopId];
      setViewedAgreements(updatedLogs);
      const currentShopContext = pendingAgreementShop;
      setPendingAgreementShop(null);
      openTradeModal(currentShopContext);
    } catch (err) {
      console.error("Agreement acceptance failed:", err);
      Swal.fire({
        ...swalConfig,
        icon: "error",
        title: "Submission Failed",
        text: "Could not save agreement acceptance. Please try again.",
      });
    }
  };

  const openTradeModal = (shop) => {
    setSelectedShop(shop);
    setTradeWeight(1);
  };

  const getMetalPrice = (shop, metalKey, type, backupPurity, backupAdjust) => {
    if (shop?.metals?.[metalKey]?.[type]) {
      return Math.round(Number(shop.metals[metalKey][type]));
    }
    const baseOunce = metalKey.includes("silver")
      ? liveBase.silver
      : liveBase.gold;
    if (!baseOunce) return 0;

    const numericAdjustment = Number(backupAdjust || 0);
    const adjustedPrice = baseOunce + numericAdjustment;
    const usdTola = (adjustedPrice / 2.667) * backupPurity;
    const pkrTola = usdTola * liveBase.pkr;
    const spread = type === "sell" ? 1.012 : 0.988;

    return Math.round(pkrTola * spread);
  };

  const getCurrentUnitPrice = (shop, metalLabel, actionType) => {
    if (metalLabel === "Gold 24K")
      return getMetalPrice(shop, "gold24K", actionType, 1, shop.goldAdjustment);
    if (metalLabel === "Gold 21K")
      return getMetalPrice(
        shop,
        "gold21K",
        actionType,
        0.875,
        shop.goldAdjustment,
      );
    if (metalLabel === "Silver 999")
      return getMetalPrice(
        shop,
        "silver",
        actionType,
        1,
        shop.silverAdjustment,
      );
    return 0;
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const unitPrice = getCurrentUnitPrice(
        selectedShop,
        selectedMetal,
        tradeType
      );

      const computedTotal = unitPrice * Number(tradeWeight);

      const payload = {
        shopId: selectedShop.adminId,
        type: tradeType,
        metal: selectedMetal,
        weight: Number(tradeWeight),
        totalPrice: computedTotal,
      };

      const res = await axios.post(
        "http://localhost:2000/api/admin/trades/new",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("SUCCESS:", res.data);

      Swal.fire({
        ...swalConfig,
        icon: "success",
        title: "Order Request Dispatched",
        text: "Your trade request has been securely transmitted.",
      });

      setSelectedShop(null);
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);

      Swal.fire({
        ...swalConfig,
        icon: "error",
        title: "Transaction Declined",
        text: err.response?.data?.message || "Trade parameters rejection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeeMore = () => {
    setVisibleCount((prevCount) => prevCount + 3);
  };

  const getFilteredAndSortedShops = () => {
    let arrangedShops = [...shops];
    if (sortBy === "default") return arrangedShops;

    return arrangedShops.sort((shopA, shopB) => {
      let priceA = 0;
      let priceB = 0;
      switch (sortBy) {
        case "gold24k":
          priceA = getMetalPrice(
            shopA,
            "gold24K",
            "sell",
            1,
            shopA.goldAdjustment,
          );
          priceB = getMetalPrice(
            shopB,
            "gold24K",
            "sell",
            1,
            shopB.goldAdjustment,
          );
          break;
        case "gold21k":
          priceA = getMetalPrice(
            shopA,
            "gold21K",
            "sell",
            0.875,
            shopA.goldAdjustment,
          );
          priceB = getMetalPrice(
            shopB,
            "gold21K",
            "sell",
            0.875,
            shopB.goldAdjustment,
          );
          break;
        case "silver":
          priceA = getMetalPrice(
            shopA,
            "silver",
            "sell",
            1,
            shopA.silverAdjustment,
          );
          priceB = getMetalPrice(
            shopB,
            "silver",
            "sell",
            1,
            shopB.silverAdjustment,
          );
          break;
        case "usd":
          priceA = Number(
            shopA.currencies?.usd?.sell || shopA.currencies?.USD?.sell || 0,
          );
          priceB = Number(
            shopB.currencies?.usd?.sell || shopB.currencies?.USD?.sell || 0,
          );
          if (priceA === 0) return 1;
          if (priceB === 0) return -1;
          break;
        default:
          return 0;
      }
      return priceA - priceB;
    });
  };

  const processedShops = getFilteredAndSortedShops();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs sm:text-sm tracking-widest text-cyan-400 font-mono">
            LOADING LIVE MARKET DATA...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-5 lg:px-8 py-5 sm:py-8 text-white relative">
      {/* Live Market Cards Section */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md">
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest mb-1 font-semibold">
              Live Gold (Oz)
            </p>
            <h2 className="text-xl font-bold text-amber-400 font-mono">
              ${liveBase.gold?.toFixed(2)}
            </h2>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md">
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest mb-1 font-semibold">
              Live Silver (Oz)
            </p>
            <h2 className="text-xl font-bold text-slate-300 font-mono">
              ${liveBase.silver?.toFixed(2)}
            </h2>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md">
            <p className="text-zinc-500 text-[11px] uppercase tracking-widest mb-1 font-semibold">
              USD / PKR Exchange
            </p>
            <h2 className="text-xl font-bold text-cyan-400 font-mono">
              {liveBase.pkr?.toFixed(2)}
            </h2>
          </div>
        </div>
      </div>

      {/* Filter and Optimization Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <FiSliders className="text-amber-500 text-lg" />
          <div>
            <h3 className="text-sm font-bold text-zinc-200">
              Market Rate Optimization
            </h3>
            <p className="text-[11px] text-zinc-500">
              Discover properties filtered by standard lowest-price metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setVisibleCount(6);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-amber-500/50 transition-colors cursor-pointer font-medium"
          >
            <option value="default">Default Catalog View</option>
            <option value="gold24k">Lowest Gold 24K Price First</option>
            <option value="gold21k">Lowest Gold 21K Price First</option>
            <option value="silver">Lowest Silver 999 Price First</option>
            <option value="usd">Lowest USD Dollar Rate First</option>
          </select>
        </div>
      </div>

      {/* Shop Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedShops.slice(0, visibleCount).map((shop) => (
          <div
            key={shop._id}
            className="bg-[#0b0c10]/90 backdrop-blur-md border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl hover:border-amber-500/40 transition-all duration-300 flex flex-col"
          >
            {/* Card Header Profile */}
            <div className="p-5 border-b border-zinc-800/80 bg-zinc-950/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0 flex items-center justify-center shadow-inner">
                  {shop.adminId?.logo ? (
                    <img
                      src={`http://localhost:2000/uploads/${shop.adminId.logo}`}
                      alt="Shop Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black text-xl font-black uppercase">
                      {shop.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide truncate">
                      {shop.name}
                    </h2>
                    {shop.isVerified && (
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2 mt-2 text-xs sm:text-sm text-zinc-400">
                    <FaMapMarkerAlt className="mt-1 text-amber-500 shrink-0 text-xs" />
                    <p className="leading-tight break-words whitespace-normal font-sans">
                      {shop.city || "Pakistan"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs sm:text-sm text-zinc-400">
                    <FiMail className="text-cyan-400 shrink-0" />
                    <p className="truncate text-zinc-400/80">
                      {shop.adminId?.shopOwnerEmail || "No Email Verified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rates Table Content Body */}
            <div className="p-5 flex-1 space-y-4">
              <div>
                <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-3 bg-zinc-950 text-[10px] uppercase tracking-widest text-zinc-400 font-bold px-3 py-2.5 border-b border-zinc-800/60">
                    <span>Metal</span>
                    <span className="text-center text-amber-400">
                      Sell (Tola)
                    </span>
                    <span className="text-center text-cyan-400">
                      Buy (Tola)
                    </span>
                  </div>

                  {[
                    {
                      key: "gold24K",
                      label: "Gold 24K",
                      purity: 1,
                      adjust: shop.goldAdjustment,
                    },
                    {
                      key: "gold21K",
                      label: "Gold 21K",
                      purity: 0.875,
                      adjust: shop.goldAdjustment,
                    },
                    {
                      key: "silver",
                      label: "Silver 999",
                      purity: 1,
                      adjust: shop.silverAdjustment,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 items-center px-3 py-2.5 border-t border-zinc-800/60 text-xs font-medium"
                    >
                      <span className="text-zinc-300 font-sans">
                        {item.label}
                      </span>
                      <span className="text-center text-amber-500 font-bold font-mono">
                        PKR{" "}
                        {getMetalPrice(
                          shop,
                          item.key,
                          "sell",
                          item.purity,
                          item.adjust,
                        ).toLocaleString()}
                      </span>
                      <span className="text-center text-cyan-500 font-bold font-mono">
                        PKR{" "}
                        {getMetalPrice(
                          shop,
                          item.key,
                          "buy",
                          item.purity,
                          item.adjust,
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currency Conversions Data Stream */}
              {shop.currencies && Object.keys(shop.currencies).length > 0 && (
                <div>
                  <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/40 overflow-hidden shadow-inner">
                    <div className="grid grid-cols-3 bg-zinc-950/60 text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-3 py-2 border-b border-zinc-800/40">
                      <span>Currency</span>
                      <span className="text-center text-amber-400/80">
                        Sell (Cash)
                      </span>
                      <span className="text-center text-cyan-400/80">
                        Buy (Cash)
                      </span>
                    </div>
                    {Object.entries(shop.currencies).map(([curKey, value]) => (
                      <div
                        key={curKey}
                        className="grid grid-cols-3 items-center px-3 py-2 border-t border-zinc-800/40 text-[11px] font-mono"
                      >
                        <span className="text-zinc-400 uppercase font-sans font-semibold tracking-wide">
                          {curKey}
                        </span>
                        <span className="text-center text-amber-400/90 font-medium">
                          {value.sell ? Number(value.sell).toFixed(2) : "0.00"}
                        </span>
                        <span className="text-center text-cyan-400/90 font-medium">
                          {value.buy ? Number(value.buy).toFixed(2) : "0.00"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card Action Controls Footer */}
            <div className="p-5 border-t border-zinc-800 bg-zinc-950/20 mt-auto">
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${shop.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 rounded-xl py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/20"
                >
                  <FaWhatsapp className="text-sm" />
                  WhatsApp
                </a>

                {shop.phone && (
                  <a
                    href={`tel:${shop.phone}`}
                    className="flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors duration-200 rounded-xl px-4 py-2.5 text-zinc-300 shadow-sm"
                  >
                    <FaPhoneAlt className="text-xs" />
                  </a>
                )}

                {/* --- YOUR BUTTON IS RUNNING THE TOKEN CHECK NOW --- */}
                <button
                  onClick={() => handleActionClick(shop)}
                  className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 border border-amber-600 text-zinc-950 transition-colors duration-200 rounded-xl px-4 py-2.5 font-bold shadow-sm"
                >
                  <FiChevronRight className="text-sm text-black font-extrabold" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container Component Trigger */}
      {processedShops.length > visibleCount && (
        <div className="w-full flex justify-center items-center mt-10 mb-4">
          <button
            onClick={handleSeeMore}
            className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-500/10 transition-all duration-300 transform active:scale-95 uppercase tracking-wider"
          >
            <FiPlus className="text-base font-black transition-transform duration-300 group-hover:rotate-90" />
            See More Vendor Mappings ({processedShops.length - visibleCount}{" "}
            Remaining)
          </button>
        </div>
      )}

      {/* --- BUSINESS AGREEMENT SCREENING MODAL --- */}
      {pendingAgreementShop && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border-2 border-amber-500/30 rounded-3xl p-6 w-full max-w-lg relative shadow-2xl">
            <button
              onClick={() => setPendingAgreementShop(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <FiX size={22} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <FiCheckCircle className="text-amber-500 text-2xl shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Vendor Terms & Business Agreement
                </h3>
                <p className="text-xs text-zinc-400">
                  Required by:{" "}
                  <span className="text-amber-400 font-semibold">
                    {pendingAgreementShop.name}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 my-4 max-h-[220px] overflow-y-auto custom-scrollbar">
              <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                {pendingAgreementShop.agreementText}
              </p>
            </div>

            <p className="text-[11px] text-zinc-500 mb-5 leading-normal">
              * Note: You only need to accept this statement once per vendor
              profile. Your confirmation will be saved to your account.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingAgreementShop(null)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl uppercase tracking-wider transition-all"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={acceptAgreementTerms}
                className="flex-[2] py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/10"
              >
                I Agree & Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TRANSACTION REQUEST CONTROL FORM MODAL --- */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setSelectedShop(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Submit Order Request
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              To:{" "}
              <span className="text-amber-400 font-semibold">
                {selectedShop.name}
              </span>
            </p>

            <form onSubmit={handleTradeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase text-zinc-400 tracking-wider font-bold mb-1.5">
                  Request Mode
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setTradeType("buy")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${tradeType === "buy" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                  >
                    Buy (From Shop)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType("sell")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${tradeType === "sell" ? "bg-blue-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                  >
                    Sell (To Shop)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase text-zinc-400 tracking-wider font-bold mb-1.5">
                  Select Metal Commodity
                </label>
                <select
                  value={selectedMetal}
                  onChange={(e) => setSelectedMetal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                >
                  <option value="Gold 24K">Gold 24K</option>
                  <option value="Gold 21K">Gold 21K</option>
                  <option value="Silver 999">Silver 999</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase text-zinc-400 tracking-wider font-bold mb-1.5">
                  Weight Volume (Tola)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={tradeWeight}
                  onChange={(e) => setTradeWeight(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs text-zinc-400">Estimated Total:</span>
                <span className="text-sm font-black font-mono text-amber-400">
                  PKR{" "}
                  {(
                    getCurrentUnitPrice(
                      selectedShop,
                      selectedMetal,
                      tradeType,
                    ) * Number(tradeWeight || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {submitting
                  ? "Processing Submission..."
                  : "Send Transaction Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketRate;