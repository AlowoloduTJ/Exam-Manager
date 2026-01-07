// Input validation utilities

import { z } from "zod";
import { MIN_OBJECTIVE_QUESTIONS } from "./constants";

// Student data upload schema
export const studentUploadSchema = z.object({
  matricNumber: z.string().min(1, "Matric number is required"),
  passportPhoto: z.string().min(1, "Passport photo is required"),
  classAttendance: z.number().min(0).max(100, "Attendance must be between 0-100"),
  continuousAssessment: z.number().min(0).max(100, "CA score must be between 0-100"),
});

export type StudentUploadData = z.infer<typeof studentUploadSchema>;

// Question validation
export const questionSchema = z.object({
  questionText: z.string().min(10, "Question text must be at least 10 characters"),
  options: z.array(z.string().min(1)).min(2).max(6, "Must have 2-6 options"),
  correctAnswer: z.number().int().min(0),
  marks: z.number().int().positive(),
});

export type QuestionData = z.infer<typeof questionSchema>;

// Validate minimum questions
export function validateMinimumQuestions(count: number): { valid: boolean; message?: string } {
  if (count < MIN_OBJECTIVE_QUESTIONS) {
    return {
      valid: false,
      message: `Insufficient questions. Minimum ${MIN_OBJECTIVE_QUESTIONS} questions required. Please do not upload.`,
    };
  }
  return { valid: true };
}

// Email validation
export const emailSchema = z.string().email("Invalid email address");

// Exam validation
export const examSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subjectId: z.string().min(1, "Subject is required"),
  duration: z.number().int().positive("Duration must be positive"),
  startTime: z.date(),
  endTime: z.date(),
  allowCalculator: z.boolean().default(true),
});

export type ExamData = z.infer<typeof examSchema>;

// Essay evaluation validation
export const essayEvaluationSchema = z.object({
  pageScores: z.record(z.string(), z.number().min(0)),
  totalScore: z.number().min(0),
  comments: z.string().optional(),
});

export type EssayEvaluationData = z.infer<typeof essayEvaluationSchema>;

// Calculate score variance
export function calculateScoreVariance(scores: number[]): number {
  if (scores.length < 2) return 0;
  
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  return mean > 0 ? stdDev / mean : 0; // Coefficient of variation
}

// Check if variance exceeds threshold
export function shouldFlagForReEvaluation(scores: number[], threshold: number = 0.1): boolean {
  const variance = calculateScoreVariance(scores);
  return variance > threshold;
}
