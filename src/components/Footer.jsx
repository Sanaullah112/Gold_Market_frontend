import React from "react";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaRegCopyright,
} from "react-icons/fa";
import { FiMail, FiTrendingUp, FiShield, FiClock } from "react-icons/fi";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-[#2a2a2a] overflow-hidden">
      {/* Premium Background Glow */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-500/10 blur-[140px] rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div onClick={scrollToTop} className="cursor-pointer">
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                Gold <span className="text-[#D4AF37]">Live Market</span>
              </h2>

              <p className="text-[#F5D76E] text-xs tracking-[4px] uppercase mt-1">
                Gold & Silver Trading Platform
              </p>
            </div>

            <p
              className="mt-5 text-zinc-400 text-sm leading-7"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Stay connected with real-time Gold and Silver market rates. Our
              platform helps customers and registered shops access accurate
              pricing, secure trading, and reliable market updates.
            </p>

            <div className="flex items-center gap-2 mt-5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm">Live Market Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-2xl font-semibold text-[#D4AF37] mb-6"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Quick Links
            </h3>

            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Currency Rates", path: "/currency" },
                { name: "Register Shop", path: "/signup" },
                { name: "Login", path: "/login" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={scrollToTop}
                    className="text-zinc-400 hover:text-[#D4AF37] transition duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3
              className="text-2xl font-semibold text-[#D4AF37] mb-6"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Our Services
            </h3>

            <ul className="space-y-4 text-zinc-400">
              <li className="flex items-center gap-3">
                <FiTrendingUp className="text-[#D4AF37]" />
                Live Gold Rates
              </li>

              <li className="flex items-center gap-3">
                <FiTrendingUp className="text-[#D4AF37]" />
                Live Silver Rates
              </li>

              <li className="flex items-center gap-3">
                <FiShield className="text-[#D4AF37]" />
                Secure Trading
              </li>

              <li className="flex items-center gap-3">
                <FiClock className="text-[#D4AF37]" />
                Real-Time Updates
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-2xl font-semibold text-[#D4AF37] mb-6"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Contact Us
            </h3>

            <div className="space-y-4 text-zinc-400">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-[#D4AF37]" />
                <span>Pakistan</span>
              </div>

              <div className="flex items-center gap-3">
                <FiMail className="text-[#D4AF37]" />
                <a
                  href={`mailto:armansana999@gmail.com?body=${encodeURIComponent("Please Sir you can explain me about the website")}`}
                  className="hover:text-white transition"
                >
                  armansana999@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <FaPhoneAlt className="text-[#D4AF37]" />
                <a
                  href="tel:+923175361139"
                  className="hover:text-white transition"
                >
                  +92 317 5361139
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://wa.me/923175361139"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#161616] border border-[#2a2a2a] text-zinc-400 hover:text-green-400 hover:border-green-500 transition"
              >
                <FaWhatsapp />
              </a>

              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#161616] border border-[#2a2a2a] text-zinc-400 hover:text-blue-400 hover:border-blue-500 transition"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#161616] border border-[#2a2a2a] text-zinc-400 hover:text-pink-400 hover:border-pink-500 transition"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#2a2a2a] mt-14 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <FaRegCopyright />
              <span>
                {new Date().getFullYear()} Gold Live Market. All Rights
                Reserved.
              </span>
            </div>

            <div className="flex gap-6 text-sm">
              <Link
                to="/privacy"
                className="text-zinc-500 hover:text-[#D4AF37] transition"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="text-zinc-500 hover:text-[#D4AF37] transition"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>

          <p className="text-center text-[#D4AF37] text-xs tracking-[4px] uppercase mt-5">
            Trusted Gold & Silver Trading Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
