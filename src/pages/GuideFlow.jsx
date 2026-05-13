import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Celebration from '../components/Celebration'
import { drawProblemDiagram } from '../lib/canvasDrawer'
import invariantHints from '../data/invariantHints'

const STEPS = [
  { num: 1, label: '理解题意' },
  { num: 2, label: '找不变量' },
  { num: 3, label: '画图分析' },
  { num: 4, label: '列式计算' },
  { num: 5, label: '验证总结' },
]

function DrawCanvas({ problem }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.parentElement.getBoundingClientRect()
    const size = Math.min(500, rect.width - 32)
    canvas.width = size
    canvas.height = size * 0.6
    canvas.style.width = `${size}px`
    canvas.style.height = `${size * 0.6}px`

    drawProblemDiagram(ctx, canvas, problem)
  }, [problem])

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="rounded-xl border-2 border-gray-200 bg-white shadow-inner"
      />
    </div>
  )
}

function GuideFlow({ problem, showToast, onComplete, currentGrade }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState({})
  const [showCelebration, setShowCelebration] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)

  const rawAnswer = problem.answer
  let answerDefs = []
  if (Array.isArray(rawAnswer)) {
    answerDefs = rawAnswer
  } else if (typeof rawAnswer === 'string') {
    try {
      answerDefs = JSON.parse(rawAnswer)
    } catch {
      answerDefs = [{ label: '答案', value: parseFloat(rawAnswer) || 0, unit: '' }]
    }
  }

  const handleAnswerSubmit = () => {
    const newResults = {}
    let allCorrect = true

    answerDefs.forEach((def, idx) => {
      const userVal = parseFloat(answers[idx])
      if (isNaN(userVal)) {
        newResults[idx] = 'empty'
        allCorrect = false
      } else if (Math.abs(userVal - def.value) <= 0.01) {
        newResults[idx] = 'correct'
      } else {
        newResults[idx] = 'wrong'
        allCorrect = false
      }
    })

    setResults(newResults)

    if (allCorrect) {
      showToast('🎉 完全正确！太厉害了！', 'success')
      setTimeout(() => {
        setCurrentStep(5)
        setShowCelebration(true)
        saveHistory(true)
      }, 500)
    } else {
      showToast('再想想哦，看看提示重新计算～', 'error')
    }
  }

  const saveHistory = async (correct) => {
    const record = {
      problem_id: problem.id || null,
      problem_text: problem.text,
      problem_type: problem.type || '自定义',
      correct,
      answer_detail: JSON.stringify(answers),
      created_at: new Date().toISOString(),
    }

    // Save to localStorage as backup
    try {
      const local = JSON.parse(localStorage.getItem('lldetective_history') || '[]')
      local.unshift(record)
      localStorage.setItem('lldetective_history', JSON.stringify(local.slice(0, 200)))
    } catch {}

    // Save to Supabase
    try {
      await supabase.from('history').insert(record)
    } catch (err) {
      console.error('Failed to save history to Supabase:', err)
    }
  }

  const handleNextProblem = async () => {
    try {
      const { data } = await supabase
        .from('problems')
        .select('*')
        .eq('grade', currentGrade)
        .limit(20)

      if (data && data.length > 0) {
        const others = data.filter((p) => p.id !== problem.id)
        const next = others.length > 0
          ? others[Math.floor(Math.random() * others.length)]
          : data[Math.floor(Math.random() * data.length)]
        window.location.reload()
        // The parent will need to handle this
        showToast('即将加载新题目...', 'success')
      }
    } catch {
      showToast('暂时无法加载新题目', 'error')
    }
  }

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

  const invariant = problem.invariant || ''

  // 获取题型对应的分层提示
  const typeHints = invariantHints[problem.type] || invariantHints['default']
  const currentHint = typeHints.hints[hintLevel] || typeHints.hints[typeHints.hints.length - 1]

  const handlePrevHint = () => {
    setHintLevel(Math.max(0, hintLevel - 1))
  }

  const handleNextHint = () => {
    if (hintLevel < typeHints.hints.length - 1) {
      setHintLevel(hintLevel + 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in-up">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.num
            const isCurrent = currentStep === step.num
            const isFuture = currentStep < step.num

            return (
              <div key={step.num} className="flex flex-col items-center flex-1">
                <button
                  onClick={() => {
                    if (!isFuture) setCurrentStep(step.num)
                  }}
                  disabled={isFuture}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-md'
                      : isCurrent
                      ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-110'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? '✓' : step.num}
                </button>
                <span
                  className={`text-xs mt-1.5 text-center ${
                    isCurrent
                      ? 'text-primary font-bold'
                      : isCompleted
                      ? 'text-green-600 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
          {/* Progress line */}
          <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200 -translate-y-1/2 z-0">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        {/* Step 1: Understand */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deep-blue flex items-center gap-2">
              <span>📖</span> 第一步：理解题意
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-sm text-gray-500 mb-1">题目原文：</p>
              <p className="text-gray-800 leading-relaxed">{problem.text}</p>
            </div>
            {conditions.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-500 mb-2">已知条件：</p>
                <ul className="space-y-1.5">
                  {conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-2.5">
                      <span className="text-primary shrink-0">🔸</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-sm font-bold text-blue-600 mb-1">❓ 问题：</p>
              <p className="text-deep-blue font-bold">{problem.question || problem.text}</p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-md"
            >
              下一步 →
            </button>
          </div>
        )}

        {/* Step 2: Invariant */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deep-blue flex items-center gap-2">
              <span>🔒</span> 第二步：{typeHints.title}
            </h3>

            {/* 不变量描述 */}
            {invariant && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-gray-500 mb-1">🔑 不变量提示：</p>
                <p className="text-base font-bold text-purple-700 leading-relaxed">{invariant}</p>
              </div>
            )}

            {/* 分层引导提示 */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-primary text-lg">💡</span>
                <span className="text-sm font-bold text-deep-blue">
                  线索 {hintLevel + 1} / {typeHints.hints.length}
                </span>
              </div>

              <div className="min-h-[60px]">
                <p className="text-base text-gray-800 leading-relaxed animate-fade-in-up">
                  {currentHint}
                </p>
              </div>

              {/* 导航按钮 */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handlePrevHint}
                  disabled={hintLevel === 0}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    hintLevel === 0
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 active:scale-95'
                  }`}
                >
                  ← 上一条线索
                </button>
                <button
                  onClick={handleNextHint}
                  disabled={hintLevel >= typeHints.hints.length - 1}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    hintLevel >= typeHints.hints.length - 1
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark active:scale-95 shadow-sm'
                  }`}
                >
                  下一条线索 →
                </button>
              </div>
            </div>

            {/* 进度条 */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((hintLevel + 1) / typeHints.hints.length) * 100}%` }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                ← 上一步
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-md"
              >
                下一步 →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Draw */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deep-blue flex items-center gap-2">
              <span>📐</span> 第三步：画图分析
            </h3>
            <DrawCanvas problem={problem} />
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500 text-center">
              💡 线段图帮助你更直观地理解数量关系
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                ← 上一步
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-md"
              >
                下一步 →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Calculate */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deep-blue flex items-center gap-2">
              <span>🧮</span> 第四步：列式计算
            </h3>

            {answerDefs.length > 0 ? (
              <>
                <p className="text-sm text-gray-500">
                  请输入你的计算结果（数值比较，容差 0.01）
                </p>
                <div className="space-y-3">
                  {answerDefs.map((def, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-bold text-gray-600 mb-1">
                        {def.label || `答案 ${idx + 1}`}
                        {def.unit && <span className="text-gray-400 font-normal">（单位：{def.unit}）</span>}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={answers[idx] ?? ''}
                        onChange={(e) => {
                          setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                          setResults((prev) => ({ ...prev, [idx]: undefined }))
                        }}
                        className={`w-full p-3 text-lg border-2 rounded-xl outline-none transition-all ${
                          results[idx] === 'wrong'
                            ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                            : results[idx] === 'correct'
                            ? 'border-green-500 bg-green-50'
                            : results[idx] === 'empty'
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                        placeholder="输入答案..."
                        disabled={results[idx] === 'correct'}
                      />
                      {results[idx] === 'wrong' && (
                        <p className="text-red-500 text-xs mt-1">
                          正确答案：{def.value}{def.unit || ''}
                        </p>
                      )}
                      {results[idx] === 'correct' && (
                        <p className="text-green-500 text-xs mt-1">✅ 正确！</p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAnswerSubmit}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-md"
                >
                  ✅ 提交答案
                </button>
              </>
            ) : (
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <span className="text-3xl block mb-2">📝</span>
                <p className="text-blue-700 font-bold mb-2">
                  请在纸上或草稿本上完成计算
                </p>
                <p className="text-sm text-blue-600 leading-relaxed">
                  在草稿本上列出算式并计算出结果，然后对照下面的参考答案核对你是否做对了。
                </p>
                <div className="mt-3 bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-500">💡 解题提示：</p>
                  <p className="text-sm text-gray-700 mt-1">
                    回顾题目中的条件，想想应该用加法、减法、乘法还是除法来解决问题。
                    做完后别忘了检查一遍哦！
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentStep(5)
                    setShowCelebration(true)
                    saveHistory(true)
                  }}
                  className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all active:scale-95 shadow-md"
                >
                  ✅ 我做完了，查看总结 →
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                ← 上一步
              </button>
              {answerDefs.length > 0 && answerDefs.every((_, idx) => results[idx] === 'correct') && (
                <button
                  onClick={() => {
                    setCurrentStep(5)
                    setShowCelebration(true)
                    saveHistory(true)
                  }}
                  className="flex-[2] bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all active:scale-95 shadow-md"
                >
                  🎉 查看总结 →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Celebration & Summary */}
        {currentStep === 5 && (
          <div className="space-y-5 text-center">
            {showCelebration && <Celebration />}

            <div className="relative">
              <span className="text-6xl block mb-2">🏆</span>
              <h3 className="text-2xl font-bold text-deep-blue mb-1">
                破案成功！太棒了！🎉
              </h3>
              <p className="text-gray-500 text-sm">你成功解开了这道数学谜题！</p>
            </div>

            {/* Summary */}
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200 text-left">
              <h4 className="font-bold text-green-700 mb-3">📝 解题回顾</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-gray-500">题型</span>
                  <span className="font-bold text-deep-blue">{problem.type || '自定义'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-gray-500">题目</span>
                  <span className="text-gray-700 text-right max-w-[60%] line-clamp-2">{problem.text}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">你的答案</span>
                  <span className="font-bold text-green-600">
                    {Object.values(answers).filter((v) => v !== '' && v !== undefined).join('、')}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 mt-3 text-center">
                <span className="text-lg">💪</span>
                <p className="text-sm text-gray-600 mt-1">
                  你已经掌握了解决{problem.type || '数学'}题的方法！继续加油！
                </p>
              </div>
            </div>

            <button
              onClick={handleNextProblem}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-md"
            >
              🔄 再来一题
            </button>

            <button
              onClick={onComplete}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              🏠 返回首页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuideFlow
