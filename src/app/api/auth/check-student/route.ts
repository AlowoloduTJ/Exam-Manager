import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { matricNumber } = await request.json();

    if (!matricNumber) {
      return NextResponse.json(
        { message: "Matric number is required" },
        { status: 400 }
      );
    }

    // Find student by matric number
    const student = await db.student.findUnique({
      where: { matricNumber: matricNumber.toUpperCase() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            name: true,
            faculty: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found. Please check your matric number." },
        { status: 404 }
      );
    }

    // Return student data (excluding sensitive information)
    return NextResponse.json({
      student: {
        id: student.id,
        matricNumber: student.matricNumber,
        passportPhoto: student.passportPhoto,
        name: student.user.name,
        department: student.department.name,
        faculty: student.department.faculty.name,
      },
    });
  } catch (error: any) {
    console.error("Check student error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to verify student" },
      { status: 500 }
    );
  }
}
