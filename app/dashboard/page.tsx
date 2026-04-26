'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Stats {
  total: number;
  inProgress: number;
  completed: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
            inProgress: data.filter((e) => e.status === 'in_progress').length,
            completed: data.filter((e) => e.status === 'completed').length,
          });
        }
      }

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
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
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
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total === 0 ? 'No experiments yet' : `${stats.total} experiment${stats.total !== 1 ? 's' : ''} created`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.inProgress === 0 ? 'Start a new experiment' : `${stats.inProgress} running`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed === 0 ? 'None completed yet' : `${stats.completed} finished`}
            </p>
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

