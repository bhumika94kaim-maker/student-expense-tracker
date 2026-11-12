import { useState } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Repeat
} from 'lucide-react'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dates'
import EmptyState from './EmptyState'
import Skeleton from './Skeleton'
import Modal from './Modal'

export default function TransactionList({
  transactions = [],
  categories = [],
  loading = false,
  page = 0,
  pageSize = 10,
  totalCount = 0,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startItem = totalCount === 0 ? 0 : page * pageSize + 1
  const endItem = Math.min((page + 1) * pageSize, totalCount)

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await onDelete(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header and Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
        {/* Top Row: Title + Quick Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
              placeholder="Search description..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 pt-1 text-xs">
          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={(e) => onFilterChange({ type: e.target.value, page: 0 })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="expense">Expenses only</option>
            <option value="income">Income only</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onFilterChange({ categoryId: e.target.value, page: 0 })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={`${filters.sortBy}-${filters.sortDir}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split('-')
              onFilterChange({ sortBy, sortDir, page: 0 })
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">Date (Newest first)</option>
            <option value="date-asc">Date (Oldest first)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
          </select>

          {/* Date range pickers */}
          <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange({ startDate: e.target.value, page: 0 })}
              className="bg-transparent text-slate-700 text-xs focus:outline-none w-28"
              title="Start Date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange({ endDate: e.target.value, page: 0 })}
              className="bg-transparent text-slate-700 text-xs focus:outline-none w-28"
              title="End Date"
            />
          </div>

          {/* Reset Filters button */}
          {(filters.search || filters.type || filters.categoryId || filters.startDate || filters.endDate) && (
            <button
              onClick={() =>
                onFilterChange({
                  search: '',
                  type: '',
                  categoryId: '',
                  startDate: '',
                  endDate: '',
                  sortBy: 'date',
                  sortDir: 'desc',
                  page: 0,
                })
              }
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area: Table on Desktop, Cards on Mobile */}
      {loading ? (
        <div className="p-5 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No transactions found"
            message={
              filters.search || filters.type || filters.categoryId || filters.startDate
                ? 'Try clearing your filters or changing your search terms.'
                : 'No transactions recorded yet. Click "Add Transaction" to log your first student expense!'
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income'
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">
                            {tx.description || (isIncome ? 'Income' : 'Expense')}
                          </span>
                          {tx.is_recurring && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600"
                              title="Recurring transaction"
                            >
                              <Repeat size={10} />
                              <span>Recurring</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <span>{tx.categories?.icon || (isIncome ? '💰' : '📦')}</span>
                          <span>{tx.categories?.name || (isIncome ? 'Income' : 'Other')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                          {tx.payment_method || 'UPI'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            isIncome ? 'text-emerald-600' : 'text-slate-800'
                          }`}
                        >
                          {isIncome ? '+' : '−'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEdit(tx)}
                            title="Edit transaction"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(tx)}
                            title="Delete transaction"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="md:hidden divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income'
              return (
                <div key={tx.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                        {tx.categories?.icon || (isIncome ? '💰' : '📦')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 leading-tight">
                          {tx.description || (isIncome ? 'Income' : 'Expense')}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>{formatDate(tx.date)}</span>
                          <span>•</span>
                          <span>{tx.payment_method || 'UPI'}</span>
                          {tx.is_recurring && (
                            <span className="inline-flex items-center text-blue-600 text-[10px]">
                              <Repeat size={10} className="mr-0.5" /> Rec
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`font-bold text-sm ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '−'}
                        {formatCurrency(tx.amount)}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tx)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls Footer */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{startItem}</span> to{' '}
              <span className="font-semibold text-slate-700">{endItem}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalCount}</span> transactions
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <span className="px-2 font-medium text-slate-600">
                Page {page + 1} of {totalPages}
              </span>

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page + 1 >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal title="Delete Transaction" onClose={() => !deleting && setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this transaction?
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
              <p>
                <strong className="text-slate-900">Description:</strong>{' '}
                {deleteTarget.description || deleteTarget.type}
              </p>
              <p>
                <strong className="text-slate-900">Amount:</strong>{' '}
                {formatCurrency(deleteTarget.amount)}
              </p>
              <p>
                <strong className="text-slate-900">Date:</strong> {formatDate(deleteTarget.date)}
              </p>
            </div>

            <p className="text-xs text-red-600">
              This action cannot be undone and will update your dashboard summary immediately.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
