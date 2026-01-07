# Single Device Login Enforcement

## Overview

The system now **strictly enforces single device login**. Students can only be logged in on ONE device at a time. Any attempt to login from a second device will be **BLOCKED** under all circumstances.

## Implementation Details

### Core Enforcement

1. **Device ID Generation**
   - Unique device ID generated from: User Agent, Platform, Hardware Concurrency
   - Stored in database and cookies
   - Used to identify and track devices

2. **Login Blocking Logic**
   - On login attempt, system checks for ANY active device session
   - If active session exists on DIFFERENT device → **LOGIN BLOCKED**
   - If active session exists on SAME device → Session refreshed (allowed)
   - If no active session → New session created (allowed)

3. **Session Validation**
   - Every protected route validates session
   - Device ID must match exactly
   - Device mismatch → Session invalidated, redirect to login

4. **Middleware Protection**
   - All `/student/*`, `/exam/*`, `/essay/*` routes protected
   - Automatic session validation on every request
   - Device mismatch detection and handling

## Files Created/Modified

### New Files
- `src/lib/auth.ts` - Authentication utilities and session management
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/app/api/auth/check-session/route.ts` - Session validation endpoint
- `src/middleware.ts` - Next.js middleware for route protection
- `src/hooks/useSession.ts` - React hook for session management

### Modified Files
- `src/app/api/auth/login/route.ts` - Enhanced with strict device checking
- `src/app/(auth)/login/page.tsx` - Added device conflict error handling

## API Endpoints

### POST `/api/auth/login`
**Enhanced with device conflict detection:**

```typescript
// If student has active session on different device:
{
  "message": "You are already logged in on another device...",
  "error": "DEVICE_CONFLICT",
  "existingDevice": true
}
// Status: 403 Forbidden
```

### POST `/api/auth/logout`
Deactivates all sessions for the student.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET `/api/auth/check-session`
Validates current session and device.

**Response:**
```json
{
  "isValid": true,
  "studentId": "student-id",
  "deviceId": "device-id"
}
```

## Security Features

### 1. Device ID Generation
- Based on browser fingerprint (User Agent, Platform, Hardware)
- Unique per device
- Cannot be easily spoofed

### 2. Session Validation
- Device ID stored in secure HTTP-only cookie
- Validated on every protected route access
- Automatic invalidation on device mismatch

### 3. Middleware Protection
- Runs before every request
- Validates session and device
- Redirects to login if invalid

### 4. Automatic Session Checking
- Client-side hook checks session every 30 seconds
- Detects device changes
- Automatic logout on device mismatch

## User Experience

### Login Attempt on Second Device

1. Student enters matric number
2. Completes face verification
3. **System detects active session on different device**
4. **Login BLOCKED** with error message:
   > "You are already logged in on another device. Please logout from that device first before logging in here. Only one device is allowed at a time."

### Same Device Re-login

1. Student enters matric number
2. Completes face verification
3. System detects active session on **same device**
4. Session refreshed (allowed)

### Device Change Detection

1. Student logged in on Device A
2. Student switches to Device B (different browser/computer)
3. On next request, middleware detects device mismatch
4. Session invalidated automatically
5. Redirected to login

## Error Messages

### Device Conflict
```
"You are already logged in on another device. 
Please logout from that device first before logging in here. 
Only one device is allowed at a time."
```

### Session Invalid
```
"Session invalid or device mismatch"
```

### Session Expired
```
"Session expired. Please login again."
```

## Testing Scenarios

### Test 1: Second Device Block
1. Login on Device A (Browser 1)
2. Attempt login on Device B (Browser 2)
3. **Expected**: Login blocked with device conflict error

### Test 2: Same Device Refresh
1. Login on Device A
2. Close browser
3. Reopen browser and login again
4. **Expected**: Login allowed (same device)

### Test 3: Device Change Detection
1. Login on Device A
2. Switch to Device B
3. Try to access protected route
4. **Expected**: Redirected to login (device mismatch)

### Test 4: Logout and Re-login
1. Login on Device A
2. Logout
3. Login on Device B
4. **Expected**: Login allowed (no active session)

## Configuration

### Session Duration
Edit `src/app/api/auth/login/route.ts`:
```typescript
maxAge: 60 * 60 * 24, // 24 hours
```

### Session Check Interval
Edit `src/hooks/useSession.ts`:
```typescript
const interval = setInterval(checkSession, 30000); // 30 seconds
```

### Device ID Generation
Edit `src/lib/encryption.ts`:
```typescript
export function generateDeviceId(deviceInfo: {
  userAgent: string;
  platform: string;
  hardwareConcurrency?: number;
}): string {
  // Customize device fingerprinting here
}
```

## Database Schema

The `DeviceSession` model tracks:
- `studentId` - Student reference
- `deviceId` - Unique device identifier
- `deviceInfo` - JSON device information
- `isActive` - Session active status
- `lastActivity` - Last activity timestamp

## Security Considerations

1. **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies (not accessible via JavaScript)
2. **Secure Cookies**: HTTPS required in production
3. **Device Fingerprinting**: Based on multiple browser characteristics
4. **Automatic Invalidation**: Device mismatch immediately invalidates session
5. **No Bypass**: No way to login on second device without logging out first

## Troubleshooting

### "Already logged in" but not actually logged in
- Check database for stale sessions
- Run cleanup script to deactivate old sessions
- Check device ID generation logic

### Device mismatch on same device
- Clear browser cache and cookies
- Check browser extensions that might modify User Agent
- Verify device ID generation includes all necessary factors

### Session not persisting
- Check cookie settings (httpOnly, secure, sameSite)
- Verify HTTPS in production
- Check browser cookie settings

## Notes

- **NO EXCEPTIONS**: Second device login is completely blocked
- **Automatic Detection**: Device changes detected automatically
- **User-Friendly**: Clear error messages explain the restriction
- **Secure**: Multiple layers of validation and protection
- **Audit Trail**: All device sessions logged in database
