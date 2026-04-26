'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, ArrowRight, Clock, Brain, FlaskConical, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
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

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    icon: Clock,
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
  planning: {
    label: 'Planning',
    icon: Brain,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  in_progress: {
    label: 'In Progress',
    icon: FlaskConical,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

export function ExperimentsGrid() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
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
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('[experiments-grid] Error fetching experiments:', error);
          toast.error('Failed to load experiments');
          setLoading(false);
          return;
        }

        setExperiments(data || []);
      } catch (err) {
        console.error('[experiments-grid] Unexpected error:', err);
        toast.error('Failed to load experiments');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-border/60">
            <CardHeader className="pb-3">
              <div className="h-5 bg-muted rounded-md w-3/4 mb-2" />
              <div className="h-3.5 bg-muted rounded-md w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-3.5 bg-muted rounded-md" />
              <div className="h-3.5 bg-muted rounded-md w-2/3" />
              <div className="h-8 bg-muted rounded-lg mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (experiments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Beaker className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No experiments yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Create your first experiment to get started with AI-powered scientific research
        </p>
        <Link href="/dashboard/experiment/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Experiment
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {experiments.map((experiment) => {
        const statusCfg = STATUS_CONFIG[experiment.status] || STATUS_CONFIG.draft;
        const StatusIcon = statusCfg.icon;
        return (
          <Link key={experiment.id} href={`/dashboard/experiment/${experiment.id}`}>
            <Card className="h-full border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                </div>
                <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
                  {experiment.title}
                </CardTitle>
                {experiment.description && (
                  <CardDescription className="mt-1 line-clamp-2 text-xs">
                    {experiment.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Updated {new Date(experiment.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
