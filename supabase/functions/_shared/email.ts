// Lightweight SMTP sender using Deno's built-in fetch + a REST email API
// We use Resend-compatible API but fallback to raw SMTP via a helper

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

// Send email via SMTP using nodemailer-compatible approach in Deno
// Uses smtp.js for Deno
export async function sendEmail(opts: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: Deno.env.get("EMAIL_USER")!,
          password: Deno.env.get("EMAIL_PASS")!,
        },
      },
    });

    await client.send({
      from: opts.from || `3Digree <${Deno.env.get("EMAIL_USER")!}>`,
      to: opts.to,
      subject: opts.subject,
      content: opts.text || "",
      html: opts.html || "",
    });

    await client.close();
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Email templates
export function welcomeEmailHtml(name: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
      <div style="background: white; padding: 30px; border-radius: 8px;">
        <h1 style="color: #2563eb; text-align: center;">Welcome to 3Digree!</h1>
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Thanks for Joining with <strong>3Digree</strong>! Visit <a href="https://3Digree.in" style="color: #2563eb;"><strong>3Digree.in</strong></a> and select your fav. Premium Templates.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://3Digree.in" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Templates Now</a>
        </div>
        <p style="text-align: center;">Thank You<br/><strong>- 3digree</strong></p>
      </div>
    </div>`;
}

export function loginAlertHtml(name: string, loginTime: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f3f4f6; border-radius: 10px;">
      <div style="background: white; padding: 30px; border-radius: 8px; border-left: 5px solid #10b981;">
        <h1 style="color: #10b981;">Login Alert</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>New login detected at <strong>${loginTime}</strong>.</p>
        <p style="color: #065f46;">If this was you, ignore this email.</p>
        <p style="color: #991b1b;">If this wasn't you, change your password immediately.</p>
        <p>Stay Safe,<br/><strong style="color: #2563eb;">3Digree Security Team</strong></p>
      </div>
    </div>`;
}

export function otpEmailHtml(name: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
      <div style="background: white; padding: 30px; border-radius: 8px;">
        <h1 style="color: #2563eb; text-align: center;">Password Reset</h1>
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Your password reset OTP:</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #2563eb;">
          <h2 style="color: #2563eb; font-size: 36px; letter-spacing: 8px;">${otp}</h2>
        </div>
        <p style="color: #92400e; background: #fef3c7; padding: 15px; border-radius: 8px;">This OTP expires in 10 minutes.</p>
        <p>Stay Safe,<br/><strong style="color: #2563eb;">3Digree Security Team</strong></p>
      </div>
    </div>`;
}

export function passwordChangedHtml(name: string, changeTime: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px;">
      <div style="background: white; padding: 30px; border-radius: 8px;">
        <h1 style="color: #10b981; text-align: center;">Password Changed</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your password was changed successfully at <strong>${changeTime}</strong>.</p>
        <p style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 8px;">If you didn't make this change, please contact us immediately.</p>
        <p>Stay Safe,<br/><strong style="color: #10b981;">3Digree Security Team</strong></p>
      </div>
    </div>`;
}

export function bulkEmailHtml(body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
      <div style="background: white; padding: 32px; border-radius: 8px; border-top: 4px solid #6498fe;">
        <div style="font-size: 15px; color: #374151; line-height: 1.75; white-space: pre-wrap;">${body.replace(/\n/g, "<br/>")}</div>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 16px;">&copy; 2026 3Digree &middot; <a href="https://3digree.in" style="color: #9ca3af;">3digree.in</a></p>
    </div>`;
}
