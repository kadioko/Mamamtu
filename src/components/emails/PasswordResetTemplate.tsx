import * as React from 'react';
import styles from './PasswordResetTemplate.module.css';

interface PasswordResetTemplateProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetTemplate({ name, resetUrl }: PasswordResetTemplateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Reset Your Password</h1>
        <p className={styles.text}>Hello {name},</p>
        <p className={styles.text}>
          We received a request to reset your password. Click the button below to set a new password:
        </p>
        <a href={resetUrl} className={styles.button}>
          Reset Password
        </a>
        <p className={styles.text}>
          If you didn&#39;t request this, please ignore this email. Your password will remain unchanged.
        </p>
        <p className={styles.text}>
          This link will expire in 1 hour.
        </p>
        <p className={styles.text}>
          Best regards,<br />
          The MamaMtu Team
        </p>
      </div>
    </div>
  );
}
