-- ==============================================================================
-- PennyWise - Student Expense & Budget Tracker Database Schema
-- Paste this entire file into the Supabase SQL Editor and click "Run".
-- Safe to re-run multiple times (idempotent).
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Card', 'Cash', 'Net Banking')) DEFAULT 'UPI',
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_budget NUMERIC NOT NULL CHECK (total_budget >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT budgets_user_month_unique UNIQUE (user_id, month)
);

-- 5. CATEGORY BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  limit_amount NUMERIC NOT NULL CHECK (limit_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cat_budget_unique UNIQUE (budget_id, category_id)
);

-- ==============================================================================
-- INDEXES FOR FAST QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets Policies
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Category Budgets Policies (Check ownership through parent budget)
DROP POLICY IF EXISTS "Users can view own category budgets" ON public.category_budgets;
CREATE POLICY "Users can view own category budgets" ON public.category_budgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.budgets b
      WHERE b.id = category_budgets.budget_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own category budgets" ON public.category_budgets;
CREATE POLICY "Users can insert own category budgets" ON public.category_budgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets b
      WHERE b.id = category_budgets.budget_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own category budgets" ON public.category_budgets;
CREATE POLICY "Users can update own category budgets" ON public.category_budgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.budgets b
      WHERE b.id = category_budgets.budget_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own category budgets" ON public.category_budgets;
CREATE POLICY "Users can delete own category budgets" ON public.category_budgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.budgets b
      WHERE b.id = category_budgets.budget_id AND b.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- TRIGGER FOR AUTOMATIC PROFILE & DEFAULT CATEGORIES SETUP ON SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (id, full_name, currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    'INR'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name;

  -- 2. Insert Default Categories for this user
  INSERT INTO public.categories (user_id, name, icon, is_default)
  VALUES
    (NEW.id, 'Food', '🍔', TRUE),
    (NEW.id, 'Travel', '🚌', TRUE),
    (NEW.id, 'Rent', '🏠', TRUE),
    (NEW.id, 'Shopping', '🛍️', TRUE),
    (NEW.id, 'Bills', '⚡', TRUE),
    (NEW.id, 'Health', '💊', TRUE),
    (NEW.id, 'Education', '📚', TRUE),
    (NEW.id, 'Entertainment', '🎬', TRUE),
    (NEW.id, 'Other', '📦', TRUE)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- RPC FUNCTION: dashboard_summary()
-- Callable via supabase.rpc('dashboard_summary')
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_month DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_next_month DATE := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::DATE;
  v_income NUMERIC := 0;
  v_expenses NUMERIC := 0;
  v_balance NUMERIC := 0;
  v_budget NUMERIC := NULL;
  v_budget_left NUMERIC := 0;
  v_savings_this_month NUMERIC := 0;
  v_total_savings NUMERIC := 0;
BEGIN
  -- Current month income
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM public.transactions
  WHERE user_id = v_user_id
    AND type = 'income'
    AND date >= v_current_month
    AND date < v_next_month;

  -- Current month expenses
  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM public.transactions
  WHERE user_id = v_user_id
    AND type = 'expense'
    AND date >= v_current_month
    AND date < v_next_month;

  -- Total balance (all-time income minus all-time expense)
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
  INTO v_balance
  FROM public.transactions
  WHERE user_id = v_user_id;

  -- Current month budget
  SELECT total_budget INTO v_budget
  FROM public.budgets
  WHERE user_id = v_user_id
    AND month = v_current_month;

  -- Budget left and savings this month
  IF v_budget IS NOT NULL THEN
    v_budget_left := GREATEST(0, v_budget - v_expenses);
    IF v_budget > v_expenses THEN
      v_savings_this_month := v_budget - v_expenses;
    ELSE
      v_savings_this_month := 0;
    END IF;
  ELSE
    v_budget_left := 0;
    v_savings_this_month := 0;
  END IF;

  -- Total all-time savings (sum of total_budget - total_expenses for months with a budget set)
  SELECT COALESCE(SUM(month_savings), 0) INTO v_total_savings
  FROM (
    SELECT
      GREATEST(0, b.total_budget - COALESCE(SUM(t.amount), 0)) AS month_savings
    FROM public.budgets b
    LEFT JOIN public.transactions t
      ON t.user_id = b.user_id
      AND t.type = 'expense'
      AND t.date >= b.month
      AND t.date < (b.month + INTERVAL '1 month')::DATE
    WHERE b.user_id = v_user_id
      AND b.month <= v_current_month
    GROUP BY b.id, b.total_budget
  ) s;

  RETURN jsonb_build_object(
    'income', v_income,
    'expenses', v_expenses,
    'balance', v_balance,
    'budget', COALESCE(v_budget, 0),
    'budget_left_this_month', v_budget_left,
    'savings_this_month', v_savings_this_month,
    'total_savings', v_total_savings
  );
END;
$$;

-- ==============================================================================
-- RPC FUNCTION: report_summary(p_period, p_date)
-- Callable via supabase.rpc('report_summary', { p_period: 'monthly', p_date: 'YYYY-MM-DD' })
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.report_summary(
  p_period TEXT DEFAULT 'monthly',
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_start_date DATE;
  v_end_date DATE;
  v_current_month_start DATE := date_trunc('month', p_date)::DATE;
  v_spending_over_time JSONB;
  v_category_totals JSONB;
  v_income_expense JSONB;
  v_category_overspending JSONB;
  v_total_income NUMERIC := 0;
  v_total_expense NUMERIC := 0;
  v_total_overspending NUMERIC := 0;
  v_days_over_budget INT := 0;
  v_budget NUMERIC := 0;
  v_savings NUMERIC := 0;
  v_daily_budget NUMERIC := 0;
BEGIN
  -- Determine date boundaries based on period
  IF p_period = 'daily' THEN
    v_start_date := p_date;
    v_end_date := p_date + INTERVAL '1 day';
  ELSIF p_period = 'weekly' THEN
    v_start_date := date_trunc('week', p_date)::DATE;
    v_end_date := (v_start_date + INTERVAL '7 days')::DATE;
  ELSE -- monthly
    v_start_date := date_trunc('month', p_date)::DATE;
    v_end_date := (v_start_date + INTERVAL '1 month')::DATE;
  END IF;

  -- Total income & expenses in period
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_total_income, v_total_expense
  FROM public.transactions
  WHERE user_id = v_user_id
    AND date >= v_start_date
    AND date < v_end_date;

  -- Spending over time (grouped by date)
  SELECT COALESCE(jsonb_agg(d ORDER BY d->>'date'), '[]'::JSONB)
  INTO v_spending_over_time
  FROM (
    SELECT
      to_char(date, 'YYYY-MM-DD') AS date,
      COALESCE(SUM(amount), 0) AS amount
    FROM public.transactions
    WHERE user_id = v_user_id
      AND type = 'expense'
      AND date >= v_start_date
      AND date < v_end_date
    GROUP BY date
  ) d;

  -- Category-wise totals & percentages
  SELECT COALESCE(jsonb_agg(c ORDER BY (c->>'total')::NUMERIC DESC), '[]'::JSONB)
  INTO v_category_totals
  FROM (
    SELECT
      COALESCE(cat.id::TEXT, 'other') AS category_id,
      COALESCE(cat.name, 'Uncategorized') AS name,
      COALESCE(cat.icon, '📦') AS icon,
      SUM(t.amount) AS total,
      CASE
        WHEN v_total_expense > 0 THEN ROUND((SUM(t.amount) / v_total_expense * 100), 1)
        ELSE 0
      END AS percentage
    FROM public.transactions t
    LEFT JOIN public.categories cat ON t.category_id = cat.id
    WHERE t.user_id = v_user_id
      AND t.type = 'expense'
      AND t.date >= v_start_date
      AND t.date < v_end_date
    GROUP BY cat.id, cat.name, cat.icon
  ) c;

  -- Overall Budget for month
  SELECT total_budget INTO v_budget
  FROM public.budgets
  WHERE user_id = v_user_id AND month = v_current_month_start;

  IF v_budget IS NOT NULL AND v_budget > v_total_expense THEN
    v_savings := v_budget - v_total_expense;
  ELSE
    v_savings := 0;
  END IF;

  -- Category overspending calculation
  SELECT
    COALESCE(jsonb_agg(ov ORDER BY (ov->>'over_amount')::NUMERIC DESC), '[]'::JSONB),
    COALESCE(SUM((ov->>'over_amount')::NUMERIC), 0)
  INTO v_category_overspending, v_total_overspending
  FROM (
    SELECT
      c.id AS category_id,
      c.name,
      c.icon,
      cb.limit_amount,
      COALESCE(SUM(t.amount), 0) AS spent,
      (COALESCE(SUM(t.amount), 0) - cb.limit_amount) AS over_amount
    FROM public.category_budgets cb
    JOIN public.budgets b ON cb.budget_id = b.id
    JOIN public.categories c ON cb.category_id = c.id
    LEFT JOIN public.transactions t
      ON t.category_id = c.id
      AND t.user_id = v_user_id
      AND t.type = 'expense'
      AND t.date >= v_start_date
      AND t.date < v_end_date
    WHERE b.user_id = v_user_id
      AND b.month = v_current_month_start
    GROUP BY c.id, c.name, c.icon, cb.limit_amount
    HAVING COALESCE(SUM(t.amount), 0) > cb.limit_amount
  ) ov;

  -- Days over daily budget threshold
  IF v_budget IS NOT NULL AND v_budget > 0 THEN
    v_daily_budget := v_budget / 30.0;
    SELECT COUNT(*) INTO v_days_over_budget
    FROM (
      SELECT date, SUM(amount) AS daily_spent
      FROM public.transactions
      WHERE user_id = v_user_id
        AND type = 'expense'
        AND date >= v_start_date
        AND date < v_end_date
      GROUP BY date
      HAVING SUM(amount) > v_daily_budget
    ) d;
  END IF;

  RETURN jsonb_build_object(
    'period', p_period,
    'start_date', v_start_date,
    'end_date', v_end_date,
    'total_income', v_total_income,
    'total_expense', v_total_expense,
    'savings', v_savings,
    'spending_over_time', v_spending_over_time,
    'category_totals', v_category_totals,
    'category_overspending', v_category_overspending,
    'total_overspending', v_total_overspending,
    'days_over_budget', v_days_over_budget
  );
END;
$$;

-- ==============================================================================
-- RPC FUNCTION: monthly_savings(p_months)
-- Callable via supabase.rpc('monthly_savings', { p_months: 6 })
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.monthly_savings(p_months INT DEFAULT 6)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(m) ORDER BY m.month_date ASC), '[]'::JSONB)
  INTO v_result
  FROM (
    SELECT
      to_char(b.month, 'Mon YYYY') AS month_label,
      b.month AS month_date,
      b.total_budget AS budget,
      COALESCE(SUM(t.amount), 0) AS spent,
      GREATEST(0, b.total_budget - COALESCE(SUM(t.amount), 0)) AS savings
    FROM public.budgets b
    LEFT JOIN public.transactions t
      ON t.user_id = b.user_id
      AND t.type = 'expense'
      AND t.date >= b.month
      AND t.date < (b.month + INTERVAL '1 month')::DATE
    WHERE b.user_id = v_user_id
      AND b.month >= (date_trunc('month', CURRENT_DATE) - ((p_months - 1) || ' months')::INTERVAL)::DATE
    GROUP BY b.id, b.month, b.total_budget
  ) m;

  RETURN v_result;
END;
$$;
