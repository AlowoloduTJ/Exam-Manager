import { NextRequest, NextResponse } from "next/server";
import { validateStudentSession } from "@/lib/auth";

/**
 * Check if current session is valid and device matches
 * Used by client to verify session before accessing protected routes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await validateStudentSession(request);

    if (!session || !session.isValid) {
      return NextResponse.json(
        {
          isValid: false,
          message: "Session invalid or device mismatch",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      isValid: true,
      studentId: session.studentId,
      deviceId: session.deviceId,
    });
  } catch (error: any) {
    console.error("Session check error:", error);
    return NextResponse.json(
      {
        isValid: false,
        message: error.message || "Session check failed",
      },
      { status: 500 }
    );
  }
}
