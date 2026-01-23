const nodemailer = require('nodemailer');

// 🔥 FIXED: Proper Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password (no spaces!)
  },
  tls: {
    rejectUnauthorized: false // For development
  }
});



// 🔥 FOR REGISTER: Welcome email (3Digree Style)
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
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${user.name || user.username}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thanks for Joining with <strong>3Digree</strong>! Oh, we will not waste your premium time, so now you can visit to <a href="https://3Digree.in" style="color: #2563eb; text-decoration: none;"><strong>3Digree.in</strong></a> and select your fav. designs of <strong>Premium Templates</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://3Digree.in" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Explore Templates Now
              </a>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6; text-align: center;">
              Thank You<br/>
              <strong>- 3digree</strong>
            </p>
          </div>
          
          <p style="text-align: center; color: white; font-size: 12px; margin-top: 15px;">
            © 2025 3Digree. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    // console.removed.log('✅ Welcome email sent successfully to:', user.email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ sendWelcomeEmail Error:', error);
    return { success: false, error: error.message };
  }
};

// 🔥 FOR LOGIN: Login notification email
exports.sendLoginNotification = async (user, loginDetails = {}) => {
  try {
    const loginTime = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });
    
    const mailOptions = {
      from: `3Digree Security <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 New Login to Your 3Digree Account',
      text: `Hello ${user.name || user.username},\n\nWe noticed a new login to your 3Digree account.\n\nLogin Details:\nTime: ${loginTime}\nDevice: ${loginDetails.device || 'Unknown device'}\nLocation: ${loginDetails.location || 'Unknown location'}\n\nIf this was you, you can safely ignore this email.\n\nIf this wasn't you, please secure your account immediately by changing your password.\n\nStay Safe,\n- 3Digree Security Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f3f4f6; border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 5px solid #10b981;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #10b981; margin: 0;">🔐 Login Alert</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${user.name || user.username}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We noticed a new login to your <strong>3Digree</strong> account.
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Login Details</h3>
              <p style="margin: 8px 0; color: #4b5563;"><strong>Time:</strong> ${loginTime}</p>
              <p style="margin: 8px 0; color: #4b5563;"><strong>Device:</strong> ${loginDetails.device || 'Web Browser'}</p>
              <p style="margin: 8px 0; color: #4b5563;"><strong>Location:</strong> ${loginDetails.location || 'India'}</p>
            </div>
            
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                ✅ <strong>If this was you,</strong> you can safely ignore this email.
              </p>
            </div>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                ⚠️ <strong>If this wasn't you,</strong> please secure your account immediately by changing your password.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
              Stay Safe,<br/>
              <strong style="color: #2563eb;">3Digree Security Team</strong>
            </p>
          </div>
          
          <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 15px;">
            This is an automated security notification from 3Digree.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    // console.removed.log('✅ Login notification email sent to:', user.email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ sendLoginNotification Error:', error);
    return { success: false, error: error.message };
  }
};

// Send meeting scheduled email
// utils/emailUtils.js
// REPLACE the existing sendMeetingScheduledEmail function with this:

exports.sendMeetingScheduledEmail = async (user, meeting) => {
  try {
    const meetingDate = new Date(meeting.scheduledDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `3Digree Meetings <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Meeting Scheduled - 3Digree',
      text: `Hello ${user.name || user.username},\n\nYour meeting "${meeting.title}" has been scheduled!\n\n📅 Date: ${meetingDate}\n🕐 Time: ${meeting.scheduledTime}\n🔗 Meeting Link: ${meeting.meetingLink || 'Will be shared shortly'}\n\nPlease join the meeting at the scheduled time.\n\nBest regards,\n3Digree Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #059669; text-align: center; margin-bottom: 20px;">✅ Meeting Scheduled!</h1>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${user.name || user.username}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your meeting "<strong>${meeting.title}</strong>" has been successfully scheduled!
            </p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin-top: 0; color: #065f46;">📋 Meeting Details</h3>
              <p style="margin: 8px 0; color: #064e3b;"><strong>📅 Date:</strong> ${meetingDate}</p>
              <p style="margin: 8px 0; color: #064e3b;"><strong>🕐 Time:</strong> ${meeting.scheduledTime}</p>
              <p style="margin: 8px 0; color: #064e3b;"><strong>🔗 Meeting Link:</strong> <a href="${meeting.meetingLink || '#'}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${meeting.meetingLink || 'Will be shared shortly'}</a></p>
            </div>
            
            ${meeting.meetingLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meeting.meetingLink}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                🎥 Join Meeting
              </a>
            </div>
            ` : ''}
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                💡 <strong>Pro Tip:</strong> Join the meeting 2-3 minutes early to test your audio and video.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
              Best regards,<br/>
              <strong style="color: #2563eb;">3Digree Team</strong>
            </p>
          </div>
          
          <p style="text-align: center; color: white; font-size: 12px; margin-top: 15px;">
            © ${new Date().getFullYear()} 3Digree. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    // console.log('✅ Meeting scheduled email sent to:', user.email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ sendMeetingScheduledEmail Error:', error);
    return { success: false, error: error.message };
  }
};


// Send payment confirmation email
exports.sendPaymentConfirmationEmail = async (user, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Payment Confirmation',
      text: `Hello ${user.username},\n\nYour payment of ${order.currency} ${order.amount} for order #${order.razorpayOrderId} has been successfully processed.\nThank you for your purchase!\n\nBest regards,\nThe Team`,
      html: `<p>Hello <strong>${user.username}</strong>,</p><p>Your payment of <strong>${order.currency} ${order.amount}</strong> for order #${order.razorpayOrderId} has been successfully processed.</p><p>Thank you for your purchase!</p><p>Best regards,<br/>The Team</p>`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('sendPaymentConfirmationEmail Error:', error);
    throw error;
  }
};

// Send template booking confirmation email
exports.sendTemplateBookingConfirmation = async (user, booking) => {
  try {
    const meetingDate = new Date(booking.meetingDetails.scheduledDate).toLocaleDateString('en-IN');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Template Booking Confirmed - ${booking.templateName}`,
      text: `Hello ${user.name || user.username},\n\nYour template booking has been confirmed!\n\nTemplate: ${booking.templateName}\nPrice: ₹${booking.templatePrice}\nMeeting Date: ${meetingDate}\nMeeting Time: ${booking.meetingDetails.scheduledTime}\nMeeting Link: ${booking.meetingDetails.meetingLink}\n\nBooking ID: ${booking.bookingId}\n\nThank you for choosing 3Degree-TBS!\n\nBest regards,\n3Degree Team`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">Template Booking Confirmed! 🎉</h2>
          
          <p>Hello <strong>${user.name || user.username}</strong>,</p>
          <p>Your template booking has been confirmed!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Booking Details</h3>
            <p><strong>Template:</strong> ${booking.templateName}</p>
            <p><strong>Price:</strong> ₹${booking.templatePrice}</p>
            <p><strong>Meeting Date:</strong> ${meetingDate}</p>
            <p><strong>Meeting Time:</strong> ${booking.meetingDetails.scheduledTime}</p>
            <p><strong>Meeting Link:</strong> <a href="${booking.meetingDetails.meetingLink}" style="color: #2563eb;">${booking.meetingDetails.meetingLink}</a></p>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          </div>
          
          <p>Our developer will meet you at the scheduled time to discuss your requirements!</p>
          
          <p>Best regards,<br/><strong>3Degree-TBS Team</strong></p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('sendTemplateBookingConfirmation Error:', error);
    throw error;
  }
};

// Send payment percentage notification email
exports.sendPaymentPercentageNotification = async (user, booking, paymentAmount) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Payment Required - ${booking.templateName}`,
      text: `Hello ${user.name || user.username},\n\nYour meeting is completed! Please proceed with the partial payment to start development.\n\nAmount to Pay: ₹${paymentAmount}\nTemplate: ${booking.templateName}\nBooking ID: ${booking.bookingId}\n\nOnce payment is received, we'll start developing your website.\n\nBest regards,\n3Degree Team`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #059669;">Payment Required 💳</h2>
          
          <p>Hello <strong>${user.name || user.username}</strong>,</p>
          <p>Great news! Your meeting is completed. Please proceed with the partial payment to start development.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="margin-top: 0; color: #0c4a6e;">Payment Details</h3>
            <p><strong>Amount to Pay:</strong> ₹${paymentAmount}</p>
            <p><strong>Template:</strong> ${booking.templateName}</p>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          </div>
          
          <p>Once payment is received, we'll start developing your website immediately!</p>
          
          <p>Best regards,<br/><strong>3Degree Team</strong></p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('sendPaymentPercentageNotification Error:', error);
    throw error;
  }
};

// Send website ready notification email
exports.sendWebsiteReadyNotification = async (user, booking) => {
  try {
    const remainingAmount = booking.paymentDetails.totalAmount - booking.paymentDetails.paidAmount;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Website Ready! - ${booking.templateName}`,
      text: `Hello ${user.name || user.username},\n\nGreat news! Your website is ready for review.\n\nPreview URL: ${booking.websiteUrls.previewUrl}\nTemplate: ${booking.templateName}\nBooking ID: ${booking.bookingId}\n\nRemaining Payment: ₹${remainingAmount}\n\nOnce final payment is completed, we'll provide the live website URL.\n\nBest regards,\n3Degree Team`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #dc2626;">Website Ready! 🎉</h2>
          
          <p>Hello <strong>${user.name || user.username}</strong>,</p>
          <p>Great news! Your website is ready for review.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">Website Details</h3>
            <p><strong>Preview URL:</strong> <a href="${booking.websiteUrls.previewUrl}" style="color: #dc2626;">${booking.websiteUrls.previewUrl}</a></p>
            <p><strong>Template:</strong> ${booking.templateName}</p>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Remaining Payment:</strong> ₹${remainingAmount}</p>
          </div>
          
          <p>Once final payment is completed, we'll provide the live website URL and source code!</p>
          
          <p>Best regards,<br/><strong>3Degree Team</strong></p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('sendWebsiteReadyNotification Error:', error);
    throw error;
  }
};

// General notification wrapper function
exports.sendNotificationEmail = async (to, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            ${message.split('\n').map(line => `<p style="margin: 10px 0;">${line}</p>`).join('')}
          </div>
          <p style="margin-top: 20px; color: #6b7280;">Best regards,<br/><strong>3Degree-TBS Team</strong></p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('sendNotificationEmail Error:', error);
    throw error;
  }
};
