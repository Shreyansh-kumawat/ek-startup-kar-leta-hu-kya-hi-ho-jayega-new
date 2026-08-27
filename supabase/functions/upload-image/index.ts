import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseClient, getSupabaseAdmin } from "../_shared/supabase.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return json({ success: false, message: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = getSupabaseClient(authHeader);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ success: false, message: "Unauthorized" }, 401);

    // Check admin
    const adminDb = getSupabaseAdmin();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "secondaryAdmin"].includes(profile.role)) {
      return json({ success: false, message: "Admin access required" }, 403);
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "3degree-tbs/templates";

    if (!file) {
      return json({ success: false, message: "No file provided" }, 400);
    }

    // Upload to Cloudinary via REST API
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${Deno.env.get("CLOUDINARY_CLOUD_NAME")}/image/upload`;

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("folder", folder);
    uploadForm.append("upload_preset", "ml_default");
    uploadForm.append("api_key", Deno.env.get("CLOUDINARY_API_KEY")!);

    // Generate signature for authenticated upload
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const key = new TextEncoder().encode(Deno.env.get("CLOUDINARY_API_SECRET")!);
    const msg = new TextEncoder().encode(paramsToSign);
    const hmacKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", hmacKey, msg);
    const signature = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Use direct upload with api_key + signature
    const directForm = new FormData();
    directForm.append("file", file);
    directForm.append("folder", folder);
    directForm.append("timestamp", timestamp);
    directForm.append("api_key", Deno.env.get("CLOUDINARY_API_KEY")!);
    directForm.append("signature", signature);

    const cloudRes = await fetch(cloudinaryUrl, {
      method: "POST",
      body: directForm,
    });

    const cloudData = await cloudRes.json();

    if (!cloudRes.ok) {
      return json({
        success: false,
        message: "Cloudinary upload failed",
        error: cloudData.error?.message || "Unknown error",
      }, 500);
    }

    return json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: cloudData.secure_url,
        public_id: cloudData.public_id,
        width: cloudData.width,
        height: cloudData.height,
      },
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
