const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (toEmail, otp, name) => {
  const mailOptions = {
    from: `"FeedbackHub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your FeedbackHub Verification Code',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0f; color: #f0eeff; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; margin: 0; background: linear-gradient(135deg, #7c6cff, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">FeedbackHub</h1>
        </div>
        <h2 style="font-size: 20px; margin-bottom: 8px; color: #f0eeff;">Hi ${name} 👋</h2>
        <p style="color: #8b8a9e; margin-bottom: 32px; font-size: 15px;">Here is your one-time verification code. It expires in <strong style="color:#f0eeff">10 minutes.</strong></p>
        <div style="background: rgba(124,108,255,0.1); border: 1px solid rgba(124,108,255,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #c084fc;">${otp}</div>
        </div>
        <p style="color: #8b8a9e; font-size: 13px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendStatusEmail = async (toEmail, name, title, status, adminNote) => {
  const color = status === 'approved' ? '#4ade80' : '#f87171';
  const emoji = status === 'approved' ? '✅' : '❌';

  const mailOptions = {
    from: `"FeedbackHub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your feedback has been ${status} ${emoji}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0f; color: #f0eeff; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
        <h1 style="font-size: 22px; margin-bottom: 24px; background: linear-gradient(135deg, #7c6cff, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">FeedbackHub</h1>
        <p style="font-size: 15px; color: #8b8a9e; margin-bottom: 8px;">Hi ${name},</p>
        <p style="font-size: 15px; color: #f0eeff; margin-bottom: 24px;">Your feedback <strong>"${title}"</strong> has been reviewed.</p>
        <div style="background: rgba(255,255,255,0.04); border-left: 3px solid ${color}; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="font-size: 13px; color: #8b8a9e; margin-bottom: 4px;">STATUS</div>
          <div style="font-size: 18px; font-weight: 700; color: ${color};">${status.toUpperCase()} ${emoji}</div>
          ${adminNote ? `<div style="margin-top: 12px; font-size: 13px; color: #8b8a9e;">Admin note: <span style="color: #f0eeff;">${adminNote}</span></div>` : ''}
        </div>
        <p style="font-size: 13px; color: #8b8a9e;">Login to FeedbackHub to view your full feedback history.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendStatusEmail };
