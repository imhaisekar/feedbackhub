const sendOTPEmail = async (toEmail, otp, name) => {
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: { name: 'FeedbackHub', email: 'feedbackhub.demo@gmail.com' },
      to: [{ email: toEmail }],
      subject: 'Your FeedbackHub Verification Code',
      htmlContent: `<div style="font-family:Arial,sans-serif;padding:20px;">
        <h2>Hi ${name},</h2>
        <p>Your OTP verification code is:</p>
        <h1 style="color:#4F46E5;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>`
    })
  });
};

const sendStatusEmail = async (toEmail, name, title, status, adminNote) => {
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: { name: 'FeedbackHub', email: 'feedbackhub.demo@gmail.com' },
      to: [{ email: toEmail }],
      subject: `Your feedback has been ${status}`,
      htmlContent: `<div style="font-family:Arial,sans-serif;padding:20px;">
        <h2>Hi ${name},</h2>
        <p>Your feedback "<strong>${title}</strong>" has been <strong>${status}</strong>.</p>
        ${adminNote ? `<p>Admin note: ${adminNote}</p>` : ''}
      </div>`
    })
  });
};

module.exports = { sendOTPEmail, sendStatusEmail };