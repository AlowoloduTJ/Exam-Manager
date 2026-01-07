import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateStudentSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // TODO: Add proctor authentication check
    // For now, allow any authenticated user (should be restricted to proctors/admins)

    // Get all active exam sessions
    const activeSessions = await db.examSession.findMany({
      where: {
        isSubmitted: false,
        // Include both active and logged out sessions for monitoring
      },
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
        exam: {
          include: {
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    // Calculate time remaining for each session
    const sessionsWithTime = activeSessions.map((session) => {
      const startTime = new Date(session.startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // seconds
      const duration = session.exam.duration * 60; // convert minutes to seconds
      const timeRemaining = Math.max(0, duration - elapsed);

      return {
        id: session.id,
        student: {
          id: session.student.id,
          matricNumber: session.student.matricNumber,
          name: session.student.user.name,
        },
        exam: {
          id: session.exam.id,
          title: session.exam.title,
          subject: session.exam.subject.name,
        },
        startTime: session.startTime.toISOString(),
        warnings: session.warnings,
        isLoggedOut: session.isLoggedOut,
        logoutReason: session.logoutReason,
        timeRemaining,
      };
    });

    return NextResponse.json({
      sessions: sessionsWithTime,
      count: sessionsWithTime.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch active sessions:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch active sessions" },
      { status: 500 }
    );
  }
}
