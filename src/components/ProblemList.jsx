import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TYPE_COLORS = {
  '图形与几何': '#6366F1',
  '综合问题': '#6B7280',
  '和差问题': '#3B82F6',
  '和差倍问题': '#3B82F6',
  '周长围栏问题': '#059669',
  '周长与围栏问题': '#059669',
  '倍数关系': '#10B981',
  '行程问题': '#8B5CF6',
  '鸡兔同笼': '#EF4444',
  '归一问题': '#06B6D4',
  '归总问题': '#EC4899',
  '平均数问题': '#F97316',
  '植树问题': '#059669',
  '年龄问题': '#EAB308',
  '工程问题': '#6366F1',
  '方阵问题': '#6B7280',
  '分数应用题': '#F43F5E',
  '百分数应用题': '#D97706',
  '盈亏问题': '#7C3AED',
  '周期问题': '#14B8A6',
  '等量代换': '#F87171',
  '购物策略': '#FB923C',
}

function ProblemList({ currentGrade, onSelectProblem }) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const fetchProblems = async () => {
      try {
        const { data, error } = await supabase
          .from('problems')
          .select('*')
          .eq('grade', currentGrade)
          .order('created_at', { ascending: false })
          .limit(30)

        if (cancelled) return

        if (error) throw error
        setProblems(data || [])
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch problems:', err)
          setError('暂时无法加载题目，请检查数据库连接')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProblems()
    return () => { cancelled = true }
  }, [currentGrade])

  const renderStars = (difficulty) => {
    const num = Math.min(5, Math.max(1, Math.round(difficulty || 1)))
    return '⭐'.repeat(num)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-3">正在加载题库...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <span className="text-4xl">⚠️</span>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (problems.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl">📚</span>
        <p className="text-gray-500 mt-3">当前年级暂无题目</p>
        <p className="text-gray-400 text-sm mt-1">请先到 Supabase 的 problems 表添加题目数据</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {problems.map((problem) => (
        <button
          key={problem.id}
          onClick={() => onSelectProblem(problem)}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] p-4 text-left border border-gray-100 group"
        >
          {/* Type Tag */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-white text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[problem.type] || '#6B7280' }}
            >
              {problem.type}
            </span>
            <span className="text-sm">{renderStars(problem.difficulty)}</span>
          </div>

          {/* Problem Text */}
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 group-hover:text-deep-blue transition-colors">
            {problem.text}
          </p>
        </button>
      ))}
    </div>
  )
}

export default ProblemList
export { TYPE_COLORS }
