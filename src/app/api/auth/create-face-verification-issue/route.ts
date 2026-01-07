import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { matricNumber, capturedPhoto, failureReason } = await request.json();

    if (!matricNumber || !failureReason) {
      return NextResponse.json(
        { message: "Matric number and failure reason are required" },
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

    // Check for existing pending issue
    const existingIssue = await db.faceVerificationIssue.findFirst({
      where: {
        studentId: student.id,
        status: "PENDING",
      },
      orderBy: {
        attemptedAt: "desc",
      },
    });

    if (existingIssue) {
      // Update existing issue - increment attempts
      await db.faceVerificationIssue.update({
        where: { id: existingIssue.id },
        data: {
          attempts: existingIssue.attempts + 1,
          failureReason: failureReason,
          capturedPhoto: capturedPhoto || existingIssue.capturedPhoto,
          attemptedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Face verification issue updated",
        issueId: existingIssue.id,
      });
    } else {
      // Create new issue
      const issue = await db.faceVerificationIssue.create({
        data: {
          studentId: student.id,
          matricNumber: student.matricNumber,
          failureReason: failureReason,
          passportPhoto: student.passportPhoto,
          capturedPhoto: capturedPhoto || null,
          attempts: 1,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Face verification issue created",
        issueId: issue.id,
      });
    }
  } catch (error: any) {
    console.error("Create face verification issue error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create face verification issue" },
      { status: 500 }
    );
  }
}
