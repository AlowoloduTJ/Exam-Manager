import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDeviceId } from "@/lib/encryption";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // TODO: Add proctor authentication check
    // Get proctor ID from authenticated session
    const proctorId = "proctor-id"; // Replace with actual proctor ID
    const proctorName = "Proctor"; // Replace with actual proctor name

    const { issueId, studentId, matricNumber, notes } = await request.json();

    if (!issueId) {
      return NextResponse.json(
        { message: "Issue ID is required" },
        { status: 400 }
      );
    }

    // Find the face verification issue
    const issue = await db.faceVerificationIssue.findUnique({
      where: { id: issueId },
      include: {
        student: {
          include: {
            user: true,
            deviceSessions: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json(
        { message: "Face verification issue not found" },
        { status: 404 }
      );
    }

    if (issue.status !== "PENDING") {
      return NextResponse.json(
        { message: "This issue has already been processed" },
        { status: 400 }
      );
    }


    // Update issue status to APPROVED
    await db.faceVerificationIssue.update({
      where: { id: issueId },
      data: {
        status: "APPROVED",
        approvedBy: proctorId,
        approvedAt: new Date(),
        approvalNotes: notes || null,
      },
    });

    // Generate device ID for the student
    const deviceInfo = {
      userAgent: request.headers.get("user-agent") || "",
      platform: request.headers.get("sec-ch-ua-platform") || "unknown",
      hardwareConcurrency: request.headers.get("sec-ch-ua") || "unknown",
    };
    const deviceId = generateDeviceId(deviceInfo);

    // CRITICAL: For proctor approval, deactivate any existing sessions
    // Proctor approval overrides single device restriction
    if (issue.student.deviceSessions.length > 0) {
      await db.deviceSession.updateMany({
        where: {
          studentId: issue.studentId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Create new device session for approved student
    await db.deviceSession.create({
      data: {
        studentId: issue.studentId,
        deviceId,
        deviceInfo: JSON.stringify(deviceInfo),
        isActive: true,
        lastActivity: new Date(),
      },
    });

    // Generate session token
    const sessionToken = Buffer.from(
      `${issue.studentId}:${Date.now()}:${deviceId}`
    ).toString("base64");

    // Set cookies (for the student's session)
    // Note: In a real scenario, you might want to return this to the proctor
    // or have the student complete login on their device
    cookies().set("studentSession", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    cookies().set("deviceId", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    // Log the proctor action
    await db.proctoringLog.create({
      data: {
        sessionId: "", // No exam session yet
        eventType: "FACE_MISMATCH",
        details: JSON.stringify({
          action: "PROCTOR_APPROVAL",
          issueId: issueId,
          matricNumber: issue.matricNumber,
          notes: notes,
          timestamp: new Date().toISOString(),
        }),
        actionTaken: "APPROVED_BY_PROCTOR",
        proctorId,
        proctorName,
        infractionReason: `Face verification approved by proctor. Original reason: ${issue.failureReason}`,
      },
    });

    // TODO: Send notification email to student that they can now login

    return NextResponse.json({
      success: true,
      message: "Student face verification approved and logged in successfully",
      student: {
        id: issue.studentId,
        matricNumber: issue.matricNumber,
        name: issue.student.user.name,
      },
      sessionToken, // Return token for proctor to provide to student if needed
    });
  } catch (error: any) {
    console.error("Approve face verification error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to approve face verification" },
      { status: 500 }
    );
  }
}
