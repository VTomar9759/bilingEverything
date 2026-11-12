import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(rawBody);
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  // Always return 200 to Razorpay (even on errors) to prevent unnecessary retries
  try {
    // Get raw body as text for signature verification
    const rawBody = await req.text();

    // Verify webhook signature
    const razorpaySignature = req.headers.get("X-Razorpay-Signature") || "";
    if (!razorpaySignature) {
      console.error("Missing X-Razorpay-Signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 200, // Return 200 so Razorpay doesn't retry
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const isValid = await verifyWebhookSignature(rawBody, razorpaySignature, webhookSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Parse the event
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error("Failed to parse webhook body");
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const eventType = event.event as string;
    const payload = event.payload as Record<string, unknown>;

    console.log(`Processing webhook event: ${eventType}`);

    if (eventType === "payment.captured") {
      const paymentEntity = (payload.payment as Record<string, unknown>)
        .entity as Record<string, unknown>;
      const rzpPaymentId = paymentEntity.id as string;
      const rzpOrderId = paymentEntity.order_id as string;

      // Idempotency: check if payment already captured
      const { data: existingPayment } = await serviceClient
        .from("payments")
        .select("id, status, subscription_id")
        .eq("razorpay_order_id", rzpOrderId)
        .single();

      if (!existingPayment) {
        console.error(`Payment record not found for order ${rzpOrderId}`);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      if (existingPayment.status === "captured") {
        console.log(`Payment ${rzpPaymentId} already captured, skipping.`);
        return new Response(JSON.stringify({ received: true, already_processed: true }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      // Update payment to captured
      await serviceClient
        .from("payments")
        .update({
          razorpay_payment_id: rzpPaymentId,
          status: "captured",
          paid_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", rzpOrderId);

      // Check if subscription is still pending and activate it
      const { data: subscription } = await serviceClient
        .from("org_subscriptions")
        .select("id, status")
        .eq("id", existingPayment.subscription_id)
        .single();

      if (subscription && subscription.status === "pending") {
        const { error: rpcError } = await serviceClient.rpc("activate_subscription", {
          p_subscription_id: subscription.id,
          p_payment_id: existingPayment.id,
        });

        if (rpcError) {
          console.error("Failed to activate subscription via webhook:", rpcError);
        } else {
          console.log(`Subscription ${subscription.id} activated via webhook.`);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (eventType === "payment.failed") {
      const paymentEntity = (payload.payment as Record<string, unknown>)
        .entity as Record<string, unknown>;
      const rzpOrderId = paymentEntity.order_id as string;

      // Find payment record
      const { data: paymentRecord } = await serviceClient
        .from("payments")
        .select("id, subscription_id, status")
        .eq("razorpay_order_id", rzpOrderId)
        .single();

      if (!paymentRecord) {
        console.error(`Payment record not found for order ${rzpOrderId}`);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      // Idempotency: skip if already failed
      if (paymentRecord.status === "failed") {
        console.log(`Payment for order ${rzpOrderId} already marked failed.`);
        return new Response(JSON.stringify({ received: true, already_processed: true }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      // Update payment status to failed
      await serviceClient
        .from("payments")
        .update({ status: "failed" })
        .eq("id", paymentRecord.id);

      // Update subscription status to failed
      await serviceClient
        .from("org_subscriptions")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", paymentRecord.subscription_id)
        .eq("status", "pending"); // Only update if still pending

      console.log(`Payment failed for order ${rzpOrderId}`);

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Unhandled event type — still return 200
    console.log(`Unhandled webhook event type: ${eventType}`);
    return new Response(JSON.stringify({ received: true, unhandled: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected webhook error:", err);
    // Always return 200 to Razorpay
    return new Response(JSON.stringify({ received: true, error: "Internal error" }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
