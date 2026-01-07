"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "./SplashScreen";

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [institutionData, setInstitutionData] = useState<{
    institution?: {
      name?: string;
      logo?: string;
    };
  } | null>(null);

  useEffect(() => {
    // Check if splash should be shown (only on first load)
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      // Fetch institution data
      fetch("/api/setup")
        .then((res) => res.json())
        .then((data) => {
          if (data.isSetup) {
            setInstitutionData(data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch institution data:", error);
        });
    }
  }, []);

  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => {
          setShowSplash(false);
          sessionStorage.setItem("hasSeenSplash", "true");
        }}
        institutionLogo={institutionData?.institution?.logo}
        institutionName={institutionData?.institution?.name}
      />
    );
  }

  return <>{children}</>;
}
