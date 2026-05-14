/**
 * AI 分析兜底模块 v1
 * 当本地规则引擎无法识别题型时，调用大模型 API 做智能分析。
 * 支持任何 OpenAI 兼容的 API（DeepSeek、OpenAI、Qwen、GLM 等）。
 */

// localStorage 存储键名
const STORAGE_KEY = 'lldetective_ai_config'

/**
 * 获取 AI 配置
 */
export function getAIConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 保存 AI 配置
 */
export function saveAIConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

/**
 * 清除 AI 配置
 */
export function clearAIConfig() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 检查是否已配置 AI
 */
export function hasAIConfig() {
  const config = getAIConfig()
  return !!(config && config.apiKey)
}

/**
 * 系统提示词：引导 AI 分析小学数学题并返回结构化 JSON
 */
const SYSTEM_PROMPT = `你是一位小学数学题分析专家。请分析用户提供的数学应用题，严格按照以下 JSON 格式返回（不要返回其他文字）：

{
  "type": "题型名称",
  "conditions": ["条件1", "条件2", ...],
  "question": "问题是什么",
  "invariant": "本题中什么是不变的？给出解题关键提示"
}

题型名称必须是以下之一（选最匹配的）：
- 和差问题：已知两数的和与差，求各数
- 和差倍问题：已知和、差、倍中的多个关系
- 倍数关系：一个数是另一个数的几倍
- 行程问题：速度、时间、路程的关系
- 鸡兔同笼：头和脚的数量问题
- 归一问题：先求单一量
- 归总问题：总量不变，先求总量
- 平均数问题：求平均数
- 图形与几何：长方形、正方形、周长、面积等
- 周长与围栏问题：围篱笆、绕操场等
- 植树问题：种树、锯木头、敲钟等间隔问题
- 年龄问题：年龄差不变
- 工程问题：工作效率、合作
- 分数应用题：几分之几、一半等
- 百分数应用题：折扣、百分比
- 盈亏问题：多出、不够
- 周期问题：蜗牛爬井、昼夜交替、循环规律
- 购物策略：比价、优惠
- 方阵问题：队列、排列
- 综合问题：其他类型

conditions 数组用一句话描述一个已知条件，不要过度拆分。
invariant 用一句话解释本题中什么数量是不变的。`

/**
 * 调用 AI API 分析题目
 * @param {string} text - 题目文本
 * @param {object} config - { apiKey, baseUrl, model }
 * @returns {Promise<object|null>} 分析结果或 null
 */
export async function aiAnalyzeProblem(text, config) {
  if (!config || !config.apiKey) return null

  const baseUrl = (config.baseUrl || 'https://api.deepseek.com').replace(/\/+$/, '')
  const model = config.model || 'deepseek-chat'

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error('AI API error:', response.status, errText)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return null

    // 从 AI 回复中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const result = JSON.parse(jsonMatch[0])

    return {
      type: result.type || '综合问题',
      conditions: Array.isArray(result.conditions) ? result.conditions : [result.conditions].filter(Boolean),
      question: result.question || '',
      invariant: result.invariant || '',
    }
  } catch (err) {
    console.error('AI分析调用失败:', err)
    return null
  }
}

export default aiAnalyzeProblem
