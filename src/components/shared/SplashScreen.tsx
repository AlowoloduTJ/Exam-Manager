"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
  institutionLogo?: string;
  institutionName?: string;
}

export function SplashScreen({ onComplete, institutionLogo, institutionName }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5"
    >
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Institution Logo */}
        {institutionLogo && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-32 w-32 sm:h-40 sm:w-40"
          >
            <Image
              src={institutionLogo}
              alt={institutionName || "Institution Logo"}
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        )}

        {/* Institution Name */}
        {institutionName && (
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl font-bold text-foreground sm:text-3xl"
          >
            {institutionName}
          </motion.h1>
        )}

        {/* CEMS Branding */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <h2 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
            CEMS
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            by
          </p>
          <p className="text-lg font-semibold text-foreground sm:text-xl">
            ATJ CONCEPTS LIMITED
          </p>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <div className="h-1 w-48 overflow-hidden rounded-full bg-muted sm:w-64">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-4 text-sm text-muted-foreground sm:text-base"
        >
          Comprehensive Examination Management System
        </motion.p>
      </div>
    </motion.div>
  );
}
