import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  InternalServerError,
  handleError,
} from '@/lib/errors';
import { ExperimentProgressSchema } from '@/lib/validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ experimentId: string }> }
) {
  try {
    const { experimentId } = await params;

    // Validate experiment ID
    if (!experimentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(experimentId)) {
      throw new ValidationError('Invalid experiment ID format');
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (err) {
      throw new ValidationError('Invalid JSON in request body');
    }

    // Validate input
    const validatedInput = ExperimentProgressSchema.safeParse(body);
    if (!validatedInput.success) {
      const errors = validatedInput.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new ValidationError('Invalid input', { errors });
    }

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
      .select('id, user_id, started_at')
      .eq('id', experimentId)
      .single();

    if (expError) {
      console.error('[v0] Database error:', expError);
      throw new InternalServerError('Failed to fetch experiment');
    }

    if (!experiment || experiment.user_id !== user.id) {
      throw new NotFoundError('Experiment not found or unauthorized');
    }

    const { status, progress_percentage, error_message, run_id } = validatedInput.data;

    // Update experiment status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (status === 'in_progress' && !experiment.started_at) {
      updateData.started_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('experiments')
      .update(updateData)
      .eq('id', experimentId);

    if (updateError) {
      console.error('[v0] Database error updating experiment:', updateError);
      throw new InternalServerError('Failed to update experiment');
    }

    // Update experiment run if provided
    if (run_id) {
      const runUpdate: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (progress_percentage !== undefined) {
        runUpdate.progress_percentage = progress_percentage;
      }

      if (error_message) {
        runUpdate.error_message = error_message;
      }

      if (status === 'completed') {
        runUpdate.completed_at = new Date().toISOString();
      }

      const { error: runError } = await supabase
        .from('experiment_runs')
        .update(runUpdate)
        .eq('id', run_id)
        .eq('user_id', user.id);

      if (runError) {
        console.error('[v0] Error updating experiment run:', runError);
        // Don't throw - run update is non-critical
      }
    }

    return NextResponse.json({
      success: true,
      experimentId,
      status,
      progress_percentage,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ experimentId: string }> }
) {
  try {
    const { experimentId } = await params;

    // Validate experiment ID
    if (!experimentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(experimentId)) {
      throw new ValidationError('Invalid experiment ID format');
    }

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

    // Get experiment with runs
    const { data: experiment, error: expError } = await supabase
      .from('experiments')
      .select(`
        *,
        experiment_runs (
          id,
          run_number,
          status,
          progress_percentage,
          started_at,
          completed_at,
          error_message
        )
      `)
      .eq('id', experimentId)
      .eq('experiment_runs.user_id', user.id)
      .single();

    if (expError) {
      console.error('[v0] Database error:', expError);
      throw new InternalServerError('Failed to fetch experiment');
    }

    if (!experiment || experiment.user_id !== user.id) {
      throw new NotFoundError('Experiment not found or unauthorized');
    }

    return NextResponse.json(experiment);
  } catch (error) {
    return handleError(error);
  }
}
