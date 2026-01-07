# Matriculation Number Only Login

## Overview

Students can login using **only their matriculation number** - no password is required. Authentication is handled through:

1. **Face Verification** - Automatic face recognition matching passport photo
2. **Proctor Approval** - Manual approval for students with face recognition issues
3. **Device Management** - Single device enforcement for security

## Login Flow

### Step 1: Enter Matric Number
- Student enters only their matriculation number
- System verifies matric number exists in database
- No password field required

### Step 2: Face Verification
- Camera activates automatically
- System captures student's face
- Compares with uploaded passport photo
- If match: Proceed to login
- If no match: Create issue for proctor review

### Step 3: Login Completion
- Session token generated
- Device session created
- Student redirected to dashboard

## Security Features

### No Password Required
- **Matric number only** - Simplifies login process
- **Face verification** - Ensures student identity
- **Proctor override** - Manual approval for edge cases

### Additional Security
- **Single device enforcement** - Only one device at a time
- **Device fingerprinting** - Unique device ID tracking
- **Session validation** - Automatic device mismatch detection
- **Audit trail** - All login attempts logged

## API Endpoints

### POST `/api/auth/login`
Login with matric number and face verification.

**Request:**
```json
{
  "matricNumber": "MAT/2021/001",
  "capturedPhoto": "base64-image-data"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "session-token",
  "deviceId": "device-id",
  "studentId": "student-id",
  "studentName": "Student Name",
  "matricNumber": "MAT/2021/001",
  "message": "Login successful"
}
```

**Response (Face Verification Required):**
```json
{
  "message": "Face verification required. Your request has been sent to a proctor for review.",
  "error": "FACE_VERIFICATION_REQUIRED",
  "requiresProctorApproval": true
}
```

**Response (Device Conflict):**
```json
{
  "message": "You are already logged in on another device...",
  "error": "DEVICE_CONFLICT",
  "existingDevice": true
}
```

### POST `/api/auth/check-student`
Verify matric number exists.

**Request:**
```json
{
  "matricNumber": "MAT/2021/001"
}
```

**Response:**
```json
{
  "student": {
    "id": "student-id",
    "matricNumber": "MAT/2021/001",
    "passportPhoto": "base64-or-url",
    "name": "Student Name",
    "department": "Computer Science",
    "faculty": "Engineering"
  }
}
```

## User Interface

### Login Page (`/login`)
- **Single Input Field**: Matric Number only
- **No Password Field**: Password not required
- **Face Verification**: Automatic camera activation
- **Device Check**: Validates camera/microphone availability

### Login Steps
1. **Input Step**: Enter matric number
2. **Verification Step**: Face verification via camera
3. **Success Step**: Login complete, redirect to dashboard
4. **Failed Step**: Show error, option to retry

## Proctor Approval

If face verification fails:
- Issue automatically created for proctor review
- Student sees: "Face verification failed. Your request has been sent to a proctor for review."
- Proctor can approve at `/proctor/face-verification`
- Once approved, student can login without face verification (24 hours)

## Benefits

### For Students
- **Simplified Login**: No password to remember
- **Fast Access**: Quick matric number entry
- **Secure**: Face verification ensures identity

### For Administrators
- **No Password Management**: No password resets needed
- **Better Security**: Face verification harder to bypass
- **Audit Trail**: All login attempts tracked

## Security Considerations

### Matric Number Security
- Matric numbers are **not secret** - they're public identifiers
- Security relies on:
  - **Face verification** - Biometric authentication
  - **Device management** - Single device enforcement
  - **Proctor oversight** - Manual approval for issues

### Recommendations
- Keep matric numbers **public** (they're student identifiers)
- Ensure **face verification** is mandatory
- Maintain **proctor review** for edge cases
- Monitor **login attempts** for suspicious activity

## Database Schema

### Student Model
```prisma
model Student {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(...)
  matricNumber          String   @unique  // Primary login identifier
  passportPhoto         String   // For face verification
  // ... other fields
}
```

### User Model
- User model has password field (for admin/examiner accounts)
- **Student accounts don't use password for login**
- Password field exists but is not validated for student login

## Migration Notes

If migrating from password-based login:
1. Remove password requirement from login API
2. Remove password field from login page
3. Keep face verification mandatory
4. Update documentation
5. Notify students of new login process

## Testing

### Test Scenarios

1. **Valid Matric + Face Match**
   - Enter valid matric number
   - Face verification succeeds
   - Login successful

2. **Valid Matric + Face Mismatch**
   - Enter valid matric number
   - Face verification fails
   - Issue created for proctor
   - Student sees pending message

3. **Invalid Matric Number**
   - Enter invalid matric number
   - Error: "Student not found"

4. **Proctor Approved**
   - Face verification failed
   - Proctor approves
   - Student can login without face verification

5. **Device Conflict**
   - Student logged in on Device A
   - Attempt login on Device B
   - Error: "Already logged in on another device"

## Notes

- **No password field** in login form
- **Matric number is case-insensitive** (automatically uppercased)
- **Face verification is mandatory** (unless proctor approved)
- **Single device enforcement** still applies
- **All security features** remain active
