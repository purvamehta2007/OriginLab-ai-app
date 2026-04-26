'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Empty } from '@/components/ui/empty';
import { Beaker, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Experiment {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'planning' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export function ExperimentsGrid() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiments = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[v0] Error fetching experiments:', error);
        toast.error('Failed to load experiments');
        setLoading(false);
        return;
      }

      setExperiments(data || []);
      setLoading(false);
    };

    fetchExperiments();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (experiments.length === 0) {
    return (
      <Empty
        icon={Beaker}
        title="No experiments yet"
        description="Create your first experiment to get started with AI-powered scientific research"
      />
    );
  }

  const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'planning':
        return 'default';
      case 'in_progress':
        return 'outline';
      case 'completed':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: Experiment['status']) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experiments.map((experiment) => (
        <Link key={experiment.id} href={`/dashboard/experiment/${experiment.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{experiment.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {experiment.description || 'No description'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant={getStatusColor(experiment.status)}>
                {getStatusLabel(experiment.status)}
              </Badge>
              <div className="text-xs text-muted-foreground">
                <p>Created {new Date(experiment.created_at).toLocaleDateString()}</p>
                <p>Updated {new Date(experiment.updated_at).toLocaleDateString()}</p>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                View Details <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
