import React, { useEffect, useState } from "react";
import { AiOutlineGold } from "react-icons/ai";
import Currency from "./Currency"; 
import MarketRate from "./MarketRate"; 
import { useAuth } from "../context/ContextApi"; // Context Connection
import GoldConverterPage from "./TMR";

const Home = () => {
  const { theme } = useAuth(); // Extract active theme string
  
  const [gold, setGold] = useState(null);
  const [silver, setSilver] = useState(null);
  const [usd, setUsd] = useState(null);

  const [mode, setMode] = useState("gold");

  const [goldFlash, setGoldFlash] = useState(false);
  const [silverFlash, setSilverFlash] = useState(false);

  const [goldChange, setGoldChange] = useState(0);
  const [silverChange, setSilverChange] = useState(0);

  const fetchMarketData = async () => {
    try {
      const res = await fetch( `${import.meta.env.VITE_API_URL}/api/market/live`);
      const result = await res.json();

      if (!result.success) return;

      const newGold = result.data.gold_ounce_usd;
      const newSilver = result.data.silver_ounce_usd;
      const newUsd = result.data.usd?.to_pkr;
      setGoldChange(result.data.gold_change_percent);
      setSilverChange(result.data.silver_change_percent);

      setGold((prev) => {
        if (prev && prev !== newGold) {
          setGoldFlash(true);
          setTimeout(() => setGoldFlash(false), 100);
        }
        return newGold;
      });

      setSilver((prev) => {
        if (prev && prev !== newSilver) {
          setSilverFlash(true);
          setTimeout(() => setSilverFlash(false), 100);
        }
        return newSilver;
      });

      setUsd(newUsd);
    } catch (err) {
      console.log("API Error:", err);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(() => {
      fetchMarketData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const goldTola =
    gold && usd
      ? ((gold * usd) / 2.667).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })
      : null;

  const silverTola =
    silver && usd
      ? ((silver * usd) / 2.667).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })
      : null;

  const priceClass = (flash, color) =>
    `text-4xl sm:text-3xl font-bold transition-all duration-500 ${
      flash ? "scale-110" : "scale-100"
    } ${color}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-10 transition-colors duration-300
      bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900
      dark:from-black dark:via-slate-900 dark:to-black dark:text-white
      theme-blue:from-slate-950 theme-blue:via-blue-950 theme-blue:to-slate-950 theme-blue:text-blue-100
      theme-emerald:from-stone-950 theme-emerald:via-emerald-950 theme-emerald:to-stone-950 theme-emerald:text-emerald-100"
    >

      {/* --- PAGE MAIN TITLE --- */}
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center transition-colors duration-300
        text-amber-600 dark:text-cyan-400 theme-blue:text-cyan-400 theme-emerald:text-emerald-400"
      >
        Live Metal Market Dashboard
      </h1>

      {/* --- RADIO NAVIGATION TABS --- */}
      <div className="flex flex-wrap gap-4 sm:gap-8 mb-8 font-semibold items-center justify-center transition-colors duration-300
        text-gray-700 dark:text-cyan-300 theme-blue:text-blue-200 theme-emerald:text-emerald-300"
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="gold"
            checked={mode === "gold"}
            onChange={(e) => setMode(e.target.value)}
            className="accent-amber-600 dark:accent-cyan-500 theme-blue:accent-cyan-400 theme-emerald:accent-emerald-400"
          />
          Gold
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="silver"
            checked={mode === "silver"}
            onChange={(e) => setMode(e.target.value)}
            className="accent-amber-600 dark:accent-cyan-500 theme-blue:accent-cyan-400 theme-emerald:accent-emerald-400"
          />
          Silver
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="currency"
            checked={mode === "currency"}
            onChange={(e) => setMode(e.target.value)}
            className="accent-amber-600 dark:accent-cyan-500 theme-blue:accent-cyan-400 theme-emerald:accent-emerald-400"
          />
          Currency
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="marketRate"
            checked={mode === "marketRate"}
            onChange={(e) => setMode(e.target.value)}
            className="accent-amber-600 dark:accent-cyan-500 theme-blue:accent-cyan-400 theme-emerald:accent-emerald-400"
          />
          Shop Rates
        </label>


        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="GoldConverterPage"
            checked={mode === "GoldConverterPage"}
            onChange={(e) => setMode(e.target.value)}
            className="accent-amber-600 dark:accent-cyan-500 theme-blue:accent-cyan-400 theme-emerald:accent-emerald-400"
          />
          TMR
        </label>
      </div>

      {/* --- DYNAMIC RENDER WINDOW CONTAINER --- */}
      <div className="w-full flex justify-center items-center">
        {(() => {
          switch (mode) {
            case "currency":
              return <Currency />;
            
            case "marketRate":
              return <MarketRate />;

               case "GoldConverterPage":
              return <GoldConverterPage />;
            
            case "gold":
            case "silver":
            default:
              return (
                /* --- DYNAMIC THEMED COMPONENT CARD --- */
                <div className="w-full max-w-[420px] rounded-2xl shadow-xl p-4 sm:p-5 border transition-all duration-300
                  bg-white border-gray-200 shadow-gray-300/40
                  dark:bg-slate-900 dark:border-slate-800 dark:shadow-none
                  theme-blue:bg-slate-900 theme-blue:border-blue-900/60 theme-blue:shadow-none
                  theme-emerald:bg-stone-900 theme-emerald:border-emerald-900/40 theme-emerald:shadow-none"
                >
                  {/* --- CARD HEADER ICON BLOCK --- */}
                  <div>
                    {mode === "gold" ? (
                      <div className="flex gap-2">
                        <div><AiOutlineGold className="bg-amber-500 w-7 h-7 mt-1 rounded-full text-white p-1" /></div>
                        <div>
                          <h1 className="text-[15px] font-bold text-gray-900 dark:text-white theme-blue:text-white theme-emerald:text-white">XAUUSD</h1>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 theme-blue:text-slate-400 theme-emerald:text-stone-400">GOLD SPOT / U.S. DOLLAR</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div><AiOutlineGold className="bg-gray-400 w-7 h-7 mt-1 rounded-full text-white p-1" /></div>
                        <div>
                          <h1 className="text-[15px] font-bold text-gray-900 dark:text-white theme-blue:text-white theme-emerald:text-white">XAGUSD</h1>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 theme-blue:text-slate-400 theme-emerald:text-stone-400">SILVER / U.S. DOLLAR</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* --- PRICE DISPLAY SECTION --- */}
                  <div className="mt-4 flex items-end gap-3">
                    <h1 className={mode === "gold" 
                      ? priceClass(goldFlash, "text-amber-600 dark:text-yellow-500 theme-blue:text-yellow-500 theme-emerald:text-yellow-500") 
                      : priceClass(silverFlash, "text-gray-600 dark:text-gray-300 theme-blue:text-slate-300 theme-emerald:text-stone-300")
                    }>
                      {mode === "gold"
                        ? gold ? gold.toFixed(2) : "Loading..."
                        : silver ? silver.toFixed(2) : "Loading..."}
                    </h1>

                    <span className={`text-sm font-semibold ${mode === "gold" ? (goldChange >= 0 ? "text-green-500" : "text-red-500") : (silverChange >= 0 ? "text-green-500" : "text-red-500")}`}>
                      {mode === "gold"
                        ? `${goldChange >= 0 ? "+" : ""}${goldChange}%`
                        : `${silverChange >= 0 ? "+" : ""}${silverChange}%`}
                    </span>
                  </div>

                  {/* --- USD META CONVERSION LABELS --- */}
                  <div className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 theme-blue:text-slate-400 theme-emerald:text-stone-400">
                    USD → PKR:{" "}
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      {usd ? usd.toFixed(2) : "Loading..."}
                    </span>
                  </div>

                  {/* --- WEIGHT VALUE TOLA AREA --- */}
                  <div className="mt-4 border-t pt-3 border-gray-200 dark:border-slate-800 theme-blue:border-blue-900/50 theme-emerald:border-emerald-900/50">
                    <p className="text-xs text-gray-500 dark:text-slate-400 theme-blue:text-slate-400 theme-emerald:text-stone-400">
                      {mode === "gold" ? "Gold Tola" : "Silver Tola"}
                    </p>
                    <p className="text-base sm:text-lg font-bold break-words transition-colors duration-300
                      text-amber-600 dark:text-cyan-400 theme-blue:text-cyan-300 theme-emerald:text-emerald-400"
                    >
                      {mode === "gold"
                        ? goldTola ? `Rs ${goldTola}` : "Loading..."
                        : silverTola ? `Rs ${silverTola}` : "Loading..."}
                    </p>
                  </div>
                </div>
              );
          }
        })()}
      </div>
    </div>
  );
};

export default Home;