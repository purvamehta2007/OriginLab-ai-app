'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FieldGroup, FieldLabel } from '@/components/ui/field';

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation
      if (!formData.title.trim()) {
        toast.error('Please enter an experiment title');
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

        // Insert experiment
        const { data: experiment, error } = await supabase
          .from('experiments')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            hypothesis: formData.hypothesis,
            methodology: formData.methodology,
            status: 'draft',
          })
          .select()
          .single();

        if (error) {
          console.error('[v0] Error creating experiment:', error);
          toast.error('Failed to create experiment: ' + error.message);
          setLoading(false);
          return;
        }

        toast.success('Experiment created successfully!');
        router.push(`/dashboard/experiment/${experiment.id}`);
      } catch (err: any) {
        console.error('[v0] Unexpected error:', err);
        toast.error('An unexpected error occurred');
        setLoading(false);
      }
    },
    [formData, router]
  );

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Experiment</h1>
          <p className="text-muted-foreground mt-1">Define your research question and initial parameters</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Experiment Details</CardTitle>
          <CardDescription>
            Start with the basics. You can refine these details later and let AI help with the planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <FieldGroup>
              <FieldLabel htmlFor="title">Experiment Title *</FieldLabel>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Effect of Temperature on Enzyme Activity"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </FieldGroup>

            {/* Description */}
            <FieldGroup>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief overview of your experiment..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                rows={3}
              />
            </FieldGroup>

            {/* Hypothesis */}
            <FieldGroup>
              <FieldLabel htmlFor="hypothesis">Hypothesis</FieldLabel>
              <Textarea
                id="hypothesis"
                name="hypothesis"
                placeholder="State your hypothesis clearly..."
                value={formData.hypothesis}
                onChange={handleChange}
                disabled={loading}
                rows={3}
              />
            </FieldGroup>

            {/* Methodology */}
            <FieldGroup>
              <FieldLabel htmlFor="methodology">Methodology (Optional)</FieldLabel>
              <Textarea
                id="methodology"
                name="methodology"
                placeholder="Initial thoughts on methodology. AI can help refine this..."
                value={formData.methodology}
                onChange={handleChange}
                disabled={loading}
                rows={3}
              />
            </FieldGroup>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Link href="/dashboard">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Create Experiment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
