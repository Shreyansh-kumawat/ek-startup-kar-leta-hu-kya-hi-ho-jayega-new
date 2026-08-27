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
    const authHeader = req.headers.get("Authorization")!;
    const supabase = getSupabaseClient(authHeader);
    const adminDb = getSupabaseAdmin();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ success: false, message: "Unauthorized" }, 401);

    // Check admin for admin actions
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile && ["admin", "secondaryAdmin"].includes(profile.role);

    // ---- ADMIN: GET ALL BOOKINGS ----
    if (action === "all" && req.method === "GET") {
      if (!isAdmin) return json({ success: false, message: "Admin required" }, 403);

      const status = url.searchParams.get("status");
      let query = adminDb
        .from("website_bookings")
        .select("*, profiles!user_id(name, email), templates!template_id(name, preview_image)")
        .order("created_at", { ascending: false });

      if (status) query = query.eq("status", status);

      const { data: bookings, error } = await query;
      if (error) return json({ success: false, message: error.message }, 500);

      return json({ success: true, count: bookings?.length || 0, data: bookings });
    }

    // ---- ADMIN: APPROVE BOOKING ----
    if (action === "approve" && req.method === "PATCH") {
      if (!isAdmin) return json({ success: false, message: "Admin required" }, 403);

      const { bookingId } = await req.json();

      const { data: booking } = await adminDb
        .from("website_bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (!booking) return json({ success: false, message: "Booking not found" }, 404);
      if (booking.status !== "purchased") {
        return json({ success: false, message: "Booking already approved or completed" }, 400);
      }

      const now = new Date();
      const completionTime = new Date(now.getTime() + 72 * 60 * 60 * 1000);

      const { data: updated, error } = await adminDb
        .from("website_bookings")
        .update({
          status: "inprogress",
          approved_at: now.toISOString(),
          estimated_completion_at: completionTime.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) return json({ success: false, message: error.message }, 500);

      return json({
        success: true,
        message: "Booking approved! Auto-progress timer started.",
        data: updated,
      });
    }

    // ---- ADMIN: COMPLETE BOOKING ----
    if (action === "complete" && req.method === "PATCH") {
      if (!isAdmin) return json({ success: false, message: "Admin required" }, 403);

      const { bookingId, previewLink } = await req.json();
      if (!previewLink) return json({ success: false, message: "Preview link required" }, 400);

      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(previewLink)) {
        return json({ success: false, message: "Invalid preview link format" }, 400);
      }

      const { data: booking } = await adminDb
        .from("website_bookings")
        .select("status")
        .eq("id", bookingId)
        .single();

      if (!booking) return json({ success: false, message: "Booking not found" }, 404);
      if (booking.status === "completed") {
        return json({ success: false, message: "Already completed" }, 400);
      }

      const { data: updated } = await adminDb
        .from("website_bookings")
        .update({
          status: "completed",
          progress: 100,
          preview_link: previewLink,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      return json({
        success: true,
        message: "Booking marked as completed!",
        data: updated,
      });
    }

    // ---- ADMIN: STATS ----
    if (action === "stats" && req.method === "GET") {
      if (!isAdmin) return json({ success: false, message: "Admin required" }, 403);

      const counts = await Promise.all([
        adminDb.from("website_bookings").select("*", { count: "exact", head: true }),
        adminDb.from("website_bookings").select("*", { count: "exact", head: true }).eq("status", "purchased"),
        adminDb.from("website_bookings").select("*", { count: "exact", head: true }).in("status", ["inprogress", "readyforcompletion"]),
        adminDb.from("website_bookings").select("*", { count: "exact", head: true }).eq("status", "completed"),
      ]);

      return json({
        success: true,
        data: {
          total: counts[0].count || 0,
          purchased: counts[1].count || 0,
          inProgress: counts[2].count || 0,
          completed: counts[3].count || 0,
        },
      });
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
