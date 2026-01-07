import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encryptObject } from "@/lib/encryption";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const subjectId = formData.get("subjectId") as string;

    if (!subjectId) {
      return NextResponse.json({ message: "Subject ID is required" }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    // Verify subject exists
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    let questionsCreated = 0;
    const preview: any[] = [];

    // Process each file
    for (const file of files) {
      try {
        const fileExt = file.name.split(".").pop()?.toLowerCase();

        // Handle different file types
        if (fileExt === "xlsx" || fileExt === "xls") {
          // Excel files
          const questions = await parseExcelFile(file);
          for (const q of questions) {
            await createQuestion(q, subjectId);
            questionsCreated++;
            preview.push(q);
          }
        } else if (fileExt === "txt") {
          // Text files
          const questions = await parseTxtFile(file);
          for (const q of questions) {
            await createQuestion(q, subjectId);
            questionsCreated++;
            preview.push(q);
          }
        } else if (fileExt === "png" || fileExt === "jpeg" || fileExt === "jpg") {
          // Image files - OCR would be needed here
          // For now, create a placeholder question
          const imageUrl = await saveImageFile(file);
          await createImageQuestion(file.name, imageUrl, subjectId);
          questionsCreated++;
        } else if (fileExt === "pdf" || fileExt === "doc" || fileExt === "docx") {
          // PDF/DOC files - would need special parsing
          // For now, return error suggesting conversion to Excel/TXT
          return NextResponse.json(
            {
              message: `PDF/DOC files require special parsing. Please convert to Excel (.xlsx) or Text (.txt) format.`,
            },
            { status: 400 }
          );
        }
      } catch (error: any) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with other files
      }
    }

    return NextResponse.json({
      success: true,
      questionsCreated,
      preview: preview.slice(0, 10), // Return first 10 for preview
      message: `Successfully created ${questionsCreated} questions`,
    });
  } catch (error: any) {
    console.error("Question upload error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to upload questions" },
      { status: 500 }
    );
  }
}

async function parseExcelFile(file: File): Promise<any[]> {
  // Use existing parser
  const { parseExcelQuestions } = await import("@/lib/question-parser");
  return parseExcelQuestions(file);
}

async function parseTxtFile(file: File): Promise<any[]> {
  // Use existing parser
  const { parseTxtQuestions } = await import("@/lib/question-parser");
  return parseTxtQuestions(file);
}

async function saveImageFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "questions");
  const filePath = path.join(uploadDir, filename);

  // Ensure directory exists
  const fs = await import("fs/promises");
  await fs.mkdir(uploadDir, { recursive: true });

  await writeFile(filePath, buffer);
  return `/uploads/questions/${filename}`;
}

async function createQuestion(questionData: any, subjectId: string) {
  const encryptedText = encryptObject({ text: questionData.questionText });
  const encryptedOptions = questionData.options
    ? encryptObject({ options: questionData.options })
    : null;

  await db.question.create({
    data: {
      subjectId,
      questionText: encryptedText,
      questionType: questionData.type || "SINGLE_CHOICE",
      options: encryptedOptions,
      correctAnswer: JSON.stringify(
        questionData.correctAnswers 
          ? questionData.correctAnswers 
          : (questionData.correctAnswer !== undefined ? [questionData.correctAnswer] : [0])
      ),
      marks: questionData.marks || 1,
      imageUrl: questionData.imageUrl || null,
      metadata: questionData.metadata ? JSON.stringify(questionData.metadata) : null,
    },
  });
}

async function createImageQuestion(fileName: string, imageUrl: string, subjectId: string) {
  const encryptedText = encryptObject({ text: `Image-based question: ${fileName}` });

  await db.question.create({
    data: {
      subjectId,
      questionText: encryptedText,
      questionType: "HOTSPOT",
      imageUrl,
      marks: 1,
      correctAnswer: JSON.stringify([]), // Empty array for hotspot questions
    },
  });
}
