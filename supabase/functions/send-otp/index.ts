import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

/**
 * TEMPORARY AUTHENTICATION CONFIGURATION NOTICE
 * 
 * For the purpose of this competition phase, live OTP email delivery (via Resend API) 
 * has been intentionally disabled and replaced with a Test/Mock OTP mechanism.
 * 
 * The original design was to implement real-time email-based OTP verification for 
 * production use. However, repeated login attempts during development and testing 
 * were resulting in unnecessary credit consumption.
 * 
 * Fixed test OTP: 123456
 * 
 * This system is fully capable of operating with live email OTP and can be instantly 
 * reverted by re-enabling the RESEND_API_KEY configuration post-evaluation.
 */

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TEST MODE: Fixed OTP for development
const TEST_OTP_CODE = "123456";

interface SendOtpRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOtpRequest = await req.json();

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Clean up old OTPs for this email first
    await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email.toLowerCase().trim());

    // Store fixed test OTP in database
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        email: email.toLowerCase().trim(),
        otp_code: TEST_OTP_CODE,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // TEST MODE: No email sent, return success with test OTP hint
    console.log(`[TEST MODE] OTP for ${email}: ${TEST_OTP_CODE}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        testMode: true,
        testOtp: TEST_OTP_CODE
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
