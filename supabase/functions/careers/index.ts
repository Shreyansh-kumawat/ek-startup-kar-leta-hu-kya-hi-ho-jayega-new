import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseClient, getSupabaseAdmin } from "../_shared/supabase.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const action = segments[segments.length - 1];
    const adminDb = getSupabaseAdmin();

    // ---- PUBLIC: GET ACTIVE JOBS ----
    if (action === "active" && req.method === "GET") {
      const { data: jobs } = await adminDb
        .from("careers")
        .select("*")
        .eq("is_active", true)
        .gt("expiry_date", new Date().toISOString())
        .order("created_at", { ascending: false });

      return json({ success: true, data: jobs });
    }

    // ---- PUBLIC: GET JOB BY JOB_ID ----
    if (action === "job" && req.method === "GET") {
      const jobId = url.searchParams.get("jobId");
      if (!jobId) return json({ success: false, message: "jobId required" }, 400);

      const { data: job } = await adminDb
        .from("careers")
        .select("*")
        .eq("job_id", jobId)
        .single();

      if (!job) return json({ success: false, message: "Job not found" }, 404);
      return json({ success: true, data: job });
    }

    // ---- PUBLIC: SUBMIT APPLICATION ----
    if (action === "apply" && req.method === "POST") {
      const { jobId, jobTitle, name, age, gender, email, phone, message } = await req.json();

      if (!jobId || !jobTitle || !name || !age || !gender || !email || !phone) {
        return json({ success: false, message: "All required fields must be filled." }, 400);
      }

      // Check duplicate
      const { data: existing } = await adminDb
        .from("job_applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("email", email)
        .single();

      if (existing) {
        return json({ success: false, message: "You have already applied for this job." }, 409);
      }

      const { data: application, error } = await adminDb
        .from("job_applications")
        .insert({ job_id: jobId, job_title: jobTitle, name, age, gender, email, phone, message: message || "" })
        .select()
        .single();

      if (error) return json({ success: false, message: error.message }, 500);

      return json({ success: true, message: "Application submitted successfully!", data: application }, 201);
    }

    // ---- ADMIN ACTIONS (require auth) ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ success: false, message: "Unauthorized" }, 401);

    const supabase = getSupabaseClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ success: false, message: "Unauthorized" }, 401);

    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "secondaryAdmin"].includes(profile.role)) {
      return json({ success: false, message: "Admin access required" }, 403);
    }

    // ---- ADMIN: GET ALL JOBS ----
    if (action === "all" && req.method === "GET") {
      const { data: jobs } = await adminDb
        .from("careers")
        .select("*")
        .order("created_at", { ascending: false });

      return json({ success: true, data: jobs });
    }

    // ---- ADMIN: CREATE JOB ----
    if (action === "create" && req.method === "POST") {
      const formData = await req.formData();
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const timePeriod = formData.get("timePeriod") as string;
      const experience = formData.get("experience") as string;
      const expiryDate = formData.get("expiryDate") as string;
      const file = formData.get("file") as File | null;

      let imageUrl = null;
      if (file) {
        // Upload to Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${Deno.env.get("CLOUDINARY_CLOUD_NAME")}/image/upload`;
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("folder", "3digree/careers");
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const paramsToSign = `folder=3digree/careers&timestamp=${timestamp}`;
        const key = new TextEncoder().encode(Deno.env.get("CLOUDINARY_API_SECRET")!);
        const msg = new TextEncoder().encode(paramsToSign);
        const hmacKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const sig = await crypto.subtle.sign("HMAC", hmacKey, msg);
        const signature = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
        uploadForm.append("timestamp", timestamp);
        uploadForm.append("api_key", Deno.env.get("CLOUDINARY_API_KEY")!);
        uploadForm.append("signature", signature);
        const cloudRes = await fetch(cloudinaryUrl, { method: "POST", body: uploadForm });
        const cloudData = await cloudRes.json();
        if (cloudRes.ok) imageUrl = cloudData.secure_url;
      }

      const { data: job, error } = await adminDb
        .from("careers")
        .insert({ title, description, time_period: timePeriod, experience, expiry_date: expiryDate, image: imageUrl })
        .select()
        .single();

      if (error) return json({ success: false, message: error.message }, 400);
      return json({ success: true, data: job }, 201);
    }

    // ---- ADMIN: UPDATE JOB ----
    if (action === "update" && req.method === "PUT") {
      const formData = await req.formData();
      const jobDbId = formData.get("id") as string;
      const updates: Record<string, unknown> = {};

      for (const field of ["title", "description", "time_period", "experience", "expiry_date"]) {
        const camelKey = field === "time_period" ? "timePeriod" : field === "expiry_date" ? "expiryDate" : field;
        const val = formData.get(camelKey) || formData.get(field);
        if (val !== null) updates[field] = val;
      }
      const isActive = formData.get("isActive") || formData.get("is_active");
      if (isActive !== null) updates.is_active = isActive === "true";

      const file = formData.get("file") as File | null;
      if (file) {
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${Deno.env.get("CLOUDINARY_CLOUD_NAME")}/image/upload`;
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("folder", "3digree/careers");
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const paramsToSign = `folder=3digree/careers&timestamp=${timestamp}`;
        const key = new TextEncoder().encode(Deno.env.get("CLOUDINARY_API_SECRET")!);
        const msg = new TextEncoder().encode(paramsToSign);
        const hmacKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const sig = await crypto.subtle.sign("HMAC", hmacKey, msg);
        const signature = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
        uploadForm.append("timestamp", timestamp);
        uploadForm.append("api_key", Deno.env.get("CLOUDINARY_API_KEY")!);
        uploadForm.append("signature", signature);
        const cloudRes = await fetch(cloudinaryUrl, { method: "POST", body: uploadForm });
        const cloudData = await cloudRes.json();
        if (cloudRes.ok) updates.image = cloudData.secure_url;
      }

      updates.updated_at = new Date().toISOString();

      const { data: job, error } = await adminDb
        .from("careers")
        .update(updates)
        .eq("id", jobDbId)
        .select()
        .single();

      if (error) return json({ success: false, message: error.message }, 400);
      return json({ success: true, data: job });
    }

    // ---- ADMIN: DELETE JOB ----
    if (action === "delete" && req.method === "DELETE") {
      const { id } = await req.json();
      await adminDb.from("careers").delete().eq("id", id);
      return json({ success: true, message: "Job deleted successfully" });
    }

    // ---- ADMIN: GET APPLICATIONS ----
    if (action === "applications" && req.method === "GET") {
      const jobId = url.searchParams.get("jobId");
      if (!jobId) return json({ success: false, message: "jobId required" }, 400);

      const { data: applications } = await adminDb
        .from("job_applications")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      return json({ success: true, data: applications, count: applications?.length || 0 });
    }

    return json({ success: false, message: "Not found" }, 404);
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
