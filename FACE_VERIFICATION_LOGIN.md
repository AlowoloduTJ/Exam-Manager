# Face Verification Login Implementation

## Overview

Students can now **only login after successful face verification**. The system requires:
1. Valid matric number
2. Face recognition verification matching uploaded passport photo
3. Device capabilities (camera and microphone)

## Implementation Details

### Login Flow

1. **Matric Number Input**
   - Student enters matric number
   - System verifies matric number exists in database
   - Checks device capabilities (camera, microphone)

2. **Face Verification** (MANDATORY)
   - Camera activates automatically
   - Student positions face in frame
   - System captures photo from camera
   - Compares with uploaded passport photo
   - Uses face-api.js for face recognition
   - Threshold: 0.6 (60% similarity required)

3. **Verification Result**
   - **Success**: Login proceeds, session created
   - **Failure**: Shows "YOU NEED FURTHER IDENTIFICATION", login blocked

### Security Features

- **Face Recognition**: Uses face-api.js with 60% similarity threshold
- **Single Device**: Enforces one active session per student
- **Device Validation**: Requires camera and microphone access
- **Session Management**: Creates secure session tokens
- **Audit Trail**: Logs verification attempts

## Files Created/Modified

### New Files
- `src/app/(auth)/login/page.tsx` - Student login page with face verification
- `src/app/api/auth/check-student/route.ts` - Verify matric number
- `src/app/api/auth/login/route.ts` - Complete login after verification
- `src/app/api/auth/face-verification/route.ts` - Server-side verification (optional)
- `src/components/ui/alert.tsx` - Alert component for error messages

### Modified Files
- `src/lib/face-recognition.ts` - Updated for client-side usage with dynamic imports

## API Endpoints

### POST `/api/auth/check-student`
Verifies matric number and returns student data (including passport photo).

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
    "department": "Computer Engineering",
    "faculty": "Faculty of Engineering"
  }
}
```

### POST `/api/auth/login`
Completes login after face verification. Creates session and device record.

**Request:**
```json
{
  "matricNumber": "MAT/2021/001",
  "capturedPhoto": "base64-image-from-camera"
}
```

**Response:**
```json
{
  "success": true,
  "token": "session-token",
  "studentId": "student-id",
  "studentName": "Student Name",
  "matricNumber": "MAT/2021/001"
}
```

## Usage

### Student Login Process

1. Navigate to `/login`
2. Enter matric number
3. Click "Continue to Face Verification"
4. Grant camera and microphone permissions
5. Position face in camera frame
6. Click "Verify Identity"
7. Wait for verification (automatic comparison)
8. If verified: Redirected to dashboard
9. If failed: Shows error, can retry

### Error Messages

- **"Camera and microphone are required"**: Device permissions not granted
- **"Student not found"**: Invalid matric number
- **"Could not detect face"**: Face not clearly visible in camera
- **"YOU NEED FURTHER IDENTIFICATION"**: Face doesn't match passport photo
- **"Face verification error"**: Technical error during verification

## Requirements

### Face Recognition Models

Download face-api.js models to `public/models/`:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`

### Browser Requirements

- Modern browser with WebRTC support
- HTTPS (required for camera/microphone in production)
- Camera and microphone permissions

### Device Requirements

- Active camera (front-facing preferred)
- Active microphone
- Active speaker (for audio monitoring)

## Configuration

### Face Recognition Threshold

Edit `src/lib/face-recognition.ts`:
```typescript
const comparison = await compareFaces(uploadedDescriptor, cameraDescriptor, 0.6);
// Change 0.6 to adjust sensitivity (lower = more strict)
```

### Session Duration

Edit `src/app/api/auth/login/route.ts`:
```typescript
maxAge: 60 * 60 * 24, // 24 hours - change as needed
```

## Security Considerations

1. **Face Recognition**: Client-side verification with server-side validation option
2. **Session Tokens**: Secure token generation and storage
3. **Device Tracking**: Single device enforcement
4. **Photo Storage**: Passport photos stored securely (encrypted in database)
5. **HTTPS Required**: Camera/microphone only work over HTTPS in production

## Testing

1. **Test Valid Login**:
   - Enter valid matric number
   - Complete face verification
   - Verify redirect to dashboard

2. **Test Invalid Matric**:
   - Enter invalid matric number
   - Verify error message

3. **Test Face Mismatch**:
   - Use different person's face
   - Verify "YOU NEED FURTHER IDENTIFICATION" message

4. **Test Device Permissions**:
   - Deny camera/microphone
   - Verify error message

5. **Test No Face Detection**:
   - Cover face or look away
   - Verify appropriate error message

## Troubleshooting

### Face Recognition Not Working
- Ensure models are in `public/models/` directory
- Check browser console for errors
- Verify face-api.js is installed: `npm install face-api.js`

### Camera Not Accessing
- Check browser permissions
- Ensure HTTPS in production
- Verify camera is not in use by another application

### Verification Always Fails
- Check passport photo quality
- Ensure good lighting
- Adjust threshold if needed (lower = more strict)
- Verify both images have clear face visibility

## Notes

- Face verification is **mandatory** - login cannot proceed without successful verification
- Verification happens client-side for performance
- Server-side verification option available for additional security
- All verification attempts are logged for audit purposes
- Failed verifications can be retried without limit (consider rate limiting in production)
