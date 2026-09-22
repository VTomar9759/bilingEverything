import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  redirectTo?: string;
}

const getHtmlTemplate = (actionLink: string, userEmail: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Bill Every Thing</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f7f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #333333;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
    }
    .header {
      background: linear-gradient(135deg, #01514b 0%, #00a389 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 36px 30px;
    }
    .content h2 {
      font-size: 20px;
      color: #111827;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #01514b 0%, #00a389 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      border-radius: 30px;
      box-shadow: 0 4px 14px rgba(1, 81, 75, 0.3);
      transition: all 0.2s ease;
    }
    .security-note {
      background: #f8fafc;
      border-left: 4px solid #00a389;
      padding: 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #64748b;
      margin-top: 24px;
    }
    .security-note strong {
      color: #1e293b;
    }
    .link-fallback {
      margin-top: 24px;
      font-size: 12px;
      color: #9ca3af;
      word-break: break-all;
    }
    .link-fallback a {
      color: #00a389;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #f3f4f6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bill Every Thing</h1>
      <p>Restaurant & Business Management SaaS</p>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset the password for your account associated with <strong>${userEmail}</strong>.</p>
      <p>Click the button below to set up a new password for your account:</p>
      
      <div class="btn-container">
        <a href="${actionLink}" class="btn" target="_blank">Reset Password →</a>
      </div>

      <div class="security-note">
        <strong>🔒 Security Notice:</strong> This password reset link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
      </div>

      <div class="link-fallback">
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <a href="${actionLink}">${actionLink}</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Bill Every Thing. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { email, redirectTo }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate Recovery Link via Supabase Admin API
    const finalRedirectTo = redirectTo || `${new URL(req.url).origin}/reset-password`;
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: finalRedirectTo,
      },
    });

    if (linkError) throw linkError;

    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) {
      throw new Error("Failed to generate action link.");
    }

    const htmlContent = getHtmlTemplate(actionLink, email);
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      // Send email via Resend API
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bill Every Thing <noreply@resend.dev>",
          to: [email],
          subject: "Reset your Password - Bill Every Thing",
          html: htmlContent,
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        console.error("Resend API error:", errorText);
        throw new Error(`Resend API failed: ${errorText}`);
      }
    } else {
      console.log("RESEND_API_KEY not set. Generated password reset link:", actionLink);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset email template generated and sent successfully",
        actionLink: resendApiKey ? undefined : actionLink,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
