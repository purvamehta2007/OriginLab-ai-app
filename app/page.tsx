'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">LabGenius</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/auth/login')}
            >
              Login
            </Button>
            <Button onClick={() => router.push('/auth/sign-up')}>
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground text-balance">
            AI-Powered Scientific <span className="text-primary">Research Automation</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Design, plan, execute, and analyze scientific experiments with AI assistance. From hypothesis to results in minutes.
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleGetStarted}
          className="gap-2 text-base"
        >
          Get Started Free <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="p-6 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors">
            <Zap className="w-10 h-10 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-foreground mb-2">AI-Powered Planning</h3>
            <p className="text-muted-foreground">Generate detailed experiment plans with AI-backed scientific guidance and methodology suggestions.</p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors">
            <BarChart3 className="w-10 h-10 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-foreground mb-2">Real-time Tracking</h3>
            <p className="text-muted-foreground">Monitor experiment progress in real-time with detailed metrics, status updates, and live notifications.</p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors">
            <Brain className="w-10 h-10 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-foreground mb-2">Automated Analysis</h3>
            <p className="text-muted-foreground">Get AI-generated insights, statistical analysis, and actionable recommendations from your results.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20 py-8 px-4 text-center text-muted-foreground">
        <p>&copy; 2026 LabGenius AI. Scientific research, automated.</p>
      </footer>
    </div>
  );
}
