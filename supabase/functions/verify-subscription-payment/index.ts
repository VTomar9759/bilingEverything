import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(`${orderId}|${paymentId}`);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hexSig = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hexSig === signature;
}

Deno.serve(async (req: Request) => {
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscription_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !subscription_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature, subscription_id" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Verify Razorpay HMAC signature
    const isValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Get user's org_id
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

    // Get payment row by order_id
    const { data: payment, error: payError } = await serviceClient
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (payError || !payment) {
      return new Response(JSON.stringify({ error: "Payment record not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Validate org ownership
    if (payment.organization_id !== org_id) {
      return new Response(JSON.stringify({ error: "Forbidden: payment does not belong to your organization" }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Idempotency: check if already captured
    if (payment.status === "captured") {
      // Already processed — fetch and return current subscription
      const { data: existingSub } = await serviceClient
        .from("org_subscriptions")
        .select("*, subscription_plan(*)")
        .eq("id", subscription_id)
        .single();

      return new Response(
        JSON.stringify({ success: true, already_captured: true, subscription: existingSub }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Verify with Razorpay API: GET /v1/payments/{razorpay_payment_id}
    const rzpVerifyResp = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(razorpayKeyId + ":" + razorpayKeySecret)}`,
        },
      }
    );

    if (!rzpVerifyResp.ok) {
      const errText = await rzpVerifyResp.text();
      console.error("Razorpay payment fetch failed:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to verify payment with Razorpay", details: errText }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const rzpPayment = await rzpVerifyResp.json();

    if (rzpPayment.status !== "captured") {
      return new Response(
        JSON.stringify({ error: `Payment not captured. Current status: ${rzpPayment.status}` }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Update payment record
    const { data: updatedPayment, error: updatePayErr } = await serviceClient
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "captured",
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id)
      .select()
      .single();

    if (updatePayErr) {
      console.error("Failed to update payment:", updatePayErr);
      return new Response(
        JSON.stringify({ error: "Failed to update payment record" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Call activate_subscription RPC
    const { data: activationResult, error: rpcError } = await serviceClient.rpc(
      "activate_subscription",
      {
        p_subscription_id: subscription_id,
        p_payment_id: updatedPayment.id,
      }
    );

    if (rpcError) {
      console.error("Failed to activate subscription:", rpcError);
      return new Response(
        JSON.stringify({ error: "Failed to activate subscription", details: rpcError.message }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch updated subscription details
    const { data: subscription } = await serviceClient
      .from("org_subscriptions")
      .select("*, subscription_plan(*)")
      .eq("id", subscription_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        subscription,
        activation_result: activationResult,
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
