'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service
    console.error('[v0] Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>We encountered an unexpected error</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-destructive/10 p-4 rounded text-sm font-mono text-destructive break-words">
              {error.message}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Please try again or contact support if the problem persists.
          </p>
          <Button
            onClick={reset}
            className="w-full gap-2"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
