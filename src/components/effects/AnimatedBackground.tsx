"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Deep Space / Modern Ambient Base */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#070b14] transition-colors duration-500" />

      {/* 3D Perspective Grid Mesh */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {/* Floating 3D Glowing Orb 1 - Indigo/Violet */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -left-32 w-96 h-96 sm:w-[32rem] sm:h-[32rem] rounded-full bg-gradient-to-tr from-indigo-600/25 via-violet-600/20 to-cyan-500/15 blur-[100px] dark:from-indigo-600/20 dark:via-purple-600/15 dark:to-cyan-400/10"
      />

      {/* Floating 3D Glowing Orb 2 - Fuchsia/Pink */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/3 -right-32 w-96 h-96 sm:w-[30rem] sm:h-[30rem] rounded-full bg-gradient-to-bl from-fuchsia-600/20 via-pink-600/15 to-indigo-600/15 blur-[120px] dark:from-fuchsia-600/15 dark:via-purple-700/15 dark:to-indigo-500/10"
      />

      {/* Floating 3D Glowing Orb 3 - Cyan/Emerald */}
      <motion.div
        animate={{
          x: [0, 60, -50, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.2, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute -bottom-32 left-1/4 w-96 h-96 sm:w-[34rem] sm:h-[34rem] rounded-full bg-gradient-to-tr from-cyan-500/20 via-teal-500/15 to-indigo-600/15 blur-[110px] dark:from-cyan-500/10 dark:via-indigo-900/20 dark:to-purple-900/15"
      />

      {/* Floating Subtle Ambient Light Beam */}
      <motion.div
        animate={{
          opacity: [0.15, 0.35, 0.15],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl pointer-events-none"
      />
    </div>
  );
}
