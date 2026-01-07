import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const subjects = await db.subject.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      subjects: subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch subjects:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
