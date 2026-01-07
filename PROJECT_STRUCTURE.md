# Exam Manager - Project Structure

```
exam-manager/
├── prisma/
│   └── schema.prisma                 # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Student login with face recognition
│   │   │   └── setup/
│   │   │       └── page.tsx          # Initial system setup
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Admin dashboard
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx          # Question management
│   │   │   │   └── upload/
│   │   │   │       └── page.tsx      # Upload questions (Excel/TXT)
│   │   │   ├── students/
│   │   │   │   └── page.tsx          # Student data management
│   │   │   ├── examiners/
│   │   │   │   └── page.tsx          # Examiner management
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # System settings (emails, faculties)
│   │   │   └── statistics/
│   │   │       └── page.tsx          # Comprehensive statistics
│   │   ├── (exam)/
│   │   │   ├── exam/
│   │   │   │   └── [examId]/
│   │   │   │       └── page.tsx      # Exam interface with proctoring
│   │   │   └── essay/
│   │   │       └── [essayId]/
│   │   │           └── page.tsx      # Essay submission interface
│   │   ├── (examiner)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Examiner dashboard
│   │   │   ├── evaluate/
│   │   │   │   └── [essayId]/
│   │   │   │       └── page.tsx      # Essay evaluation interface
│   │   │   └── notifications/
│   │   │       └── page.tsx          # Email notifications
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts      # Login API
│   │   │   │   └── face-recognition/
│   │   │   │       └── route.ts      # Face recognition API
│   │   │   ├── questions/
│   │   │   │   ├── route.ts          # Question CRUD
│   │   │   │   └── upload/
│   │   │   │       └── route.ts      # Upload questions
│   │   │   ├── students/
│   │   │   │   └── route.ts          # Student management
│   │   │   ├── exam/
│   │   │   │   ├── start/
│   │   │   │   │   └── route.ts      # Start exam
│   │   │   │   ├── submit/
│   │   │   │   │   └── route.ts      # Submit exam
│   │   │   │   └── autosave/
│   │   │   │       └── route.ts      # Auto-save progress
│   │   │   ├── proctoring/
│   │   │   │   ├── focus/
│   │   │   │   │   └── route.ts      # Focus detection
│   │   │   │   └── audio/
│   │   │   │       └── route.ts      # Audio monitoring
│   │   │   ├── essays/
│   │   │   │   ├── route.ts          # Essay management
│   │   │   │   └── evaluate/
│   │   │   │       └── route.ts     # Essay evaluation
│   │   │   ├── results/
│   │   │   │   └── route.ts          # Results distribution
│   │   │   └── encryption/
│   │   │       └── route.ts          # Encryption utilities
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── magicui/                  # Magic UI components
│   │   ├── admin/
│   │   │   ├── QuestionUpload.tsx    # Question upload component
│   │   │   ├── QuestionList.tsx      # Question list
│   │   │   ├── StudentUpload.tsx     # Student data upload
│   │   │   └── Statistics.tsx        # Statistics dashboard
│   │   ├── exam/
│   │   │   ├── ExamInterface.tsx     # Main exam interface
│   │   │   ├── QuestionCard.tsx      # Question display
│   │   │   ├── Timer.tsx             # Countdown timer
│   │   │   ├── Calculator.tsx       # Scientific calculator
│   │   │   ├── Proctoring.tsx        # Proctoring component
│   │   │   └── AutoSave.tsx          # Auto-save indicator
│   │   ├── examiner/
│   │   │   ├── EssayViewer.tsx       # Essay viewing interface
│   │   │   ├── ScoringPanel.tsx      # Scoring interface
│   │   │   └── PageScorer.tsx        # Per-page scoring
│   │   └── shared/
│   │       ├── FaceRecognition.tsx   # Face recognition component
│   │       ├── DeviceCheck.tsx       # Device validation
│   │       └── Encryption.tsx        # Encryption utilities
│   ├── lib/
│   │   ├── utils.ts                  # Utility functions
│   │   ├── db.ts                      # Database client
│   │   ├── encryption.ts              # AES-256 encryption
│   │   ├── email.ts                   # Email service
│   │   ├── face-recognition.ts        # Face recognition logic
│   │   ├── proctoring.ts              # Proctoring logic
│   │   ├── question-parser.ts        # Excel/TXT parser
│   │   ├── validation.ts              # Input validation
│   │   └── constants.ts               # Constants and config
│   ├── types/
│   │   └── index.ts                   # TypeScript types
│   └── hooks/
│       ├── useExam.ts                 # Exam hook
│       ├── useProctoring.ts           # Proctoring hook
│       └── useTimer.ts                # Timer hook
├── public/
│   ├── models/                        # Face recognition models
│   └── samples/                       # Sample data files
├── .env.example                       # Environment variables template
├── .env                               # Environment variables (gitignored)
├── README.md                          # Project documentation
├── INSTALLATION.md                    # Installation instructions
├── DEPLOYMENT.md                      # Deployment guide
└── package.json                       # Dependencies

```
