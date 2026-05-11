import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TYPE_COLORS } from '../components/ProblemList'

function HistoryPage({ showToast }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    let merged = []

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) {
        merged = data
      }
    } catch (err) {
      console.error('Supabase history fetch failed:', err)
    }

    // Merge local storage records
    try {
      const local = JSON.parse(localStorage.getItem('lldetective_history') || '[]')
      const localIds = new Set(merged.map((r) => r.created_at))
      const newLocals = local.filter((r) => !localIds.has(r.created_at))
      merged = [...merged, ...newLocals].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )
    } catch {}

    if (merged.length === 0) {
      setError('empty')
    } else {
      setRecords(merged)
    }
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <span className="text-6xl">🔍</span>
        <h2 className="text-xl font-bold text-deep-blue mt-4">还没有破案记录</h2>
        <p className="text-gray-400 mt-2">去挑战吧！选一道题开始你的侦探之旅</p>
        <div className="mt-6 w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/3 rounded-full"></div>
        </div>
      </div>
    )
  }

  const totalCount = records.length
  const correctCount = records.filter((r) => r.correct).length
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <span className="text-4xl">📋</span>
        <h2 className="text-xl font-bold text-deep-blue mt-2">破案记录</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
          <p className="text-xs text-gray-500 mt-1">总题数</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{correctCount}</p>
          <p className="text-xs text-gray-500 mt-1">正确数</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-deep-blue">{accuracy}%</p>
          <p className="text-xs text-gray-500 mt-1">正确率</p>
        </div>
      </div>

      {/* Record List */}
      <div className="space-y-3">
        {records.map((record, idx) => (
          <div
            key={record.id || `local-${idx}`}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">
                {formatDate(record.created_at)}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  record.correct
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {record.correct ? '✅ 正确' : '❌ 错误'}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              {record.problem_type && (
                <span
                  className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[record.problem_type] || '#6B7280' }}
                >
                  {record.problem_type}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {record.problem_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryPage
