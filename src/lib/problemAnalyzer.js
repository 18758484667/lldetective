/**
 * 智能数学题目分析器 v3
 * 基于语义规则自动解析小学应用题，提取题型、条件、问题、不变量等
 * 
 * 改进要点：
 * 1. 不粗暴按逗号切割——以句号/问号分割段落，保留条件语义完整性
 * 2. 智能合并"如果...可以..."等关联从句
 * 3. 类型关键词大幅扩展，覆盖更多常见题目模式
 * 4. 支持 AI 兜底：规则无法识别时自动调用大模型 API
 */

import { aiAnalyzeProblem, getAIConfig } from './aiAnalyzer'

/**
 * 类型模式定义
 * 每个模式包含：type(类型名称), keywords(关键词), exclude(排除短语——命中则扣分)
 */
const TYPE_PATTERNS = [
  // === 图形与几何（优先匹配）===
  {
    type: '图形与几何',
    keywords: [
      '长方形', '正方形', '圆形', '三角形', '梯形', '平行四边形',
      '周长', '面积', '边长', '半径', '直径',
      '长增加了', '宽增加了', '长和宽', '边长增加',
    ],
  },
  // === 归总问题：总量不变，先求总量再分配 ===
  {
    type: '归总问题',
    keywords: [
      '可以装', '可以放', '可以分', '可以坐',
      '如果每', '如果...可以', '装...包', '装...箱',
      '每包', '每袋', '每箱', '每盒', '每瓶',
      '这批', '一堆', '一批',
      '少装', '多装',
    ],
  },
  // === 归一问题：先求单位量 ===
  {
    type: '归一问题',
    keywords: [
      '照这样计算', '照这样', '同样的', '每个', '每件', '每辆',
      '单价', '单一量', '平均每个',
    ],
  },
  {
    type: '和差问题',
    keywords: ['和', '差', '共', '一共', '合计', '多多少', '少多少', '相差', '比...多', '比...少'],
    exclude: ['长和宽', '底和高', '长和', '宽和', '爸爸和', '妈妈和', '儿子和', '女儿和', '小明和', '小红和',
              '哥哥和', '弟弟和', '姐姐和', '妹妹和', '爷爷和', '奶奶和'],
  },
  {
    type: '和差倍问题',
    keywords: ['和', '差', '倍', '共', '多多少', '少多少', '比...多', '比...少'],
    exclude: ['长和宽', '底和高', '长和', '宽和', '爸爸和', '妈妈和', '儿子和', '女儿和', '小明和', '小红和',
              '哥哥和', '弟弟和', '姐姐和', '妹妹和', '爷爷和', '奶奶和'],
  },
  {
    type: '倍数关系',
    keywords: ['倍', '的几倍', '多少倍', '扩大', '缩小'],
  },
  {
    type: '行程问题',
    keywords: ['速度', '时间', '路程', '相向', '同向', '相遇', '追及', '每小时', '每分钟', '相距', '距离'],
  },
  {
    type: '鸡兔同笼',
    keywords: ['鸡', '兔', '头', '脚', '腿', '笼'],
    exclude: ['木头', '石头'], // "木头"中的"头"不是动物头数
  },
  {
    type: '平均数问题',
    keywords: ['平均', '平均数', '平均分'],
  },
  {
    type: '周长与围栏问题',
    keywords: ['周长', '围栏', '篱笆', '边长', '四周', '靠墙', '围一圈', '围起来', '花坛', '菜地'],
  },
  {
    type: '植树问题',
    keywords: ['植树', '种树', '锯', '锯成', '敲钟', '间隔', '两端', '棵数', '段数', '段', '株距'],
  },
  {
    type: '年龄问题',
    keywords: ['年龄', '岁', '年前', '年后', '爸爸', '妈妈', '儿子', '女儿'],
  },
  {
    type: '工程问题',
    keywords: ['工程', '工作', '效率', '合作', '单独', '完成', '修路', '修一段'],
  },
  {
    type: '分数应用题',
    keywords: ['分之', '几分之几', '一半', '三分之一', '四分', '占比', '相当于'],
  },
  {
    type: '百分数应用题',
    keywords: ['%', '百分', '百分之', '折扣', '打折', '利润', '利率', '税率'],
  },
  {
    type: '盈亏问题',
    keywords: ['多出', '不够', '剩余', '缺', '盈', '亏'],
  },
  // === 趣味周期问题：蜗牛爬井、蜗牛爬树、昼夜交替等 ===
  {
    type: '周期问题',
    keywords: [
      '周期', '循环', '重复', '规律',
      '蜗牛', '井底', '井口', '爬到井口',
      '白天...晚上', '白天爬', '晚上滑下', '爬...滑下',
      '白天...夜间', '每...后倒退', '进...退',
      '每爬', '滑下',
    ],
  },
  {
    type: '等量代换',
    keywords: ['等于', '相当于', '替换', '代换', '代替'],
  },
  {
    type: '购物策略',
    keywords: ['买', '购买', '商店', '超市', '花费', '优惠', '促销', '满减'],
  },
  {
    type: '方阵问题',
    keywords: ['方阵', '队列', '排', '列', '行', '每行', '每列', '最外层'],
  },
]

const INVARIANT_MAP = {
  '图形与几何': '图形的基本属性（如周长、面积公式）是不变的，变化的只是具体的边长数值。',
  '和差问题': '两数的和与差保持不变，利用和差关系求解。',
  '和差倍问题': '和与差的关系固定，倍数关系也固定，可以利用线段图找出对应关系。',
  '倍数关系': '倍数关系是固定的，一份量（或单位量）是解题关键。',
  '行程问题': '速度、时间、路程三个量中，已知两个可以求第三个。',
  '鸡兔同笼': '总头数和总脚数是固定的，假设法是基本思路。',
  '归一问题': '单一量（单位量）是不变的，先求单一量再求总量。',
  '归总问题': '总量是不变的，先求总量再求单一量或份数。',
  '平均数问题': '总数 = 平均数 × 份数，这个关系保持不变。',
  '周长与围栏问题': '周长是围成封闭图形一周的长度，由各边长度相加得到。',
  '植树问题': '棵数与间隔数之间的关系由植树方式决定。',
  '年龄问题': '年龄差始终不变，年龄和逐年增加。',
  '工程问题': '工作总量 = 工作效率 × 工作时间，三量关系不变。',
  '分数应用题': '单位"1"是解题的关键，找到对应关系。',
  '百分数应用题': '百分数表示部分与整体的关系，找准单位"1"。',
  '盈亏问题': '两次分配的总差额与每份差额的比值不变。',
  '周期问题': '周期长度不变，用余数法确定位置。',
  '等量代换': '数量之间的等量关系不变，用已知量替换未知量。',
  '购物策略': '总花费不变，比较不同方案的花费。',
  '方阵问题': '每边人数与总人数之间满足方阵计算规律。',
  '综合问题': '从已知条件出发，寻找数量之间的关系，逐步推导出答案。',
}

/**
 * 按句号/问号/叹号分割段落（不再按逗号切割）
 * 每个段落保持语义完整。
 * 然后在段落级别识别问题句，从条件中分离出来。
 */
function splitIntoParagraphs(text) {
  // 统一标点
  const normalized = text
    .replace(/？/g, '？')
    .replace(/？\s*/g, '？')

  return normalized
    .split(/[。！？.!?\n]+/)
    .filter(Boolean)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * 判断句子是否为问题句
 */
function isQuestionSentence(sentence) {
  const hasQuestionMark = sentence.includes('？') || sentence.includes('?')
  const hasQuestionWord = ['多少', '几', '什么', '哪', '如何', '怎样', '怎么', '是否', '是不是', '吗'].some(
    (w) => sentence.includes(w)
  )
  return hasQuestionMark || hasQuestionWord
}

/**
 * 从句是否以依赖词开头（需要与前后合并）
 */
function startsWithDependent(text) {
  const dependents = ['如果', '若', '假设', '要是', '假若', '当', '那么', '则', '可以']
  const trimmed = text.trim()
  for (const d of dependents) {
    if (trimmed.startsWith(d)) return true
  }
  return false
}

/**
 * 从句是否太短需与前面合并
 */
function isShortFragment(text) {
  const trimmed = text.trim()
  if (trimmed.length <= 6) return true
  // 纯数字/数量短语（如"可以装30包"语义上依附于前面的"如果每包40本"）
  const weakStarters = ['可以', '只需', '只要', '需要', '得到', '就是', '则是', '是']
  for (const w of weakStarters) {
    if (trimmed.startsWith(w)) return true
  }
  return false
}

/**
 * 从句是否以代词/指示词开头（如"它", "他", "这", "那"）
 */
function startsWithPronoun(text) {
  const pronouns = ['它', '他', '她', '这', '那', '其', '它们', '他们', '她们', '这些', '那些']
  const trimmed = text.trim()
  for (const p of pronouns) {
    if (trimmed.startsWith(p)) return true
  }
  return false
}

  /**
   * 智能分割 + 合并：以句子为单位，再按语义合并
   * 规则：
   * - 以"如果/若"等开头的从句如果本身不含问题，才合并到上一句
   * - 短句、代词开头的从句合并到上一句
   * - 上一句很短且不是问题句 → 合并
   */
  function splitAndMerge(text) {
    const paragraphs = splitIntoParagraphs(text)
    const result = []

    for (let i = 0; i < paragraphs.length; i++) {
      const current = paragraphs[i]

      if (result.length === 0) {
        result.push(current)
        continue
      }

      const last = result[result.length - 1]

      // 条件1: 当前句以"如果/若/"等开头，且自身不是问题句 → 合并到上一句
      if (startsWithDependent(current) && !isQuestionSentence(current)) {
        result[result.length - 1] = last + '。' + current
        continue
      }

      // 条件2: 当前句很短或是代词开头 → 合并到上一句
      if (isShortFragment(current) || startsWithPronoun(current)) {
        result[result.length - 1] = last + '，' + current
        continue
      }

      // 条件3: 上一句很短且不是问题句 → 合并
      if (isShortFragment(last) && !isQuestionSentence(last)) {
        result[result.length - 1] = last + '，' + current
        continue
      }

      result.push(current)
    }

    return result
  }

/**
 * 从段落列表中分离问题和条件
 * 策略：如果一段包含问题关键词，找到最后一个逗号/分号前的位置，
 * 将逗号前作为条件、逗号后（含问题关键词）作为问题。
 * 这样保证不会把"可以少装"切到条件里。
 */
function extractConditionsAndQuestion(paragraphs) {
  const conditions = []
  let question = ''

  for (const p of paragraphs) {
    const trimmed = p.trim()
    if (!trimmed) continue

    if (!isQuestionSentence(trimmed)) {
      conditions.push(trimmed)
      continue
    }

    // 找最后一个句子分隔符（逗号/分号/冒号）的位置
    const sepMatch = trimmed.match(/[，,；;：:](?!.*[，,；;：:])/)  
    const lastSepIdx = sepMatch ? sepMatch.index : -1

    if (lastSepIdx > 0) {
      const beforeSep = trimmed.substring(0, lastSepIdx).trim()
      const afterSep = trimmed.substring(lastSepIdx + 1).trim()
      // 分隔符后的部分包含问题关键词才拆分
      if (isQuestionSentence(afterSep) && beforeSep.length >= 4) {
        conditions.push(beforeSep)
        question = afterSep
        continue
      }
    }

    // 无法拆分，整段作为问题
    question = trimmed
  }

  // 如果没找到问题句，尝试从最后一条条件中提取
  if (!question && conditions.length > 0) {
    const last = conditions[conditions.length - 1]
    const qWords = ['多少', '几', '什么', '哪', '如何', '怎样', '怎么']
    let hasQ = false
    for (const w of qWords) {
      if (last.includes(w)) {
        hasQ = true
        break
      }
    }
    if (hasQ) {
      question = conditions.pop()
    }
  }

  return { conditions, question }
}

/**
 * 检测题目类型
 */
function detectType(text) {
  let bestMatch = { type: '综合问题', score: 0 }
  const MIN_SCORE = 1

  for (const pattern of TYPE_PATTERNS) {
    let score = 0

    // 排除短语扣分
    const exclusions = pattern.exclude || []
    let excludeHit = 0
    for (const excl of exclusions) {
      if (text.includes(excl)) excludeHit++
    }

    for (const kw of pattern.keywords) {
      if (kw.includes('...')) {
        const parts = kw.split('...')
        // 通配符匹配需要检查两部分距离（≤15字符），避免跨句误匹
        const firstIdx = text.indexOf(parts[0])
        if (firstIdx !== -1) {
          const afterFirst = text.substring(firstIdx + parts[0].length)
          const secondIdx = afterFirst.indexOf(parts[1])
          if (secondIdx !== -1 && secondIdx <= 15) {
            score += 1.5
          }
        }
      } else if (text.includes(kw)) {
        score += 1
      }
    }

    score = Math.max(0, score - excludeHit * 0.8)

    if (score > bestMatch.score) {
      bestMatch = { type: pattern.type, score }
    }
  }

  if (bestMatch.score < MIN_SCORE) return '综合问题'
  return bestMatch.type
}

/**
 * 主分析函数（异步，支持 AI 兜底）
 * @param {string} text - 题目文本
 * @param {object} [options] - 可选参数
 * @param {boolean} [options.skipAI=false] - 是否跳过AI兜底
 * @param {object} [options.aiConfig] - AI 配置（默认从 localStorage 读取）
 * @returns {Promise<object>}
 */
export async function analyzeProblem(text, options = {}) {
  // 1. 本地规则引擎分析（同步）
  const mergedParagraphs = splitAndMerge(text)
  const type = detectType(text)
  const { conditions, question } = extractConditionsAndQuestion(mergedParagraphs)
  const localResult = {
    text,
    type,
    conditions,
    question: question || text,
    invariant: INVARIANT_MAP[type] || '',
    answer: [],
    custom: true,
    autoAnalyzed: true,
    aiEnhanced: false,
  }

  // 2. 如果类型是"综合问题"（规则引擎没认出来），尝试 AI 兜底
  const isLowConfidence = type === '综合问题'
  if (!isLowConfidence && type !== '归总问题' && type !== '归一问题') {
    // 规则引擎有明确结果且不是边缘类型 → 直接用
    return localResult
  }

  if (options.skipAI) return localResult

  const aiConfig = options.aiConfig || getAIConfig()
  if (!aiConfig || !aiConfig.apiKey) {
    // 没有配置 AI，返回当地结果
    return localResult
  }

  // 3. 调 AI 做增强分析
  try {
    const aiResult = await aiAnalyzeProblem(text, aiConfig)
    if (aiResult && aiResult.type && aiResult.type !== '综合问题') {
      // AI 识别出明确类型 → 用AI结果
      return {
        ...localResult,
        type: aiResult.type,
        conditions: aiResult.conditions.length > 0 ? aiResult.conditions : localResult.conditions,
        question: aiResult.question || localResult.question,
        invariant: aiResult.invariant || INVARIANT_MAP[aiResult.type] || localResult.invariant,
        aiEnhanced: true,
      }
    }
  } catch (err) {
    console.warn('AI 分析兜底失败，回落本地结果:', err)
  }

  return localResult
}

export default analyzeProblem
