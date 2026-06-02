import React, { useEffect, useState } from "react";
import axios from "axios";
import CountryDropdown from "./CountryDropdown";

// 🌍 Essential global fiat mapping with 2-letter ISO country codes for Flagsapi
const countries = [
  { name: "United States", code: "USD", iso: "US" },
  { name: "Pakistan", code: "PKR", iso: "PK" },
  { name: "United Kingdom", code: "GBP", iso: "GB" },
  { name: "Euro Zone", code: "EUR", iso: "EU" },
  { name: "India", code: "INR", iso: "IN" },
  { name: "UAE", code: "AED", iso: "AE" },
  { name: "Saudi Arabia", code: "SAR", iso: "SA" },
  { name: "Australia", code: "AUD", iso: "AU" },
  { name: "Canada", code: "CAD", iso: "CA" },
  { name: "Switzerland", code: "CHF", iso: "CH" },
  { name: "China", code: "CNY", iso: "CN" },
  { name: "Japan", code: "JPY", iso: "JP" },
  { name: "Kuwait", code: "KWD", iso: "KW" },
  { name: "Oman", code: "OMR", iso: "OM" },
  { name: "Qatar", code: "QAR", iso: "QA" },
  { name: "Bahrain", code: "BHD", iso: "BH" },
  { name: "Turkey", code: "TRY", iso: "TR" }
];

const Currency = () => {
  const [rates, setRates] = useState({});
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PKR");
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);

  // Fetch live exchange updates
  const fetchRates = async () => {
    try {
      const res = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      setRates(res.data.rates);
    } catch (err) {
      console.log("Currency API Error:", err);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Conversion logic
  const convert = () => {
    if (!rates[from] || !rates[to]) return;

    const usdBase = amount / rates[from];
    const converted = usdBase * rates[to];

    setResult(
      converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  useEffect(() => {
    convert();
  }, [from, to, amount, rates]);

  const getCountry = (code) => countries.find((c) => c.code === code);

  return (
    <div className="w-full max-w-[420px] bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-4 sm:p-5">
      {/* Title */}
      <h2 className="text-lg font-bold text-center mb-1 text-white">
        Currency Converter
      </h2>
      <p className="text-center text-slate-400 text-xs mb-4">
        Live global exchange rates 🌍
      </p>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 font-medium">Amount</label>
        <input
          type="number"
          value={amount}
          min="0"
          onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full mt-1 p-2.5 text-sm rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none text-white transition"
        />
      </div>

      {/* FROM Select Menu Dropdown */}
      <CountryDropdown
        label="From Currency"
        selected={from}
        setSelected={setFrom}
        countries={countries}
      />

      {/* TO Select Menu Dropdown */}
      <CountryDropdown
        label="To Currency"
        selected={to}
        setSelected={setTo}
        countries={countries}
      />

      {/* Result Card Output Panel */}
      <div className="mt-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 p-4 rounded-xl text-center">
        <div className="text-slate-400 text-xs flex items-center justify-center gap-2">
          {/* Dynamic Image Flags */}
          <img 
            src={`https://flagsapi.com/${getCountry(from)?.iso}/flat/24.png`} 
            alt={from}
            className="w-5 h-4 object-cover rounded-sm inline-block shadow-sm"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="font-semibold text-white">{from}</span> 
          
          <span className="text-slate-500">→</span> 
          
          <img 
            src={`https://flagsapi.com/${getCountry(to)?.iso}/flat/24.png`} 
            alt={to}
            className="w-5 h-4 object-cover rounded-sm inline-block shadow-sm"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="font-semibold text-white">{to}</span>
        </div>

        <p className="text-2xl font-black mt-2 text-cyan-400 tracking-wide">
          {result ? result : "Loading..."}
        </p>

        <p className="text-[10px] text-slate-500 mt-1">
          Updated in real-time
        </p>
      </div>
    </div>
  );
};

export default Currency;