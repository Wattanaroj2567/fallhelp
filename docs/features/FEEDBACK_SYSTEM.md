# Feedback System Documentation

## Overview

The Feedback System allows caregivers to send feedback about the app to administrators, who can then view and manage the feedback through the Admin Panel.

**Status:** ✅ Complete (December 1, 2025)

---

## Architecture

```
Mobile App (Caregiver)
    ↓ Submit Feedback
Backend API
    ↓ Store in Database
Admin Panel
    ↓ View & Manage
```

---

## Backend Implementation

### Database Schema

**Model: Feedback**

```prisma
model Feedback {
  id        String         @id @default(uuid())
  userId    String?        // Optional: User might send anonymously
  user      User?          @relation(fields: [userId], references: [id], onDelete: SetNull)
  message   String
  status    FeedbackStatus @default(PENDING)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  @@map("feedbacks")
}

enum FeedbackStatus {
  PENDING
  REVIEWED
  RESOLVED
}
```

**Relation to User:**

```prisma
model User {
  // ... other fields
  feedbacks Feedback[]
}
```

---

### API Endpoints

#### 1. Submit Feedback (Caregiver)

```http
POST /api/feedback
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "แอปพลิเคชันใช้งานง่ายมากครับ แต่ขอเพิ่มฟีเจอร์แจ้งเตือนผ่าน Line หน่อยครับ"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "message": "...",
    "status": "PENDING",
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-01T10:00:00.000Z"
  }
}
```

---

#### 2. Get All Feedback (Admin)

```http
GET /api/feedback
Authorization: Bearer {admin-token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "user": {
        "id": "user-uuid",
        "firstName": "วรรธนโรจน์",
        "lastName": "บุตรดี",
        "email": "user@example.com",
        "profileImage": null
      },
      "message": "...",
      "status": "PENDING",
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2025-12-01T10:00:00.000Z"
    }
  ]
}
```

---

#### 3. Update Feedback Status (Admin)

```http
PATCH /api/feedback/:id/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "REVIEWED"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "REVIEWED",
    "updatedAt": "2025-12-01T11:00:00.000Z"
  }
}
```

---

## Mobile App Implementation

### Send Feedback Screen

**Location:** `mobile/app/(setting-features)/feedback.tsx`

**Features:**
- Text area for feedback message
- Character count (optional)
- Submit button
- Success/error messages
- Loading state

**Navigation:**
- Access from Settings → "ส่งความคิดเห็น"

**Code Example:**

```typescript
const submitFeedback = useMutation({
  mutationFn: (message: string) => feedbackService.submitFeedback(message),
  onSuccess: () => {
    Alert.alert('สำเร็จ', 'ส่งความคิดเห็นเรียบร้อยแล้ว');
    router.back();
  },
  onError: () => {
    Alert.alert('ผิดพลาด', 'ไม่สามารถส่งความคิดเห็นได้');
  },
});
```

---

## Admin Panel Implementation

### Feedback Management Page

**Location:** `admin/src/pages/Feedback.tsx`

**Features:**
- Table view of all feedback
- User information display (name, email, avatar)
- Status badges (PENDING, REVIEWED, RESOLVED)
- Update status buttons
- Timestamp display
- Loading and empty states

**Status Colors:**
- PENDING: Yellow (`bg-yellow-100 text-yellow-800`)
- REVIEWED: Blue (`bg-blue-100 text-blue-800`)
- RESOLVED: Green (`bg-green-100 text-green-800`)

**Actions:**
- Mark as Reviewed (Clock icon)
- Mark as Resolved (CheckCircle icon)

---

## User Flow

### Caregiver Flow

1. Open mobile app
2. Navigate to Settings
3. Tap "ส่งความคิดเห็น"
4. Type feedback message
5. Tap "ส่ง"
6. See success message
7. Return to Settings

### Admin Flow

1. Login to Admin Panel
2. Navigate to Feedback page
3. View list of feedback
4. Click status update button
5. Feedback status changes
6. Table updates automatically

---

## Status Workflow

```
PENDING (Yellow)
    ↓ Admin reviews
REVIEWED (Blue)
    ↓ Admin resolves
RESOLVED (Green)
```

**Status Descriptions:**
- **PENDING:** New feedback, not yet reviewed
- **REVIEWED:** Admin has read the feedback
- **RESOLVED:** Issue has been addressed or feedback implemented

---

## Files Created/Modified

### Backend
- `backend/prisma/schema.prisma` (Modified)
- `backend/src/routes/feedbackRoutes.ts` (New)
- `backend/src/services/feedbackService.ts` (New)
- `backend/src/controllers/feedbackController.ts` (New)
- `backend/src/routes/index.ts` (Modified)

### Mobile App
- `mobile/app/(setting-features)/feedback.tsx` (New)
- `mobile/services/feedbackService.ts` (New)
- `mobile/app/(tabs)/settings.tsx` (Modified)

### Admin Panel
- `admin/src/pages/Feedback.tsx` (New)
- `admin/src/layouts/DashboardLayout.tsx` (Modified)
- `admin/src/App.tsx` (Modified)

---

## Testing

### Manual Testing

**Test Case 1: Submit Feedback**
1. Login to mobile app
2. Go to Settings → Send Feedback
3. Enter message: "Test feedback"
4. Submit
5. Verify success message

**Test Case 2: View Feedback (Admin)**
1. Login to Admin Panel
2. Navigate to Feedback page
3. Verify feedback appears in list
4. Verify user information is correct

**Test Case 3: Update Status**
1. Click "Mark as Reviewed" button
2. Verify status changes to REVIEWED
3. Click "Mark as Resolved" button
4. Verify status changes to RESOLVED

---

## Future Enhancements

- [ ] Anonymous feedback option
- [ ] Feedback categories (Bug, Feature Request, General)
- [ ] Admin reply to feedback
- [ ] Email notification to user when feedback is resolved
- [ ] Feedback analytics (most common issues)
- [ ] Export feedback to CSV

---

**Last Updated:** December 1, 2025
