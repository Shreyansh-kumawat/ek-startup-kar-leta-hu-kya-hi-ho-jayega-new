import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseClient, getSupabaseAdmin } from "../_shared/supabase.ts";
import {
  sendEmail,
  welcomeEmailHtml,
  loginAlertHtml,
  otpEmailHtml,
  passwordChangedHtml,
} from "../_shared/email.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return json({ success: false, message: "Method not allowed" }, 405);
  }

  try {
    const { type, to, name, data } = await req.json();

    if (!type || !to) {
      return json({ success: false, message: "type and to are required" }, 400);
    }

    let subject = "";
    let html = "";
    let text = "";

    switch (type) {
      case "welcome":
        subject = "Welcome to 3Digree!";
        html = welcomeEmailHtml(name || "there");
        text = `Hello ${name}, Thanks for joining 3Digree! Visit 3Digree.in`;
        break;

      case "login_alert":
        subject = "New Login to Your 3Digree Account";
        html = loginAlertHtml(name || "there", data?.loginTime || new Date().toLocaleString());
        text = `Hello ${name}, new login detected.`;
        break;

      case "otp":
        subject = "Password Reset OTP - 3Digree";
        html = otpEmailHtml(name || "there", data?.otp || "000000");
        text = `Hello ${name}, your OTP is: ${data?.otp}`;
        break;

      case "password_changed":
        subject = "Password Changed Successfully - 3Digree";
        html = passwordChangedHtml(name || "there", data?.changeTime || new Date().toLocaleString());
        text = `Hello ${name}, your password was changed.`;
        break;

      case "custom":
        subject = data?.subject || "3Digree Notification";
        html = data?.html || `<p>${data?.message || ""}</p>`;
        text = data?.message || "";
        break;

      default:
        return json({ success: false, message: "Unknown email type" }, 400);
    }

    const result = await sendEmail({ to, subject, text, html });

    return json({
      success: result.success,
      message: result.success ? "Email sent" : "Email failed",
      error: result.error,
    });
  } catch (error) {
    return json({ success: false, message: (error as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
