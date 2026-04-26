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
import { ExperimentPlanSchema } from '@/lib/validation';

const PlanSchema = z.object({
  steps: z.array(
    z.object({
      step_number: z.number(),
      step_title: z.string(),
      step_description: z.string(),
      expected_duration: z.number().nullable(),
      required_resources: z.array(z.string()).nullable(),
    })
  ),
  estimated_total_duration: z.number(),
  safety_considerations: z.array(z.string()),
  equipment_needed: z.array(z.string()),
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
    const validatedInput = ExperimentPlanSchema.safeParse(body);
    if (!validatedInput.success) {
      const errors = validatedInput.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new ValidationError('Invalid input', { errors });
    }

    const { experimentId, title, description, hypothesis, methodology } = validatedInput.data;

    // Check authentication
    const supabase = await createClient();
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

    // Create prompt for AI
    const prompt = `You are a scientific research expert. Generate a detailed experimental plan for the following research:

Title: ${title}
Description: ${description || 'Not provided'}
Hypothesis: ${hypothesis || 'Not provided'}
Methodology Notes: ${methodology || 'Not provided'}

Create a structured experimental plan with:
1. Clear step-by-step procedures
2. Realistic time estimates for each step
3. Required equipment and resources
4. Safety considerations
5. Potential challenges and solutions

Format your response as a detailed JSON plan that can be used to execute the experiment.`;

    const result = await streamText({
      model: openai('gpt-4o'),
      prompt,
      output: Output.object({
        schema: PlanSchema,
      }),
      system: 'You are a scientific research expert providing detailed, practical experimental plans. Return valid JSON only.',
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    return handleError(error);
  }
}
