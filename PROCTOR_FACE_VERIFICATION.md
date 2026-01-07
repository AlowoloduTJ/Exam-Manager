# Proctor Face Verification Override

## Overview

Proctors can now **approve and login students** who have problems with face recognition/picture verification. This allows manual verification when automatic face recognition fails.

## Features

### Face Verification Issues Dashboard
- View all students who failed face recognition
- See passport photo vs captured photo comparison
- View failure reasons and attempt counts
- Filter by status (Pending, Approved, Rejected)
- Real-time updates

### Proctor Actions
- **Approve & Login**: Manually verify student identity and log them in
- **Reject**: Reject the verification request with reason
- **View Photos**: Compare passport and captured photos side-by-side

### Automatic Issue Creation
- When student fails face verification, issue is automatically created
- Issue status: PENDING (awaiting proctor review)
- Proctor can approve to allow login

## Implementation

### Files Created

1. **`src/app/(admin)/proctor/face-verification/page.tsx`**
   - Proctor dashboard for face verification issues
   - Photo comparison view
   - Approve/Reject actions

2. **`src/app/api/proctor/face-verification-issues/route.ts`**
   - API endpoint to fetch all face verification issues

3. **`src/app/api/proctor/approve-face-verification/route.ts`**
   - API endpoint to approve student and log them in

4. **`src/app/api/proctor/reject-face-verification/route.ts`**
   - API endpoint to reject face verification request

### Database Updates

**New Model: `FaceVerificationIssue`**
- Tracks students who failed face recognition
- Stores passport and captured photos
- Records approval/rejection by proctors
- Tracks attempt counts

**New Enum: `FaceVerificationStatus`**
- PENDING - Awaiting proctor review
- APPROVED - Approved by proctor, student can login
- REJECTED - Rejected by proctor

## Usage

### Student Flow

1. Student attempts login with face verification
2. Face verification fails
3. System creates `FaceVerificationIssue` with status PENDING
4. Student sees message: "Face verification failed. Your request has been sent to a proctor for review."
5. Student waits for proctor approval

### Proctor Flow

1. Navigate to `/proctor/face-verification`
2. View pending face verification issues
3. Compare passport photo vs captured photo
4. Review failure reason and attempt count
5. **Approve**: Click "Approve & Login"
   - Add optional approval notes
   - Confirm approval
   - Student is logged in automatically
6. **Reject**: Click "Reject"
   - Provide rejection reason (required)
   - Student must try again or contact support

### After Approval

- Student can login without face verification (for 24 hours)
- Session token generated automatically
- Student logged in immediately
- Audit log entry created

## API Endpoints

### GET `/api/proctor/face-verification-issues`
Returns all face verification issues.

**Response:**
```json
{
  "issues": [
    {
      "id": "issue-id",
      "studentId": "student-id",
      "matricNumber": "MAT/2021/001",
      "studentName": "Student Name",
      "attemptedAt": "2024-01-01T10:00:00Z",
      "failureReason": "Face verification failed",
      "passportPhoto": "base64-or-url",
      "capturedPhoto": "base64-or-url",
      "attempts": 1,
      "status": "PENDING"
    }
  ],
  "count": 1
}
```

### POST `/api/proctor/approve-face-verification`
Approves student face verification and logs them in.

**Request:**
```json
{
  "issueId": "issue-id",
  "studentId": "student-id",
  "matricNumber": "MAT/2021/001",
  "notes": "Manually verified identity"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student face verification approved and logged in successfully",
  "student": {
    "id": "student-id",
    "matricNumber": "MAT/2021/001",
    "name": "Student Name"
  },
  "sessionToken": "session-token"
}
```

### POST `/api/proctor/reject-face-verification`
Rejects face verification request.

**Request:**
```json
{
  "issueId": "issue-id",
  "reason": "Photos do not match. Student needs to retake passport photo."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Face verification request has been rejected",
  "issue": {
    "id": "issue-id",
    "status": "REJECTED",
    "rejectionReason": "Photos do not match..."
  }
}
```

## Login API Updates

The login API now:
1. Checks for approved face verification issues
2. If approved within 24 hours, allows login without face verification
3. If not approved, creates issue and returns error
4. Proctor approval bypasses face verification requirement

## Dashboard Features

### Statistics
- **Pending Reviews**: Number of issues awaiting proctor action
- **Total Issues**: All face verification issues
- **Approved**: Successfully approved issues
- **Rejected**: Rejected issues

### Issue Cards
Each issue displays:
- Student name and matric number
- Passport photo (side-by-side with captured photo)
- Failure reason
- Attempt count
- Timestamp
- Status badge

### Actions
- **Approve & Login**: Approve student and log them in
- **Reject**: Reject with reason
- **View Details**: See full issue information

## Security & Audit

### Audit Trail
- All proctor actions logged in `ProctoringLog`
- Records proctor ID, name, and action taken
- Tracks approval/rejection reasons
- Timestamps all actions

### Approval Validity
- Approvals valid for 24 hours
- After 24 hours, student must verify again
- Can be extended if needed

### Proctor Authentication
- **TODO**: Add proctor authentication check
- Currently allows any authenticated user
- Should be restricted to proctors/admins only

## Error Handling

### Common Errors
- **"Issue not found"**: Face verification issue doesn't exist
- **"Already processed"**: Issue already approved/rejected
- **"Reason required"**: Must provide rejection reason
- **"Student not found"**: Student doesn't exist

## Testing Scenarios

### Test 1: Approve Student
1. Student fails face verification
2. Issue appears in proctor dashboard
3. Proctor approves
4. Student can login without face verification

### Test 2: Reject Student
1. Student fails face verification
2. Issue appears in proctor dashboard
3. Proctor rejects with reason
4. Student must try again

### Test 3: Multiple Attempts
1. Student fails multiple times
2. Each attempt creates new issue or increments count
3. Proctor can see attempt history

## Future Enhancements

1. **Bulk Approval**: Approve multiple students at once
2. **Photo Enhancement**: Tools to adjust/compare photos
3. **Video Verification**: Option for video call verification
4. **Auto-Approval Rules**: Rules for automatic approval
5. **Notification System**: Alert proctors of new issues
6. **Analytics**: Track approval/rejection rates

## Notes

- Proctor approval **bypasses** face verification requirement
- Approvals are **time-limited** (24 hours default)
- All actions are **logged** for audit
- Rejection reasons are **mandatory**
- Students can **retry** after rejection
