"use client";

import { motion } from "motion/react";
import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      
      {/* Scanning line */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center gap-6"
      >
        {/* Logo with pulse */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Zap className="w-10 h-10 text-primary" />
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gradient">Q-Grid Shield</h2>
          <p className="text-sm text-muted-foreground mt-1">Initializing Grid Systems...</p>
        </div>

        {/* Loading bars */}
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-8 rounded-full bg-primary/30"
              animate={{ height: [16, 32, 16] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
