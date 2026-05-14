import { useState, useEffect } from 'react'
import { getAIConfig, saveAIConfig, clearAIConfig } from '../lib/aiAnalyzer'

const PROVIDERS = [
  { label: 'DeepSeek（推荐）', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com', model: 'gpt-4o-mini' },
  { label: '阿里通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode', model: 'qwen-plus' },
  { label: '自定义', baseUrl: '', model: '' },
]

function AISettings({ onBack, onConfigChange, showToast }) {
  const [existingConfig, setExistingConfig] = useState(null)
  const [provider, setProvider] = useState(0)
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const config = getAIConfig()
    if (config) {
      setExistingConfig(config)
      setApiKey(config.apiKey || '')
      setBaseUrl(config.baseUrl || '')
      setModel(config.model || '')

      // 找出匹配的 provider
      const idx = PROVIDERS.findIndex(
        (p) => p.baseUrl === config.baseUrl && p.model === config.model
      )
      if (idx >= 0) setProvider(idx)
      else setProvider(PROVIDERS.length - 1) // 自定义
    }
  }, [])

  const handleProviderChange = (idx) => {
    setProvider(idx)
    if (idx < PROVIDERS.length - 1) {
      setBaseUrl(PROVIDERS[idx].baseUrl)
      setModel(PROVIDERS[idx].model)
    }
  }

  const handleSave = () => {
    const key = apiKey.trim()
    if (!key) {
      showToast('请输入 API Key', 'error')
      return
    }
    const url = provider === PROVIDERS.length - 1 ? baseUrl.trim() : PROVIDERS[provider].baseUrl
    const mdl = provider === PROVIDERS.length - 1 ? model.trim() : PROVIDERS[provider].model

    if (!url) {
      showToast('请输入 API 地址', 'error')
      return
    }
    if (!mdl) {
      showToast('请输入模型名称', 'error')
      return
    }

    saveAIConfig({ apiKey: key, baseUrl: url, model: mdl })
    setExistingConfig({ apiKey: key, baseUrl: url, model: mdl })
    onConfigChange()
    showToast('AI 配置已保存！规则引擎无法识别时将自动调用 AI', 'success')
  }

  const handleClear = () => {
    clearAIConfig()
    setExistingConfig(null)
    setApiKey('')
    setBaseUrl('')
    setModel('')
    onConfigChange()
    showToast('已清除 AI 配置', 'success')
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const config = {
        apiKey: apiKey.trim(),
        baseUrl: provider === PROVIDERS.length - 1 ? baseUrl.trim() : PROVIDERS[provider].baseUrl,
        model: provider === PROVIDERS.length - 1 ? model.trim() : PROVIDERS[provider].model,
      }

      const response = await fetch(`${config.baseUrl.replace(/\/+$/, '')}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'user', content: '回复"连接成功"四个字' },
          ],
          temperature: 0,
          max_tokens: 20,
        }),
      })

      if (response.ok) {
        showToast('✅ 连接成功！AI 可以正常使用', 'success')
      } else {
        const err = await response.text().catch(() => '')
        showToast(`❌ 连接失败 (${response.status})，请检查配置`, 'error')
      }
    } catch (err) {
      showToast(`❌ 连接失败：${err.message}`, 'error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-fade-in-up">
      <div className="text-center">
        <span className="text-4xl">🤖</span>
        <h2 className="text-xl font-bold text-deep-blue mt-2">AI 智能分析</h2>
        <p className="text-gray-400 text-sm mt-1">
          配置 AI API 后，当题目规则引擎无法识别时会自动调用 AI 兜底分析
        </p>
      </div>

      {existingConfig && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
          ✅ AI 已配置（{existingConfig.baseUrl} / {existingConfig.model}）
        </div>
      )}

      {/* Provider Select */}
      <div>
        <label className="text-sm font-bold text-gray-500 block mb-1.5">API 供应商</label>
        <select
          value={provider}
          onChange={(e) => handleProviderChange(Number(e.target.value))}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
        >
          {PROVIDERS.map((p, i) => (
            <option key={i} value={i}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div>
        <label className="text-sm font-bold text-gray-500 block mb-1.5">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
        />
        <p className="text-xs text-gray-400 mt-1">你的 API Key 只保存在本地浏览器，不会上传到服务器</p>
      </div>

      {/* Custom Base URL */}
      {provider === PROVIDERS.length - 1 && (
        <>
          <div>
            <label className="text-sm font-bold text-gray-500 block mb-1.5">API 地址</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-500 block mb-1.5">模型名称</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
        >
          ← 返回
        </button>
        <button
          onClick={handleTest}
          disabled={testing || !apiKey.trim()}
          className="flex-1 bg-purple-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-600 transition-all active:scale-95 disabled:opacity-50"
        >
          {testing ? '测试中...' : '🔄 测试连接'}
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/30"
        >
          💾 保存配置
        </button>
      </div>

      {existingConfig && (
        <div className="text-center">
          <button
            onClick={handleClear}
            className="text-sm text-red-400 hover:text-red-600 underline"
          >
            清除 AI 配置
          </button>
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
        <p className="font-bold text-deep-blue">💡 如何获取 API Key？</p>
        <p>🔹 <b>DeepSeek</b>：platform.deepseek.com → API Keys → 创建</p>
        <p>🔹 <b>OpenAI</b>：platform.openai.com/api-keys</p>
        <p>🔹 <b>通义千问</b>：dashscope.aliyun.com → API Key 管理</p>
        <p className="text-xs text-gray-400 mt-1">
          DeepSeek 价格约 ¥0.14/百万tokens，分析一道题约 ¥0.003
        </p>
      </div>
    </div>
  )
}

export default AISettings
