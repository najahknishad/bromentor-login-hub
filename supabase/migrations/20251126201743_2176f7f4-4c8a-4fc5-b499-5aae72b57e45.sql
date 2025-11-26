-- Create OTP storage table for email verification
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert OTP codes (for registration)
CREATE POLICY "Anyone can create OTP codes"
  ON public.otp_codes
  FOR INSERT
  WITH CHECK (true);

-- Allow reading own OTP codes by email
CREATE POLICY "Users can read own OTP codes"
  ON public.otp_codes
  FOR SELECT
  USING (true);

-- Allow updating own OTP codes
CREATE POLICY "Users can update own OTP codes"
  ON public.otp_codes
  FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_otp_email ON public.otp_codes(email);
CREATE INDEX idx_otp_expires ON public.otp_codes(expires_at);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION clean_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now();
END;
$$;