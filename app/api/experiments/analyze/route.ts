import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  InternalServerError,
  handleError,
} from '@/lib/errors';
import { ExperimentAnalysisSchema } from '@/lib/validation';

const AnalysisSchema = z.object({
  summary: z.string(),
  key_findings: z.array(z.string()),
  statistical_insights: z.array(z.string()),
  success_metrics: z.object({
    hypothesis_supported: z.boolean().nullable(),
    confidence_score: z.number().nullable(),
  }),
  recommendations: z.array(z.string()),
  next_steps: z.array(z.string()),
  limitations: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      throw new ValidationError('Invalid JSON in request body');
    }

    const validatedInput = ExperimentAnalysisSchema.safeParse(body);
    if (!validatedInput.success) {
      const errors = validatedInput.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new ValidationError('Invalid input', { errors });
    }

    const { experimentId, title, hypothesis, raw_data, processed_data, notes } = validatedInput.data;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { data: experiment, error: expError } = await supabase
      .from('experiments')
      .select('id, user_id')
      .eq('id', experimentId)
      .single();

    if (expError) {
      console.error('[analyze] Database error:', expError);
      throw new InternalServerError('Failed to fetch experiment');
    }

    if (!experiment || experiment.user_id !== user.id) {
      throw new NotFoundError('Experiment not found or unauthorized');
    }

    const prompt = `You are a scientific data analyst. Analyze the following experimental results:

Experiment: ${title}
Hypothesis: ${hypothesis || 'Not provided'}

Raw Data:
${JSON.stringify(raw_data || {}, null, 2)}

Processed Data:
${JSON.stringify(processed_data || {}, null, 2)}

Notes: ${notes || 'None provided'}

Provide a comprehensive analysis including:
1. A clear summary of what the data shows
2. Key findings from the data
3. Statistical insights (averages, trends, significant differences)
4. Whether the data supports the hypothesis and with what confidence
5. Actionable recommendations based on findings
6. Suggested next steps for further research
7. Limitations and potential sources of error

Be thorough, scientific, and practical.`;

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: AnalysisSchema,
      prompt,
      system: 'You are a scientific data analyst. Provide rigorous, evidence-based analysis. Be specific and quantitative where possible.',
    });

    // Persist analysis report to database
    const { error: reportError } = await supabase.from('analysis_reports').insert({
      experiment_id: experimentId,
      user_id: user.id,
      analysis_type: 'final_analysis',
      summary: result.object.summary,
      key_findings: result.object.key_findings,
      recommendations: result.object.recommendations.join('\n'),
      confidence_score: result.object.success_metrics.confidence_score,
    });

    if (reportError) console.error('[analyze] Failed to persist analysis report:', reportError);

    // Update experiment status
    await supabase
      .from('experiments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', experimentId);

    return NextResponse.json(result.object);
  } catch (error) {
    return handleError(error);
  }
}
