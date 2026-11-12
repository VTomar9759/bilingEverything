import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    // Auth: get user from Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, serviceRoleKey);
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Service role client for DB operations
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Get org_id: try as owner first, then as admin
    let { data: org } = await serviceClient
      .from("organization")
      .select("id")
      .eq("created_by", user.id)
      .single();

    if (!org) {
      const { data: adminRow } = await serviceClient
        .from("admin")
        .select("org_id")
        .eq("email", user.email)
        .single();
      if (adminRow) org = { id: adminRow.org_id };
    }

    if (!org) {
      return new Response(
        JSON.stringify({ error: "Organization not found for user" }),
        {
          status: 404,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const org_id = org.id;

    // Parse request body
    const body = await req.json();
    const { plan_id } = body;

    if (!plan_id || typeof plan_id !== "number") {
      return new Response(JSON.stringify({ error: "Invalid plan_id" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Fetch plan
    const { data: plan, error: planError } = await serviceClient
      .from("subscription_plan")
      .select("*")
      .eq("id", plan_id)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: "Plan not found or inactive" }),
        {
          status: 404,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Check for existing pending subscription
    const { data: pendingSub } = await serviceClient
      .from("org_subscriptions")
      .select("id")
      .eq("organization_id", org_id)
      .eq("status", "pending")
      .single();

    if (pendingSub) {
      return new Response(
        JSON.stringify({
          error: "A pending subscription already exists. Please complete or cancel it first.",
          subscription_id: pendingSub.id,
        }),
        {
          status: 409,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Handle Free Trial directly without Razorpay
    if (plan.is_free_trial) {
      // Check if organisation has already used a free trial
      const { data: previousTrial } = await serviceClient
        .from("org_subscriptions")
        .select("id, status")
        .eq("organization_id", org_id)
        .eq("plan_id", plan_id)
        .in("status", ["active", "replaced", "expired"])
        .limit(1);

      if (previousTrial && previousTrial.length > 0) {
        return new Response(
          JSON.stringify({ error: "Free trial has already been used by your organization." }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }

      // Create subscription in pending status
      const { data: subscription, error: subError } = await serviceClient
        .from("org_subscriptions")
        .insert({
          organization_id: org_id,
          plan_id,
          status: "pending",
          amount: 0,
          currency: "INR",
        })
        .select()
        .single();

      if (subError || !subscription) {
        console.error("Failed to create free trial subscription:", subError);
        return new Response(
          JSON.stringify({ error: "Failed to create subscription record" }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }

      // Activate immediately via activate_subscription RPC (payment_id is null for free trial)
      const { data: activationResult, error: rpcError } = await serviceClient.rpc(
        "activate_subscription",
        {
          p_subscription_id: subscription.id,
          p_payment_id: null,
        }
      );

      if (rpcError) {
        console.error("Failed to activate free trial:", rpcError);
        return new Response(
          JSON.stringify({ error: "Failed to activate free trial", details: rpcError.message }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }

      const { data: activatedSub } = await serviceClient
        .from("org_subscriptions")
        .select("*, plan:subscription_plan(*)")
        .eq("id", subscription.id)
        .single();

      return new Response(
        JSON.stringify({
          is_free_trial: true,
          success: true,
          subscription: activatedSub,
          activation_result: activationResult,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Amount in paise (multiply INR by 100)
    const amountPaise = Math.round(Number(plan.price) * 100);

    // Create Razorpay order
    const receipt = `sub_${org_id}_${Date.now()}`;
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(razorpayKeyId + ":" + razorpayKeySecret)}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
      }),
    });

    if (!rzpResponse.ok) {
      const rzpError = await rzpResponse.text();
      console.error("Razorpay order creation failed:", rzpError);
      return new Response(
        JSON.stringify({ error: "Failed to create payment order", details: rzpError }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const rzpOrder = await rzpResponse.json();

    // Insert into org_subscriptions
    const { data: subscription, error: subError } = await serviceClient
      .from("org_subscriptions")
      .insert({
        organization_id: org_id,
        plan_id,
        status: "pending",
        amount: plan.price,
        currency: "INR",
      })
      .select()
      .single();

    if (subError || !subscription) {
      console.error("Failed to create subscription:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to create subscription record" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Insert into payments
    const { data: payment, error: payError } = await serviceClient
      .from("payments")
      .insert({
        subscription_id: subscription.id,
        organization_id: org_id,
        razorpay_order_id: rzpOrder.id,
        amount: plan.price,
        currency: "INR",
        status: "created",
      })
      .select()
      .single();

    if (payError || !payment) {
      console.error("Failed to create payment record:", payError);
      // Rollback the subscription
      await serviceClient
        .from("org_subscriptions")
        .delete()
        .eq("id", subscription.id);
      return new Response(
        JSON.stringify({ error: "Failed to create payment record" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        order_id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: "INR",
        key_id: razorpayKeyId,
        subscription_id: subscription.id,
        plan,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
