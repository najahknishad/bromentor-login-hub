-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'support', 'admin');

-- Create enum for doubt status
CREATE TYPE public.doubt_status AS ENUM ('submitted', 'in_progress', 'resolved', 'closed', 'escalated');

-- Create enum for badge types
CREATE TYPE public.badge_type AS ENUM (
  'verified_doubt', 
  'learning_streak', 
  'complex_solver',
  'fast_resolution',
  'high_satisfaction',
  'complex_handler'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create modules table
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create doubts table
CREATE TABLE public.doubts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_support_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  status doubt_status DEFAULT 'submitted',
  priority integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  closed_at timestamptz,
  escalated_at timestamptz,
  reopened_count integer DEFAULT 0,
  sla_deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id uuid REFERENCES public.doubts(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_name text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create doubt_responses table
CREATE TABLE public.doubt_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id uuid REFERENCES public.doubts(id) ON DELETE CASCADE NOT NULL,
  responder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  response_text text,
  response_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  badge_type badge_type NOT NULL,
  icon_url text,
  for_role app_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at timestamptz DEFAULT now(),
  awarded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  doubt_id uuid REFERENCES public.doubts(id) ON DELETE SET NULL,
  UNIQUE (user_id, badge_id, doubt_id)
);

-- Create engagement_tracking table
CREATE TABLE public.engagement_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  learning_minutes integer DEFAULT 0,
  doubts_submitted integer DEFAULT 0,
  doubts_resolved integer DEFAULT 0,
  self_research_count integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  doubt_id uuid REFERENCES public.doubts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default role as student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doubts_updated_at
  BEFORE UPDATE ON public.doubts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for courses, modules, topics (read-only for all authenticated users)
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view modules"
  ON public.modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage modules"
  ON public.modules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view topics"
  ON public.topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage topics"
  ON public.topics FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for doubts
CREATE POLICY "Students can view their own doubts"
  ON public.doubts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR public.has_role(auth.uid(), 'support')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Students can create doubts"
  ON public.doubts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own doubts"
  ON public.doubts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = student_id
    OR public.has_role(auth.uid(), 'support')
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments for doubts they can access"
  ON public.attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.doubts
      WHERE doubts.id = attachments.doubt_id
        AND (
          doubts.student_id = auth.uid()
          OR public.has_role(auth.uid(), 'support')
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

CREATE POLICY "Users can insert attachments for their doubts"
  ON public.attachments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- RLS Policies for doubt_responses
CREATE POLICY "Users can view responses for accessible doubts"
  ON public.doubt_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.doubts
      WHERE doubts.id = doubt_responses.doubt_id
        AND (
          doubts.student_id = auth.uid()
          OR public.has_role(auth.uid(), 'support')
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

CREATE POLICY "Support and admins can create responses"
  ON public.doubt_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'support')
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_badges
CREATE POLICY "Users can view all user badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Support and admins can award badges"
  ON public.user_badges FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'support')
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for engagement_tracking
CREATE POLICY "Users can view their own engagement"
  ON public.engagement_tracking FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can manage their own engagement"
  ON public.engagement_tracking FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);