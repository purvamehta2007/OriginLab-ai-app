-- LabGenius AI Database Schema
-- This script creates the complete database structure for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  credits DECIMAL(10, 2) DEFAULT 100.00,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  methodology TEXT,
  expected_outcomes TEXT,
  status TEXT DEFAULT 'draft', -- draft, planning, in_progress, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Experiment runs table
CREATE TABLE IF NOT EXISTS experiment_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  run_number INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experiment_id, run_number)
);

-- Experiment results table
CREATE TABLE IF NOT EXISTS experiment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES experiment_runs(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_data JSONB,
  processed_data JSONB,
  success BOOLEAN,
  data_quality_score DECIMAL(3, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analysis reports table
CREATE TABLE IF NOT EXISTS analysis_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- initial_plan, progress_analysis, final_analysis
  content TEXT,
  summary TEXT,
  key_findings JSONB,
  recommendations TEXT,
  confidence_score DECIMAL(3, 2),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiment plans (AI-generated) table
CREATE TABLE IF NOT EXISTS experiment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  step_description TEXT,
  expected_duration INTEGER, -- in minutes
  required_resources TEXT[],
  step_status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experiment_id, step_number)
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- api_call, ai_analysis, experiment_run
  credits_used DECIMAL(10, 2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  related_experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_experiments_user_id ON experiments(user_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiment_runs_experiment_id ON experiment_runs(experiment_id);
CREATE INDEX idx_experiment_runs_status ON experiment_runs(status);
CREATE INDEX idx_experiment_results_run_id ON experiment_results(run_id);
CREATE INDEX idx_experiment_results_user_id ON experiment_results(user_id);
CREATE INDEX idx_analysis_reports_experiment_id ON analysis_reports(experiment_id);
CREATE INDEX idx_experiment_plans_experiment_id ON experiment_plans(experiment_id);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Auto-create a users row when a new Supabase auth user signs up
-- Without this, inserting experiments fails with a FK violation because
-- experiments.user_id references users.id (not auth.users.id directly).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for experiments table
CREATE POLICY "Users can view their own experiments"
  ON experiments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experiments"
  ON experiments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
  ON experiments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments"
  ON experiments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for experiment_runs table
CREATE POLICY "Users can view their own experiment runs"
  ON experiment_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert experiment runs"
  ON experiment_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiment runs"
  ON experiment_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for experiment_results table
CREATE POLICY "Users can view their own results"
  ON experiment_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON experiment_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analysis_reports table
CREATE POLICY "Users can view their own analysis reports"
  ON analysis_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert analysis reports"
  ON analysis_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for experiment_plans table
CREATE POLICY "Users can view their own experiment plans"
  ON experiment_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own plans"
  ON experiment_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON experiment_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for usage_logs table
CREATE POLICY "Users can view their own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiment_runs_updated_at BEFORE UPDATE ON experiment_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiment_results_updated_at BEFORE UPDATE ON experiment_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
