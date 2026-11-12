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

    // Parse query params
    const url = new URL(req.url);
    const includeHistory = url.searchParams.get("include_history") === "true";

    // Fetch active subscription with plan details
    const { data: activeSubscription, error: activeSubErr } = await serviceClient
      .from("org_subscriptions")
      .select(`
        *,
        plan:subscription_plan(*)
      `)
      .eq("organization_id", org_id)
      .eq("status", "active")
      .order("activated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeSubErr) {
      console.error("Failed to fetch active subscription:", activeSubErr);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscription" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Also check for a pending subscription if no active one
    let pendingSubscription = null;
    if (!activeSubscription) {
      const { data: pendingSub } = await serviceClient
        .from("org_subscriptions")
        .select(`
          *,
          plan:subscription_plan(*)
        `)
        .eq("organization_id", org_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      pendingSubscription = pendingSub;
    }

    // Optionally fetch history
    let history = null;
    if (includeHistory) {
      const { data: historyData, error: historyErr } = await serviceClient
        .from("org_subscriptions")
        .select(`
          *,
          plan:subscription_plan(*)
        `)
        .eq("organization_id", org_id)
        .order("created_at", { ascending: false });

      if (historyErr) {
        console.error("Failed to fetch subscription history:", historyErr);
      } else {
        history = historyData;
      }
    }

    return new Response(
      JSON.stringify({
        active_subscription: activeSubscription,
        pending_subscription: pendingSubscription,
        plan_details: activeSubscription?.plan ?? pendingSubscription?.plan ?? null,
        ...(includeHistory ? { history } : {}),
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
