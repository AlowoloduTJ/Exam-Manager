import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateStudentSession, logoutStudent } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await validateStudentSession(request);

    if (!session || !session.isValid) {
      return NextResponse.json(
        { message: "No active session" },
        { status: 401 }
      );
    }

    // Logout student - deactivate all sessions
    await logoutStudent(session.studentId);

    // Clear cookies
    cookies().delete("studentSession");
    cookies().delete("deviceId");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}
