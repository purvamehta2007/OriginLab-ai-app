'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader,
  Brain,
  BarChart3,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Microscope,
  Shield,
  Wrench,
  Timer,
  TrendingUp,
  Target,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface Experiment {
  id: string;
  title: string;
  description: string | null;
  hypothesis: string | null;
  methodology: string | null;
  status: 'draft' | 'planning' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface PlanStep {
  step_number: number;
  step_title: string;
  step_description: string;
  expected_duration: number | null;
  required_resources: string[] | null;
}

interface Plan {
  steps: PlanStep[];
  estimated_total_duration: number;
  safety_considerations: string[];
  equipment_needed: string[];
}

interface Analysis {
  summary: string;
  key_findings: string[];
  statistical_insights: string[];
  success_metrics: {
    hypothesis_supported: boolean | null;
    confidence_score: number | null;
  };
  recommendations: string[];
  next_steps: string[];
  limitations: string[];
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: Clock, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  planning: { label: 'Planning', icon: Brain, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  in_progress: { label: 'In Progress', icon: FlaskConical, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  failed: { label: 'Failed', icon: AlertCircle, className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

export default function ExperimentDetailPage() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const router = useRouter();

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [rawData, setRawData] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchExperiment = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', experimentId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        toast.error('Experiment not found');
        router.push('/dashboard');
        return;
      }

      setExperiment(data);
      setLoading(false);

      // Load saved plan steps from DB if any
      const { data: planSteps } = await supabase
        .from('experiment_plans')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('step_number', { ascending: true });

      if (planSteps && planSteps.length > 0) {
        const totalDuration = planSteps.reduce(
          (sum: number, s: PlanStep & { expected_duration: number | null }) =>
            sum + (s.expected_duration || 0),
          0
        );
        setPlan({
          steps: planSteps,
          estimated_total_duration: totalDuration,
          safety_considerations: [],
          equipment_needed: [],
        });
      }
    };

    fetchExperiment();
  }, [experimentId, router]);

  const handleGeneratePlan = useCallback(async () => {
    if (!experiment) return;
    setGeneratingPlan(true);

    try {
      const response = await fetch('/api/experiments/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId: experiment.id,
          title: experiment.title,
          description: experiment.description,
          hypothesis: experiment.hypothesis,
          methodology: experiment.methodology,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to generate plan';
        try {
          const err = await response.json();
          errMsg = err.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const parsed: Plan = await response.json();
      setPlan(parsed);
      setExperiment((prev) => prev ? { ...prev, status: 'planning' } : prev);
      toast.success('Experiment plan generated!');
    } catch (err: any) {
      console.error('[plan] Error:', err);
      toast.error(err.message || 'Failed to generate plan');
    } finally {
      setGeneratingPlan(false);
    }
  }, [experiment]);

  const handleGenerateAnalysis = useCallback(async () => {
    if (!experiment) return;
    setGeneratingAnalysis(true);

    try {
      let parsedData: Record<string, unknown> = {};
      if (rawData.trim()) {
        try {
          parsedData = JSON.parse(rawData);
        } catch {
          parsedData = { raw_text: rawData };
        }
      }

      const response = await fetch('/api/experiments/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId: experiment.id,
          title: experiment.title,
          hypothesis: experiment.hypothesis,
          raw_data: parsedData,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to generate analysis';
        try {
          const err = await response.json();
          errMsg = err.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const parsed: Analysis = await response.json();
      setAnalysis(parsed);
      setExperiment((prev) => prev ? { ...prev, status: 'completed' } : prev);
      toast.success('Analysis complete!');
    } catch (err: any) {
      console.error('[analyze] Error:', err);
      toast.error(err.message || 'Failed to generate analysis');
    } finally {
      setGeneratingAnalysis(false);
    }
  }, [experiment, rawData, notes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading experiment...</p>
        </div>
      </div>
    );
  }

  if (!experiment) return null;

  const statusCfg = STATUS_CONFIG[experiment.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{experiment.title}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.className}`}>
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Created {new Date(experiment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            {' · '}Updated {new Date(experiment.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Experiment Details */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Microscope className="w-4 h-4 text-primary" />
            </div>
            Experiment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {experiment.description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{experiment.description}</p>
            </div>
          )}
          {experiment.hypothesis && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Hypothesis</p>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-foreground leading-relaxed italic">"{experiment.hypothesis}"</p>
              </div>
            </div>
          )}
          {experiment.methodology && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Methodology</p>
              <p className="text-sm text-foreground leading-relaxed">{experiment.methodology}</p>
            </div>
          )}
          {!experiment.description && !experiment.hypothesis && !experiment.methodology && (
            <p className="text-sm text-muted-foreground italic">No details provided yet.</p>
          )}
        </CardContent>
      </Card>

      {/* AI Plan Generation */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            AI Experiment Plan
          </CardTitle>
          <CardDescription>
            Let AI generate a step-by-step experimental plan based on your details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!plan ? (
            <Button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              {generatingPlan ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating Plan…
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate Experiment Plan
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-5">
              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Total Duration</p>
                  </div>
                  <p className="font-bold text-foreground">{plan.estimated_total_duration} min</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Total Steps</p>
                  </div>
                  <p className="font-bold text-foreground">{plan.steps.length}</p>
                </div>
              </div>

              {plan.equipment_needed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equipment Needed</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.equipment_needed.map((e, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-muted text-xs text-foreground font-medium">{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {plan.safety_considerations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Safety Considerations</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 space-y-1">
                    {plan.safety_considerations.map((s, i) => (
                      <p key={i} className="text-sm text-amber-800 dark:text-amber-300 flex gap-2">
                        <span className="shrink-0">⚠</span>
                        <span>{s}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Steps</p>
                <div className="space-y-2">
                  {plan.steps.map((step) => (
                    <div key={step.step_number} className="flex gap-3 p-3.5 border border-border/60 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                        {step.step_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{step.step_title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{step.step_description}</p>
                        {step.expected_duration && (
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {step.expected_duration} min
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="gap-2"
              >
                {generatingPlan ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Regenerate Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            AI Data Analysis
          </CardTitle>
          <CardDescription>
            Paste your experimental data and notes, then let AI analyze the results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Experimental Data (JSON or plain text)
                </label>
                <Textarea
                  placeholder={'{"measurements": [1.2, 1.5, 1.3], "control": [0.9, 1.0, 0.95]}'}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  rows={5}
                  className="font-mono text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Any observations, anomalies, or context about the experiment…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={handleGenerateAnalysis}
                disabled={generatingAnalysis}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {generatingAnalysis ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Analyze Results
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</p>
                <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Hypothesis Result */}
              {analysis.success_metrics.hypothesis_supported !== null && (
                <div className={`flex items-center gap-3 p-3.5 border rounded-xl ${
                  analysis.success_metrics.hypothesis_supported
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                    : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
                }`}>
                  {analysis.success_metrics.hypothesis_supported ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${
                      analysis.success_metrics.hypothesis_supported
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      Hypothesis {analysis.success_metrics.hypothesis_supported ? 'Supported' : 'Not Supported'}
                    </p>
                    {analysis.success_metrics.confidence_score !== null && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Confidence: {Math.round(analysis.success_metrics.confidence_score * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {analysis.key_findings.length > 0 && (
                <AnalysisSection icon={<Target className="w-3.5 h-3.5 text-primary" />} title="Key Findings" items={analysis.key_findings} />
              )}

              {/* Statistical Insights */}
              {analysis.statistical_insights.length > 0 && (
                <AnalysisSection icon={<TrendingUp className="w-3.5 h-3.5 text-blue-500" />} title="Statistical Insights" items={analysis.statistical_insights} />
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <AnalysisSection icon={<ChevronRight className="w-3.5 h-3.5 text-emerald-500" />} title="Recommendations" items={analysis.recommendations} />
              )}

              {/* Next Steps */}
              {analysis.next_steps.length > 0 && (
                <AnalysisSection icon={<ChevronRight className="w-3.5 h-3.5 text-violet-500" />} title="Next Steps" items={analysis.next_steps} />
              )}

              {/* Limitations */}
              {analysis.limitations.length > 0 && (
                <AnalysisSection icon={<AlertCircle className="w-3.5 h-3.5 text-amber-500" />} title="Limitations" items={analysis.limitations} accent="amber" />
              )}

              <Button variant="outline" onClick={() => setAnalysis(null)} className="gap-2">
                <BarChart3 className="w-4 h-4" /> Run New Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalysisSection({
  icon,
  title,
  items,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  accent?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className={`text-xs font-semibold uppercase tracking-wider ${
          accent === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
        }`}>
          {title}
        </p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-foreground flex gap-2 leading-relaxed">
            <span className="text-muted-foreground shrink-0 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
