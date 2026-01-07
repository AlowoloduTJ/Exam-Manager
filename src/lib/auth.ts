// Authentication and session management utilities

import { cookies } from "next/headers";
import { db } from "./db";
import { generateDeviceId } from "./encryption";
import { NextRequest } from "next/server";

export interface SessionData {
  studentId: string;
  deviceId: string;
  isValid: boolean;
}

/**
 * Validate student session and device
 * Returns null if session is invalid or device mismatch
 */
export async function validateStudentSession(
  request: NextRequest
): Promise<SessionData | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("studentSession")?.value;
    const deviceIdCookie = cookieStore.get("deviceId")?.value;

    if (!sessionToken || !deviceIdCookie) {
      return null;
    }

    // Decode session token
    const decoded = Buffer.from(sessionToken, "base64").toString("utf-8");
    const [studentId, timestamp, deviceId] = decoded.split(":");

    if (!studentId || !deviceId) {
      return null;
    }

    // Verify device ID matches
    const deviceInfo = {
      userAgent: request.headers.get("user-agent") || "",
      platform: request.headers.get("sec-ch-ua-platform") || "unknown",
      hardwareConcurrency: request.headers.get("sec-ch-ua") || "unknown",
    };
    const currentDeviceId = generateDeviceId(deviceInfo);

    // CRITICAL: Device ID must match exactly
    if (deviceId !== currentDeviceId || deviceId !== deviceIdCookie) {
      // Device mismatch - invalidate session
      await invalidateStudentSession(studentId);
      return null;
    }

    // Check if device session is still active in database
    const deviceSession = await db.deviceSession.findFirst({
      where: {
        studentId,
        deviceId,
        isActive: true,
      },
    });

    if (!deviceSession) {
      return null;
    }

    // Update last activity
    await db.deviceSession.update({
      where: { id: deviceSession.id },
      data: { lastActivity: new Date() },
    });

    return {
      studentId,
      deviceId,
      isValid: true,
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

/**
 * Invalidate all sessions for a student
 */
export async function invalidateStudentSession(studentId: string): Promise<void> {
  await db.deviceSession.updateMany({
    where: {
      studentId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
}

/**
 * Check if student has active session on any device
 */
export async function hasActiveSession(studentId: string): Promise<boolean> {
  const activeSessions = await db.deviceSession.findMany({
    where: {
      studentId,
      isActive: true,
    },
  });

  return activeSessions.length > 0;
}

/**
 * Get active device session for student
 */
export async function getActiveDeviceSession(studentId: string) {
  return await db.deviceSession.findFirst({
    where: {
      studentId,
      isActive: true,
    },
  });
}

/**
 * Logout student - deactivate all sessions
 */
export async function logoutStudent(studentId: string): Promise<void> {
  await invalidateStudentSession(studentId);
}
