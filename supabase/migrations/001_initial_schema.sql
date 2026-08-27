-- ============================================================
-- 3Digree: Full Supabase Migration
-- MongoDB → PostgreSQL
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ======================== EXTENSIONS ========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- ======================== PROFILES ========================
-- Linked to auth.users (Supabase Auth manages email/password)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'secondaryAdmin')),
  is_active BOOLEAN DEFAULT TRUE,
  google_id TEXT UNIQUE,
  profile_picture TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  auth_provider TEXT DEFAULT 'local' CHECK (auth_provider IN ('local', 'google')),
  credits INTEGER DEFAULT 0 CHECK (credits >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ======================== TEMPLATES ========================
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  live_demo TEXT,
  template_link TEXT,
  preview_image TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN ('portfolio', 'ecommerce', 'blog', 'business', 'other')),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  with_backend BOOLEAN DEFAULT FALSE,
  credits_required INTEGER DEFAULT 1 CHECK (credits_required >= 1),
  whats_included JSONB DEFAULT '{"title": "What''s Included", "items": [], "customItems": []}',
  template_info JSONB DEFAULT '{"title": "Template Information", "details": []}',
  development_process JSONB DEFAULT '{"title": "", "steps": []}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_active ON public.templates(is_active);
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_backend ON public.templates(with_backend);
CREATE INDEX idx_templates_display_id ON public.templates(display_id);
CREATE INDEX idx_templates_name_desc ON public.templates USING gin(to_tsvector('english', name || ' ' || description));

-- Auto-generate display_id like #3di-XXXXXX
CREATE OR REPLACE FUNCTION generate_template_display_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.display_id := '#3di-' || substring(replace(NEW.id::text, '-', '') from 27 for 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_template_display_id
  BEFORE INSERT ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION generate_template_display_id();

-- Auto-set credits_required based on with_backend
CREATE OR REPLACE FUNCTION auto_set_credits_required()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.with_backend = TRUE THEN
    NEW.credits_required := 4;
  ELSE
    NEW.credits_required := 1;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_credits
  BEFORE INSERT OR UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_credits_required();

-- ======================== WEBSITE BOOKINGS ========================
CREATE TABLE public.website_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_display_id TEXT NOT NULL,
  template_id UUID NOT NULL REFERENCES public.templates(id),
  template_name TEXT NOT NULL,
  template_image TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1 CHECK (credits_used >= 1),
  status TEXT NOT NULL DEFAULT 'purchased' CHECK (status IN (
    'purchased', 'approved', 'inprogress', 'readyforcompletion', 'completed'
  )),
  progress INTEGER DEFAULT 10 CHECK (progress >= 0 AND progress <= 100),
  approved_at TIMESTAMPTZ,
  estimated_completion_at TIMESTAMPTZ,
  preview_link TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wb_user_status ON public.website_bookings(user_id, status);
CREATE INDEX idx_wb_approved ON public.website_bookings(approved_at);
CREATE INDEX idx_wb_created ON public.website_bookings(created_at DESC);

-- ======================== TEMPLATE BOOKINGS (Legacy) ========================
CREATE TABLE public.template_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id),
  template_name TEXT NOT NULL,
  template_price NUMERIC NOT NULL CHECK (template_price >= 0),

  -- Meeting
  meeting_scheduled_date TIMESTAMPTZ,
  meeting_scheduled_time TEXT,
  meeting_link TEXT,
  meeting_status TEXT DEFAULT 'scheduled' CHECK (meeting_status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  meeting_notes TEXT DEFAULT '',
  additional_requirements TEXT DEFAULT '',

  -- Payment
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  paid_amount NUMERIC DEFAULT 0 CHECK (paid_amount >= 0),
  payment_percentage NUMERIC DEFAULT 0 CHECK (payment_percentage >= 0 AND payment_percentage <= 100),
  partial_payment_id TEXT,
  final_payment_id TEXT,
  razorpay_orders JSONB DEFAULT '[]',

  -- Development
  dev_stage TEXT DEFAULT 'not_started' CHECK (dev_stage IN ('not_started', 'in_progress', 'review', 'completed')),
  dev_started_at TIMESTAMPTZ,
  dev_completed_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  dev_progress INTEGER DEFAULT 0 CHECK (dev_progress >= 0 AND dev_progress <= 100),
  developer_notes TEXT DEFAULT '',

  -- Website URLs
  preview_url TEXT,
  final_url TEXT,
  download_url TEXT,

  -- Admin
  assigned_admin UUID REFERENCES public.profiles(id),
  payment_percentage_set BOOLEAN DEFAULT FALSE,
  payment_percentage_set_at TIMESTAMPTZ,
  payment_percentage_set_by UUID REFERENCES public.profiles(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'meeting_scheduled' CHECK (status IN (
    'meeting_scheduled', 'meeting_completed', 'partial_payment_pending',
    'partial_payment_done', 'development_in_progress', 'website_ready',
    'final_payment_pending', 'completed', 'cancelled'
  )),

  -- Communications
  communications JSONB DEFAULT '[]',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tb_user_status ON public.template_bookings(user_id, status);
CREATE INDEX idx_tb_template ON public.template_bookings(template_id, created_at DESC);
CREATE INDEX idx_tb_meeting_date ON public.template_bookings(meeting_scheduled_date);
CREATE INDEX idx_tb_dev_stage ON public.template_bookings(dev_stage);
CREATE INDEX idx_tb_created ON public.template_bookings(created_at DESC);

-- ======================== MEETINGS ========================
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id),
  title TEXT NOT NULL,
  description TEXT,
  preferred_date TIMESTAMPTZ,
  preferred_time TEXT,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'scheduled', 'completed', 'cancelled', 'no-show')),
  scheduled_date TIMESTAMPTZ,
  scheduled_time TEXT,
  meeting_link TEXT,
  admin_notes TEXT,
  scheduled_by UUID REFERENCES public.profiles(id),
  reschedule_reason TEXT,
  rescheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_user ON public.meetings(user_id);
CREATE INDEX idx_meetings_status ON public.meetings(status);
CREATE INDEX idx_meetings_scheduled ON public.meetings(scheduled_date);

-- ======================== PLAN PURCHASES ========================
CREATE TABLE public.plan_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('Starter', 'Growth', 'Scale', 'Single Website')),
  plan_price NUMERIC NOT NULL CHECK (plan_price >= 0),
  credits_received INTEGER NOT NULL CHECK (credits_received >= 1),

  -- Payment
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  payment_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',

  -- Status
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'processing', 'completed', 'failed', 'refunded')),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  gateway_response JSONB DEFAULT '{}',
  credits_applied BOOLEAN DEFAULT FALSE,
  credits_applied_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pp_user ON public.plan_purchases(user_id, created_at DESC);
CREATE INDEX idx_pp_order ON public.plan_purchases(razorpay_order_id);
CREATE INDEX idx_pp_payment ON public.plan_purchases(razorpay_payment_id);
CREATE INDEX idx_pp_status ON public.plan_purchases(status);

-- ======================== PAYMENTS ========================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.template_bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Razorpay
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,

  -- Details
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'INR',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('partial', 'final')),
  payment_percentage NUMERIC CHECK (payment_percentage >= 0 AND payment_percentage <= 100),

  -- Status
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'processing', 'completed', 'failed', 'refunded')),
  gateway_response JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON public.payments(booking_id, payment_type);
CREATE INDEX idx_payments_user ON public.payments(user_id, created_at DESC);
CREATE INDEX idx_payments_razorpay ON public.payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- ======================== CHATS ========================
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.website_bookings(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_booking ON public.chats(booking_id);
CREATE INDEX idx_chat_messages_chat ON public.chat_messages(chat_id, created_at);

-- Update last_message_at on new message
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chat_last_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_message();

-- ======================== CAREERS ========================
CREATE TABLE public.careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  time_period TEXT,
  experience TEXT NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate job_id like 3di001
CREATE OR REPLACE FUNCTION generate_job_id()
RETURNS TRIGGER AS $$
DECLARE
  count_val INTEGER;
BEGIN
  IF NEW.job_id IS NULL OR NEW.job_id = '' THEN
    SELECT COUNT(*) + 1 INTO count_val FROM public.careers;
    NEW.job_id := '3di' || lpad(count_val::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_job_id
  BEFORE INSERT ON public.careers
  FOR EACH ROW
  EXECUTE FUNCTION generate_job_id();

-- ======================== JOB APPLICATIONS ========================
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, email)
);

CREATE INDEX idx_ja_job ON public.job_applications(job_id, created_at DESC);

-- ======================== NOTIFICATIONS ========================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- ======================== TUTORIAL INTERACTIONS ========================
CREATE TABLE public.tutorial_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('yes', 'no')),
  videos_watched INTEGER[] DEFAULT '{}',
  total_videos_watched INTEGER DEFAULT 0,
  last_video_watched INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  session_id TEXT,
  device_info TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ti_user ON public.tutorial_interactions(user_id, started_at DESC);
CREATE INDEX idx_ti_action ON public.tutorial_interactions(action);

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Purchase website: atomic credit deduction + booking creation
CREATE OR REPLACE FUNCTION purchase_website(
  p_user_id UUID,
  p_template_display_id TEXT,
  p_template_id UUID,
  p_template_name TEXT,
  p_template_image TEXT,
  p_credits_required INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_user_credits INTEGER;
  v_booking_id UUID;
  v_remaining_credits INTEGER;
BEGIN
  -- Lock user row for update
  SELECT credits INTO v_user_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_user_credits IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  IF v_user_credits < p_credits_required THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('Insufficient credits. Required: %s, Available: %s', p_credits_required, v_user_credits),
      'required', p_credits_required,
      'available', v_user_credits
    );
  END IF;

  -- Deduct credits
  UPDATE public.profiles
  SET credits = credits - p_credits_required
  WHERE id = p_user_id
  RETURNING credits INTO v_remaining_credits;

  -- Create booking
  INSERT INTO public.website_bookings (
    user_id, template_display_id, template_id,
    template_name, template_image, credits_used,
    status, progress, purchased_at
  ) VALUES (
    p_user_id, p_template_display_id, p_template_id,
    p_template_name, p_template_image, p_credits_required,
    'purchased', 10, NOW()
  ) RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'remaining_credits', v_remaining_credits,
    'credits_deducted', p_credits_required
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply plan credits: atomic payment verify + credit add
CREATE OR REPLACE FUNCTION apply_plan_credits(
  p_purchase_id UUID,
  p_user_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_gateway_response JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_purchase RECORD;
  v_new_credits INTEGER;
BEGIN
  -- Lock purchase row
  SELECT * INTO v_purchase
  FROM public.plan_purchases
  WHERE id = p_purchase_id AND user_id = p_user_id AND status = 'created'
  FOR UPDATE;

  IF v_purchase IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Purchase record not found or already processed');
  END IF;

  -- Update purchase record
  UPDATE public.plan_purchases
  SET
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    status = 'completed',
    is_verified = TRUE,
    verified_at = NOW(),
    gateway_response = p_gateway_response,
    credits_applied = TRUE,
    credits_applied_at = NOW(),
    updated_at = NOW()
  WHERE id = p_purchase_id;

  -- Add credits to user
  UPDATE public.profiles
  SET credits = credits + v_purchase.credits_received
  WHERE id = p_user_id
  RETURNING credits INTO v_new_credits;

  RETURN jsonb_build_object(
    'success', true,
    'credits_received', v_purchase.credits_received,
    'new_balance', v_new_credits,
    'plan_type', v_purchase.plan_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_templates', (SELECT COUNT(*) FROM public.templates),
    'total_website_bookings', (SELECT COUNT(*) FROM public.website_bookings),
    'total_template_bookings', (SELECT COUNT(*) FROM public.template_bookings),
    'purchased_bookings', (SELECT COUNT(*) FROM public.website_bookings WHERE status = 'purchased'),
    'inprogress_bookings', (SELECT COUNT(*) FROM public.website_bookings WHERE status IN ('approved', 'inprogress', 'readyforcompletion')),
    'completed_bookings', (SELECT COUNT(*) FROM public.website_bookings WHERE status = 'completed'),
    'total_revenue', (SELECT COALESCE(SUM(plan_price), 0) FROM public.plan_purchases WHERE status = 'completed'),
    'active_users', (SELECT COUNT(*) FROM public.profiles WHERE is_active = TRUE),
    'admin_count', (SELECT COUNT(*) FROM public.profiles WHERE role IN ('admin', 'secondaryAdmin'))
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP (Trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, auth_provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE
      WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
      ELSE 'local'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_interactions ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'secondaryAdmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ---- PROFILES ----
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (is_admin());

-- ---- TEMPLATES ----
CREATE POLICY "Anyone can view active templates"
  ON public.templates FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can insert templates"
  ON public.templates FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update templates"
  ON public.templates FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete templates"
  ON public.templates FOR DELETE
  USING (is_admin());

-- ---- WEBSITE BOOKINGS ----
CREATE POLICY "Users can view own bookings"
  ON public.website_bookings FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Authenticated users can create bookings"
  ON public.website_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update bookings"
  ON public.website_bookings FOR UPDATE
  USING (is_admin());

-- ---- TEMPLATE BOOKINGS ----
CREATE POLICY "Users can view own template bookings"
  ON public.template_bookings FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create template bookings"
  ON public.template_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update template bookings"
  ON public.template_bookings FOR UPDATE
  USING (is_admin());

-- ---- MEETINGS ----
CREATE POLICY "Users can view own meetings"
  ON public.meetings FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update meetings"
  ON public.meetings FOR UPDATE
  USING (is_admin());

-- ---- PLAN PURCHASES ----
CREATE POLICY "Users can view own purchases"
  ON public.plan_purchases FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create purchases"
  ON public.plan_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---- PAYMENTS ----
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---- CHATS ----
CREATE POLICY "Users can view own chats"
  ON public.chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.website_bookings wb
      WHERE wb.id = booking_id AND (wb.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can create chats for own bookings"
  ON public.chats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.website_bookings wb
      WHERE wb.id = booking_id AND (wb.user_id = auth.uid() OR is_admin())
    )
  );

-- ---- CHAT MESSAGES ----
CREATE POLICY "Users can view messages in own chats"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats c
      JOIN public.website_bookings wb ON wb.id = c.booking_id
      WHERE c.id = chat_id AND (wb.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can send messages in own chats"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chats c
      JOIN public.website_bookings wb ON wb.id = c.booking_id
      WHERE c.id = chat_id AND (wb.user_id = auth.uid() OR is_admin())
    )
  );

-- ---- CAREERS ----
CREATE POLICY "Anyone can view active careers"
  ON public.careers FOR SELECT
  USING (is_active = TRUE AND expiry_date > NOW() OR is_admin());

CREATE POLICY "Admins can manage careers"
  ON public.careers FOR ALL
  USING (is_admin());

-- ---- JOB APPLICATIONS ----
CREATE POLICY "Anyone can submit applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view applications"
  ON public.job_applications FOR SELECT
  USING (is_admin());

-- ---- NOTIFICATIONS ----
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ---- TUTORIAL INTERACTIONS ----
CREATE POLICY "Users can view own interactions"
  ON public.tutorial_interactions FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create interactions"
  ON public.tutorial_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON public.tutorial_interactions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- CRON JOB: Progress Updater (replaces node-cron)
-- Runs every 54 minutes, updates website booking progress
-- ============================================================
CREATE OR REPLACE FUNCTION update_booking_progress()
RETURNS void AS $$
DECLARE
  v_booking RECORD;
  v_elapsed_minutes INTEGER;
  v_new_progress INTEGER;
BEGIN
  FOR v_booking IN
    SELECT id, approved_at, progress, status
    FROM public.website_bookings
    WHERE status IN ('approved', 'inprogress')
      AND progress < 90
      AND approved_at IS NOT NULL
  LOOP
    v_elapsed_minutes := EXTRACT(EPOCH FROM (NOW() - v_booking.approved_at)) / 60;
    v_new_progress := LEAST(10 + FLOOR(v_elapsed_minutes / 54.0), 90);

    IF v_new_progress > v_booking.progress THEN
      UPDATE public.website_bookings
      SET
        progress = v_new_progress,
        status = CASE
          WHEN v_new_progress >= 90 THEN 'readyforcompletion'
          WHEN v_new_progress > 10 THEN 'inprogress'
          ELSE status
        END,
        updated_at = NOW()
      WHERE id = v_booking.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the cron job (every 54 minutes)
SELECT cron.schedule(
  'update-booking-progress',
  '*/54 * * * *',
  $$SELECT update_booking_progress()$$
);

-- ============================================================
-- DONE! All tables, functions, triggers, RLS policies created.
-- ============================================================
