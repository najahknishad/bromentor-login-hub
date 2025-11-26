import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full bg-logo-bg flex items-center justify-center">
            <span className="text-5xl font-bold text-foreground">BRO</span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl font-bold text-foreground">
          BroMentor
        </h1>

        {/* Tagline */}
        <p className="text-2xl text-text-secondary">
          Your doubt. Our support – Resolved in record time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02]"
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/auth")}
            className="h-14 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Sign In
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-bold text-foreground mb-2">Fast Resolution</h3>
            <p className="text-muted-foreground">Get your doubts resolved quickly by our expert support team</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-bold text-foreground mb-2">Track Progress</h3>
            <p className="text-muted-foreground">Monitor your learning journey and earn achievement badges</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-bold text-foreground mb-2">Built for Brototype</h3>
            <p className="text-muted-foreground">Designed specifically for Brototype students</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
