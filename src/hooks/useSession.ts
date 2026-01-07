"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionData {
  isValid: boolean;
  studentId?: string;
  deviceId?: string;
}

export function useSession() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
    
    // Check session periodically (every 30 seconds)
    const interval = setInterval(checkSession, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/check-session");
      const data = await response.json();

      if (response.ok && data.isValid) {
        setSession({
          isValid: true,
          studentId: data.studentId,
          deviceId: data.deviceId,
        });
      } else {
        setSession({ isValid: false });
        // Redirect to login if session invalid
        router.push("/login?error=session_expired");
      }
    } catch (error) {
      console.error("Session check error:", error);
      setSession({ isValid: false });
      router.push("/login?error=session_error");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession({ isValid: false });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    session,
    loading,
    isValid: session?.isValid || false,
    checkSession,
    logout,
  };
}
