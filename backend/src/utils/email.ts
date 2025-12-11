import { Resend } from 'resend';
import createDebug from 'debug';

const log = createDebug('fallhelp:email');

// Resend API Key from environment
const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Use 'support' instead of 'noreply' per Resend best practices
const EMAIL_FROM = process.env.EMAIL_FROM || 'FallHelp <support@fallhelp.tawanlab.site>';

// Log API key status on load (for debugging)
if (RESEND_API_KEY) {
  console.log(`✅ Resend API key is configured (starts with: ${RESEND_API_KEY.substring(0, 8)}...)`);
} else {
  console.warn('⚠️ Resend API key is NOT configured - emails will be logged to console only. Please set RESEND_API_KEY in .env');
}

// Initialize Resend client
let resend: Resend | null = null;

const getResendClient = (): Resend | null => {
  if (!resend && RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY);
    log('✅ Resend client initialized');
  }
  return resend;
};

/**
 * Send email using Resend
 */
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> => {
  const client = getResendClient();

  if (!client) {
    // Development mode - log to console
    console.log('📧 [DEV MODE] Email would be sent:');
    console.log('  To: %s', options.to);
    console.log('  Subject: %s', options.subject);
    console.log('  Content: %s', options.text || options.html.substring(0, 200));
    return;
  }

  try {
    log('📤 Sending email to %s...', options.to);

    // Call Resend API - note: 'to' must be an array per docs
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: [options.to],  // Must be an array per Resend API docs
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      log('❌ Resend API error: %O', error);
      throw new Error(error.message || 'Failed to send email');
    }

    log('✅ Email sent successfully! ID: %s', data?.id);
  } catch (error: any) {
    log('❌ Email send error: %O', error);
    throw new Error(error.message || 'Failed to send email');
  }
};

/**
 * Send OTP email (Thai language)
 */
export const sendOtpEmail = async (
  email: string,
  code: string,
  purpose: string
): Promise<void> => {
  const purposeText = {
    PASSWORD_RESET: 'รีเซ็ตรหัสผ่าน',
    EMAIL_VERIFICATION: 'ยืนยันอีเมล',
    PHONE_VERIFICATION: 'ยืนยันเบอร์โทรศัพท์',
  }[purpose] || purpose;

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${purposeText} - FallHelp</title>
      <style>
        body { 
          font-family: 'Kanit', 'Sarabun', Arial, sans-serif; 
          line-height: 1.8; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #F3F4EC;
        }
        .container { 
          max-width: 500px; 
          margin: 40px auto; 
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header { 
          background: linear-gradient(135deg, #7B8E54 0%, #5d6b3f 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .header p {
          margin: 8px 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .content { 
          background: #ffffff; 
          padding: 40px 30px; 
        }
        .otp-code { 
          background: #F3F4EC; 
          border: 2px solid #7B8E54; 
          padding: 25px; 
          text-align: center; 
          font-size: 36px; 
          font-weight: bold; 
          letter-spacing: 10px; 
          color: #7B8E54; 
          margin: 25px 0; 
          border-radius: 12px;
        }
        .info-box {
          background: #F3F4EC;
          border-radius: 10px;
          padding: 16px;
          margin: 20px 0;
        }
        .info-box p {
          margin: 0;
          font-size: 14px;
          color: #5d6b3f;
        }
        .warning { 
          background: #fff8e6; 
          border-left: 4px solid #f5c518; 
          padding: 14px 16px; 
          margin: 20px 0; 
          border-radius: 0 8px 8px 0;
          font-size: 13px;
        }
        .footer { 
          text-align: center; 
          padding: 25px; 
          color: #999; 
          font-size: 12px; 
          background: #fafafa;
        }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ${purposeText}</h1>
          <p>รหัสยืนยันจาก FallHelp</p>
        </div>
        <div class="content">
          <p>สวัสดีค่ะ/ครับ,</p>
          <p>คุณได้ร้องขอรหัสยืนยันสำหรับ${purposeText} กรุณาใช้รหัส OTP ด้านล่างนี้:</p>
          
          <div class="otp-code">${code}</div>
          
          <div class="info-box">
            <p>⏰ รหัสนี้จะหมดอายุใน <strong>10 นาที</strong></p>
          </div>
          
          <div class="warning">
            ⚠️ <strong>คำเตือน:</strong> ห้ามแชร์รหัสนี้กับใครทั้งสิ้น FallHelp จะไม่ขอรหัสนี้ผ่านทางโทรศัพท์หรืออีเมล
          </div>
          
          <p style="color: #666; font-size: 14px;">หากคุณไม่ได้ร้องขอรหัสนี้ กรุณาเพิกเฉยอีเมลนี้</p>
        </div>
        <div class="footer">
          <p>© 2025 FallHelp สงวนลิขสิทธิ์</p>
          <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
FallHelp - ${purposeText}

รหัสยืนยันของคุณคือ: ${code}

รหัสนี้จะหมดอายุใน 10 นาที

หากคุณไม่ได้ร้องขอรหัสนี้ กรุณาเพิกเฉยอีเมลนี้

© 2025 FallHelp
  `.trim();

  await sendEmail({
    to: email,
    subject: `FallHelp - รหัส${purposeText}: ${code}`,
    html,
    text,
  });
};

/**
 * Send welcome email (Thai language)
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Kanit', 'Sarabun', Arial, sans-serif; 
          line-height: 1.8; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #F3F4EC;
        }
        .container { 
          max-width: 500px; 
          margin: 40px auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header { 
          background: linear-gradient(135deg, #7B8E54 0%, #5d6b3f 100%); 
          color: white; 
          padding: 50px 30px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content { 
          background: #ffffff; 
          padding: 40px 30px; 
        }
        .feature-list {
          background: #F3F4EC;
          border-radius: 12px;
          padding: 20px 25px;
          margin: 20px 0;
        }
        .feature-list li {
          margin: 10px 0;
          color: #5d6b3f;
        }
        .cta-button {
          display: inline-block;
          background: #7B8E54;
          color: white !important;
          text-decoration: none;
          padding: 14px 35px;
          border-radius: 30px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          padding: 25px; 
          color: #999; 
          font-size: 12px;
          background: #fafafa;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 ยินดีต้อนรับสู่ FallHelp!</h1>
        </div>
        <div class="content">
          <p>สวัสดีคุณ ${firstName},</p>
          <p>ขอบคุณที่สมัครใช้งาน FallHelp! เรายินดีที่ได้ต้อนรับคุณเข้าสู่ครอบครัวของเรา</p>
          
          <div class="feature-list">
            <p style="margin: 0 0 10px; font-weight: 600; color: #7B8E54;">✨ สิ่งที่คุณสามารถทำได้:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>ติดตามความปลอดภัยของผู้สูงอายุ</li>
              <li>รับการแจ้งเตือนเมื่อเกิดเหตุฉุกเฉิน</li>
              <li>ดูประวัติและรายงานต่างๆ</li>
            </ul>
          </div>
          
          <p>หากมีคำถามหรือต้องการความช่วยเหลือ สามารถติดต่อทีมงานของเราได้ตลอดเวลา</p>
          
          <p>ด้วยความเคารพ,<br><strong>ทีมงาน FallHelp</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 FallHelp สงวนลิขสิทธิ์</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'ยินดีต้อนรับสู่ FallHelp! 🎉',
    html,
    text: `สวัสดีคุณ ${firstName},\n\nขอบคุณที่สมัครใช้งาน FallHelp!\n\nบัญชีของคุณถูกสร้างเรียบร้อยแล้ว คุณสามารถเริ่มใช้งานระบบติดตามและดูแลผู้สูงอายุได้ทันที\n\nด้วยความเคารพ,\nทีมงาน FallHelp`,
  });
};
/**
 * Send invitation email (Thai language)
 */
export const sendInvitationEmail = async (
  email: string,
  inviterName: string,
  elderName: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <style>
        body { font-family: 'Kanit', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16AD78; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #16AD78; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>คำเชิญเข้าร่วมดูแลผู้สูงอายุ</h1>
        </div>
        <div class="content">
          <p>สวัสดีครับ,</p>
          <p>คุณ <strong>${inviterName}</strong> ได้เชิญคุณให้เข้าร่วมเป็นผู้ดูแล (Caregiver)</p>
          <p>สำหรับผู้สูงอายุชื่อ: <strong>${elderName}</strong></p>
          <p>
            คุณสามารถดูข้อมูลสุขภาพ การแจ้งเตือนการหกล้ม และข้อมูลอื่นๆ ของผู้สูงอายุท่านนี้ได้ผ่านแอปพลิเคชัน FallHelp
          </p>
          <p>กรุณาเปิดแอปพลิเคชันเพื่อดูข้อมูล (หากคุณยังไม่ได้ติดตั้งแอปพลิเคชัน กรุณาติดตั้งก่อน)</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            หากคุณไม่ได้คาดหวังอีเมลนี้ กรุณาเพิกเฉย
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `คำเชิญเข้าร่วมดูแลคุณ ${elderName} จาก ${inviterName}`,
    html,
    text: `คุณได้รับเชิญจาก ${inviterName} ให้ร่วมดูแลคุณ ${elderName} ผ่านแอป FallHelp`,
  });
};
