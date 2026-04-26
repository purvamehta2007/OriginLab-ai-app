import { z } from 'zod';

// Common patterns
export const UUIDSchema = z.string().uuid('Invalid UUID format');
export const EmailSchema = z.string().email('Invalid email format');
export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

// Experiment schemas
export const CreateExperimentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  hypothesis: z.string().max(2000, 'Hypothesis too long').optional().nullable(),
  methodology: z.string().max(2000, 'Methodology too long').optional().nullable(),
});

export const UpdateExperimentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  hypothesis: z.string().max(2000, 'Hypothesis too long').optional().nullable(),
  methodology: z.string().max(2000, 'Methodology too long').optional().nullable(),
  status: z.enum(['draft', 'planning', 'in_progress', 'completed', 'failed']).optional(),
});

export const ExperimentPlanSchema = z.object({
  experimentId: UUIDSchema,
  title: z.string(),
  description: z.string().optional(),
  hypothesis: z.string().optional(),
  methodology: z.string().optional(),
});

export const ExperimentAnalysisSchema = z.object({
  experimentId: UUIDSchema,
  title: z.string(),
  hypothesis: z.string().optional(),
  raw_data: z.record(z.any()).optional(),
  processed_data: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export const ExperimentProgressSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  progress_percentage: z.number().min(0).max(100).optional(),
  error_message: z.string().optional().nullable(),
  run_id: z.string().uuid().optional(),
});

// Results schemas
export const ExperimentResultSchema = z.object({
  experimentId: UUIDSchema,
  runId: UUIDSchema,
  raw_data: z.record(z.any()).optional(),
  processed_data: z.record(z.any()).optional(),
  success: z.boolean().optional(),
  data_quality_score: z.number().min(0).max(1).optional(),
  notes: z.string().max(5000).optional(),
});

// User schemas
export const UserProfileSchema = z.object({
  display_name: z.string().max(255).optional(),
});

// Auth schemas
export const SignUpSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string(),
});

// Export types for convenience
export type CreateExperiment = z.infer<typeof CreateExperimentSchema>;
export type UpdateExperiment = z.infer<typeof UpdateExperimentSchema>;
export type ExperimentPlan = z.infer<typeof ExperimentPlanSchema>;
export type ExperimentAnalysis = z.infer<typeof ExperimentAnalysisSchema>;
export type ExperimentProgress = z.infer<typeof ExperimentProgressSchema>;
export type ExperimentResult = z.infer<typeof ExperimentResultSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type SignUp = z.infer<typeof SignUpSchema>;
export type Login = z.infer<typeof LoginSchema>;

// Helper function to parse and validate
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }

  return result.data;
}
