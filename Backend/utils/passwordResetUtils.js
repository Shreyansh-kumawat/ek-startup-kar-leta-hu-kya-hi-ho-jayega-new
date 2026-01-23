const nodemailer = require('nodemailer');

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate 6-digit OTP
exports.generateResetToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Password Reset Email with OTP
exports.sendPasswordResetEmail = async (user, otp) => {
  try {
    const mailOptions = {
      from: `3Digree Security <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Password Reset OTP - 3Digree',
      text: `Hello ${user.name},\n\nYour password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nStay Safe,\n- 3Digree Security Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin: 0;">🔐 Password Reset</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${user.name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You requested to reset your password. Use the OTP below:
            </p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #2563eb;">
              <h2 style="color: #2563eb; margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">
                ${otp}
              </h2>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                ⏰ <strong>This OTP expires in 10 minutes.</strong>
              </p>
            </div>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                ⚠️ If you didn't request this, please ignore this email and secure your account.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
              Stay Safe,<br/>
              <strong style="color: #2563eb;">3Digree Security Team</strong>
            </p>
          </div>
          
          <p style="text-align: center; color: white; font-size: 12px; margin-top: 15px;">
            © 2025 3Digree. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    // console.log('✅ Password reset OTP sent to:', user.email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ sendPasswordResetEmail Error:', error);
    return { success: false, error: error.message };
  }
};

// Send Password Changed Confirmation Email
exports.sendPasswordChangedEmail = async (user) => {
  try {
    const changeTime = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });
    
    const mailOptions = {
      from: `3Digree Security <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Password Changed Successfully - 3Digree',
      text: `Hello ${user.name},\n\nYour password was changed successfully at ${changeTime}.\n\nIf you didn't make this change, please contact us immediately.\n\nStay Safe,\n- 3Digree Security Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #10b981; margin: 0;">✅ Password Changed</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${user.name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your password was changed successfully.
            </p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
              <p style="margin: 0; color: #065f46;">
                <strong>Changed At:</strong> ${changeTime}
              </p>
            </div>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                ⚠️ <strong>If you didn't make this change, please contact us immediately.</strong>
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
              Stay Safe,<br/>
              <strong style="color: #10b981;">3Digree Security Team</strong>
            </p>
          </div>
          
          <p style="text-align: center; color: white; font-size: 12px; margin-top: 15px;">
            © 2025 3Digree. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    // console.log('✅ Password changed confirmation sent to:', user.email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ sendPasswordChangedEmail Error:', error);
    return { success: false, error: error.message };
  }
};
