# PennyWise – Student Expense & Budget Tracker

A full-stack, mobile-friendly student expense and budget tracking web application built for our 2nd-year B.Tech IT college project (Open Source Technologies subject).

## 🚀 Overview

Students often struggle to track daily pocket money, mess expenses, transportation, and course materials. **PennyWise** is designed specifically to help college students budget realistically, monitor spending habits, and build monthly savings habits with real-time feedback.

## 🛠️ Tech Stack

- **Frontend**: React 19 (Vite), JavaScript, Tailwind CSS v4, React Router v7, Recharts, Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Custom RPC Functions, Database Triggers)
- **Deployment**: Vercel (SPA rewrite configuration via `vercel.json`)

## 📋 Features

- **Authentication**: Email & Password auth via Supabase with instantaneous login (email confirmation disabled for grading).
- **Dashboard**: Real-time summary cards (Income, Expenses, Balance, Budget Remaining, Savings), quick transaction entry, search, filter, sort, and server-side pagination.
- **Budget Planner**: 2-step monthly budget allocation with sliders, remaining unallocated calculations, and animated progress bars (Blue < 80%, Amber 80–99%, Red 100%+).
- **Visual Analytics**: Interactive Recharts graphs (Spending over time, Category donut chart, Income vs Expense grouped bars), category overspending callouts, and month-by-month savings trends.
- **Settings**: Manage profile details, currency preferences, and secure data reset.
- **Resilient UX**: Polished loading skeletons, empty states, and offline/error states with retry buttons.

## 💻 Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bhumika94kaim-maker/student-expense-tracker.git
   cd student-expense-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase project URL and Anon key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```
