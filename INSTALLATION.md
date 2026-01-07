# Installation Guide - Exam Manager System

## Prerequisites

- Node.js 18+ and npm
- Git
- SQLite (included with Node.js) or PostgreSQL for production
- SMTP email account for notifications

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/AlowoloduTJ/Exam-Manager.git
cd Exam-Manager

# Install dependencies
npm install
```

## Step 2: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Encryption (Generate a secure random key)
ENCRYPTION_KEY="your-secure-32-character-key-here"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@exammanager.com"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3002"
NODE_ENV="development"

# Session
SESSION_SECRET="your-secure-session-secret"
```

### Generating Encryption Key

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed sample data
npx prisma db seed
```

## Step 4: Download Face Recognition Models

Download face-api.js models and place them in `public/models/`:

```bash
mkdir -p public/models
cd public/models

# Download models (you'll need to get these from face-api.js repository)
# tiny_face_detector_model-weights_manifest.json
# tiny_face_detector_model-shard1
# face_landmark_68_model-weights_manifest.json
# face_landmark_68_model-shard1
# face_recognition_model-weights_manifest.json
# face_recognition_model-shard1
```

Or use the provided script:

```bash
npm run download-models
```

## Step 5: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3002`

## Step 6: Initial Setup

1. Navigate to `http://localhost:3002/setup`
2. Configure:
   - Admin account
   - University email addresses
   - Faculties and Departments
   - Examiner accounts

## Step 7: Upload Sample Data

### Upload Questions

1. Go to Admin Dashboard → Questions → Upload
2. Upload Excel (.xlsx) or Text (.txt) file with questions
3. Ensure minimum 300 questions per subject

### Upload Students

1. Go to Admin Dashboard → Students → Upload
2. Upload CSV file with format:
   ```
   Matric Number,Passport Photo,Class Attendance,Continuous Assessment
   MAT/2021/001,base64_or_url,85,75
   ```

## Production Deployment

See `DEPLOYMENT.md` for detailed production deployment instructions.

## Troubleshooting

### Face Recognition Models Not Loading

- Ensure models are in `public/models/` directory
- Check browser console for CORS errors
- Verify model files are accessible

### Database Errors

- Run `npx prisma migrate reset` to reset database
- Check `DATABASE_URL` in `.env`
- Ensure Prisma Client is generated: `npx prisma generate`

### Email Not Sending

- Verify SMTP credentials in `.env`
- For Gmail, use App Password (not regular password)
- Check firewall/network restrictions

### Device Access Denied

- Ensure HTTPS in production (required for camera/microphone)
- Check browser permissions
- Verify SSL certificate is valid
