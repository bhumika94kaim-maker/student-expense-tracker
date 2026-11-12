import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ShieldCheck,
  IndianRupee,
  Plus,
  Sparkles,
  LogOut,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getGreeting } from '../utils/dates'
import { formatCurrency } from '../utils/formatCurrency'
import { getDashboardSummary } from '../services/reports'
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
} from '../services/transactions'
import SummaryCard from '../components/SummaryCard'
import TransactionList from '../components/TransactionList'
import TransactionForm from '../components/TransactionForm'
import Modal from '../components/Modal'
import Skeleton from '../components/Skeleton'
import ErrorState from '../components/ErrorState'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const greeting = getGreeting()

  // Summary state
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(null)

  // Transactions state
  const [transactions, setTransactions] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [txLoading, setTxLoading] = useState(true)
  const [txError, setTxError] = useState(null)

  // Categories list for dropdown and filters
  const [categories, setCategories] = useState([])

  // Filters state
  const [filters, setFilters] = useState({
    type: '',
    categoryId: '',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortDir: 'desc',
  })

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Load summary data from Supabase RPC
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    const { data, error } = await getDashboardSummary()
    if (error) {
      setSummaryError(error.message || 'Failed to load summary')
    } else {
      setSummary(data)
    }
    setSummaryLoading(false)
  }, [])

  // Load categories
  useEffect(() => {
    getCategories().then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  // Load transactions with current filters and pagination
  const loadTransactions = useCallback(async () => {
    setTxLoading(true)
    setTxError(null)
    const { data, count, error } = await getTransactions({
      page,
      type: filters.type,
      categoryId: filters.categoryId,
      search: filters.search,
      startDate: filters.startDate,
      endDate: filters.endDate,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    })

    if (error) {
      setTxError(error.message || 'Failed to load transactions')
    } else {
      setTransactions(data || [])
      setTotalCount(count || 0)
    }
    setTxLoading(false)
  }, [page, filters])

  // Initial load and whenever filters/page change
  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Handle filter changes (resets page to 0)
  function handleFilterChange(newFilters) {
    if (newFilters.page !== undefined) {
      setPage(newFilters.page)
    }
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }

  // Handle Add or Edit submit with Optimistic UI updates
  async function handleFormSubmit(formData) {
    setFormSubmitting(true)

    if (editingTx) {
      // --- OPTIMISTIC UPDATE ---
      const previousTransactions = [...transactions]
      const updatedCategory = categories.find((c) => c.id === formData.category_id)
      const optimisticUpdatedItem = {
        ...editingTx,
        ...formData,
        categories: updatedCategory
          ? { name: updatedCategory.name, icon: updatedCategory.icon }
          : editingTx.categories,
      }

      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTx.id ? optimisticUpdatedItem : t))
      )
      setIsModalOpen(false)
      setEditingTx(null)

      const { data, error } = await updateTransaction(editingTx.id, formData)
      if (error) {
        // Rollback on error
        setTransactions(previousTransactions)
        toast.error('Failed to update transaction. ' + (error.message || ''))
      } else {
        toast.success('Transaction updated successfully!')
        if (data) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === editingTx.id ? data : t))
          )
        }
        loadSummary()
      }
    } else {
      // --- OPTIMISTIC INSERT ---
      const previousTransactions = [...transactions]
      const previousSummary = summary ? { ...summary } : null
      const previousCount = totalCount

      const optimisticCategory = categories.find((c) => c.id === formData.category_id)
      const optimisticItem = {
        id: `temp-${Date.now()}`,
        ...formData,
        categories: optimisticCategory
          ? { name: optimisticCategory.name, icon: optimisticCategory.icon }
          : null,
      }

      // Prepend to current list
      setTransactions((prev) => [optimisticItem, ...prev.slice(0, pageSize - 1)])
      setTotalCount((prev) => prev + 1)

      // Optimistically update summary metrics
      if (summary) {
        const amt = parseFloat(formData.amount) || 0
        if (formData.type === 'expense') {
          setSummary((s) => ({
            ...s,
            expenses: (parseFloat(s.expenses) || 0) + amt,
            balance: (parseFloat(s.balance) || 0) - amt,
            budget_left_this_month: Math.max(0, (parseFloat(s.budget_left_this_month) || 0) - amt),
          }))
        } else {
          setSummary((s) => ({
            ...s,
            income: (parseFloat(s.income) || 0) + amt,
            balance: (parseFloat(s.balance) || 0) + amt,
          }))
        }
      }

      setIsModalOpen(false)

      const { data, error } = await addTransaction(formData)
      if (error) {
        // Rollback on error
        setTransactions(previousTransactions)
        setTotalCount(previousCount)
        setSummary(previousSummary)
        toast.error('Failed to add transaction. ' + (error.message || ''))
      } else {
        toast.success('Transaction logged successfully!')
        if (data) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === optimisticItem.id ? data : t))
          )
        }
        loadSummary()
      }
    }

    setFormSubmitting(false)
  }

  // Handle Delete with Optimistic UI update
  async function handleDelete(id) {
    const previousTransactions = [...transactions]
    const previousCount = totalCount
    const target = transactions.find((t) => t.id === id)

    // Optimistically remove
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))

    const { error } = await deleteTransaction(id)
    if (error) {
      setTransactions(previousTransactions)
      setTotalCount(previousCount)
      toast.error('Failed to delete transaction. ' + (error.message || ''))
    } else {
      toast.success('Transaction deleted.')
      loadSummary()
    }
  }

  // Open modal in edit mode
  function handleOpenEdit(tx) {
    setEditingTx(tx)
    setIsModalOpen(true)
  }

  // Open modal in create mode
  function handleOpenCreate() {
    setEditingTx(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting, Quick Actions & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs mb-1">
            <Sparkles size={14} />
            <span>{greeting}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {displayName}! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and manage your college pocket money and daily expenses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadSummary()
              loadTransactions()
            }}
            title="Refresh Data"
            className="p-2.5 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm shadow-blue-200 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Six Summary Cards Grid */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : summaryError ? (
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
          <ErrorState message={summaryError} onRetry={loadSummary} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* 1. Total Income */}
          <SummaryCard
            title="Total Income"
            value={formatCurrency(summary?.income || 0)}
            icon={<TrendingUp size={22} />}
            color="green"
            subtitle="Current month"
          />

          {/* 2. Total Expenses */}
          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(summary?.expenses || 0)}
            icon={<TrendingDown size={22} />}
            color="red"
            subtitle="Current month"
          />

          {/* 3. Balance */}
          <SummaryCard
            title="Balance"
            value={formatCurrency(summary?.balance || 0)}
            icon={<Wallet size={22} />}
            color="blue"
            subtitle="All-time net balance"
          />

          {/* 4. Budget Left This Month */}
          <SummaryCard
            title="Budget Left"
            value={formatCurrency(summary?.budget_left_this_month || 0)}
            icon={<PiggyBank size={22} />}
            color="navy"
            subtitle={
              summary?.budget
                ? `Limit: ${formatCurrency(summary.budget)}`
                : 'No budget set for this month'
            }
          />

          {/* 5. Savings This Month */}
          <SummaryCard
            title="Savings"
            value={formatCurrency(summary?.savings_this_month || 0)}
            icon={<ShieldCheck size={22} />}
            color="green"
            subtitle="Current month remaining"
          />

          {/* 6. Total Savings */}
          <SummaryCard
            title="Total Savings"
            value={formatCurrency(summary?.total_savings || 0)}
            icon={<IndianRupee size={22} />}
            color="blue"
            subtitle="Cumulative all-time"
          />
        </div>
      )}

      {/* Transactions Section */}
      {txError ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <ErrorState message={txError} onRetry={loadTransactions} />
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          categories={categories}
          loading={txLoading}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          filters={filters}
          onFilterChange={handleFilterChange}
          onPageChange={(newPage) => setPage(newPage)}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <Modal
          title={editingTx ? 'Edit Transaction' : 'Add New Transaction'}
          onClose={() => !formSubmitting && setIsModalOpen(false)}
        >
          <TransactionForm
            initial={editingTx}
            loading={formSubmitting}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  )
}
