'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[LabGenius] Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
            <div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>An unexpected error occurred in the dashboard</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md text-sm font-mono text-destructive break-words">
              {error.message}
              {error.digest && (
                <p className="mt-1 text-xs opacity-70">Digest: {error.digest}</p>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Please try again. If the problem persists, return to the dashboard.
          </p>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline" className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button variant="default" className="w-full gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
