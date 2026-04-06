const nodemailer = require('nodemailer');

// 🔥 FIXED: Proper Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

// Helper: replace {{name}} placeholder
const interpolate = (text, name) =>
  (text || '').replace(/{{name}}/g, name || 'there');

// 🔥 FOR REGISTER: Welcome email
exports.sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: `3Digree <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to 3Digree! 🎉',
      text: `Hello ${user.name || user.username},\n\nThanks for Joining with 3Digree! Oh, we will not waste your premium time, so now you can visit to 3Digree.in and select your fav. designs of Premium Templates.\n\nThank You\n- 3digree`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #2563eb; text-align: center; margin-bottom: 20px;">Welcome to 3Digree! 🎉</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hello <strong>${user.name || user.username}</strong>,</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Thanks for Joining with <strong>3Digree</strong>! Visit <a href="https://3Digree.in" style="color: #2563eb;"><strong>3Digree.in</strong></a> and select your fav. Premium Templates.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://3Digree.in" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Explore Templates Now</a>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6; text-align: center;">Thank You<br/><strong>- 3digree</strong></p>
          </div>
          <p style="text-align: center; color: white; font-size: 12px; margin-top: 15px;">© 2026 3Digree. All rights reserved.</p>
        </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ sendWelcomeEmail Error:', error);
    return { success: false, error: error.message };
  }
};

// 🔥 FOR LOGIN: Login notification email
exports.sendLoginNotification = async (user, loginDetails = {}) => {
  try {
    const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });
    const mailOptions = {
      from: `3Digree Security <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 New Login to Your 3Digree Account',
      text: `Hello ${user.name || user.username},\n\nWe noticed a new login to your 3Digree account.\n\nTime: ${loginTime}\nDevice: ${loginDetails.device || 'Unknown'}\n\nIf this wasn't you, please change your password immediately.\n\nStay Safe,\n- 3Digree Security Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f3f4f6; border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 5px solid #10b981;">
            <h1 style="color: #10b981;">🔐 Login Alert</h1>
            <p>Hello <strong>${user.name || user.username}</strong>,</p>
            <p>We noticed a new login to your <strong>3Digree</strong> account at <strong>${loginTime}</strong>.</p>
            <p style="color: #065f46;">✅ If this was you, you can safely ignore this email.</p>
            <p style="color: #991b1b;">⚠️ If this wasn't you, please change your password immediately.</p>
            <p>Stay Safe,<br/><strong style="color: #2563eb;">3Digree Security Team</strong></p>
          </div>
        </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ sendLoginNotification Error:', error);
    return { success: false, error: error.message };
  }
};

// Meeting scheduled email
exports.sendMeetingScheduledEmail = async (user, meeting) => {
  try {
    const meetingDate = new Date(meeting.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const mailOptions = {
      from: `3Digree Meetings <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Meeting Scheduled - 3Digree',
      text: `Hello ${user.name || user.username},\n\nYour meeting "${meeting.title}" has been scheduled!\n\nDate: ${meetingDate}\nTime: ${meeting.scheduledTime}\nLink: ${meeting.meetingLink || 'Will be shared shortly'}\n\nBest regards,\n3Digree Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">✅ Meeting Scheduled!</h1>
          <p>Hello <strong>${user.name || user.username}</strong>,</p>
          <p>Your meeting "<strong>${meeting.title}</strong>" has been scheduled.</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
            <p><strong>📅 Date:</strong> ${meetingDate}</p>
            <p><strong>🕐 Time:</strong> ${meeting.scheduledTime}</p>
            <p><strong>🔗 Link:</strong> <a href="${meeting.meetingLink || '#'}">${meeting.meetingLink || 'Will be shared shortly'}</a></p>
          </div>
          <p>Best regards,<br/><strong style="color: #2563eb;">3Digree Team</strong></p>
        </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ sendMeetingScheduledEmail Error:', error);
    return { success: false, error: error.message };
  }
};

// Payment confirmation email
exports.sendPaymentConfirmationEmail = async (user, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Payment Confirmation',
      text: `Hello ${user.username},\n\nYour payment of ${order.currency} ${order.amount} for order #${order.razorpayOrderId} has been successfully processed.\n\nBest regards,\nThe Team`,
      html: `<p>Hello <strong>${user.username}</strong>,</p><p>Your payment of <strong>${order.currency} ${order.amount}</strong> for order #${order.razorpayOrderId} has been successfully processed.</p><p>Best regards,<br/>The Team</p>`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('sendPaymentConfirmationEmail Error:', error);
    throw error;
  }
};

// Template booking confirmation
exports.sendTemplateBookingConfirmation = async (user, booking) => {
  try {
    const meetingDate = new Date(booking.meetingDetails.scheduledDate).toLocaleDateString('en-IN');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Template Booking Confirmed - ${booking.templateName}`,
      text: `Hello ${user.name || user.username},\n\nYour template booking has been confirmed!\n\nTemplate: ${booking.templateName}\nPrice: ₹${booking.templatePrice}\nMeeting Date: ${meetingDate}\nBooking ID: ${booking.bookingId}\n\nBest regards,\n3Digree Team`,
      html: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;"><h2 style="color:#2563eb;">Template Booking Confirmed! 🎉</h2><p>Hello <strong>${user.name || user.username}</strong>,</p><p>Template: <strong>${booking.templateName}</strong><br/>Price: ₹${booking.templatePrice}<br/>Date: ${meetingDate}<br/>Booking ID: ${booking.bookingId}</p><p>Best regards,<br/><strong>3Digree Team</strong></p></div>`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('sendTemplateBookingConfirmation Error:', error);
    throw error;
  }
};

// Payment percentage notification
exports.sendPaymentPercentageNotification = async (user, booking, paymentAmount) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Payment Required - ${booking.templateName}`,
      text: `Hello ${user.name || user.username},\n\nPlease proceed with partial payment of ₹${paymentAmount} to start development.\n\nBest regards,\n3Digree Team`,
      html: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;"><h2 style="color:#059669;">Payment Required 💳</h2><p>Hello <strong>${user.name || user.username}</strong>,</p><p>Amount: ₹<strong>${paymentAmount}</strong> | Template: ${booking.templateName}</p><p>Best regards,<br/><strong>3Digree Team</strong></p></div>`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('sendPaymentPercentageNotification Error:', error);
    throw error;
  }
};

// Website ready notification
exports.sendWebsiteReadyNotification = async (user, booking) => {
  try {
    const remainingAmount = booking.paymentDetails.totalAmount - booking.paymentDetails.paidAmount;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Website Ready! - ${booking.templateName}`,
      text: `Hello ${user.name || user.username},\n\nYour website is ready for review!\n\nPreview: ${booking.websiteUrls.previewUrl}\nRemaining: ₹${remainingAmount}\n\nBest regards,\n3Digree Team`,
      html: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;"><h2 style="color:#dc2626;">Website Ready! 🎉</h2><p>Hello <strong>${user.name || user.username}</strong>,</p><p>Preview: <a href="${booking.websiteUrls.previewUrl}">${booking.websiteUrls.previewUrl}</a></p><p>Remaining: ₹${remainingAmount}</p><p>Best regards,<br/><strong>3Digree Team</strong></p></div>`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('sendWebsiteReadyNotification Error:', error);
    throw error;
  }
};

// General notification wrapper
exports.sendNotificationEmail = async (to, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#f8fafc;padding:20px;border-radius:8px;border-left:4px solid #3b82f6;">${message.split('\n').map(l => `<p style="margin:10px 0;">${l}</p>`).join('')}</div><p style="margin-top:20px;color:#6b7280;">Best regards,<br/><strong>3Digree Team</strong></p></div>`
    };
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('sendNotificationEmail Error:', error);
    throw error;
  }
};

// ==================== BULK EMAIL UTILITY ====================

/**
 * sendBulkEmailUtil — sends personalized emails to an array of users
 * @param {Array} recipients - [{name, username, email}]
 * @param {string} subject
 * @param {string} bodyTemplate - can contain {{name}}
 * @returns {{ total, sent, failed, errors }}
 */
exports.sendBulkEmailUtil = async (recipients, subject, bodyTemplate) => {
  let sent = 0;
  let failed = 0;
  const errors = [];

  for (const recipient of recipients) {
    const name = recipient.name || recipient.username || 'there';
    const personalizedBody = interpolate(bodyTemplate, name);

    // Plain text version (strip basic HTML if any)
    const textBody = personalizedBody.replace(/<[^>]+>/g, '');

    // HTML version — wrap plain text in a clean branded template
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <div style="background: white; padding: 32px; border-radius: 8px; border-top: 4px solid #6498fe;">
          <img src="https://3digree.in/icon5.png" alt="3Digree" style="width: 40px; height: 40px; border-radius: 8px; margin-bottom: 20px;" />
          <div style="font-size: 15px; color: #374151; line-height: 1.75; white-space: pre-wrap;">${personalizedBody.replace(/\n/g, '<br/>')}</div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 16px;">© 2026 3Digree · <a href="https://3digree.in" style="color: #9ca3af;">3digree.in</a></p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `3Digree <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject,
        text: textBody,
        html: htmlBody,
      });
      sent++;
    } catch (err) {
      failed++;
      errors.push({ email: recipient.email, error: err.message });
      console.error(`❌ Bulk mail failed for ${recipient.email}:`, err.message);
    }
  }

  return { total: recipients.length, sent, failed, errors };
};
