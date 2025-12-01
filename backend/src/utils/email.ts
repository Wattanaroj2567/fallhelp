import nodemailer, { Transporter } from 'nodemailer';
import createDebug from 'debug';

const log = createDebug('fallhelp:email');

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
const getTransporter = (): Transporter => {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      log('Email credentials not configured. Emails will be logged to console.');
      // Return mock transporter for development
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    } else {
      transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      });
      log('Email transporter initialized with %s', EMAIL_HOST);
    }
  }
  return transporter;
};

/**
 * Send email
 */
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> => {
  try {
    const transport = getTransporter();
    
    const mailOptions = {
      from: `FallHelp <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transport.sendMail(mailOptions);
    
    if (EMAIL_USER && EMAIL_PASSWORD) {
      log('Email sent successfully to %s: %s', options.to, info.messageId);
    } else {
      log('Email mock sent to %s (configure EMAIL_USER and EMAIL_PASSWORD to send real emails)', options.to);
      log('Subject: %s', options.subject);
      log('Content: %s', options.text || options.html);
    }
  } catch (error) {
    log('Failed to send email to %s: %O', options.to, error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send OTP email
 */
export const sendOtpEmail = async (
  email: string,
  code: string,
  purpose: string
): Promise<void> => {
  const purposeText = {
    PASSWORD_RESET: 'Password Reset',
    EMAIL_VERIFICATION: 'Email Verification',
    PHONE_VERIFICATION: 'Phone Verification',
  }[purpose] || purpose;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${purposeText} - FallHelp</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ${purposeText}</h1>
          <p>FallHelp Security Code</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested a verification code for ${purposeText.toLowerCase()}. Please use the following OTP code:</p>
          
          <div class="otp-code">${code}</div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          
          <div class="warning">
            ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. FallHelp will never ask for this code via phone or email.
          </div>
          
          <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
        </div>
        <div class="footer">
          <p>© 2025 FallHelp. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
FallHelp - ${purposeText}

Your verification code is: ${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

© 2025 FallHelp
  `.trim();

  await sendEmail({
    to: email,
    subject: `FallHelp - ${purposeText} Code: ${code}`,
    html,
    text,
  });
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Welcome to FallHelp!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Welcome to FallHelp! We're excited to have you on board.</p>
          <p>Your account has been successfully created. You can now start using our fall detection and monitoring services.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The FallHelp Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to FallHelp! 🎉',
    html,
    text: `Hi ${firstName},\n\nWelcome to FallHelp! Your account has been successfully created.\n\nBest regards,\nThe FallHelp Team`,
  });
};
