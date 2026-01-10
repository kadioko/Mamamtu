/**
 * Notification Service
 * Handles creation, scheduling, and delivery of notifications across multiple channels
 */

export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'LAB_RESULT_READY'
  | 'MEDICATION_REMINDER'
  | 'FOLLOW_UP_REQUIRED'
  | 'HIGH_RISK_ALERT'
  | 'SYSTEM_ANNOUNCEMENT';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  channels?: NotificationChannel[];
  appointmentId?: string;
  patientId?: string;
  scheduledFor?: Date;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  enableInApp: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  enablePush: boolean;
  appointmentReminders: boolean;
  labResults: boolean;
  medicationReminders: boolean;
  followUpAlerts: boolean;
  highRiskAlerts: boolean;
  systemAnnouncements: boolean;
  reminderHoursBefore: number;
  quietHoursStart?: number;
  quietHoursEnd?: number;
}

/**
 * Create a notification
 * This is a placeholder implementation until the Notification model is added to Prisma schema
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  console.log('Creating notification:', {
    type: input.type,
    title: input.title,
    userId: input.userId,
    channels: input.channels || ['IN_APP'],
    scheduledFor: input.scheduledFor,
  });

  // TODO: Once Notification model is added to schema, implement:
  // 1. Get user preferences
  // 2. Filter channels based on preferences
  // 3. Create notification records in database
  // 4. Schedule delivery if scheduledFor is set
  // 5. Send immediately if no schedule
}

/**
 * Schedule appointment reminder
 */
export async function scheduleAppointmentReminder(
  userId: string,
  appointmentId: string,
  appointmentTitle: string,
  appointmentTime: Date,
  reminderHoursBefore: number = 24
): Promise<void> {
  const reminderTime = new Date(appointmentTime.getTime() - reminderHoursBefore * 60 * 60 * 1000);

  // Don't schedule if reminder time is in the past
  if (reminderTime < new Date()) {
    console.log('Reminder time is in the past, skipping');
    return;
  }

  await createNotification({
    type: 'APPOINTMENT_REMINDER',
    title: 'Upcoming Appointment Reminder',
    message: `You have an appointment "${appointmentTitle}" scheduled for ${appointmentTime.toLocaleString()}`,
    userId,
    appointmentId,
    scheduledFor: reminderTime,
    channels: ['IN_APP', 'EMAIL'],
    priority: 1,
  });
}

/**
 * Send appointment cancellation notification
 */
export async function notifyAppointmentCancelled(
  userId: string,
  appointmentId: string,
  appointmentTitle: string,
  reason?: string
): Promise<void> {
  await createNotification({
    type: 'APPOINTMENT_CANCELLED',
    title: 'Appointment Cancelled',
    message: `Your appointment "${appointmentTitle}" has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    userId,
    appointmentId,
    channels: ['IN_APP', 'EMAIL', 'SMS'],
    priority: 2,
  });
}

/**
 * Send high-risk alert notification
 */
export async function sendHighRiskAlert(
  userId: string,
  patientId: string,
  alertMessage: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await createNotification({
    type: 'HIGH_RISK_ALERT',
    title: 'High Risk Alert',
    message: alertMessage,
    userId,
    patientId,
    channels: ['IN_APP', 'EMAIL', 'SMS'],
    priority: 2,
    metadata,
  });
}

/**
 * Send lab result notification
 */
export async function notifyLabResultReady(
  userId: string,
  patientId: string,
  testName: string
): Promise<void> {
  await createNotification({
    type: 'LAB_RESULT_READY',
    title: 'Lab Results Available',
    message: `Your ${testName} results are now available. Please check your medical records.`,
    userId,
    patientId,
    channels: ['IN_APP', 'EMAIL'],
    priority: 1,
  });
}

/**
 * Send follow-up required notification
 */
export async function notifyFollowUpRequired(
  userId: string,
  patientId: string,
  reason: string,
  dueDate?: Date
): Promise<void> {
  const message = dueDate
    ? `Follow-up required: ${reason}. Due by ${dueDate.toLocaleDateString()}`
    : `Follow-up required: ${reason}`;

  await createNotification({
    type: 'FOLLOW_UP_REQUIRED',
    title: 'Follow-up Required',
    message,
    userId,
    patientId,
    channels: ['IN_APP', 'EMAIL'],
    priority: 1,
    scheduledFor: dueDate,
  });
}

/**
 * Get default notification preferences
 */
export function getDefaultNotificationPreferences(): NotificationPreferences {
  return {
    enableInApp: true,
    enableEmail: true,
    enableSMS: false,
    enablePush: true,
    appointmentReminders: true,
    labResults: true,
    medicationReminders: true,
    followUpAlerts: true,
    highRiskAlerts: true,
    systemAnnouncements: true,
    reminderHoursBefore: 24,
  };
}

/**
 * Check if notification should be sent based on quiet hours
 */
export function isWithinQuietHours(
  preferences: NotificationPreferences,
  time: Date = new Date()
): boolean {
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
    return false;
  }

  const hour = time.getHours();
  const start = preferences.quietHoursStart;
  const end = preferences.quietHoursEnd;

  if (start < end) {
    return hour >= start && hour < end;
  } else {
    // Quiet hours span midnight
    return hour >= start || hour < end;
  }
}

/**
 * Filter channels based on user preferences
 */
export function getEnabledChannels(
  preferences: NotificationPreferences,
  requestedChannels: NotificationChannel[]
): NotificationChannel[] {
  return requestedChannels.filter(channel => {
    switch (channel) {
      case 'IN_APP':
        return preferences.enableInApp;
      case 'EMAIL':
        return preferences.enableEmail;
      case 'SMS':
        return preferences.enableSMS;
      case 'PUSH':
        return preferences.enablePush;
      default:
        return false;
    }
  });
}

/**
 * Check if notification type is enabled in preferences
 */
export function isNotificationTypeEnabled(
  preferences: NotificationPreferences,
  type: NotificationType
): boolean {
  switch (type) {
    case 'APPOINTMENT_REMINDER':
    case 'APPOINTMENT_CANCELLED':
    case 'APPOINTMENT_RESCHEDULED':
      return preferences.appointmentReminders;
    case 'LAB_RESULT_READY':
      return preferences.labResults;
    case 'MEDICATION_REMINDER':
      return preferences.medicationReminders;
    case 'FOLLOW_UP_REQUIRED':
      return preferences.followUpAlerts;
    case 'HIGH_RISK_ALERT':
      return preferences.highRiskAlerts;
    case 'SYSTEM_ANNOUNCEMENT':
      return preferences.systemAnnouncements;
    default:
      return true;
  }
}
