"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { verifyStudentIdentity } from "@/lib/face-recognition";
import { checkDeviceCapabilities } from "@/lib/proctoring";

export default function StudentLoginPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [matricNumber, setMatricNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "verification" | "verified" | "failed">("input");
  const [error, setError] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  const [deviceCheck, setDeviceCheck] = useState<{
    hasCamera: boolean;
    hasMicrophone: boolean;
    hasSpeaker: boolean;
    error?: string;
  } | null>(null);

  // Check device capabilities on mount
  useEffect(() => {
    checkDeviceCapabilities().then(setDeviceCheck);
  }, []);

  // Start camera when in verification step
  useEffect(() => {
    if (step === "verification" && videoRef.current) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [step]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error: any) {
      setError(`Camera access denied: ${error.message}`);
      setStep("input");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleMatricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check device capabilities first
      if (!deviceCheck?.hasCamera || !deviceCheck?.hasMicrophone) {
        setError("Camera and microphone are required for login. Please grant permissions.");
        setLoading(false);
        return;
      }

      // Verify matric number exists
      const response = await fetch("/api/auth/check-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid matric number");
        setLoading(false);
        return;
      }

      setStudentData(data.student);
      setStep("verification");
    } catch (error: any) {
      setError("Failed to verify matric number. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const capturePhoto = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject(new Error("Video or canvas not available"));
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Canvas context not available"));
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to capture photo"));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.95);
    });
  };

  const handleFaceVerification = async () => {
    if (!studentData || !videoRef.current) {
      setError("Student data or camera not available");
      return;
    }

    setVerificationStatus("verifying");
    setError("");

    try {
      // Capture photo from camera
      const capturedPhoto = await capturePhoto();

      // Verify face with uploaded passport photo
      const verificationResult = await verifyStudentIdentity(
        studentData.passportPhoto,
        videoRef.current
      );

      if (verificationResult.verified) {
        setVerificationStatus("success");
        setStep("verified");

        // Wait a moment to show success, then proceed to login
        setTimeout(async () => {
          await completeLogin(capturedPhoto);
        }, 1500);
      } else {
        setVerificationStatus("failed");
        
        // Create face verification issue for proctor review
        try {
          await fetch("/api/auth/create-face-verification-issue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              matricNumber,
              capturedPhoto,
              failureReason: verificationResult.message || "Face verification failed",
            }),
          });
        } catch (error) {
          console.error("Failed to create face verification issue:", error);
        }

        setError(
          verificationResult.message || 
          "Face verification failed. Your request has been sent to a proctor for review. Please wait for approval."
        );
        setStep("failed");
      }
    } catch (error: any) {
      setVerificationStatus("failed");
      setError(error.message || "Face verification error. Please try again.");
      setStep("failed");
      console.error("Face verification error:", error);
    }
  };

  const completeLogin = async (capturedPhoto: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber,
          capturedPhoto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for device conflict error
        if (data.error === "DEVICE_CONFLICT" && data.existingDevice) {
          setError(
            "You are already logged in on another device. Please logout from that device first before logging in here. Only one device is allowed at a time."
          );
        } else if (data.error === "FACE_VERIFICATION_REQUIRED" && data.requiresProctorApproval) {
          setError(
            "Face verification failed. Your request has been sent to a proctor for review. Please wait for approval or contact support."
          );
          // Optionally redirect to a waiting page
        } else {
          setError(data.message || "Login failed");
        }
        setStep("failed");
        return;
      }

      // Store session
      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentId", data.studentId);
      localStorage.setItem("studentName", data.studentName);

      // Redirect to exam dashboard or available exams
      router.push("/student/dashboard");
    } catch (error: any) {
      setError("Login failed. Please try again.");
      setStep("failed");
      console.error("Login error:", error);
    }
  };

  const retryVerification = () => {
    setStep("verification");
    setVerificationStatus("idle");
    setError("");
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Student Login</CardTitle>
            <CardDescription>
              Login with your matric number only - no password required. Face verification ensures your identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Check Alert */}
            {deviceCheck && (!deviceCheck.hasCamera || !deviceCheck.hasMicrophone) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {deviceCheck.error || "Camera and microphone are required for login. Please grant permissions and refresh the page."}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Matric Number Input */}
            {step === "input" && (
              <form onSubmit={handleMatricSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricNumber">Matric Number</Label>
                  <Input
                    id="matricNumber"
                    type="text"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                    placeholder="Enter your matric number"
                    required
                    disabled={loading}
                    className="uppercase"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || !deviceCheck?.hasCamera}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Continue to Face Verification
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Face Verification */}
            {step === "verification" && (
              <div className="space-y-4">
                <div className="relative mx-auto aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {verificationStatus === "verifying" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                        <p className="mt-4">Verifying your identity...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Position your face in the center of the frame
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ensure good lighting and look directly at the camera
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("input");
                      setError("");
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleFaceVerification}
                    disabled={verificationStatus === "verifying"}
                    className="flex-1"
                  >
                    {verificationStatus === "verifying" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify Identity
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Verification Success */}
            {step === "verified" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Identity Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Logging you in...
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Verification Failed */}
            {step === "failed" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Verification Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    {error || "Face verification failed. Please try again."}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("input");
                      setError("");
                      setMatricNumber("");
                    }}
                    className="flex-1"
                  >
                    Start Over
                  </Button>
                  <Button onClick={retryVerification} className="flex-1">
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
