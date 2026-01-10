import * as React from 'react';

interface EmailVerificationTemplateProps {
  name: string;
  verificationUrl: string;
}

export function EmailVerificationTemplate({ name, verificationUrl }: EmailVerificationTemplateProps) {
  return (
    <div style={container}>
      <div style={content}>
        <h1 style={heading}>Verify Your Email Address</h1>
        <p style={text}>Hello {name},</p>
        <p style={text}>
          Thank you for signing up with MamaMtu. Please verify your email address by clicking the button below:
        </p>
        <a href={verificationUrl} style={button}>
          Verify Email Address
        </a>
        <p style={text}>
          If you did not create an account, you can safely ignore this email.
        </p>
        <p style={text}>
          Best regards,<br />
          The MamaMtu Team
        </p>
      </div>
    </div>
  );
}

const container = {
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
  lineHeight: '1.6',
  color: '#333',
};

const content = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '5px',
};

const heading = {
  color: '#2d3748',
  fontSize: '24px',
  marginBottom: '20px',
};

const text = {
  margin: '10px 0',
  fontSize: '16px',
};

const button = {
  display: 'inline-block',
  padding: '12px 24px',
  margin: '20px 0',
  backgroundColor: '#4299e1',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
};
