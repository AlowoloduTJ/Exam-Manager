import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // TODO: Add proctor authentication check

    // Get all face verification issues
    const issues = await db.faceVerificationIssue.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        attemptedAt: "desc",
      },
    });

    const formattedIssues = issues.map((issue) => ({
      id: issue.id,
      studentId: issue.studentId,
      matricNumber: issue.matricNumber,
      studentName: issue.student.user.name,
      attemptedAt: issue.attemptedAt.toISOString(),
      failureReason: issue.failureReason,
      passportPhoto: issue.passportPhoto,
      capturedPhoto: issue.capturedPhoto,
      attempts: issue.attempts,
      status: issue.status,
      approvedBy: issue.approvedBy,
      approvedAt: issue.approvedAt?.toISOString(),
      approvalNotes: issue.approvalNotes,
      rejectedBy: issue.rejectedBy,
      rejectedAt: issue.rejectedAt?.toISOString(),
      rejectionReason: issue.rejectionReason,
    }));

    return NextResponse.json({
      issues: formattedIssues,
      count: formattedIssues.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch face verification issues:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch face verification issues" },
      { status: 500 }
    );
  }
}
