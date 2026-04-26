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
  draft: { label: 'Draft', color: 'secondary' as const, icon: Clock },
  planning: { label: 'Planning', color: 'default' as const, icon: Brain },
  in_progress: { label: 'In Progress', color: 'outline' as const, icon: FlaskConical },
  completed: { label: 'Completed', color: 'outline' as const, icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'destructive' as const, icon: AlertCircle },
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
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate plan');
      }

      const text = await response.text();
      const parsed = JSON.parse(text);
      setPlan(parsed);

      // Update status to 'planning'
      const supabase = createClient();
      await supabase
        .from('experiments')
        .update({ status: 'planning', updated_at: new Date().toISOString() })
        .eq('id', experiment.id);

      setExperiment((prev) => prev ? { ...prev, status: 'planning' } : prev);
      toast.success('Experiment plan generated!');
    } catch (err: any) {
      console.error('[v0] Plan error:', err);
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
          // treat raw data as plain text
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
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate analysis');
      }

      const text = await response.text();
      const parsed = JSON.parse(text);
      setAnalysis(parsed);

      // Mark experiment as completed
      const supabase = createClient();
      await supabase
        .from('experiments')
        .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', experiment.id);

      setExperiment((prev) => prev ? { ...prev, status: 'completed' } : prev);
      toast.success('Analysis complete!');
    } catch (err: any) {
      console.error('[v0] Analysis error:', err);
      toast.error(err.message || 'Failed to generate analysis');
    } finally {
      setGeneratingAnalysis(false);
    }
  }, [experiment, rawData, notes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!experiment) return null;

  const statusCfg = STATUS_CONFIG[experiment.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-foreground">{experiment.title}</h1>
            <Badge variant={statusCfg.color} className="gap-1">
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Created {new Date(experiment.created_at).toLocaleDateString()} ·{' '}
            Updated {new Date(experiment.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Experiment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" /> Experiment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiment.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-foreground">{experiment.description}</p>
            </div>
          )}
          {experiment.hypothesis && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Hypothesis</p>
              <p className="text-foreground">{experiment.hypothesis}</p>
            </div>
          )}
          {experiment.methodology && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Methodology</p>
              <p className="text-foreground">{experiment.methodology}</p>
            </div>
          )}
          {!experiment.description && !experiment.hypothesis && !experiment.methodology && (
            <p className="text-muted-foreground text-sm italic">No details provided yet.</p>
          )}
        </CardContent>
      </Card>

      {/* AI Plan Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" /> AI Experiment Plan
          </CardTitle>
          <CardDescription>
            Let AI generate a step-by-step experimental plan based on your details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!plan ? (
            <Button onClick={handleGeneratePlan} disabled={generatingPlan} className="gap-2">
              {generatingPlan ? (
                <><Loader className="w-4 h-4 animate-spin" /> Generating Plan…</>
              ) : (
                <><Brain className="w-4 h-4" /> Generate Experiment Plan</>
              )}
            </Button>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Duration</p>
                  <p className="font-semibold">{plan.estimated_total_duration} min</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Steps</p>
                  <p className="font-semibold">{plan.steps.length}</p>
                </div>
              </div>

              {plan.equipment_needed.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Equipment Needed</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {plan.equipment_needed.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              {plan.safety_considerations.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-amber-600">⚠ Safety Considerations</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {plan.safety_considerations.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-3">Steps</p>
                <div className="space-y-3">
                  {plan.steps.map((step) => (
                    <div key={step.step_number} className="flex gap-3 p-3 border border-border rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                        {step.step_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{step.step_title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{step.step_description}</p>
                        {step.expected_duration && (
                          <p className="text-xs text-muted-foreground mt-1">⏱ {step.expected_duration} min</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={handleGeneratePlan} disabled={generatingPlan} className="gap-2">
                {generatingPlan ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Regenerate Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> AI Data Analysis
          </CardTitle>
          <CardDescription>
            Paste your experimental data and notes, then let AI analyze the results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!analysis ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Experimental Data (JSON or text)</label>
                <Textarea
                  placeholder={'{"measurements": [1.2, 1.5, 1.3], "control": [0.9, 1.0, 0.95]}'}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  placeholder="Any observations, anomalies, or context about the experiment…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleGenerateAnalysis} disabled={generatingAnalysis} className="gap-2">
                {generatingAnalysis ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Analyzing…</>
                ) : (
                  <><BarChart3 className="w-4 h-4" /> Analyze Results</>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 bg-muted/40 rounded-lg">
                <p className="text-sm font-medium mb-1">Summary</p>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>

              {/* Hypothesis Result */}
              {analysis.success_metrics.hypothesis_supported !== null && (
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  {analysis.success_metrics.hypothesis_supported ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      Hypothesis {analysis.success_metrics.hypothesis_supported ? 'Supported' : 'Not Supported'}
                    </p>
                    {analysis.success_metrics.confidence_score !== null && (
                      <p className="text-xs text-muted-foreground">
                        Confidence: {Math.round(analysis.success_metrics.confidence_score * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {analysis.key_findings.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Key Findings</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.key_findings.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}

              {/* Statistical Insights */}
              {analysis.statistical_insights.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Statistical Insights</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.statistical_insights.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Recommendations</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {analysis.next_steps.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Next Steps</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.next_steps.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </div>
              )}

              {/* Limitations */}
              {analysis.limitations.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-amber-600">⚠ Limitations</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.limitations.map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                </div>
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
