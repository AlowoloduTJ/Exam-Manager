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
      return;
    }

    // Fetch institution data (with error handling)
    // If API fails, just skip splash screen - don't block page load
    fetch("/api/setup")
      .then((res) => {
        if (!res.ok) {
          // If setup API fails, just skip splash screen
          setShowSplash(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.setupComplete) {
          setInstitutionData(data);
        } else {
          // No setup data, skip splash after short delay
          setTimeout(() => setShowSplash(false), 2000);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch institution data:", error);
        // On error, skip splash screen immediately
        setShowSplash(false);
      });
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
