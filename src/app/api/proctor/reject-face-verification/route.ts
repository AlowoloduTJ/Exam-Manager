import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // TODO: Add proctor authentication check
    // Get proctor ID from authenticated session
    const proctorId = "proctor-id"; // Replace with actual proctor ID
    const proctorName = "Proctor"; // Replace with actual proctor name

    const { issueId, reason } = await request.json();

    if (!issueId || !reason || !reason.trim()) {
      return NextResponse.json(
        { message: "Issue ID and rejection reason are required" },
        { status: 400 }
      );
    }

    // Find the face verification issue
    const issue = await db.faceVerificationIssue.findUnique({
      where: { id: issueId },
      include: {
        student: true,
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

    // Update issue status to REJECTED
    await db.faceVerificationIssue.update({
      where: { id: issueId },
      data: {
        status: "REJECTED",
        rejectedBy: proctorId,
        rejectedAt: new Date(),
        rejectionReason: reason.trim(),
      },
    });

    // Log the proctor action
    await db.proctoringLog.create({
      data: {
        sessionId: "", // No exam session
        eventType: "FACE_MISMATCH",
        details: JSON.stringify({
          action: "PROCTOR_REJECTION",
          issueId: issueId,
          matricNumber: issue.matricNumber,
          reason: reason.trim(),
          timestamp: new Date().toISOString(),
        }),
        actionTaken: "REJECTED_BY_PROCTOR",
        proctorId,
        proctorName,
        infractionReason: `Face verification rejected by proctor. Reason: ${reason.trim()}`,
      },
    });

    // TODO: Send notification email to student about rejection

    return NextResponse.json({
      success: true,
      message: "Face verification request has been rejected",
      issue: {
        id: issueId,
        status: "REJECTED",
        rejectionReason: reason.trim(),
      },
    });
  } catch (error: any) {
    console.error("Reject face verification error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to reject face verification" },
      { status: 500 }
    );
  }
}
