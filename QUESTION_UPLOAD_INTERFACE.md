# Question Upload Interface

## Overview

A comprehensive interface for uploading and creating multiple types of questions from various file formats or manual entry.

## Supported Question Types

1. **Single-Answer MCQ** - One correct option
2. **Multiple-Answer MCQ** - More than one correct option
3. **True/False** - Simplified MCQ
4. **Best-Answer** - Several correct options but one is most correct
5. **Fill-in-the-Blank / Short Answer** - Candidates type a word, phrase, or number
6. **Matching Questions** - Drag-and-drop or dropdown matching
7. **Hotspot / Image-Based Questions** - Candidates click on a specific area of an image
8. **Ordering / Sequencing Questions** - Candidates arrange items in the correct order
9. **Simulation / Scenario-Based Questions** - Interactive tasks that mimic real-world actions
10. **Essay / Long-Form Questions** - Candidates type a full written response
11. **Coding Questions** - Candidates write and run code inside the test environment

## Supported File Formats

- **Excel**: `.xls`, `.xlsx`
- **Word**: `.doc`, `.docx` (requires conversion to Excel/TXT)
- **PDF**: `.pdf` (requires conversion to Excel/TXT)
- **Text**: `.txt`
- **Images**: `.png`, `.jpeg`, `.jpg` (for image-based questions)

## Features

### File Upload
- Multiple file selection
- Drag-and-drop support (via file input)
- File validation
- Progress tracking
- Preview of parsed questions

### Manual Entry
- All question types supported
- Dynamic option management
- Image upload for questions
- Mark correct answers visually
- Subject selection

## File Format Specifications

### Excel Format (.xlsx, .xls)
```
Column A: Question Text
Column B-F: Options (B is correct, marked in bold)
Column G: Marks (optional, defaults to 1)
```

### Text Format (.txt)
```
Q1. Question text?
A) Option 1
B) Option 2
C) Option 3 (correct)
D) Option 4
Marks: 1
---
```

## Database Schema

### Question Model
```prisma
model Question {
  id            String       @id @default(cuid())
  subjectId     String
  questionText  String       // Encrypted
  questionType  QuestionType @default(SINGLE_CHOICE)
  options       String?      // JSON array, encrypted
  correctAnswer String?      // JSON: can be array for multiple choice
  marks         Int          @default(1)
  imageUrl      String?      // URL to question image
  metadata      String?      // JSON: additional data
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  TRUE_FALSE
  BEST_ANSWER
  FILL_BLANK
  MATCHING
  HOTSPOT
  ORDERING
  SIMULATION
  ESSAY
  CODING
}
```

## API Endpoints

### GET `/api/subjects`
Get list of all subjects.

**Response:**
```json
{
  "subjects": [
    {
      "id": "subject-id",
      "name": "Mathematics",
      "code": "MATH101"
    }
  ]
}
```

### POST `/api/questions/upload`
Upload questions from files.

**Request:**
- `files`: Array of files (FormData)
- `subjectId`: Subject ID

**Response:**
```json
{
  "success": true,
  "questionsCreated": 50,
  "preview": [...],
  "message": "Successfully created 50 questions"
}
```

### POST `/api/questions/create`
Create a single question manually.

**Request:**
- `questionText`: Question text
- `type`: Question type
- `options`: JSON array of options
- `correctAnswers`: JSON array of correct answer indices
- `marks`: Marks for the question
- `subjectId`: Subject ID
- `image`: Optional image file

**Response:**
```json
{
  "success": true,
  "question": {
    "id": "question-id",
    "type": "SINGLE_CHOICE",
    "marks": 1
  },
  "message": "Question created successfully"
}
```

## Usage

### Accessing the Interface
Navigate to `/questions/upload` (admin only)

### Uploading from Files
1. Select "Upload from File" tab
2. Choose a subject
3. Select files (multiple files supported)
4. Click "Upload Questions"
5. Review preview of parsed questions

### Manual Entry
1. Select "Manual Entry" tab
2. Choose subject and question type
3. Enter question text
4. Add options (if applicable)
5. Mark correct answers
6. Set marks
7. Upload image (optional)
8. Click "Create Question"

## File Processing

### Excel Files
- Parses first sheet
- Detects header row automatically
- Extracts options from columns B-F
- Identifies correct answer from bold formatting
- Supports marks column

### Text Files
- Parses question format: `Q1. Question text?`
- Parses options: `A) Option 1`
- Detects correct answer from `(correct)` marker or `*`
- Supports marks: `Marks: 1`

### Image Files
- Saves image to `/public/uploads/questions/`
- Creates HOTSPOT question type
- Image URL stored in question record

### PDF/DOC Files
- Currently requires conversion to Excel/TXT
- Future: OCR and parsing support

## Security

- All question text encrypted before storage
- Options encrypted
- Correct answers stored as JSON (encrypted)
- File uploads validated
- Subject verification

## Error Handling

- Invalid file format: Shows error message
- Missing subject: Validation error
- Parsing errors: Logged, continues with other files
- File size limits: Configurable

## Future Enhancements

1. **OCR Support**: Parse questions from PDF/DOC files
2. **Bulk Edit**: Edit multiple questions at once
3. **Question Templates**: Pre-defined templates for each type
4. **Import Validation**: Preview and validate before import
5. **Question Bank Management**: View, edit, delete questions
6. **Duplicate Detection**: Check for duplicate questions
7. **Question Statistics**: View question usage and performance

## Notes

- Minimum 300 questions required for exams (validated separately)
- Questions are encrypted before storage
- Image uploads stored in `public/uploads/questions/`
- All question types supported in database schema
- Manual entry supports all question types
- File upload currently supports Excel and TXT formats
