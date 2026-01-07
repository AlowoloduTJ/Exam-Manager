import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logoutStudent } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // TODO: Add proctor authentication check
    // Verify that the requester is a proctor or admin

    const { sessionId, studentId, reason } = await request.json();

    if (!sessionId || !studentId || !reason || !reason.trim()) {
      return NextResponse.json(
        { message: "Session ID, Student ID, and reason are required" },
        { status: 400 }
      );
    }

    // Find the exam session
    const session = await db.examSession.findUnique({
      where: { id: sessionId },
      include: {
        student: true,
        exam: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Exam session not found" },
        { status: 404 }
      );
    }

    if (session.studentId !== studentId) {
      return NextResponse.json(
        { message: "Student ID mismatch" },
        { status: 400 }
      );
    }

    if (session.isLoggedOut) {
      return NextResponse.json(
        { message: "Student is already logged out" },
        { status: 400 }
      );
    }

    // Get proctor information (from session or request)
    // TODO: Get actual proctor ID from authenticated session
    const proctorId = "proctor-id"; // Replace with actual proctor ID
    const proctorName = "Proctor"; // Replace with actual proctor name

    // Update exam session - mark as logged out
    await db.examSession.update({
      where: { id: sessionId },
      data: {
        isLoggedOut: true,
        logoutReason: reason.trim(),
        loggedOutBy: proctorId,
        loggedOutAt: new Date(),
        endTime: new Date(),
      },
    });

    // Log the proctoring event
    await db.proctoringLog.create({
      data: {
        sessionId: session.id,
        eventType: "LOGOUT",
        details: JSON.stringify({
          reason: reason.trim(),
          proctorAction: true,
          timestamp: new Date().toISOString(),
        }),
        actionTaken: "LOGOUT_BY_PROCTOR",
        proctorId,
        proctorName,
        infractionReason: reason.trim(),
      },
    });

    // Logout student from all devices (invalidate all sessions)
    await logoutStudent(studentId);

    // TODO: Send notification email to student about the logout
    // TODO: Send notification to administrators

    return NextResponse.json({
      success: true,
      message: "Student has been logged out successfully",
      session: {
        id: session.id,
        studentId: session.studentId,
        isLoggedOut: true,
        logoutReason: reason.trim(),
      },
    });
  } catch (error: any) {
    console.error("Logout student error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to logout student" },
      { status: 500 }
    );
  }
}
