import { IndianRupee, Database, KeyRound, Terminal, ExternalLink } from 'lucide-react'

// Shown when VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from .env
export default function SetupNeeded() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2.5 rounded-xl">
            <IndianRupee size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">PennyWise</h1>
            <p className="text-xs text-slate-500">Student Expense & Budget Tracker</p>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-blue-900 mb-1">
            Supabase Connection Required
          </h2>
          <p className="text-xs text-blue-700 leading-relaxed">
            PennyWise needs a free Supabase database to store your expenses, budgets, and user accounts.
            Follow these simple steps to connect your project:
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-4 mb-8">
          <li className="flex items-start gap-3 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center mt-0.5">
              1
            </span>
            <div>
              <p className="font-medium text-slate-800">Create a Supabase Project</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Go to{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
                >
                  supabase.com <ExternalLink size={12} />
                </a>{' '}
                and create a new free project.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center mt-0.5">
              2
            </span>
            <div>
              <p className="font-medium text-slate-800">Run the Database Schema</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Open the <strong className="text-slate-700">SQL Editor</strong> in Supabase, paste the contents of{' '}
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">supabase/schema.sql</code>, and click Run.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center mt-0.5">
              3
            </span>
            <div>
              <p className="font-medium text-slate-800">Copy Environment Variables</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Create a file named <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">.env</code> in the project root and add:
              </p>
              <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs mt-2 overflow-x-auto font-mono">
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
              </pre>
            </div>
          </li>

          <li className="flex items-start gap-3 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center mt-0.5">
              4
            </span>
            <div>
              <p className="font-medium text-slate-800">Restart the Dev Server</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Press <kbd className="bg-slate-100 px-1 rounded border text-[11px]">Ctrl+C</kbd> in your terminal and run <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">npm run dev</code> again.
              </p>
            </div>
          </li>
        </ol>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>College OST Subject Project</span>
          <span>B.Tech IT (2nd Year)</span>
        </div>
      </div>
    </div>
  )
}
