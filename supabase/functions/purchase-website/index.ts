import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseClient, getSupabaseAdmin } from "../_shared/supabase.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = getSupabaseClient(authHeader);
    const adminDb = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { templateDisplayId } = await req.json();

    if (!templateDisplayId || !templateDisplayId.startsWith("#3di-")) {
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid template ID format. Use format: #3di-XXXXXX",
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find template by display_id
    const { data: template, error: tplErr } = await adminDb
      .from("templates")
      .select("*")
      .eq("display_id", templateDisplayId)
      .eq("is_active", true)
      .single();

    if (tplErr || !template) {
      return new Response(JSON.stringify({
        success: false,
        message: "Template not found with this ID",
      }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const creditsRequired = template.credits_required || 1;

    // Atomic purchase via database function
    const { data: result, error: rpcErr } = await adminDb.rpc("purchase_website", {
      p_user_id: user.id,
      p_template_display_id: templateDisplayId,
      p_template_id: template.id,
      p_template_name: template.name,
      p_template_image: template.preview_image || "",
      p_credits_required: creditsRequired,
    });

    if (rpcErr) {
      return new Response(JSON.stringify({ success: false, message: rpcErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        message: result.message,
        data: { required: result.required, available: result.available },
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the created booking
    const { data: booking } = await adminDb
      .from("website_bookings")
      .select("*")
      .eq("id", result.booking_id)
      .single();

    return new Response(JSON.stringify({
      success: true,
      message: `Website purchased successfully! ${creditsRequired} credit${creditsRequired > 1 ? "s" : ""} deducted.`,
      data: {
        booking,
        remainingCredits: result.remaining_credits,
        creditsDeducted: result.credits_deducted,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
