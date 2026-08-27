import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseClient, getSupabaseAdmin } from "../_shared/supabase.ts";

const PLAN_CONFIG: Record<string, { price: number; credits: number }> = {
  Starter: { price: 10999, credits: 3 },
  Growth: { price: 29999, credits: 9 },
  "Single Website": { price: 3999, credits: 1 },
};

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    const authHeader = req.headers.get("Authorization")!;
    const supabase = getSupabaseClient(authHeader);
    const adminDb = getSupabaseAdmin();

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- CREATE PLAN ORDER ----
    if (path === "create-order" && req.method === "POST") {
      const { planType } = await req.json();

      if (!planType || !PLAN_CONFIG[planType]) {
        return new Response(JSON.stringify({ success: false, message: "Invalid plan type" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const plan = PLAN_CONFIG[planType];
      const amountPaise = Math.round(plan.price * 100);

      // Get user profile
      const { data: profile } = await adminDb
        .from("profiles")
        .select("name, email, phone")
        .eq("id", user.id)
        .single();

      // Create Razorpay order via API
      const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(
            `${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`
          ),
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: `PLAN_${user.id.slice(-6)}_${Date.now().toString().slice(-8)}`,
          notes: { userId: user.id, planType, credits: plan.credits },
        }),
      });

      const razorpayOrder = await razorpayRes.json();
      if (!razorpayRes.ok) {
        return new Response(JSON.stringify({ success: false, message: "Failed to create Razorpay order" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create purchase record
      const { data: purchase, error: insertErr } = await adminDb
        .from("plan_purchases")
        .insert({
          user_id: user.id,
          plan_type: planType,
          plan_price: plan.price,
          credits_received: plan.credits,
          razorpay_order_id: razorpayOrder.id,
          payment_amount: plan.price,
          status: "created",
          metadata: { source: "dashboard" },
        })
        .select()
        .single();

      if (insertErr) {
        return new Response(JSON.stringify({ success: false, message: insertErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Plan order created successfully",
        data: {
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          },
          planDetails: {
            purchaseId: purchase.id,
            planType,
            price: plan.price,
            credits: plan.credits,
          },
          customerDetails: {
            name: profile?.name,
            email: profile?.email,
            phone: profile?.phone,
          },
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- VERIFY PLAN PAYMENT ----
    if (path === "verify-payment" && req.method === "POST") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return new Response(JSON.stringify({ success: false, message: "Missing payment data" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify signature
      const key = new TextEncoder().encode(Deno.env.get("RAZORPAY_KEY_SECRET")!);
      const msg = new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`);
      const hmacKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const signature = await crypto.subtle.sign("HMAC", hmacKey, msg);
      const expectedSig = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSig !== razorpay_signature) {
        // Mark as failed
        await adminDb
          .from("plan_purchases")
          .update({ status: "failed", gateway_response: { failureReason: "Invalid signature" } })
          .eq("razorpay_order_id", razorpay_order_id)
          .eq("user_id", user.id);

        return new Response(JSON.stringify({ success: false, message: "Payment verification failed" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find purchase
      const { data: purchase } = await adminDb
        .from("plan_purchases")
        .select("*")
        .eq("razorpay_order_id", razorpay_order_id)
        .eq("user_id", user.id)
        .eq("status", "created")
        .single();

      if (!purchase) {
        return new Response(JSON.stringify({ success: false, message: "Purchase record not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Atomic: apply credits
      const { data: result } = await adminDb.rpc("apply_plan_credits", {
        p_purchase_id: purchase.id,
        p_user_id: user.id,
        p_razorpay_payment_id: razorpay_payment_id,
        p_razorpay_signature: razorpay_signature,
        p_gateway_response: { razorpay_order_id, razorpay_payment_id, razorpay_signature, verifiedAt: new Date().toISOString() },
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Payment verified successfully! Credits added.",
        data: {
          payment: {
            purchaseId: purchase.id,
            planType: purchase.plan_type,
            creditsReceived: purchase.credits_received,
            status: "completed",
          },
          user: {
            credits: result?.new_balance,
          },
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, message: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
