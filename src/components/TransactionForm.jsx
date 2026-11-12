import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { getCategories, addCategory } from '../services/transactions'
import { todayString } from '../utils/dates'
import { isValidAmount } from '../utils/validators'

const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'Net Banking']

// Form to add or edit a transaction
// If `initial` is passed, it pre-fills the form for editing
export default function TransactionForm({ initial, onSubmit, onCancel, loading }) {
  const [type, setType] = useState(initial?.type || 'expense')
  const [categoryId, setCategoryId] = useState(initial?.category_id || '')
  const [amount, setAmount] = useState(initial?.amount || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [date, setDate] = useState(initial?.date || todayString())
  const [paymentMethod, setPaymentMethod] = useState(initial?.payment_method || 'UPI')
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring || false)
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [addingCat, setAddingCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📦')

  // Load categories from the database
  useEffect(() => {
    getCategories().then(({ data }) => {
      setCategories(data || [])
      // Set default category if none selected
      if (!initial?.category_id && data?.length > 0) {
        setCategoryId(data[0].id)
      }
      setCatLoading(false)
    })
  }, [])

  function validate() {
    const e = {}
    if (!isValidAmount(amount)) e.amount = 'Enter a valid amount greater than 0'
    if (type === 'expense' && !categoryId) e.category = 'Please select a category for this expense'
    if (!date) e.date = 'Please pick a date'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit({
      type,
      category_id: categoryId || null,
      amount: parseFloat(amount),
      description: description.trim(),
      date,
      payment_method: paymentMethod,
      is_recurring: isRecurring,
    })
  }

  // Add a new custom category
  async function handleAddCategory() {
    if (!newCatName.trim()) return
    const { data, error } = await addCategory(newCatName.trim(), newCatIcon)
    if (!error && data) {
      setCategories(prev => [...prev, data])
      setCategoryId(data.id)
      setAddingCat(false)
      setNewCatName('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Income / Expense toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {['expense', 'income'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              type === t
                ? t === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-500 text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'expense' ? '− Expense' : '+ Income'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
        {catLoading ? (
          <div className="h-10 skeleton rounded-xl" />
        ) : (
          <select
            value={categoryId}
            onChange={e => {
              if (e.target.value === '__new__') {
                setAddingCat(true)
              } else {
                setCategoryId(e.target.value)
              }
            }}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
            <option value="__new__">+ Add custom category</option>
          </select>
        )}
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}

        {/* Add category inline form */}
        {addingCat && (
          <div className="mt-2 flex gap-2 items-center border border-blue-200 rounded-xl px-3 py-2 bg-blue-50">
            <input
              type="text"
              value={newCatIcon}
              onChange={e => setNewCatIcon(e.target.value)}
              className="w-10 text-center border border-slate-200 rounded-lg p-1 text-sm bg-white"
              maxLength={2}
              placeholder="📦"
            />
            <input
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Category name"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              onClick={() => setAddingCat(false)}
              className="text-slate-400 hover:text-slate-600 text-sm px-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What was this for?"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date and Payment Method side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment</label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {PAYMENT_METHODS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recurring toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setIsRecurring(v => !v)}
          className={`w-10 h-5 rounded-full transition-colors ${isRecurring ? 'bg-blue-600' : 'bg-slate-200'} flex items-center px-0.5`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isRecurring ? 'translate-x-5' : ''}`} />
        </div>
        <span className="text-sm text-slate-600">Mark as recurring</span>
      </label>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving...' : initial ? 'Update' : 'Add Transaction'}
        </button>
      </div>
    </form>
  )
}
