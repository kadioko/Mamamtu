import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
  
  try {
    if (!resend) {
      console.info('[Email Fallback] Verify your email:', { to: email, verificationUrl });
      return { success: true, fallback: true } as const;
    }

    const { data, error } = await resend.emails.send({
      from: 'MamaMtu <noreply@mamamtu.health>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.5;">
          <h2>Verify your email</h2>
          <p>Hi ${name || ''}, please verify your email by clicking the link below:</p>
          <p><a href="${verificationUrl}">Verify Email</a></p>
          <p>If the button doesn't work, copy and paste this URL in your browser:</p>
          <p>${verificationUrl}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  
  try {
    if (!resend) {
      console.info('[Email Fallback] Reset your password:', { to: email, resetUrl });
      return { success: true, fallback: true } as const;
    }

    const { data, error } = await resend.emails.send({
      from: 'MamaMtu <noreply@mamamtu.health>',
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.5;">
          <h2>Reset your password</h2>
          <p>Hi ${name || ''}, click the link below to reset your password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>If the button doesn't work, copy and paste this URL in your browser:</p>
          <p>${resetUrl}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendAppointmentReminderEmail(
  email: string,
  name: string,
  appointmentTitle: string,
  appointmentDate: string,
  appointmentTime: string,
  location?: string
) {
  try {
    if (!resend) {
      console.info('[Email Fallback] Appointment reminder:', { to: email, appointmentTitle, appointmentDate });
      return { success: true, fallback: true } as const;
    }

    const { error } = await resend.emails.send({
      from: 'MamaMtu <noreply@mamamtu.health>',
      to: email,
      subject: `Reminder: ${appointmentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Appointment Reminder</h2>
          <p>Hi ${name},</p>
          <p>This is a reminder about your upcoming appointment:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${appointmentTitle}</h3>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${appointmentDate}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${appointmentTime}</p>
            ${location ? `<p style="margin: 8px 0;"><strong>Location:</strong> ${location}</p>` : ''}
          </div>
          <p>Please arrive 10 minutes early. If you need to reschedule, please contact us as soon as possible.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            MamaMtu - Maternal & Newborn Health Support
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending appointment reminder email:', error);
      throw new Error('Failed to send appointment reminder email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendAppointmentReminderEmail:', error);
    throw new Error('Failed to send appointment reminder email');
  }
}

export async function sendAppointmentCancelledEmail(
  email: string,
  name: string,
  appointmentTitle: string,
  appointmentDate: string,
  reason?: string
) {
  try {
    if (!resend) {
      console.info('[Email Fallback] Appointment cancelled:', { to: email, appointmentTitle });
      return { success: true, fallback: true } as const;
    }

    const { error } = await resend.emails.send({
      from: 'MamaMtu <noreply@mamamtu.health>',
      to: email,
      subject: `Appointment Cancelled: ${appointmentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Hi ${name},</p>
          <p>Your appointment has been cancelled:</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #991b1b;">${appointmentTitle}</h3>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${appointmentDate}</p>
            ${reason ? `<p style="margin: 8px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          <p>If you would like to reschedule, please contact us or book a new appointment through the portal.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            MamaMtu - Maternal & Newborn Health Support
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending appointment cancelled email:', error);
      throw new Error('Failed to send appointment cancelled email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendAppointmentCancelledEmail:', error);
    throw new Error('Failed to send appointment cancelled email');
  }
}

export async function sendLabResultReadyEmail(
  email: string,
  name: string,
  testName: string
) {
  try {
    if (!resend) {
      console.info('[Email Fallback] Lab results ready:', { to: email, testName });
      return { success: true, fallback: true } as const;
    }

    const resultsUrl = `${baseUrl}/dashboard/patients`;

    const { error } = await resend.emails.send({
      from: 'MamaMtu <noreply@mamamtu.health>',
      to: email,
      subject: `Lab Results Available: ${testName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Lab Results Available</h2>
          <p>Hi ${name},</p>
          <p>Your lab results for <strong>${testName}</strong> are now available.</p>
          <div style="margin: 30px 0;">
            <a href="${resultsUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Results
            </a>
          </div>
          <p>You can view your results by logging into your patient portal.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            MamaMtu - Maternal & Newborn Health Support
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending lab result email:', error);
      throw new Error('Failed to send lab result email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendLabResultReadyEmail:', error);
    throw new Error('Failed to send lab result email');
  }
}

export async function sendHighRiskAlertEmail(
  email: string,
  name: string,
  patientName: string,
  alertMessage: string
) {
  try {
    if (!resend) {
      console.info('[Email Fallback] High risk alert:', { to: email, patientName, alertMessage });
      return { success: true, fallback: true } as const;
    }

    const { error } = await resend.emails.send({
      from: 'MamaMtu <noreply@mamamtu.health>',
      to: email,
      subject: `URGENT: High Risk Alert - ${patientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; color: white;">⚠️ HIGH RISK ALERT</h2>
          </div>
          <div style="padding: 20px; border: 2px solid #dc2626; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p><strong>Patient:</strong> ${patientName}</p>
            <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Alert:</strong> ${alertMessage}</p>
            </div>
            <p style="color: #dc2626; font-weight: bold;">Immediate attention required.</p>
            <p>Please review the patient's records and take appropriate action.</p>
          </div>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            MamaMtu - Maternal & Newborn Health Support
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending high risk alert email:', error);
      throw new Error('Failed to send high risk alert email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendHighRiskAlertEmail:', error);
    throw new Error('Failed to send high risk alert email');
  }
}
