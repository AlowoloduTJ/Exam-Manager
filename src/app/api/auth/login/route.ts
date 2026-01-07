import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDeviceId } from "@/lib/encryption";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { matricNumber, capturedPhoto } = await request.json();

    if (!matricNumber) {
      return NextResponse.json(
        { message: "Matric number is required" },
        { status: 400 }
      );
    }

    // Find student
    const student = await db.student.findUnique({
      where: { matricNumber: matricNumber.toUpperCase() },
      include: {
        user: true,
        deviceSessions: {
          where: { isActive: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Check if student has a pending face verification issue
    // If proctor has approved, allow login
    const approvedIssue = await db.faceVerificationIssue.findFirst({
      where: {
        studentId: student.id,
        status: "APPROVED",
        approvedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Approved within last 24 hours
        },
      },
      orderBy: {
        approvedAt: "desc",
      },
    });

    // If there's an approved issue, skip face verification requirement
    const skipFaceVerification = !!approvedIssue;

    // If face verification is required but not provided, create an issue
    if (!capturedPhoto && !skipFaceVerification) {
      // Create face verification issue for proctor review
      await db.faceVerificationIssue.create({
        data: {
          studentId: student.id,
          matricNumber: student.matricNumber,
          failureReason: "Face verification failed or not provided",
          passportPhoto: student.passportPhoto,
          attempts: 1,
          status: "PENDING",
        },
      });

      return NextResponse.json(
        {
          message: "Face verification required. Your request has been sent to a proctor for review.",
          error: "FACE_VERIFICATION_REQUIRED",
          requiresProctorApproval: true,
        },
        { status: 403 }
      );
    }

    // Generate device ID from request headers
    const deviceInfo = {
      userAgent: request.headers.get("user-agent") || "",
      platform: request.headers.get("sec-ch-ua-platform") || "unknown",
      hardwareConcurrency: request.headers.get("sec-ch-ua") || "unknown",
    };
    const deviceId = generateDeviceId(deviceInfo);

    // CRITICAL: Check for ANY active device session
    // If student has ANY active session on ANY device, BLOCK the login
    if (student.deviceSessions.length > 0) {
      // Check if this is the same device trying to login again
      const sameDeviceSession = student.deviceSessions.find(
        (session) => session.deviceId === deviceId
      );

      if (sameDeviceSession) {
        // Same device - update last activity and allow
        await db.deviceSession.update({
          where: { id: sameDeviceSession.id },
          data: { lastActivity: new Date() },
        });
      } else {
        // DIFFERENT DEVICE - BLOCK LOGIN
        return NextResponse.json(
          {
            message: "You are already logged in on another device. Please logout from that device first before logging in here.",
            error: "DEVICE_CONFLICT",
            existingDevice: true,
          },
          { status: 403 }
        );
      }
    } else {
      // No active sessions - create new device session
      await db.deviceSession.create({
        data: {
          studentId: student.id,
          deviceId,
          deviceInfo: JSON.stringify(deviceInfo),
          isActive: true,
          lastActivity: new Date(),
        },
      });
    }

    // If approved by proctor, mark the issue as used (optional - can keep for audit)
    if (approvedIssue) {
      // Optionally update the issue to track that login was completed
      // This is already approved, so we can proceed
    }

    // Generate session token (in production, use JWT or similar)
    const sessionToken = Buffer.from(
      `${student.id}:${Date.now()}:${deviceId}`
    ).toString("base64");

    // Set cookie
    cookies().set("studentSession", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Also store device ID in cookie for validation
    cookies().set("deviceId", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      success: true,
      token: sessionToken,
      deviceId,
      studentId: student.id,
      studentName: student.user.name,
      matricNumber: student.matricNumber,
      message: skipFaceVerification
        ? "Login successful (approved by proctor)"
        : "Login successful",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
