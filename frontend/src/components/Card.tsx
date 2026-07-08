import React, { type HTMLAttributes } from "react";
import { motion } from "framer-motion";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  glass?: boolean;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  glass = true,
  className = "",
  ...props
}) => {
  const baseStyles = "rounded-[2rem] p-6 md:p-8 lg:p-9 border border-brand-line/40 transition-all duration-300 ease-out";
  
  const glassStyle = glass 
    ? "bg-white/72 backdrop-blur-md shadow-[0_10px_40px_rgba(73,54,43,0.03)]" 
    : "bg-white shadow-sm";
  
  const glowStyle = glow 
    ? "shadow-[0_0_0_1px_rgba(185,122,87,0.08),_0_20px_50px_rgba(59,46,38,0.05)] border-brand-terracotta/20" 
    : "";

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(73,54,43,0.08)", borderColor: "rgba(185, 122, 87, 0.3)" }}
      transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
      className={`${baseStyles} ${glassStyle} ${glowStyle} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};
