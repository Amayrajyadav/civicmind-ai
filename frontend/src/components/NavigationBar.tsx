import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiMiniArrowUpRight, HiMiniBars3, HiMiniXMark } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

import { useLanguage } from "@/context/LanguageContext";

export const NavigationBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { label: t("nav.home", "Home"), href: "/" },
    { label: t("nav.citizen", "Citizen Portal"), href: "/citizen-portal" },
    { label: t("nav.aiProcessing", "AI Pipeline"), href: "/ai-processing" },
    { label: t("nav.dashboard", "MP Dashboard"), href: "/mp-dashboard" },
  ];

  return (
    <motion.header
      className="sticky top-0 z-40 px-4 pt-4"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-[1440px] rounded-[2rem] border border-brand-line/60 bg-white/70 px-4 py-3 shadow-[0_10px_40px_rgba(73,54,43,0.06)] backdrop-blur-xl md:rounded-full md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-sand to-brand-terracotta text-sm font-bold text-white shadow-md shadow-brand-terracotta/20">
              CM
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-brand-ink">CivicMind AI</p>
              <p className="truncate text-xs text-brand-ink-light/80">Constituency Decision Intelligence</p>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1.5 rounded-full bg-white/50 p-1 border border-brand-line/30 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-brand-terracotta/10 text-brand-terracotta shadow-sm border border-brand-terracotta/5"
                      : "text-brand-ink-light hover:text-brand-ink hover:bg-brand-ink/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Global Language Selector */}
            <div className="flex bg-brand-line/20 rounded-full p-0.5 text-[10px] font-bold">
              {(["en", "hi", "te"] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                    language === lang 
                      ? "bg-brand-terracotta text-white" 
                      : "text-brand-ink hover:bg-brand-line/35"
                  }`}
                >
                  {lang === "en" ? "EN" : lang === "hi" ? "HI" : "TE"}
                </button>
              ))}
            </div>

            <Link
              to="/issue-submission"
              className="hidden sm:inline-flex items-center gap-1.5 bg-brand-terracotta text-white rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-brand-terracotta/90 shadow-sm shadow-brand-terracotta/15 transition-all duration-300 hover:scale-[1.02]"
            >
              {t("nav.issueSubmission", "Report Grievance")}
              <HiMiniArrowUpRight className="text-sm" />
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-line/60 bg-white/60 text-brand-ink hover:bg-brand-line/30 md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-terracotta"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <HiMiniXMark className="text-xl" /> : <HiMiniBars3 className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 overflow-hidden md:hidden border-t border-brand-line/20 pt-3 flex flex-col gap-2"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-[1.2rem] px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-terracotta/10 text-brand-terracotta font-semibold"
                        : "text-brand-ink-light hover:text-brand-ink hover:bg-brand-ink/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/issue-submission"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-brand-terracotta text-white rounded-[1.2rem] py-3 text-sm font-semibold uppercase tracking-wider mt-2 shadow-sm"
              >
                {t("nav.issueSubmission", "Report Grievance")}
                <HiMiniArrowUpRight className="text-sm" />
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
