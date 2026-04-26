'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Beaker } from 'lucide-react';
import Link from 'next/link';
import { ExperimentsGrid } from '@/components/experiments-grid';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    email?: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as User || null);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h1>
          <p className="text-muted-foreground">Manage your scientific experiments with AI assistance</p>
        </div>
        <Link href="/dashboard/experiment/new">
          <Button className="gap-2" size="lg">
            <Plus className="w-5 h-5" />
            New Experiment
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Experiments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">No experiments yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">Start a new experiment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">100</div>
            <p className="text-xs text-muted-foreground mt-1">Use AI features</p>
          </CardContent>
        </Card>
      </div>

      {/* Experiments Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Beaker className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Your Experiments</h2>
        </div>
        <ExperimentsGrid />
      </div>
    </div>
  );
}
