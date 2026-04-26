'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Beaker, TrendingUp, CheckCircle2, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { ExperimentsGrid } from '@/components/experiments-grid';

interface User {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; email?: string };
}

interface Stats {
  total: number;
  inProgress: number;
  completed: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as User || null);

      if (user) {
        const { data } = await supabase
          .from('experiments')
          .select('status')
          .eq('user_id', user.id);

        if (data) {
          setStats({
            total: data.length,
            inProgress: data.filter((e) => e.status === 'in_progress' || e.status === 'planning').length,
            completed: data.filter((e) => e.status === 'completed').length,
          });
        }
      }
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) return null;

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Researcher';

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your scientific experiments with AI assistance
          </p>
        </div>
        <Link href="/dashboard/experiment/new" className="shrink-0">
          <Button className="gap-2 w-full sm:w-auto" size="default">
            <Plus className="w-4 h-4" />
            New Experiment
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.total === 0 ? 'No experiments' : `experiment${stats.total !== 1 ? 's' : ''}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.inProgress === 0 ? 'None running' : 'in progress'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Done
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.completed === 0 ? 'None finished' : 'completed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Experiments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Your Experiments</h2>
          </div>
          {stats.total > 0 && (
            <Link href="/dashboard/experiments">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                View all
                <TrendingUp className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>
        <ExperimentsGrid />
      </div>
    </div>
  );
}
