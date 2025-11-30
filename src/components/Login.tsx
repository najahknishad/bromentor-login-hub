import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Email validation schema for enhanced security
const emailSchema = z.string().email("Please enter a valid email address").trim();

// OTP validation - must be exactly 6 digits
const otpSchema = z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers");

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle sending OTP - REAL EMAIL IMPLEMENTATION
  const handleSendOtp = async () => {
    // Validate email before sending OTP
    const emailValidation = emailSchema.safeParse(email);
    
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call edge function to send OTP via email
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: email.trim() }
      });

      if (error) throw error;

      setShowOtpInput(true);
      
      // TEST MODE: Show OTP hint if in test mode
      if (data?.testMode && data?.testOtp) {
        setTestOtpHint(data.testOtp);
        toast({
          title: "Test Mode Active",
          description: `Use OTP: ${data.testOtp} for testing`,
        });
      } else {
        toast({
          title: "OTP Sent",
          description: "Please check your email for the 6-digit OTP",
        });
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification with role-based redirect
  const handleVerifyOtp = async () => {
    const otpValidation = otpSchema.safeParse(otp);
    
    if (!otpValidation.success) {
      toast({
        title: "Invalid OTP",
        description: otpValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email: email.trim(), otp: otp }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "OTP verification failed");
      }

      // Set session from the response
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      toast({
        title: "Login Successful",
        description: "Welcome to BroMentor!",
      });

      // Fetch user role and redirect
      const userId = data.user?.id;
      if (userId) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        const role = roleData?.role || 'student';

        // Navigate based on role
        switch (role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'support':
            navigate('/support', { replace: true });
            break;
          case 'student':
          default:
            navigate('/dashboard', { replace: true });
            break;
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
      
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo - Circular BRO icon with light background */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full bg-logo-bg flex items-center justify-center shadow-lg">
            <span className="text-5xl font-bold text-slate-900">BRO</span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-center text-foreground">
          BroMentor
        </h1>

        {/* Main Tagline */}
        <p className="text-lg text-primary text-center font-medium">
          "Your doubt, our support — resolved in record time."
        </p>

        {/* Sign in text - Two separate lines */}
        <div className="text-center space-y-1 pt-2">
          <p className="text-lg text-text-secondary">Sign in to continue</p>
          <p className="text-lg text-text-secondary">Built for Brototype students</p>
        </div>

        {/* Authentication Form */}
        <div className="space-y-6">
          {!showOtpInput ? (
            // Email Input Phase
            <>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-lg bg-input placeholder:text-muted-foreground border-none rounded-xl !text-black"
                disabled={isLoading}
              />
              
              <Button
                onClick={handleSendOtp}
                disabled={isLoading || !email}
                className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            // OTP Input Phase - 6-digit numeric input only
            <>
              <div className="space-y-4">
                <p className="text-center text-text-secondary">
                  Enter the 6-digit OTP sent to your email
                </p>
                
                {/* TEST MODE: Display OTP hint for development */}
                {testOtpHint && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-center">
                    <p className="text-sm text-yellow-200">
                      <strong>Test Mode:</strong> Use OTP <code className="bg-yellow-500/30 px-2 py-1 rounded font-mono">{testOtpHint}</code>
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    pattern="[0-9]*"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-14 w-12 text-xl border-border" />
                      <InputOTPSlot index={1} className="h-14 w-12 text-xl border-border" />
                      <InputOTPSlot index={2} className="h-14 w-12 text-xl border-border" />
                      <InputOTPSlot index={3} className="h-14 w-12 text-xl border-border" />
                      <InputOTPSlot index={4} className="h-14 w-12 text-xl border-border" />
                      <InputOTPSlot index={5} className="h-14 w-12 text-xl border-border" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp("");
                  setTestOtpHint(null);
                }}
                className="w-full text-text-secondary hover:text-foreground"
              >
                Back to email
              </Button>
            </>
          )}

          {/* Session Control - Keep me signed in checkbox */}
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="keep-signed-in"
              checked={keepSignedIn}
              onCheckedChange={(checked) => setKeepSignedIn(checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-1">
              <label
                htmlFor="keep-signed-in"
                className="text-base text-foreground font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep me signed in
              </label>
              <p className="text-sm text-muted-foreground">
                Will logout automatically after 48 hours of inactivity
              </p>
            </div>
          </div>
        </div>

        {/* Developer Comment Guidance */}
        {/* 
          UI layout choices are focused on simplicity for student users.
          The design emphasizes clarity and ease of use for Brototype learners.
        */}
      </div>
    </div>
  );
};

export default Login;

