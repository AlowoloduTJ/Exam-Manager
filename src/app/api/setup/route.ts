import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { institution, admin, emails } = body;

    // Validate required fields
    if (!admin.email || !admin.password || !admin.name) {
      return NextResponse.json(
        { message: "Admin information is required" },
        { status: 400 }
      );
    }

    // Check if setup already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "System has already been set up" },
        { status: 400 }
      );
    }

    // Create admin user
    const adminUser = await db.user.create({
      data: {
        email: admin.email,
        password: hashPassword(admin.password),
        role: "ADMIN",
        name: admin.name,
        adminSettings: {
          create: {
            institutionName: institution.name || null,
            institutionLogo: institution.logo || null,
            mission: institution.mission || null,
            vision: institution.vision || null,
            viceChancellorEmail: emails.viceChancellorEmail,
            registrarEmail: emails.registrarEmail,
            bursarEmail: emails.bursarEmail,
            librarianEmail: emails.librarianEmail,
            facultyDeanEmail: emails.facultyDeanEmail,
            headOfDeptEmail: emails.headOfDeptEmail,
            facultyExamOfficerEmail: emails.facultyExamOfficerEmail,
            deptExamOfficerEmail: emails.deptExamOfficerEmail,
            courseLecturerEmails: emails.courseLecturerEmails || "[]",
            deputyVCEmail: emails.deputyVCEmail,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Setup completed successfully",
        adminId: adminUser.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { message: error.message || "Setup failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const adminSettings = await db.adminSettings.findFirst({
      include: {
        user: true,
      },
    });

    if (!adminSettings) {
      return NextResponse.json({ 
        setupComplete: false,
        isSetup: false 
      });
    }

    return NextResponse.json({
      setupComplete: true,
      isSetup: true,
      institution: {
        name: adminSettings.institutionName,
        logo: adminSettings.institutionLogo,
        mission: adminSettings.mission,
        vision: adminSettings.vision,
      },
    });
  } catch (error: any) {
    console.error("Setup GET error:", error);
    // Return safe default instead of error
    return NextResponse.json({ 
      setupComplete: false,
      isSetup: false 
    });
  }
}
