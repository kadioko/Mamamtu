# Notification System Architecture

## Overview

The MamaMtu notification system provides multi-channel notifications for appointment reminders, lab results, high-risk alerts, and other important healthcare events.

## Features

- **Multi-Channel Delivery**: In-app, email, SMS, and push notifications
- **User Preferences**: Granular control over notification types and channels
- **Scheduled Notifications**: Support for future-dated notifications (e.g., appointment reminders)
- **Priority Levels**: Normal, high, and urgent priorities
- **Quiet Hours**: Respect user-defined quiet hours
- **Role-Based**: Different notification types for patients vs. healthcare providers

## Implementation Status

### ✅ Completed
- Service layer architecture (`src/services/notificationService.ts`)
- Type definitions and interfaces
- Helper functions for common notification scenarios
- Preference management logic
- Schema design (`prisma/notifications-schema.prisma`)

### 🚧 To Be Implemented

1. **Database Schema Integration**
   - Add `Notification` and `NotificationPreference` models to `prisma/schema.prisma`
   - Run migration: `npm run prisma:migrate`
   - Update Prisma client: `npm run prisma:generate`

2. **API Endpoints**
   - `GET /api/notifications` - List user notifications
   - `POST /api/notifications/:id/read` - Mark as read
   - `GET /api/notifications/preferences` - Get user preferences
   - `PUT /api/notifications/preferences` - Update preferences
   - `DELETE /api/notifications/:id` - Delete notification

3. **Background Job System**
   - Set up job queue (e.g., BullMQ, Agenda)
   - Create notification processor
   - Schedule appointment reminders automatically
   - Process scheduled notifications

4. **Email Integration**
   - Configure email provider (Resend is already installed)
   - Create email templates for each notification type
   - Implement email sending in notification service

5. **SMS Integration** (Optional)
   - Choose SMS provider (Twilio, Africa's Talking)
   - Implement SMS sending
   - Add phone number verification

6. **Push Notifications** (Optional)
   - Set up Firebase Cloud Messaging or similar
   - Implement push notification sending
   - Handle device token registration

7. **UI Components**
   - Notification bell icon in header
   - Notification dropdown/panel
   - Notification preferences page
   - Toast notifications for real-time alerts

## Usage Examples

### Schedule Appointment Reminder

```typescript
import { scheduleAppointmentReminder } from '@/services/notificationService';

// When creating an appointment
await scheduleAppointmentReminder(
  userId,
  appointment.id,
  appointment.title,
  appointment.startTime,
  24 // hours before
);
```

### Send High-Risk Alert

```typescript
import { sendHighRiskAlert } from '@/services/notificationService';

// When detecting high-risk condition
await sendHighRiskAlert(
  healthcareProviderId,
  patient.id,
  'Patient blood pressure critically high: 180/120',
  { systolic: 180, diastolic: 120 }
);
```

### Notify Lab Results Ready

```typescript
import { notifyLabResultReady } from '@/services/notificationService';

// When lab results are uploaded
await notifyLabResultReady(
  patient.userId,
  patient.id,
  'Complete Blood Count (CBC)'
);
```

## Database Schema

### Notification Model

```prisma
model Notification {
  id            String              @id @default(uuid())
  type          NotificationType
  title         String
  message       String
  channel       NotificationChannel
  status        NotificationStatus  @default(PENDING)
  userId        String
  user          User                @relation(fields: [userId], references: [id])
  appointmentId String?
  appointment   Appointment?        @relation(fields: [appointmentId], references: [id])
  patientId     String?
  patient       Patient?            @relation(fields: [patientId], references: [id])
  scheduledFor  DateTime?
  sentAt        DateTime?
  readAt        DateTime?
  metadata      String?
  priority      Int                 @default(0)
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}
```

### NotificationPreference Model

```prisma
model NotificationPreference {
  id                    String   @id @default(uuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])
  enableInApp           Boolean  @default(true)
  enableEmail           Boolean  @default(true)
  enableSMS             Boolean  @default(false)
  enablePush            Boolean  @default(true)
  appointmentReminders  Boolean  @default(true)
  labResults            Boolean  @default(true)
  medicationReminders   Boolean  @default(true)
  followUpAlerts        Boolean  @default(true)
  highRiskAlerts        Boolean  @default(true)
  systemAnnouncements   Boolean  @default(true)
  reminderHoursBefore   Int      @default(24)
  quietHoursStart       Int?
  quietHoursEnd         Int?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## Notification Types

- **APPOINTMENT_REMINDER**: Scheduled reminders before appointments
- **APPOINTMENT_CANCELLED**: Immediate notification when appointment is cancelled
- **APPOINTMENT_RESCHEDULED**: Notification when appointment time changes
- **LAB_RESULT_READY**: Alert when lab results are available
- **MEDICATION_REMINDER**: Reminders to take medications
- **FOLLOW_UP_REQUIRED**: Alerts for required follow-up visits
- **HIGH_RISK_ALERT**: Urgent alerts for high-risk conditions
- **SYSTEM_ANNOUNCEMENT**: General system messages

## Channels

- **IN_APP**: Notifications visible in the application
- **EMAIL**: Email notifications
- **SMS**: Text message notifications
- **PUSH**: Mobile push notifications

## Priority Levels

- **0 (Normal)**: Standard notifications
- **1 (High)**: Important notifications (lab results, reminders)
- **2 (Urgent)**: Critical notifications (high-risk alerts, cancellations)

## Next Steps

1. Integrate notification models into Prisma schema
2. Create API endpoints for notification management
3. Implement email sending with Resend
4. Build notification UI components
5. Set up background job processing
6. Add notification triggers to relevant workflows
7. Test notification delivery across all channels

## Configuration

Environment variables needed:

```env
# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# SMS (Optional - Africa's Talking or Twilio)
SMS_API_KEY=your_sms_api_key
SMS_USERNAME=your_username

# Push Notifications (Optional - Firebase)
FIREBASE_SERVER_KEY=your_firebase_key
```

## Testing

Create test notifications:

```typescript
// In development, test notifications
if (process.env.NODE_ENV === 'development') {
  await createNotification({
    type: 'SYSTEM_ANNOUNCEMENT',
    title: 'Test Notification',
    message: 'This is a test notification',
    userId: 'test-user-id',
    channels: ['IN_APP'],
  });
}
```
