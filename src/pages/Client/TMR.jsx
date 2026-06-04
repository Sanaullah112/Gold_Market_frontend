import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GoldConverter = () => {
  const GRAMS_PER_TOLA = 11.66;
  const MASHA_PER_TOLA = 12;
  const RATTI_PER_TOLA = 96;

  const initialState = { grams: "", tola: "", masha: "", ratti: "" };
  const [values, setValues] = useState(initialState);
  const [activeField, setActiveField] = useState(null);

  const formatValue = (num, decimals) => {
    return isNaN(num) ? "" : Number(num.toFixed(decimals)).toString();
  };

  const handleChange = (field, inputValue) => {
    setActiveField(field);
    if (inputValue === "") {
      setValues(initialState);
      return;
    }

    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) {
      setValues((prev) => ({ ...prev, [field]: inputValue }));
      return;
    }

    let grams, tola, masha, ratti;

    switch (field) {
      case "grams":
        grams = numericValue;
        tola = grams / GRAMS_PER_TOLA;
        masha = tola * MASHA_PER_TOLA;
        ratti = tola * RATTI_PER_TOLA;
        break;
      case "tola":
        tola = numericValue;
        grams = tola * GRAMS_PER_TOLA;
        masha = tola * MASHA_PER_TOLA;
        ratti = tola * RATTI_PER_TOLA;
        break;
      case "masha":
        masha = numericValue;
        tola = masha / MASHA_PER_TOLA;
        grams = tola * GRAMS_PER_TOLA;
        ratti = tola * RATTI_PER_TOLA;
        break;
      case "ratti":
        ratti = numericValue;
        tola = ratti / RATTI_PER_TOLA;
        grams = tola * GRAMS_PER_TOLA;
        masha = tola * MASHA_PER_TOLA;
        break;
      default:
        return;
    }

    setValues({
      grams: field === "grams" ? inputValue : formatValue(grams, 3),
      tola: field === "tola" ? inputValue : formatValue(tola, 3),
      masha: field === "masha" ? inputValue : formatValue(masha, 2),
      ratti: field === "ratti" ? inputValue : formatValue(ratti, 2),
    });
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "out" } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20 p-6 text-white font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent inline-block"
            layoutId="title"
          >
            Gold Weight Converter
          </motion.h1>
          <p className="text-zinc-400 text-sm mt-2">Precision conversions for classical jewelry weights</p>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { id: "grams", label: "Grams (g)" },
            { id: "tola", label: "Tola (تولہ)" },
            { id: "masha", label: "Masha (ماشہ)" },
            { id: "ratti", label: "Ratti (رتی)" },
          ].map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <InputBox
                label={item.label}
                value={values[item.id]}
                isPassiveCalculated={activeField && activeField !== item.id && values[item.id] !== ""}
                onChange={(v) => handleChange(item.id, v)}
                onFocus={() => setActiveField(item.id)}
                onBlur={() => setActiveField(null)}
              />
            </motion.div>
          ))}
        </div>

        {/* Action Elements */}
        <div className="flex flex-col items-center justify-center mt-8 gap-4">
          <motion.button
            whileHover={{ scale: 1.04, backgroundColor: "#ef4444" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setValues(initialState);
              setActiveField(null);
            }}
            className="px-8 py-2.5 bg-zinc-800 text-zinc-200 font-medium rounded-xl border border-zinc-700/50 shadow-md hover:text-white transition-colors cursor-pointer"
          >
            Clear All Fields
          </motion.button>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="text-center text-xs text-zinc-400 tracking-wide"
          >
            Modify any unit — values compute seamlessly in real-time.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

// Sub-Component for Clean Input Markup
const InputBox = ({ label, value, isPassiveCalculated, onChange, onFocus, onBlur }) => {
  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-xs font-semibold text-zinc-400 group-focus-within:text-amber-400 transition-colors tracking-wide pl-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="0.00"
          className="w-full p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-lg outline-none transition-all duration-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 placeholder-zinc-700"
        />
        {/* Subtle glow border animate-overlay when calculated passively */}
        <AnimatePresence>
          {isPassiveCalculated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 border border-amber-400 rounded-xl pointer-events-none shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GoldConverter;