import { useState, useEffect, useCallback } from 'react'
import HomePage from './pages/HomePage'
import AnalyzePage from './pages/AnalyzePage'
import GuideFlow from './pages/GuideFlow'
import HistoryPage from './pages/HistoryPage'
import AISettings from './components/AISettings'
import Toast from './components/Toast'
import { analyzeProblem } from './lib/problemAnalyzer'
import { hasAIConfig } from './lib/aiAnalyzer'

const PAGE_ICONS = {
  home: '🏠',
  history: '📋',
  aiSettings: '🤖',
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [currentGrade, setCurrentGrade] = useState(() => {
    try {
      const saved = localStorage.getItem('lldetective_config')
      if (saved) {
        const config = JSON.parse(saved)
        return config.grade || 1
      }
    } catch {}
    return 1
  })
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [toast, setToast] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiConfigured, setAiConfigured] = useState(hasAIConfig())

  useEffect(() => {
    try {
      localStorage.setItem('lldetective_config', JSON.stringify({ grade: currentGrade }))
    } catch {}
  }, [currentGrade])

  const refreshAiStatus = useCallback(() => {
    setAiConfigured(hasAIConfig())
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const handleSelectProblem = useCallback((problem) => {
    setSelectedProblem(problem)
    setCurrentPage('analyze')
  }, [])

  const handleCustomProblem = useCallback(async (text) => {
    setAnalyzing(true)
    try {
      const analyzed = await analyzeProblem(text)
      setSelectedProblem(analyzed)
      setCurrentPage('analyze')
    } catch (err) {
      console.error('分析失败:', err)
      showToast('分析失败，请重试', 'error')
    } finally {
      setAnalyzing(false)
    }
  }, [showToast])

  const handleBackHome = useCallback(() => {
    setSelectedProblem(null)
    setCurrentPage('home')
  }, [])

  const handleGuideStart = useCallback(() => {
    setCurrentPage('guide')
  }, [])

  const handleGuideBack = useCallback(() => {
    setSelectedProblem(null)
    setCurrentPage('home')
  }, [])

  const bottomNavItems = [
    { key: 'home', label: '首页', icon: PAGE_ICONS.home },
    { key: 'history', label: '历史', icon: PAGE_ICONS.history },
  ]

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-amber-50 to-white">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Navigation */}
      <header className="bg-deep-blue text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <h1 className="text-xl font-bold tracking-wide">线线侦探社</h1>
        </div>
        <div className="flex items-center gap-2">
          {currentPage === 'home' && (
            <>
              <span className="text-sm text-amber-200">年级</span>
              <select
                value={currentGrade}
                onChange={(e) => {
                  setCurrentGrade(Number(e.target.value))
                  setSelectedProblem(null)
                }}
                className="bg-amber-400 text-deep-blue font-bold rounded-lg px-3 py-1.5 text-sm border-none outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>{g}年级</option>
                ))}
              </select>
              {/* AI 配置入口 */}
              <button
                onClick={() => setCurrentPage('aiSettings')}
                className={`text-lg p-1 rounded-lg transition-all hover:scale-110 active:scale-95 ${
                  aiConfigured ? 'text-green-300' : 'text-white/60'
                }`}
                title={aiConfigured ? 'AI已配置' : '配置AI增强分析'}
              >
                🤖
              </button>
            </>
          )}
          {currentPage !== 'home' && (
            <button
              onClick={handleBackHome}
              className="bg-amber-400 text-deep-blue px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
            >
              ← 返回
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        {currentPage === 'home' && (
          <HomePage
            currentGrade={currentGrade}
            onGradeChange={(g) => { setCurrentGrade(g); setSelectedProblem(null) }}
            onSelectProblem={handleSelectProblem}
            onCustomProblem={handleCustomProblem}
            showToast={showToast}
            analyzing={analyzing}
          />
        )}
        {currentPage === 'analyze' && selectedProblem && (
          <AnalyzePage
            problem={selectedProblem}
            onStartGuide={handleGuideStart}
            onBack={handleBackHome}
          />
        )}
        {currentPage === 'guide' && selectedProblem && (
          <GuideFlow
            problem={selectedProblem}
            showToast={showToast}
            onComplete={handleBackHome}
            currentGrade={currentGrade}
          />
        )}
        {currentPage === 'history' && <HistoryPage showToast={showToast} />}
        {currentPage === 'aiSettings' && (
          <AISettings
            onBack={() => setCurrentPage('home')}
            onConfigChange={refreshAiStatus}
            showToast={showToast}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
          {bottomNavItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrentPage(item.key)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                currentPage === item.key
                  ? 'text-primary scale-110'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-0.5 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
