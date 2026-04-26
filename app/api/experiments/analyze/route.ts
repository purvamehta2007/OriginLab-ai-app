import { streamText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
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
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (err) {
      throw new ValidationError('Invalid JSON in request body');
    }

    // Validate input
    const validatedInput = ExperimentAnalysisSchema.safeParse(body);
    if (!validatedInput.success) {
      const errors = validatedInput.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new ValidationError('Invalid input', { errors });
    }

    const {
      experimentId,
      title,
      hypothesis,
      raw_data,
      processed_data,
      notes,
    } = validatedInput.data;

    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('[v0] Auth error:', authError);
      throw new AuthenticationError();
    }

    if (!user) {
      throw new AuthenticationError('User not authenticated');
    }

    // Verify experiment belongs to user
    const { data: experiment, error: expError } = await supabase
      .from('experiments')
      .select('id, user_id')
      .eq('id', experimentId)
      .single();

    if (expError) {
      console.error('[v0] Database error:', expError);
      throw new InternalServerError('Failed to fetch experiment');
    }

    if (!experiment || experiment.user_id !== user.id) {
      throw new NotFoundError('Experiment not found or unauthorized');
    }

    // Create prompt for AI analysis
    const prompt = `You are a scientific data analyst. Analyze the following experimental results and provide insights:

Experiment: ${title}
Hypothesis: ${hypothesis || 'Not provided'}

Raw Data:
${JSON.stringify(raw_data || {}, null, 2)}

Processed Data:
${JSON.stringify(processed_data || {}, null, 2)}

Notes: ${notes || 'None provided'}

Provide a comprehensive analysis including:
1. Summary of findings
2. Key observations
3. Statistical insights
4. Whether the hypothesis is supported
5. Recommendations for future work
6. Suggested next steps
7. Limitations of the study

Be thorough, scientific, and practical in your analysis.`;

    const result = await streamText({
      model: openai('gpt-4o'),
      prompt,
      output: Output.object({
        schema: AnalysisSchema,
      }),
      system: 'You are a scientific data analyst. Provide rigorous, evidence-based analysis. Return valid JSON only.',
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    return handleError(error);
  }
}
