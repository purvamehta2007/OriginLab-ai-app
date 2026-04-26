import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-9 h-9 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Page not found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
