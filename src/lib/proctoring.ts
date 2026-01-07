// Proctoring utilities for focus and audio monitoring

import {
  FOCUS_LOST_THRESHOLD,
  AUDIO_WARNING_THRESHOLD,
  AUDIO_LOGOUT_THRESHOLD,
} from "./constants";

export interface ProctoringState {
  isFocused: boolean;
  focusLostTime: number | null;
  audioDetected: boolean;
  audioStartTime: number | null;
  warnings: number;
  isLoggedOut: boolean;
}

/**
 * Check if user has lost focus
 */
export function checkFocusLoss(
  isFocused: boolean,
  focusLostTime: number | null,
  currentTime: number
): {
  shouldWarn: boolean;
  shouldLogout: boolean;
  newFocusLostTime: number | null;
} {
  if (isFocused) {
    return {
      shouldWarn: false,
      shouldLogout: false,
      newFocusLostTime: null,
    };
  }

  const newFocusLostTime = focusLostTime || currentTime;
  const timeLost = currentTime - newFocusLostTime;

  return {
    shouldWarn: timeLost >= FOCUS_LOST_THRESHOLD,
    shouldLogout: false, // Focus loss doesn't cause logout, only warning
    newFocusLostTime,
  };
}

/**
 * Check audio detection and warnings
 */
export function checkAudioDetection(
  audioDetected: boolean,
  audioStartTime: number | null,
  currentTime: number
): {
  shouldWarn: boolean;
  shouldLogout: boolean;
  newAudioStartTime: number | null;
} {
  if (!audioDetected) {
    return {
      shouldWarn: false,
      shouldLogout: false,
      newAudioStartTime: null,
    };
  }

  const newAudioStartTime = audioStartTime || currentTime;
  const audioDuration = currentTime - newAudioStartTime;

  return {
    shouldWarn: audioDuration >= AUDIO_WARNING_THRESHOLD,
    shouldLogout: audioDuration >= AUDIO_LOGOUT_THRESHOLD,
    newAudioStartTime,
  };
}

/**
 * Get focus warning message
 */
export function getFocusWarningMessage(): string {
  return "FOCUS ON YOUR EXAMINATION";
}

/**
 * Get audio warning message
 */
export function getAudioWarningMessage(): string {
  return "YOU WILL BE LOGGED OUT OF THIS EXAMINATION IF THIS NOISE IS NOT STOPPED NOW!";
}

/**
 * Get logout message
 */
export function getLogoutMessage(reason: "audio" | "focus" | "other"): string {
  const messages = {
    audio: "You have been logged out due to continuous background noise.",
    focus: "You have been logged out due to prolonged loss of focus.",
    other: "You have been logged out from the examination.",
  };
  return messages[reason];
}

/**
 * Monitor device capabilities
 */
export async function checkDeviceCapabilities(): Promise<{
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasSpeaker: boolean;
  error?: string;
}> {
  try {
    // Check camera
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraStream.getTracks().forEach((track) => track.stop());
    const hasCamera = true;

    // Check microphone
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStream.getTracks().forEach((track) => track.stop());
    const hasMicrophone = true;

    // Check speaker (we can't directly detect, but assume true if audio context works)
    let hasSpeaker = false;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      hasSpeaker = audioContext.state === "running" || audioContext.state === "suspended";
      audioContext.close();
    } catch {
      hasSpeaker = false;
    }

    return {
      hasCamera,
      hasMicrophone,
      hasSpeaker,
    };
  } catch (error: any) {
    return {
      hasCamera: false,
      hasMicrophone: false,
      hasSpeaker: false,
      error: error.message || "Failed to access device capabilities",
    };
  }
}
