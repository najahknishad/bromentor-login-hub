-- Fix search path for clean_expired_otps function
CREATE OR REPLACE FUNCTION public.clean_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now();
END;
$$;