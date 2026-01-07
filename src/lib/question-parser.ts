// Parse questions from Excel and TXT files

import * as XLSX from "xlsx";
import { QuestionData } from "./validation";

export interface ParsedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

/**
 * Parse questions from Excel file
 * Expected format:
 * - Column A: Question Text
 * - Column B-F: Options (B is correct, marked in bold)
 * - Column G: Marks (optional, defaults to 1)
 */
export function parseExcelQuestions(file: File): Promise<ParsedQuestion[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        const questions: ParsedQuestion[] = [];
        
        // Skip header row if present
        const startRow = jsonData[0]?.[0]?.toString().toLowerCase().includes("question") ? 1 : 0;
        
        for (let i = startRow; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          if (!row[0] || row[0].toString().trim() === "") continue;
          
          const questionText = row[0].toString().trim();
          const options: string[] = [];
          let correctAnswer = 0;
          
          // Extract options (columns B-F)
          for (let j = 1; j <= 5; j++) {
            if (row[j] && row[j].toString().trim() !== "") {
              options.push(row[j].toString().trim());
            }
          }
          
          // Check for bold formatting to determine correct answer
          const cell = worksheet[XLSX.utils.encode_cell({ r: i, c: 1 })];
          if (cell && cell.s && cell.s.font && cell.s.font.bold) {
            correctAnswer = 0; // First option is correct
          } else {
            // Default: first option is correct (can be enhanced)
            correctAnswer = 0;
          }
          
          if (options.length < 2) {
            continue; // Skip invalid questions
          }
          
          const marks = row[6] ? parseInt(row[6].toString()) || 1 : 1;
          
          questions.push({
            questionText,
            options,
            correctAnswer,
            marks,
          });
        }
        
        resolve(questions);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse questions from TXT file
 * Format:
 * Q1. Question text?
 * A) Option 1
 * B) Option 2
 * C) Option 3 (correct)
 * D) Option 4
 * Marks: 1
 * ---
 */
export function parseTxtQuestions(file: File): Promise<ParsedQuestion[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").map((line) => line.trim());
        
        const questions: ParsedQuestion[] = [];
        let currentQuestion: Partial<ParsedQuestion> | null = null;
        let options: string[] = [];
        let correctAnswer = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (!line) continue;
          
          // Detect question
          if (line.match(/^Q\d+\./i) || line.match(/^\d+\./)) {
            // Save previous question
            if (currentQuestion && options.length >= 2) {
              questions.push({
                questionText: currentQuestion.questionText!,
                options,
                correctAnswer,
                marks: currentQuestion.marks || 1,
              });
            }
            
            // Start new question
            currentQuestion = { questionText: line.replace(/^Q?\d+\.\s*/i, "") };
            options = [];
            correctAnswer = 0;
          }
          // Detect option
          else if (line.match(/^[A-F]\)/i)) {
            const optionText = line.replace(/^[A-F]\)\s*/i, "").trim();
            const optionIndex = line.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
            
            options.push(optionText);
            
            // Check if marked as correct (contains "(correct)" or "*")
            if (line.toLowerCase().includes("(correct)") || line.includes("*")) {
              correctAnswer = optionIndex;
            }
          }
          // Detect marks
          else if (line.toLowerCase().startsWith("marks:")) {
            const marks = parseInt(line.split(":")[1].trim()) || 1;
            if (currentQuestion) {
              currentQuestion.marks = marks;
            }
          }
        }
        
        // Save last question
        if (currentQuestion && options.length >= 2) {
          questions.push({
            questionText: currentQuestion.questionText!,
            options,
            correctAnswer,
            marks: currentQuestion.marks || 1,
          });
        }
        
        resolve(questions);
      } catch (error) {
        reject(new Error(`Failed to parse TXT file: ${error}`));
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Auto-detect file type and parse
 */
export async function parseQuestions(file: File): Promise<ParsedQuestion[]> {
  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    return parseExcelQuestions(file);
  } else if (file.name.endsWith(".txt")) {
    return parseTxtQuestions(file);
  } else {
    throw new Error("Unsupported file format. Please use .xlsx or .txt");
  }
}
