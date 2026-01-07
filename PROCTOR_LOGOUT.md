# Proctor Logout Functionality

## Overview

Proctors can now **log out any student** from their examination session for any infraction. This feature allows real-time monitoring and immediate action on examination violations.

## Features

### Proctor Dashboard
- View all active exam sessions in real-time
- See student information (name, matric number)
- Monitor warnings and session status
- Search and filter active sessions
- Auto-refresh every 10 seconds

### Logout Functionality
- **One-click logout** for any student
- **Mandatory infraction reason** - must provide reason before logout
- **Automatic session invalidation** - logs out student from all devices
- **Audit trail** - all proctor actions logged
- **Email notifications** - (to be implemented) notify student and administrators

## Implementation

### Files Created

1. **`src/app/(admin)/proctor/dashboard/page.tsx`**
   - Proctor dashboard interface
   - Real-time session monitoring
   - Logout dialog with reason input

2. **`src/app/api/proctor/active-sessions/route.ts`**
   - API endpoint to fetch all active exam sessions
   - Returns session details with time remaining

3. **`src/app/api/proctor/logout-student/route.ts`**
   - API endpoint to logout student
   - Records infraction reason
   - Creates proctoring log entry
   - Invalidates all student sessions

4. **`src/components/ui/dialog.tsx`**
   - Dialog component for logout confirmation

### Database Updates

**ExamSession Model:**
- Added `loggedOutBy` - Proctor/Admin ID
- Added `loggedOutAt` - Timestamp of logout

**ProctoringLog Model:**
- Added `proctorId` - ID of proctor who took action
- Added `proctorName` - Name of proctor
- Added `infractionReason` - Reason for proctor action

## Usage

### Accessing Proctor Dashboard

1. Navigate to `/proctor/dashboard`
2. View all active exam sessions
3. Search by matric number, name, or exam title
4. Click "Logout Student" button for any active session

### Logging Out a Student

1. Click "Logout Student" button on student's session card
2. Dialog opens with student and exam information
3. **Enter infraction reason** (required):
   - Examples:
     - "Using unauthorized materials"
     - "Talking during examination"
     - "Suspicious behavior detected"
     - "Violation of examination rules"
     - "Using mobile phone"
     - "Cheating attempt detected"
4. Click "Confirm Logout"
5. Student is immediately logged out from all devices
6. Session marked as logged out with reason
7. Proctoring log entry created

### What Happens When Student is Logged Out

1. **Exam Session:**
   - `isLoggedOut` set to `true`
   - `logoutReason` recorded
   - `loggedOutBy` set to proctor ID
   - `loggedOutAt` timestamp recorded
   - `endTime` set to current time

2. **Student Sessions:**
   - All active device sessions invalidated
   - Student logged out from all devices
   - Cannot login again until session expires

3. **Proctoring Log:**
   - New log entry created with:
     - Event type: `LOGOUT`
     - Proctor information
     - Infraction reason
     - Timestamp

4. **Notifications:**
   - (To be implemented) Email to student
   - (To be implemented) Email to administrators

## API Endpoints

### GET `/api/proctor/active-sessions`
Returns all active exam sessions.

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-id",
      "student": {
        "id": "student-id",
        "matricNumber": "MAT/2021/001",
        "name": "Student Name"
      },
      "exam": {
        "id": "exam-id",
        "title": "Introduction to Computer Science",
        "subject": "Computer Science"
      },
      "startTime": "2024-01-01T10:00:00Z",
      "warnings": 2,
      "isLoggedOut": false,
      "logoutReason": null,
      "timeRemaining": 3600
    }
  ],
  "count": 1
}
```

### POST `/api/proctor/logout-student`
Logs out a student for an infraction.

**Request:**
```json
{
  "sessionId": "session-id",
  "studentId": "student-id",
  "reason": "Using unauthorized materials during examination"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student has been logged out successfully",
  "session": {
    "id": "session-id",
    "studentId": "student-id",
    "isLoggedOut": true,
    "logoutReason": "Using unauthorized materials during examination"
  }
}
```

## Security Considerations

### Authentication
- **TODO**: Add proctor authentication check
- Currently allows any authenticated user
- Should be restricted to proctors and admins only

### Authorization
- Verify proctor has permission to logout students
- Log all proctor actions for audit
- Track which proctor took which action

### Audit Trail
- All logout actions logged in `ProctoringLog`
- Includes proctor ID, name, reason, timestamp
- Cannot be deleted or modified

## Dashboard Features

### Statistics Cards
- **Active Sessions**: Total number of active exam sessions
- **Sessions with Warnings**: Sessions that have received warnings
- **Logged Out**: Number of students logged out
- **Total Students**: Unique students in active sessions

### Session Cards
Each session card displays:
- Student name and matric number
- Exam title and subject
- Start time and time remaining
- Warning count (if any)
- Logout status (if logged out)
- Logout reason (if applicable)

### Actions
- **Logout Student**: Logout with infraction reason
- **View Details**: View detailed session information
- **Refresh**: Manually refresh session list

## Error Handling

### Common Errors
- **"Session not found"**: Exam session doesn't exist
- **"Student ID mismatch"**: Student ID doesn't match session
- **"Already logged out"**: Student already logged out
- **"Reason required"**: Must provide infraction reason

## Future Enhancements

1. **Real-time Updates**: WebSocket for live session updates
2. **Email Notifications**: Automatic emails to student and admins
3. **Infraction Categories**: Predefined infraction categories
4. **Warning System**: Issue warnings before logout
5. **Session Recording**: Record session for review
6. **Proctor Notes**: Add notes to sessions
7. **Bulk Actions**: Logout multiple students at once
8. **Reports**: Generate infraction reports

## Testing

### Test Scenarios

1. **Logout Active Student**:
   - Find active session
   - Click logout
   - Enter reason
   - Verify student logged out

2. **Logout Already Logged Out**:
   - Try to logout already logged out student
   - Verify error message

3. **Missing Reason**:
   - Try to logout without reason
   - Verify validation error

4. **Session Refresh**:
   - Logout student
   - Verify session updates in dashboard

## Notes

- Proctor actions are **irreversible** - logged out students cannot resume exam
- All actions are **logged** for audit purposes
- Infraction reasons are **mandatory** - cannot logout without reason
- Student is logged out from **all devices** immediately
- Dashboard **auto-refreshes** every 10 seconds
