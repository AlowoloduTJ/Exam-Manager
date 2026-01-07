import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encryptObject } from "@/lib/encryption";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const questionText = formData.get("questionText") as string;
    const questionType = formData.get("type") as string;
    const optionsJson = formData.get("options") as string;
    const correctAnswersJson = formData.get("correctAnswers") as string;
    const marks = parseInt(formData.get("marks") as string) || 1;
    const subjectId = formData.get("subjectId") as string;
    const imageFile = formData.get("image") as File | null;

    if (!questionText || !subjectId || !questionType) {
      return NextResponse.json(
        { message: "Question text, type, and subject are required" },
        { status: 400 }
      );
    }

    // Verify subject exists
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    // Parse options and correct answers
    const options = optionsJson ? JSON.parse(optionsJson) : null;
    const correctAnswers = correctAnswersJson ? JSON.parse(correctAnswersJson) : [];

    // Handle image upload
    let imageUrl: string | null = null;
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filename = `${Date.now()}-${imageFile.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "questions");
      const filePath = path.join(uploadDir, filename);

      // Ensure directory exists
      const fs = await import("fs/promises");
      await fs.mkdir(uploadDir, { recursive: true });

      await writeFile(filePath, buffer);
      imageUrl = `/uploads/questions/${filename}`;
    }

    // Encrypt question data
    const encryptedText = encryptObject({ text: questionText });
    const encryptedOptions = options ? encryptObject({ options }) : null;

    // Create question
    const question = await db.question.create({
      data: {
        subjectId,
        questionText: encryptedText,
        questionType: questionType as any,
        options: encryptedOptions,
        correctAnswer: JSON.stringify(correctAnswers),
        marks,
        imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      question: {
        id: question.id,
        type: question.questionType,
        marks: question.marks,
      },
      message: "Question created successfully",
    });
  } catch (error: any) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create question" },
      { status: 500 }
    );
  }
}
