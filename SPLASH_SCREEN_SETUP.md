# Splash Screen and Institution Configuration

## Overview

The system now includes:
1. **Splash Screen** - Displays "CEMS by ATJ CONCEPTS LIMITED" with institution branding
2. **Institution Configuration** - Setup page for mission, vision, and logo upload
3. **Database Schema Updates** - Added fields for institution branding

## Features Implemented

### 1. Splash Screen Component
- **Location**: `src/components/shared/SplashScreen.tsx`
- **Features**:
  - Displays institution logo (if configured)
  - Shows institution name
  - Displays "CEMS" branding
  - Shows "by ATJ CONCEPTS LIMITED"
  - Animated loading progress bar
  - 3-second display duration
  - Smooth fade-out animation
  - Only shows on first page load (uses sessionStorage)

### 2. Setup Page
- **Location**: `src/app/(auth)/setup/page.tsx`
- **Features**:
  - 3-step setup wizard:
    1. **Institution Information**:
       - Institution name input
       - Logo upload (drag & drop or click)
       - Mission statement textarea
       - Vision statement textarea
    2. **Admin Account**:
       - Admin name, email, password
       - Password confirmation
    3. **Email Configuration**:
       - All university official emails
       - Course lecturer emails (comma-separated)

### 3. Database Schema Updates
- **Location**: `prisma/schema.prisma`
- **New Fields in AdminSettings**:
  - `institutionLogo` (String?) - Logo file path/URL
  - `institutionName` (String?) - Institution name
  - `mission` (String?) - Mission statement
  - `vision` (String?) - Vision statement

### 4. API Routes
- **Setup API**: `src/app/api/setup/route.ts`
  - `POST /api/setup` - Complete system setup
  - `GET /api/setup` - Check setup status and get institution data
- **Logo Upload**: `src/app/api/setup/upload-logo/route.ts`
  - `POST /api/setup/upload-logo` - Upload institution logo
  - Validates file type (PNG, JPG, SVG)
  - Validates file size (5MB max)
  - Saves to `public/uploads/logos/`

## Usage

### Initial Setup Flow

1. **First Launch**:
   - Splash screen appears automatically
   - Shows "CEMS by ATJ CONCEPTS LIMITED"
   - Displays institution logo if configured

2. **Setup Process**:
   - Navigate to `/setup` (or redirect if not configured)
   - Complete 3-step wizard:
     - Upload logo, enter mission/vision
     - Create admin account
     - Configure email addresses

3. **After Setup**:
   - Splash screen shows with institution branding
   - Institution data is loaded from database
   - Logo, mission, and vision are displayed

### Logo Upload

- **Supported Formats**: PNG, JPG, JPEG, SVG
- **Max Size**: 5MB
- **Storage**: `public/uploads/logos/`
- **Access**: Public URL `/uploads/logos/filename`

### Mission & Vision

- **Mission**: Institution's mission statement
- **Vision**: Institution's vision statement
- **Storage**: Stored in database (AdminSettings model)
- **Display**: Can be shown on dashboard, about page, etc.

## Files Created/Modified

### New Files
- `src/components/shared/SplashScreen.tsx` - Splash screen component
- `src/components/shared/SplashScreenProvider.tsx` - Client wrapper for splash
- `src/components/ui/textarea.tsx` - Textarea component
- `src/components/ui/label.tsx` - Label component
- `src/app/(auth)/setup/page.tsx` - Setup page
- `src/app/api/setup/route.ts` - Setup API
- `src/app/api/setup/upload-logo/route.ts` - Logo upload API

### Modified Files
- `prisma/schema.prisma` - Added institution fields
- `src/app/layout.tsx` - Integrated splash screen

## Database Migration

After updating the schema, run:

```bash
npx prisma migrate dev --name add_institution_branding
npx prisma generate
```

## Configuration

### Environment Variables
No additional environment variables needed. Logo uploads use the `public/uploads/` directory.

### File Permissions
Ensure the uploads directory is writable:
```bash
mkdir -p public/uploads/logos
chmod 755 public/uploads/logos
```

## Customization

### Splash Screen Duration
Edit `SplashScreen.tsx`:
```typescript
setTimeout(() => {
  setIsVisible(false);
  setTimeout(onComplete, 500);
}, 3000); // Change 3000 to desired milliseconds
```

### Logo Size Limits
Edit `src/app/api/setup/upload-logo/route.ts`:
```typescript
if (file.size > 5 * 1024 * 1024) { // Change 5 to desired MB
```

### Allowed File Types
Edit `src/app/api/setup/upload-logo/route.ts`:
```typescript
const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
```

## Displaying Mission & Vision

To display mission and vision elsewhere in the app:

```typescript
const response = await fetch("/api/setup");
const data = await response.json();

if (data.isSetup) {
  const { mission, vision, institutionName, institutionLogo } = data.institution;
  // Use the data
}
```

## Testing

1. **Test Splash Screen**:
   - Clear sessionStorage: `sessionStorage.removeItem("hasSeenSplash")`
   - Refresh page
   - Splash should appear

2. **Test Setup**:
   - Navigate to `/setup`
   - Complete all 3 steps
   - Verify data is saved

3. **Test Logo Upload**:
   - Upload a logo in setup
   - Verify it appears in splash screen
   - Check file is saved in `public/uploads/logos/`

## Notes

- Splash screen only shows once per browser session
- Logo is stored in public directory (accessible via URL)
- Mission and vision are stored in database
- Setup can only be completed once (check prevents re-setup)
- All fields are optional except admin account and email configuration
