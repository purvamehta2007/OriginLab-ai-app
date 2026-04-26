-- Fix: Add INSERT policy for users table so the trigger can create user rows
-- Without this, new signups fail because the trigger can't insert into public.users

-- Allow the system trigger to insert new user rows
CREATE POLICY "Allow trigger to insert user rows"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow service role to insert (for server-side operations)
-- This is needed when users.id doesn't exist yet but experiments.user_id references it

-- Also ensure experiment_plans has proper DELETE policy for regeneration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'experiment_plans' AND policyname = 'Users can delete their own plans'
  ) THEN
    CREATE POLICY "Users can delete their own plans"
      ON experiment_plans FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure analysis_reports has UPDATE policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'analysis_reports' AND policyname = 'Users can update their own analysis reports'
  ) THEN
    CREATE POLICY "Users can update their own analysis reports"
      ON analysis_reports FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
