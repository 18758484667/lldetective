import { useState } from 'react'
import GradeSelector from '../components/GradeSelector'
import ProblemList from '../components/ProblemList'

function HomePage({ currentGrade, onGradeChange, onSelectProblem, onCustomProblem, showToast }) {
  const [customText, setCustomText] = useState('')
  const charLimit = 500

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.length > charLimit) {
        showToast('题目文本不能超过500字', 'error')
        return
      }
      setCustomText(text)
    } catch {
      showToast('无法读取剪贴板', 'error')
    }
  }

  const handleSubmit = () => {
    const trimmed = customText.trim()
    if (!trimmed) {
      showToast('请输入题目内容', 'error')
      return
    }
    if (trimmed.length > charLimit) {
      showToast('题目文本不能超过500字', 'error')
      return
    }
    onCustomProblem(trimmed)
    setCustomText('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Hero */}
      <div className="text-center animate-fade-in-up">
        <span className="text-5xl">🔍</span>
        <h2 className="text-2xl font-bold text-deep-blue mt-2">欢迎来到线线侦探社</h2>
        <p className="text-gray-500 mt-1 text-sm">选择题目或输入你的数学难题，一起破案吧！</p>
      </div>

      {/* Grade Selector */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1">
          <span>📚</span> 选择年级
        </h3>
        <GradeSelector currentGrade={currentGrade} onGradeChange={onGradeChange} />
      </div>

      {/* Problem List */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1">
          <span>📖</span> 题库列表
        </h3>
        <ProblemList currentGrade={currentGrade} onSelectProblem={onSelectProblem} />
      </div>

      {/* Custom Problem Input */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1">
          <span>✏️</span> 自主输入题目
        </h3>
        <div className="relative">
          <textarea
            value={customText}
            onChange={(e) => {
              if (e.target.value.length <= charLimit) {
                setCustomText(e.target.value)
              }
            }}
            placeholder="在此粘贴或输入你的数学题目，侦探帮你分析..."
            className="w-full h-32 p-4 text-sm border-2 border-gray-200 rounded-xl resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            maxLength={charLimit}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-0.5 rounded-full">
            {customText.length}/{charLimit}
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          <button
            onClick={handlePaste}
            className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            📋 粘贴题目
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-primary/30"
          >
            🔍 开始分析
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
