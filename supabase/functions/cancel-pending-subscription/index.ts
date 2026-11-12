import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth: get user from Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const {
      data: { user },
      error: authError,
    } = await serviceClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const body = await req.json();
    const { subscription_id } = body;

    if (!subscription_id) {
      return new Response(JSON.stringify({ error: "Missing subscription_id" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Get org_id
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

    // Find the pending subscription (must belong to this org)
    const { data: subscription, error: subErr } = await serviceClient
      .from("org_subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .eq("organization_id", org_id)
      .eq("status", "pending")
      .single();

    if (subErr || !subscription) {
      return new Response(
        JSON.stringify({
          error: "Pending subscription not found or does not belong to your organization",
        }),
        {
          status: 404,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Note: Razorpay orders cannot be explicitly cancelled via API.
    // We simply abandon the order on our end by marking it cancelled.
    // The order will expire on Razorpay's side automatically.

    const now = new Date().toISOString();

    // Update org_subscriptions status to 'cancelled'
    const { error: cancelSubErr } = await serviceClient
      .from("org_subscriptions")
      .update({ status: "cancelled", updated_at: now })
      .eq("id", subscription_id)
      .eq("status", "pending"); // Ensure we only cancel if still pending

    if (cancelSubErr) {
      console.error("Failed to cancel subscription:", cancelSubErr);
      return new Response(
        JSON.stringify({ error: "Failed to cancel subscription" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Update associated payments status to 'failed'
    const { error: cancelPayErr } = await serviceClient
      .from("payments")
      .update({ status: "failed" })
      .eq("subscription_id", subscription_id)
      .eq("status", "created"); // Only update payments that haven't been processed yet

    if (cancelPayErr) {
      console.error("Failed to update payment records:", cancelPayErr);
      // Non-fatal: subscription is already cancelled
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pending subscription cancelled successfully",
        subscription_id,
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
