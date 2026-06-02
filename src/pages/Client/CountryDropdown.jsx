import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const CountryDropdown = ({ label, selected, setSelected, countries }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the currently active country data object
  const currentCountry = countries.find((c) => c.code === selected);

  // Close dropdown if user clicks anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="text-xs text-slate-400 font-medium block mb-1">{label}</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition outline-none text-white text-sm"
      >
        <div className="flex items-center gap-2.5">
          {currentCountry && (
            <img
              src={`https://flagsapi.com/${currentCountry.iso}/flat/24.png`}
              alt={currentCountry.code}
              className="w-5 h-4 object-cover rounded-sm shadow-sm"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <span className="font-semibold">{selected}</span>
          <span className="text-xs text-slate-400">({currentCountry?.name})</span>
        </div>
        <FiChevronDown className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <ul className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 scrollbar-thin scrollbar-thumb-slate-700">
          {countries.map((country) => (
            <li key={country.code}>
              <button
                type="button"
                onClick={() => {
                  setSelected(country.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors
                  ${selected === country.code 
                    ? "bg-cyan-500/10 text-cyan-400 font-medium" 
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
              >
                {/* Fixed dropdown images pointing to flagsapi source */}
                <img
                  src={`https://flagsapi.com/${country.iso}/flat/24.png`}
                  alt={country.code}
                  className="w-5 h-4 object-cover rounded-sm shadow-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="font-bold w-10">{country.code}</span>
                <span className="text-xs opacity-80 truncate">{country.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountryDropdown;