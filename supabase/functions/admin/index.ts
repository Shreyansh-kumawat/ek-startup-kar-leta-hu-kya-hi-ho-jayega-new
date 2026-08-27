import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseClient, getSupabaseAdmin } from "../_shared/supabase.ts";
import { sendEmail, bulkEmailHtml } from "../_shared/email.ts";

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

    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "secondaryAdmin"].includes(profile.role)) {
      return json({ success: false, message: "Admin access required" }, 403);
    }

    // ---- DASHBOARD STATS ----
    if (action === "dashboard" && req.method === "GET") {
      const { data: stats } = await adminDb.rpc("get_admin_dashboard_stats");

      // Recent users
      const { data: recentUsers } = await adminDb
        .from("profiles")
        .select("id, name, email, created_at, role")
        .order("created_at", { ascending: false })
        .limit(5);

      // Recent bookings
      const { data: recentBookings } = await adminDb
        .from("website_bookings")
        .select("*, profiles!user_id(name, email)")
        .order("created_at", { ascending: false })
        .limit(5);

      return json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: { ...stats, recentUsers, recentBookings },
      });
    }

    // ---- GET ALL USERS ----
    if (action === "users" && req.method === "GET") {
      const search = url.searchParams.get("search") || "";
      const role = url.searchParams.get("role") || "";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = (page - 1) * limit;

      let query = adminDb
        .from("profiles")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      if (role && role !== "all") {
        query = query.eq("role", role);
      }

      const { data: users, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Stats
      const { count: totalUsers } = await adminDb.from("profiles").select("*", { count: "exact", head: true });
      const { count: activeUsers } = await adminDb.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true);

      return json({
        success: true,
        message: "Users fetched successfully",
        data: {
          users,
          stats: { total: totalUsers, active: activeUsers },
          pagination: {
            currentPage: page,
            totalPages: Math.ceil((count || 0) / limit),
            totalUsers: count,
          },
        },
      });
    }

    // ---- GET USER BY ID ----
    if (action === "user-detail" && req.method === "GET") {
      const userId = url.searchParams.get("id");
      if (!userId) return json({ success: false, message: "User ID required" }, 400);

      const { data: targetUser } = await adminDb
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!targetUser) return json({ success: false, message: "User not found" }, 404);

      const { data: bookings } = await adminDb
        .from("website_bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      return json({
        success: true,
        data: { user: targetUser, bookings },
      });
    }

    // ---- UPDATE USER STATUS ----
    if (action === "update-status" && req.method === "PATCH") {
      const { userId, isActive, reason } = await req.json();

      const { data: targetUser } = await adminDb
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!targetUser) return json({ success: false, message: "User not found" }, 404);
      if (targetUser.role === "admin" && !isActive) {
        return json({ success: false, message: "Cannot deactivate main admin" }, 403);
      }

      await adminDb
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", userId);

      return json({
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      });
    }

    // ---- UPDATE USER CREDITS ----
    if (action === "update-credits" && req.method === "PATCH") {
      const { userId, credits } = await req.json();

      if (typeof credits !== "number" || credits < 0) {
        return json({ success: false, message: "Credits must be non-negative number" }, 400);
      }

      const { data: targetUser } = await adminDb
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single();

      if (!targetUser) return json({ success: false, message: "User not found" }, 404);

      await adminDb
        .from("profiles")
        .update({ credits })
        .eq("id", userId);

      return json({
        success: true,
        message: "Credits updated successfully",
        data: { oldCredits: targetUser.credits, newCredits: credits },
      });
    }

    // ---- ADD CREDITS ----
    if (action === "add-credits" && req.method === "POST") {
      const { userId, credits } = await req.json();

      if (!userId || !credits || credits <= 0) {
        return json({ success: false, message: "Valid userId and credits required" }, 400);
      }

      const { data: targetUser } = await adminDb
        .from("profiles")
        .select("credits, name")
        .eq("id", userId)
        .single();

      if (!targetUser) return json({ success: false, message: "User not found" }, 404);

      const newCredits = (targetUser.credits || 0) + credits;
      await adminDb
        .from("profiles")
        .update({ credits: newCredits })
        .eq("id", userId);

      return json({
        success: true,
        message: `Added ${credits} credits`,
        data: { previousCredits: targetUser.credits, newCredits, userName: targetUser.name },
      });
    }

    // ---- DEDUCT CREDITS ----
    if (action === "deduct-credits" && req.method === "POST") {
      const { userId, credits } = await req.json();

      const { data: targetUser } = await adminDb
        .from("profiles")
        .select("credits, name")
        .eq("id", userId)
        .single();

      if (!targetUser) return json({ success: false, message: "User not found" }, 404);
      if ((targetUser.credits || 0) < credits) {
        return json({ success: false, message: `Insufficient credits. Has: ${targetUser.credits}` }, 400);
      }

      const newCredits = targetUser.credits - credits;
      await adminDb.from("profiles").update({ credits: newCredits }).eq("id", userId);

      return json({
        success: true,
        message: `Deducted ${credits} credits`,
        data: { previousCredits: targetUser.credits, newCredits },
      });
    }

    // ---- DELETE USER ----
    if (action === "delete-user" && req.method === "DELETE") {
      const { userId, confirmDelete } = await req.json();
      if (!confirmDelete) return json({ success: false, message: "Confirm deletion" }, 400);

      const { data: targetUser } = await adminDb
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!targetUser) return json({ success: false, message: "User not found" }, 404);
      if (targetUser.role === "admin") return json({ success: false, message: "Cannot delete main admin" }, 403);

      // Check active bookings
      const { count } = await adminDb
        .from("website_bookings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["purchased", "approved", "inprogress"]);

      if (count && count > 0) {
        return json({ success: false, message: `User has ${count} active bookings` }, 400);
      }

      // Delete from auth (cascade deletes profile)
      await adminDb.auth.admin.deleteUser(userId);

      return json({ success: true, message: "User deleted successfully" });
    }

    // ---- CREATE SECONDARY ADMIN ----
    if (action === "create-admin" && req.method === "POST") {
      const { name, email, password, phone } = await req.json();

      if (!name || !email || !password) {
        return json({ success: false, message: "Name, email, and password required" }, 400);
      }

      // Create user in auth
      const { data: authUser, error: authErr } = await adminDb.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone: phone || "" },
      });

      if (authErr) {
        return json({ success: false, message: authErr.message }, 400);
      }

      // Update profile role
      await adminDb
        .from("profiles")
        .update({ role: "secondaryAdmin", name, phone: phone || "" })
        .eq("id", authUser.user.id);

      return json({
        success: true,
        message: "Secondary admin created successfully",
        data: { id: authUser.user.id, name, email, role: "secondaryAdmin" },
      }, 201);
    }

    // ---- BULK EMAIL ----
    if (action === "bulk-email" && req.method === "POST") {
      const { mode, userIds = [], subject, body } = await req.json();

      if (!subject || !body) return json({ success: false, message: "Subject and body required" }, 400);
      if (!["all", "specific"].includes(mode)) return json({ success: false, message: "Mode must be all or specific" }, 400);

      let recipients;
      if (mode === "all") {
        const { data } = await adminDb.from("profiles").select("name, email").eq("is_active", true);
        recipients = data || [];
      } else {
        const { data } = await adminDb.from("profiles").select("name, email").in("id", userIds);
        recipients = data || [];
      }

      if (recipients.length === 0) return json({ success: false, message: "No recipients found" }, 400);

      let sent = 0, failed = 0;
      const errors: { email: string; error: string }[] = [];

      for (const r of recipients) {
        const personalBody = body.replace(/\{\{name\}\}/g, r.name || "there");
        const result = await sendEmail({
          to: r.email,
          subject,
          text: personalBody.replace(/<[^>]+>/g, ""),
          html: bulkEmailHtml(personalBody),
        });
        if (result.success) sent++;
        else {
          failed++;
          errors.push({ email: r.email, error: result.error || "Unknown" });
        }
      }

      return json({
        success: true,
        message: "Bulk email completed",
        data: { total: recipients.length, sent, failed, errors: errors.slice(0, 10) },
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
