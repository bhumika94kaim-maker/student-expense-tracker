-- ==============================================================================
-- PennyWise - Seed Data for Demo Account (demo@pennywise.app)
-- 
-- PREREQUISITE:
-- 1. First, create the user "demo@pennywise.app" via the app Sign Up page
--    (Password e.g. Demo@1234, Name: "Demo Student") OR in Supabase Dashboard.
-- 2. Then, run this script in the Supabase SQL Editor.
-- ==============================================================================

DO $$
DECLARE
  v_demo_email TEXT := 'demo@pennywise.app';
  v_user_id UUID;
  v_current_month DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_last_month DATE := (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month')::DATE;
  v_budget_curr UUID;
  v_budget_prev UUID;
  v_cat_food UUID;
  v_cat_travel UUID;
  v_cat_rent UUID;
  v_cat_shopping UUID;
  v_cat_bills UUID;
  v_cat_health UUID;
  v_cat_education UUID;
  v_cat_entertainment UUID;
  v_cat_other UUID;
BEGIN
  -- Look up user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_demo_email LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Demo user (%) was not found in auth.users.', v_demo_email;
    RAISE NOTICE 'Please sign up with email "%" first, then re-run this seed script.', v_demo_email;
    RETURN;
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, full_name, currency)
  VALUES (v_user_id, 'Demo Student', 'INR')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Demo Student', currency = 'INR';

  -- Ensure default categories exist and grab their IDs
  INSERT INTO public.categories (user_id, name, icon, is_default)
  VALUES
    (v_user_id, 'Food', '🍔', TRUE),
    (v_user_id, 'Travel', '🚌', TRUE),
    (v_user_id, 'Rent', '🏠', TRUE),
    (v_user_id, 'Shopping', '🛍️', TRUE),
    (v_user_id, 'Bills', '⚡', TRUE),
    (v_user_id, 'Health', '💊', TRUE),
    (v_user_id, 'Education', '📚', TRUE),
    (v_user_id, 'Entertainment', '🎬', TRUE),
    (v_user_id, 'Other', '📦', TRUE)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_food FROM public.categories WHERE user_id = v_user_id AND name = 'Food';
  SELECT id INTO v_cat_travel FROM public.categories WHERE user_id = v_user_id AND name = 'Travel';
  SELECT id INTO v_cat_rent FROM public.categories WHERE user_id = v_user_id AND name = 'Rent';
  SELECT id INTO v_cat_shopping FROM public.categories WHERE user_id = v_user_id AND name = 'Shopping';
  SELECT id INTO v_cat_bills FROM public.categories WHERE user_id = v_user_id AND name = 'Bills';
  SELECT id INTO v_cat_health FROM public.categories WHERE user_id = v_user_id AND name = 'Health';
  SELECT id INTO v_cat_education FROM public.categories WHERE user_id = v_user_id AND name = 'Education';
  SELECT id INTO v_cat_entertainment FROM public.categories WHERE user_id = v_user_id AND name = 'Entertainment';
  SELECT id INTO v_cat_other FROM public.categories WHERE user_id = v_user_id AND name = 'Other';

  -- Clean previous sample transactions and budgets for clean re-seeding
  DELETE FROM public.transactions WHERE user_id = v_user_id;
  DELETE FROM public.budgets WHERE user_id = v_user_id;

  -- 1. Budgets for Current and Last Month
  INSERT INTO public.budgets (user_id, month, total_budget)
  VALUES
    (v_user_id, v_current_month, 14000)
  RETURNING id INTO v_budget_curr;

  INSERT INTO public.budgets (user_id, month, total_budget)
  VALUES
    (v_user_id, v_last_month, 13500)
  RETURNING id INTO v_budget_prev;

  -- Category limits for current month (Total 14,000)
  INSERT INTO public.category_budgets (budget_id, category_id, limit_amount)
  VALUES
    (v_budget_curr, v_cat_food, 4500),
    (v_budget_curr, v_cat_rent, 4000),
    (v_budget_curr, v_cat_travel, 1800),
    (v_budget_curr, v_cat_education, 1200),
    (v_budget_curr, v_cat_bills, 1000),
    (v_budget_curr, v_cat_entertainment, 800),
    (v_budget_curr, v_cat_shopping, 700);

  -- Category limits for previous month (Total 13,500)
  INSERT INTO public.category_budgets (budget_id, category_id, limit_amount)
  VALUES
    (v_budget_prev, v_cat_food, 4200),
    (v_budget_prev, v_cat_rent, 4000),
    (v_budget_prev, v_cat_travel, 1800),
    (v_budget_prev, v_cat_education, 1200),
    (v_budget_prev, v_cat_bills, 1000),
    (v_budget_prev, v_cat_entertainment, 800),
    (v_budget_prev, v_cat_shopping, 500);

  -- 2. Transactions for Current Month
  -- Income
  INSERT INTO public.transactions (user_id, type, category_id, amount, description, date, payment_method, is_recurring)
  VALUES
    (v_user_id, 'income', NULL, 12000, 'Monthly Parents Allowance', v_current_month + 1, 'Net Banking', TRUE),
    (v_user_id, 'income', NULL, 3500, 'Freelance Web Design Gig', v_current_month + 8, 'UPI', FALSE),
    (v_user_id, 'income', NULL, 1500, 'Junior Tutoring Fees', v_current_month + 10, 'Cash', FALSE);

  -- Expenses (Current Month)
  INSERT INTO public.transactions (user_id, type, category_id, amount, description, date, payment_method, is_recurring)
  VALUES
    (v_user_id, 'expense', v_cat_rent, 4000, 'Shared Hostel Room Rent', v_current_month + 2, 'UPI', TRUE),
    (v_user_id, 'expense', v_cat_food, 3200, 'Hostel Mess Monthly Advance', v_current_month + 3, 'UPI', TRUE),
    (v_user_id, 'expense', v_cat_travel, 1200, 'City Bus Student Pass', v_current_month + 4, 'Card', TRUE),
    (v_user_id, 'expense', v_cat_bills, 699, 'Hostel Wi-Fi & Mobile Recharge', v_current_month + 5, 'UPI', TRUE),
    (v_user_id, 'expense', v_cat_education, 480, 'Operating Systems Reference Textbook Xerox', v_current_month + 6, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_food, 180, 'Canteen Burger and Cold Coffee', v_current_month + 7, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_food, 240, 'Evening Shawarma with Project Group', v_current_month + 8, 'Cash', FALSE),
    (v_user_id, 'expense', v_cat_travel, 200, 'Auto rickshaw to railway station', v_current_month + 9, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_entertainment, 450, 'Weekend Movie Ticket & Popcorn', v_current_month + 9, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_shopping, 620, 'College Fest Merchandise T-Shirt', v_current_month + 10, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_food, 520, 'Pizza treat after assignment submission', v_current_month + 11, 'Card', FALSE),
    (v_user_id, 'expense', v_cat_health, 190, 'Cough syrup & Paracetamol', v_current_month + 11, 'Cash', FALSE),
    (v_user_id, 'expense', v_cat_food, 220, 'Chai and Maggie at Tapri (Group study)', v_current_month + 12, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_education, 350, 'OST Lab Assignment Printouts & Spiral Binding', v_current_month + 12, 'Cash', FALSE);

  -- 3. Transactions for Previous Month (To populate historical graphs & savings)
  -- Income (Previous Month)
  INSERT INTO public.transactions (user_id, type, category_id, amount, description, date, payment_method, is_recurring)
  VALUES
    (v_user_id, 'income', NULL, 12000, 'Monthly Parents Allowance', v_last_month + 1, 'Net Banking', TRUE),
    (v_user_id, 'income', NULL, 2000, 'Frontend bug fix bounty', v_last_month + 15, 'UPI', FALSE);

  -- Expenses (Previous Month - Total spent: ₹11,350 out of ₹13,500 budget = ₹2,150 savings)
  INSERT INTO public.transactions (user_id, type, category_id, amount, description, date, payment_method, is_recurring)
  VALUES
    (v_user_id, 'expense', v_cat_rent, 4000, 'Shared Hostel Room Rent', v_last_month + 2, 'UPI', TRUE),
    (v_user_id, 'expense', v_cat_food, 3100, 'Mess Fees', v_last_month + 3, 'UPI', TRUE),
    (v_user_id, 'expense', v_cat_travel, 1200, 'City Bus Student Pass', v_last_month + 4, 'Card', TRUE),
    (v_user_id, 'expense', v_cat_bills, 750, 'Shared Electricity & Water', v_last_month + 5, 'UPI', TRUE),
    (v_user_id, 'expense', v_cat_education, 600, 'Database Engineering Notes & Notebooks', v_last_month + 8, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_food, 450, 'College Canteen Snacks', v_last_month + 12, 'Cash', FALSE),
    (v_user_id, 'expense', v_cat_entertainment, 450, 'Cinema outing', v_last_month + 18, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_shopping, 480, 'College Notebooks & Stationery', v_last_month + 22, 'UPI', FALSE),
    (v_user_id, 'expense', v_cat_health, 320, 'First aid and vitamins', v_last_month + 25, 'Cash', FALSE);

  RAISE NOTICE 'Demo user data seeded successfully for %!', v_demo_email;
END;
$$;
