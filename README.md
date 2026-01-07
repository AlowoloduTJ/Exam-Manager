# Exam Manager - Comprehensive Examination Management System

A full-featured, AI-powered examination management platform designed for higher-education institutions. Supports objective tests, essays, technical drawings, and laboratory reports with advanced proctoring, multi-examiner evaluation, and secure on-premise deployment.

## Features

### Core Functionality
- ✅ **500+ Objective Questions** with randomization
- ✅ **Multi-format Support**: Objective tests, essays, technical drawings, laboratory reports
- ✅ **Handwritten Assessment**: Scanned answer sheet processing
- ✅ **Multi-Examiner System**: Automatic distribution to 3 examiners
- ✅ **Variance Detection**: Flags essays with >10% score variance for re-evaluation
- ✅ **AES-256 Encryption**: All sensitive data encrypted
- ✅ **Single Device Sign-in**: Enforces one device per student

### Question Management
- ✅ **Excel/TXT Upload**: Bulk question import
- ✅ **Minimum 300 Questions**: Validation before exam creation
- ✅ **Correct Answer Highlighting**: Bold formatting in Excel
- ✅ **Subject-based Organization**: Multiple subjects support
- ✅ **Question Bank Management**: 500+ questions per subject

### Exam System
- ✅ **Timed Examinations**: Configurable duration with countdown timer
- ✅ **Auto-save Progress**: Every 30 seconds
- ✅ **Responsive Interface**: Mobile-first design
- ✅ **Scientific Calculator**: Embedded dropdown calculator
- ✅ **Question Randomization**: Unique question sets per student

### Proctoring & Security
- ✅ **Face Recognition**: Identity verification on login
- ✅ **Focus Detection**: Warns after 2 seconds of lost focus
- ✅ **Audio Monitoring**: Detects background noise
- ✅ **Auto-logout**: Logs out after 15 seconds of continuous noise
- ✅ **Device Validation**: Requires camera, microphone, speaker
- ✅ **System Takeover**: Full-screen exam mode

### Essay Evaluation
- ✅ **3 Random Examiners**: Automatic distribution
- ✅ **Per-page Scoring**: Score each page individually
- ✅ **Cumulative Scoring**: Automatic total calculation
- ✅ **Email Notifications**: Alerts examiners of new assignments
- ✅ **Word Count Validation**: Enforces min/max word limits
- ✅ **Variance Analysis**: Flags for re-evaluation if >10% variance

### Results & Reporting
- ✅ **Automatic Distribution**: Emails to all university officials
- ✅ **Comprehensive Reports**: Detailed statistics and analytics
- ✅ **Audit Trail**: Complete examination history
- ✅ **Grade Calculation**: Automatic grading system

### Admin Dashboard
- ✅ **Question Upload**: Excel/TXT file support
- ✅ **Student Management**: Bulk student data upload
- ✅ **Examiner Management**: Assign and manage examiners
- ✅ **Statistics Dashboard**: Comprehensive analytics
- ✅ **System Settings**: Email configuration, faculty/department setup

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Magic UI
- **Encryption**: AES-256 (crypto-js)
- **Face Recognition**: face-api.js
- **File Processing**: xlsx, react-pdf
- **Email**: Nodemailer
- **Validation**: Zod

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed file structure.

## Quick Start

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AlowoloduTJ/Exam-Manager.git
cd Exam-Manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Download face recognition models**
Place face-api.js models in `public/models/` directory.

6. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3002` and complete initial setup.

For detailed installation instructions, see [INSTALLATION.md](./INSTALLATION.md).

## Configuration

### Initial Setup

1. Navigate to `/setup` after first launch
2. Configure:
   - Admin account credentials
   - University email addresses (VC, Registrar, Bursar, etc.)
   - Faculties and Departments
   - Examiner accounts

### Student Data Format

Upload CSV with columns:
- Matric Number
- Passport Photo (base64 or URL)
- Class Attendance (0-100)
- Continuous Assessment (0-100)

### Question Upload Format

**Excel Format:**
- Column A: Question Text
- Column B-F: Options (B is correct, marked in bold)
- Column G: Marks (optional, defaults to 1)

**TXT Format:**
```
Q1. Question text?
A) Option 1
B) Option 2 (correct)
C) Option 3
Marks: 1
---
```

## Usage

### For Administrators

1. **Upload Questions**
   - Navigate to Admin Dashboard → Questions → Upload
   - Upload Excel or TXT file
   - System validates minimum 300 questions

2. **Upload Students**
   - Admin Dashboard → Students → Upload
   - Upload CSV with student data

3. **Create Exam**
   - Set exam duration, timing, and settings
   - Select questions (minimum 500 for randomization)
   - Enable/disable calculator

4. **Monitor Statistics**
   - View comprehensive exam statistics
   - Monitor student progress
   - Track examiner evaluations

### For Students

1. **Login**
   - Enter matric number
   - Face recognition verification
   - Device validation (camera, microphone, speaker)

2. **Take Exam**
   - Full-screen exam interface
   - Timer countdown
   - Auto-save every 30 seconds
   - Scientific calculator available

3. **Submit**
   - Review answers before submission
   - Final submission confirmation

### For Examiners

1. **Receive Notification**
   - Email notification for new essay assignment
   - Login to examiner dashboard

2. **Evaluate Essay**
   - View scanned pages
   - Score each page individually
   - Enter comments
   - Submit evaluation

3. **Re-evaluation**
   - Flagged essays appear for additional review
   - Provide second evaluation if variance >10%

## Security Features

- **AES-256 Encryption**: All sensitive data encrypted at rest
- **Single Device Enforcement**: One active session per student
- **Face Recognition**: Identity verification
- **Proctoring**: Real-time monitoring
- **Secure Storage**: On-premise data storage
- **Input Validation**: Comprehensive validation with Zod
- **Error Handling**: Robust error handling throughout

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Production Requirements

- HTTPS (required for camera/microphone access)
- PostgreSQL database
- SMTP email server
- SSL certificate
- Sufficient server resources

## Sample Data

Sample data scripts are available in `prisma/seed.ts`. Run with:

```bash
npx prisma db seed
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Student login with face recognition
- `POST /api/auth/face-recognition` - Face verification

### Questions
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `POST /api/questions/upload` - Upload questions file

### Exam
- `POST /api/exam/start` - Start exam session
- `POST /api/exam/submit` - Submit exam
- `POST /api/exam/autosave` - Auto-save progress

### Proctoring
- `POST /api/proctoring/focus` - Report focus status
- `POST /api/proctoring/audio` - Report audio detection

### Essays
- `GET /api/essays` - List essay submissions
- `POST /api/essays/evaluate` - Submit evaluation

## Troubleshooting

### Common Issues

**Face Recognition Not Working**
- Ensure models are in `public/models/`
- Check browser console for errors
- Verify HTTPS in production

**Device Access Denied**
- HTTPS required for camera/microphone
- Check browser permissions
- Verify SSL certificate

**Email Not Sending**
- Verify SMTP credentials
- Check firewall settings
- Use App Password for Gmail

**Database Errors**
- Run `npx prisma migrate reset`
- Check `DATABASE_URL` in `.env`
- Ensure Prisma Client is generated

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Specify your license here]

## Support

For issues and questions:
- GitHub Issues: https://github.com/AlowoloduTJ/Exam-Manager/issues
- Documentation: See project documentation files

## Roadmap

- [ ] Mobile app support
- [ ] Offline mode
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with LMS systems
- [ ] AI-powered question generation
- [ ] Plagiarism detection

---

**Note**: This is a comprehensive system. Ensure proper testing and security audits before production deployment.
