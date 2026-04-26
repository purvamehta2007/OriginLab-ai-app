'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader, ArrowLeft, Beaker, Lightbulb, FlaskConical, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function NewExperimentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hypothesis: '',
    methodology: '',
  });

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title.trim()) {
        toast.error('Please enter an experiment title');
        return;
      }

      if (formData.title.trim().length < 3) {
        toast.error('Title must be at least 3 characters');
        return;
      }

      setLoading(true);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error('You must be logged in to create an experiment');
          router.push('/auth/login');
          return;
        }

        const { data: experiment, error } = await supabase
          .from('experiments')
          .insert({
            user_id: user.id,
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            hypothesis: formData.hypothesis.trim() || null,
            methodology: formData.methodology.trim() || null,
            status: 'draft',
          })
          .select()
          .single();

        if (error) {
          console.error('[new-experiment] Error creating experiment:', error);
          toast.error('Failed to create experiment: ' + error.message);
          setLoading(false);
          return;
        }

        toast.success('Experiment created!');
        router.push(`/dashboard/experiment/${experiment.id}`);
      } catch (err: any) {
        console.error('[new-experiment] Unexpected error:', err);
        toast.error('An unexpected error occurred');
        setLoading(false);
      }
    },
    [formData, router]
  );

  const fields = [
    {
      key: 'title' as const,
      label: 'Experiment Title',
      required: true,
      placeholder: 'e.g., Effect of Temperature on Enzyme Activity',
      icon: <Beaker className="w-3.5 h-3.5" />,
      type: 'input' as const,
    },
    {
      key: 'hypothesis' as const,
      label: 'Hypothesis',
      required: false,
      placeholder: 'State your hypothesis clearly — what do you expect to find and why?',
      icon: <Lightbulb className="w-3.5 h-3.5" />,
      type: 'textarea' as const,
      rows: 3,
    },
    {
      key: 'description' as const,
      label: 'Description',
      required: false,
      placeholder: 'Brief overview of your experiment and its goals…',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      type: 'textarea' as const,
      rows: 3,
    },
    {
      key: 'methodology' as const,
      label: 'Methodology',
      required: false,
      placeholder: 'Initial thoughts on methodology. AI can help refine and expand on this…',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      type: 'textarea' as const,
      rows: 3,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Experiment</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define your research question and initial parameters
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Experiment Details</CardTitle>
          <CardDescription>
            Start with the basics. AI will help you build out a detailed plan once created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label
                  htmlFor={field.key}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {field.icon}
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                </label>
                {field.type === 'input' ? (
                  <Input
                    id={field.key}
                    name={field.key}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={handleChange}
                    disabled={loading}
                    required={field.required}
                    className="h-10"
                  />
                ) : (
                  <Textarea
                    id={field.key}
                    name={field.key}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={handleChange}
                    disabled={loading}
                    rows={field.rows}
                    className="resize-none"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 justify-end pt-2">
              <Link href="/dashboard">
                <Button variant="outline" type="button" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="gap-2 min-w-36">
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Beaker className="w-4 h-4" />
                    Create Experiment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
