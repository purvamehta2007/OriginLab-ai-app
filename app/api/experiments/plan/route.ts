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
    let body;
    try {
      body = await request.json();
    } catch (err) {
      throw new ValidationError('Invalid JSON in request body');
    }

    const validatedInput = ExperimentPlanSchema.safeParse(body);
    if (!validatedInput.success) {
      const errors = validatedInput.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new ValidationError('Invalid input', { errors });
    }

    const { experimentId, title, description, hypothesis, methodology } = validatedInput.data;

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
      console.error('[plan] Database error:', expError);
      throw new InternalServerError('Failed to fetch experiment');
    }

    if (!experiment || experiment.user_id !== user.id) {
      throw new NotFoundError('Experiment not found or unauthorized');
    }

    const prompt = `You are a scientific research expert. Generate a detailed experimental plan for:

Title: ${title}
Description: ${description || 'Not provided'}
Hypothesis: ${hypothesis || 'Not provided'}
Methodology Notes: ${methodology || 'Not provided'}

Create a structured experimental plan with:
1. Clear step-by-step procedures (4-8 steps)
2. Realistic time estimates for each step (in minutes)
3. Required equipment and resources
4. Safety considerations specific to this experiment
5. Practical, actionable instructions`;

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: PlanSchema,
      prompt,
      system: 'You are a scientific research expert providing detailed, practical experimental plans. Be specific and thorough.',
    });

    // Persist plan steps to the database
    const planSteps = result.object.steps.map((step) => ({
      experiment_id: experimentId,
      user_id: user.id,
      step_number: step.step_number,
      step_title: step.step_title,
      step_description: step.step_description,
      expected_duration: step.expected_duration,
      required_resources: step.required_resources,
    }));

    await supabase.from('experiment_plans').delete().eq('experiment_id', experimentId);

    if (planSteps.length > 0) {
      const { error: insertError } = await supabase.from('experiment_plans').insert(planSteps);
      if (insertError) console.error('[plan] Failed to persist plan steps:', insertError);
    }

    // Update experiment status to planning
    await supabase
      .from('experiments')
      .update({ status: 'planning', updated_at: new Date().toISOString() })
      .eq('id', experimentId);

    return NextResponse.json(result.object);
  } catch (error) {
    return handleError(error);
  }
}
