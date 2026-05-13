/**
 * 智能数学题目分析器 v2
 * 基于规则自动解析小学应用题，提取题型、条件、问题、不变量等
 * 支持中文逗号分割、英文标点、混合书写
 */

const TYPE_PATTERNS = [
  {
    type: '和差问题',
    keywords: ['和', '差', '共', '一共', '合计', '多多少', '少多少', '相差', '比...多', '比...少'],
  },
  {
    type: '和差倍问题',
    keywords: ['和', '差', '倍', '共', '多多少', '少多少', '比...多', '比...少'],
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
  },
  {
    type: '归一问题',
    keywords: ['单价', '单一量', '照这样', '同样的', '每个'],
  },
  {
    type: '归总问题',
    keywords: ['总量', '总价', '总共'],
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
    keywords: ['植树', '种树', '间隔', '两端', '棵数', '段数', '株距'],
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
    keywords: ['分之', '几分之几', '占比', '相当于'],
  },
  {
    type: '百分数应用题',
    keywords: ['%', '百分', '百分之', '折扣', '打折', '利润', '利率', '税率'],
  },
  {
    type: '盈亏问题',
    keywords: ['多出', '不够', '剩余', '缺', '盈', '亏'],
  },
  {
    type: '周期问题',
    keywords: ['周期', '循环', '重复', '规律'],
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
}

/**
 * 将文本分成句子（支持中文逗号、句号、问号、感叹号、英文标点）
 */
function splitSentences(text) {
  // 先将所有中文标点归一化
  let normalized = text
    .replace(/？/g, '？') // 确保是中文问号
    .replace(/？\s*/g, '？') // 去掉问号后面的空格

  // 按句子终结符分割：。！？.!\n  同时保留中文逗号，也作为条件分割符
  const segments = normalized
    .split(/[。！？.!?\n]+/)
    .filter(Boolean)
    .map((s) => s.trim())
    .filter(Boolean)

  // 再把每个 segment 按中文逗号 , 分割成更细的子句
  const result = []
  for (const seg of segments) {
    const parts = seg.split(/[,，、；;]+/).map((p) => p.trim()).filter(Boolean)
    // 如果逗号分割后只有一个部分，就保留原段
    if (parts.length <= 1) {
      result.push(seg)
    } else {
      result.push(...parts)
    }
  }

  return result
}

/**
 * 检测题目类型
 */
function detectType(text) {
  let bestMatch = { type: '和差问题', score: 0 }

  for (const pattern of TYPE_PATTERNS) {
    let score = 0
    for (const kw of pattern.keywords) {
      if (kw.includes('...')) {
        const parts = kw.split('...')
        if (text.includes(parts[0]) && text.includes(parts[1])) {
          score += 1.5
        }
      } else if (text.includes(kw)) {
        score += 1
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { type: pattern.type, score }
    }
  }

  return bestMatch.type
}

/**
 * 判断是否为问题句
 */
function isQuestionSentence(sentence) {
  const hasQuestionMark = sentence.includes('？') || sentence.includes('?')
  const hasQuestionWord = ['多少', '几', '什么', '哪', '如何', '怎样', '怎么', '是否', '是不是', '吗'].some(
    (w) => sentence.includes(w)
  )
  return hasQuestionMark || hasQuestionWord
}

/**
 * 从句子中提取数字信息
 */
function extractNumbers(sentence) {
  const units = [
    '个', '只', '棵', '本', '支', '条', '头', '张', '把', '块', '件',
    '元', '角', '分', '米', '千米', '厘米', '分米', '毫米',
    '千克', '克', '吨', '斤', '公斤',
    '时', '分', '秒', '小时', '分钟', '天', '年', '月',
    '人', '名', '位', '辆', '架', '艘', '箱', '袋', '盒', '页',
  ].sort((a, b) => b.length - a.length) // 长单位优先匹配

  const matches = []
  const numRegex = /(\d+(?:\.\d+)?)/g
  let match

  while ((match = numRegex.exec(sentence)) !== null) {
    const after = sentence.slice(match.index + match[0].length).trim()
    let unit = ''
    for (const u of units) {
      if (after.startsWith(u)) {
        unit = u
        break
      }
    }
    matches.push({ value: parseFloat(match[0]), unit })
  }

  return matches
}

/**
 * 主分析函数
 */
export function analyzeProblem(text) {
  const sentences = splitSentences(text)
  const type = detectType(text)

  // 分离问题句和条件句
  const questionSents = []
  const conditionSents = []

  for (const sent of sentences) {
    if (isQuestionSentence(sent)) {
      questionSents.push(sent)
    } else {
      conditionSents.push(sent)
    }
  }

  // 如果没有识别出问题句，尝试从最后一句提取
  let question = questionSents.join(' ')
  if (!question && sentences.length > 0) {
    const last = sentences[sentences.length - 1]
    const qWords = ['多少', '几', '什么', '哪', '如何', '怎样', '怎么']
    if (qWords.some((w) => last.includes(w))) {
      question = last
      conditionSents.pop() // 从条件中移除
    }
  }

  // 如果还是没有问题句，使用最后一句
  if (!question) {
    question = sentences.length > 0 ? sentences[sentences.length - 1] : text
  }

  // 条件列表
  const conditions = conditionSents.map((s) => s.trim()).filter(Boolean)

  // 不变量
  const invariant = INVARIANT_MAP[type] || ''

  // 统计数字用于难度估算
  const allNumbers = sentences.flatMap((s) => extractNumbers(s))
  const difficulty = Math.min(5, Math.max(1, Math.ceil(allNumbers.length / 2)))

  return {
    text,
    type,
    conditions,
    question,
    invariant,
    difficulty,
    answer: [],
    custom: true,
    autoAnalyzed: true,
    _numbers: allNumbers,
  }
}

export default analyzeProblem
