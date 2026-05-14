import { useState, useEffect } from 'react'
import { TYPE_COLORS } from '../components/ProblemList'

function AnalyzePage({ problem, onStartGuide, onBack }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-20 h-20 animate-magnify-spin">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <circle cx="28" cy="28" r="18" fill="none" stroke="#F59E0B" strokeWidth="4" />
            <line x1="41" y1="41" x2="56" y2="56" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
            <circle cx="28" cy="28" r="8" fill="#FBBF24" opacity="0.5" />
          </svg>
        </div>
        <p className="text-deep-blue text-lg font-bold mt-6 animate-pulse">
          正在分析案情…
        </p>
        <p className="text-gray-400 text-sm mt-2">侦探正在仔细阅读题目...</p>
      </div>
    )
  }

  const typeColor = TYPE_COLORS[problem.type] || '#6B7280'

  let conditions = []
  if (problem.conditions && Array.isArray(problem.conditions)) {
    conditions = problem.conditions
  } else if (typeof problem.conditions === 'string') {
    try {
      conditions = JSON.parse(problem.conditions)
    } catch {
      conditions = [problem.conditions]
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <span className="text-4xl">🔎</span>
        <h2 className="text-xl font-bold text-deep-blue mt-2">案情分析</h2>
        <p className="text-gray-400 text-sm">看看这道题藏着什么线索</p>
      </div>

      {/* Type Tag + Difficulty */}
      <div className="flex items-center justify-center gap-3">
        <span
          className="text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md"
          style={{ backgroundColor: typeColor }}
        >
          {problem.type || '自定义题目'}
        </span>
        {problem.difficulty && (
          <span className="text-sm text-gray-500">
            {'⭐'.repeat(Math.min(5, Math.max(1, problem.difficulty)))}
          </span>
        )}
        {problem.autoAnalyzed && !problem.aiEnhanced && (
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            自动识别
          </span>
        )}
        {problem.aiEnhanced && (
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>🤖</span> AI 增强
          </span>
        )}
      </div>

      {/* Problem Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        {/* Problem Text */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-2">📜 案情描述</h3>
          <p className="text-gray-800 leading-relaxed">{problem.text}</p>
        </div>

        {/* Conditions */}
        {conditions.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-2">🔑 已知线索</h3>
            <ul className="space-y-1.5">
              {conditions.map((cond, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-2.5"
                >
                  <span className="text-primary shrink-0">🔸</span>
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Invariant */}
        {problem.invariant && (
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-2">🔒 侦破关键</h3>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
              <p className="text-sm text-purple-700 leading-relaxed">{problem.invariant}</p>
            </div>
          </div>
        )}

        {/* Question */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-2">❓ 问题</h3>
          <p className="text-deep-blue font-bold text-lg leading-relaxed bg-amber-50 rounded-xl p-3 border border-amber-200">
            {problem.question || problem.text}
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
        >
          ← 返回
        </button>
        <button
          onClick={onStartGuide}
          className="flex-[2] bg-primary text-white py-3 rounded-xl text-base font-bold hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/30"
        >
          🕵️ 开始破案
        </button>
      </div>
    </div>
  )
}

export default AnalyzePage
