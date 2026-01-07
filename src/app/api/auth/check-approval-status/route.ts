import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Check if student has been approved by proctor for face verification
 */
export async function POST(request: NextRequest) {
  try {
    const { matricNumber } = await request.json();

    if (!matricNumber) {
      return NextResponse.json(
        { message: "Matric number is required" },
        { status: 400 }
      );
    }

    // Find student
    const student = await db.student.findUnique({
      where: { matricNumber: matricNumber.toUpperCase() },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Check for approved face verification issue
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

    // Check for pending issues
    const pendingIssue = await db.faceVerificationIssue.findFirst({
      where: {
        studentId: student.id,
        status: "PENDING",
      },
      orderBy: {
        attemptedAt: "desc",
      },
    });

    return NextResponse.json({
      isApproved: !!approvedIssue,
      isPending: !!pendingIssue,
      approvedAt: approvedIssue?.approvedAt?.toISOString(),
      pendingSince: pendingIssue?.attemptedAt.toISOString(),
      message: approvedIssue
        ? "Your face verification has been approved. You can now login."
        : pendingIssue
        ? "Your face verification request is pending proctor review."
        : "No face verification issues found.",
    });
  } catch (error: any) {
    console.error("Check approval status error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to check approval status" },
      { status: 500 }
    );
  }
}
