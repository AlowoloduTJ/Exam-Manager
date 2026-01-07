// TypeScript types for Exam Manager System

export type UserRole = "ADMIN" | "EXAMINER" | "STUDENT";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Student {
  id: string;
  matricNumber: string;
  passportPhoto: string;
  classAttendance: number;
  continuousAssessment: number;
  departmentId: string;
}

export interface Question {
  id: string;
  subjectId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
  allowCalculator: boolean;
}

export interface ExamSession {
  id: string;
  examId: string;
  studentId: string;
  startTime: Date;
  answers: Record<string, number>; // questionId -> selectedOption
  autoSavedData?: Record<string, any>;
  warnings: number;
}

export interface EssaySubmission {
  id: string;
  essayQuestionId: string;
  studentId: string;
  scannedPages: string[];
  wordCount: number;
  status: "PENDING" | "IN_PROGRESS" | "EVALUATED" | "FLAGGED" | "RE_EVALUATION";
}

export interface EssayEvaluation {
  id: string;
  submissionId: string;
  examinerId: string;
  pageScores: Record<string, number>;
  totalScore: number;
  comments?: string;
  isFlagged: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
}

export interface ProctoringEvent {
  type: "FOCUS_LOST" | "FOCUS_RESTORED" | "AUDIO_DETECTED" | "AUDIO_WARNING" | "LOGOUT" | "FACE_MISMATCH";
  timestamp: Date;
  details?: Record<string, any>;
}

export interface DeviceInfo {
  deviceId: string;
  browser: string;
  os: string;
  userAgent: string;
}

export interface EmailConfig {
  viceChancellorEmail: string;
  registrarEmail: string;
  bursarEmail: string;
  librarianEmail: string;
  facultyDeanEmail: string;
  headOfDeptEmail: string;
  facultyExamOfficerEmail: string;
  deptExamOfficerEmail: string;
  courseLecturerEmails: string[];
  deputyVCEmail: string;
}
