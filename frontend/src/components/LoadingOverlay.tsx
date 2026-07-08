import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "Processing report...",
  subMessage = "Executing operations and connecting to servers.",
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-cream/80 backdrop-blur-md"
        >
          <div className="text-center max-w-sm px-6 space-y-5">
            <div className="relative mx-auto h-16 w-16">
              <span className="absolute inset-0 rounded-full border-4 border-brand-terracotta/20" />
              <span className="absolute inset-0 rounded-full border-4 border-t-brand-terracotta border-r-brand-terracotta animate-spin" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-brand-ink">
                {message}
              </h3>
              <p className="text-sm text-brand-ink-light/80 leading-relaxed">
                {subMessage}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
