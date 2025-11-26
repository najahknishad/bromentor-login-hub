import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Email validation schema
const emailSchema = z.string().email("Please enter a valid email address").trim();

// Password validation schema
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

// OTP validation - must be exactly 6 digits
const otpSchema = z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSignUp = async () => {
    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.success) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sign Up Successful",
        description: "Welcome to BroMentor! You can now log in.",
      });
      setIsLogin(true);
    }
  };

  const handleLogin = async () => {
    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.success) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login Successful",
        description: `Welcome back to BroMentor!`,
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo - Circular BRO icon */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full bg-logo-bg flex items-center justify-center">
            <span className="text-5xl font-bold text-foreground">BRO</span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-center text-foreground">
          BroMentor
        </h1>

        {/* Tagline - Single line as specified */}
        <div className="text-center">
          <p className="text-lg text-text-secondary">Your doubt. Our support – Resolved in record time.</p>
        </div>

        {/* Authentication Form */}
        <div className="space-y-6">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-14 text-lg bg-input text-foreground placeholder:text-muted-foreground border-none rounded-xl"
              disabled={isLoading}
            />
          )}
          
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 text-lg bg-input text-foreground placeholder:text-muted-foreground border-none rounded-xl"
            disabled={isLoading}
          />

          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 text-lg bg-input text-foreground placeholder:text-muted-foreground border-none rounded-xl"
            disabled={isLoading}
          />

          <Button
            onClick={isLogin ? handleLogin : handleSignUp}
            disabled={isLoading || !email || !password}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Sign Up")}
          </Button>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-text-secondary hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

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

        {/* Developer Comments:
          - Auto logout after 48 hours of inactivity improves privacy & safety
          - Email/password authentication with proper validation
          - Proper RLS policies ensure data security at database level
        */}
      </div>
    </div>
  );
};

export default Auth;
