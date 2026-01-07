// Constants for Exam Manager System

export const MIN_OBJECTIVE_QUESTIONS = 300;
export const MIN_QUESTIONS_FOR_EXAM = 500;
export const ESSAY_EXAMINERS_COUNT = 3;
export const MAX_SCORE_VARIANCE = 0.1; // 10%

// Proctoring thresholds
export const FOCUS_LOST_THRESHOLD = 2000; // 2 seconds in milliseconds
export const AUDIO_WARNING_THRESHOLD = 4000; // 4 seconds
export const AUDIO_LOGOUT_THRESHOLD = 15000; // 15 seconds

// Face recognition
export const FACE_MATCH_THRESHOLD = 0.6; // Similarity threshold

// Exam settings
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const TIMER_UPDATE_INTERVAL = 1000; // 1 second

// Email roles
export const EMAIL_ROLES = [
  "viceChancellorEmail",
  "registrarEmail",
  "bursarEmail",
  "librarianEmail",
  "facultyDeanEmail",
  "headOfDeptEmail",
  "facultyExamOfficerEmail",
  "deptExamOfficerEmail",
  "courseLecturerEmails",
  "deputyVCEmail",
] as const;

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
export const ALLOWED_DOCUMENT_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/plain", // .txt
  "application/pdf", // .pdf
];

// Encryption
export const ENCRYPTION_ALGORITHM = "aes-256-cbc";
export const IV_LENGTH = 16;
