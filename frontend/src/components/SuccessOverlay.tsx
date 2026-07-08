import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessOverlayProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  isVisible?: boolean;
}

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  title,
  message,
  icon,
  isVisible = true,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-cream/80 backdrop-blur-md"
        >
          <div className="bg-white/90 rounded-[2rem] p-8 text-center shadow-lg max-w-sm">
            {icon && <div className="mx-auto mb-4">{icon}</div>}
            <h3 className="text-xl font-bold text-brand-ink mb-2">{title}</h3>
            <p className="text-brand-ink-light">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
