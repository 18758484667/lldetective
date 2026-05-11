/**
 * Canvas 数学题画图工具
 * 为 17 种题型画出线段图/示意图
 */

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  amber: '#F59E0B',
  purple: '#8B5CF6',
  red: '#EF4444',
  cyan: '#06B6D4',
  pink: '#EC4899',
  orange: '#F97316',
  emerald: '#059669',
  indigo: '#6366F1',
  gray: '#6B7280',
  rose: '#F43F5E',
  yellow: '#EAB308',
  teal: '#14B8A6',
  sky: '#0EA5E9',
}

function drawBox(ctx, x, y, w, h, color, label, labelColor) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 4)
  ctx.fill()
  if (label) {
    ctx.fillStyle = labelColor || '#1E293B'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(label, x + w / 2, y - 4)
    ctx.textBaseline = 'alphabetic'
  }
}

function drawBracket(ctx, x1, y1, x2, y2, label, color) {
  ctx.strokeStyle = color || COLORS.amber
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1, y2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x1, y2)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  if (label) {
    ctx.fillStyle = color || COLORS.amber
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, (x1 + x2) / 2, y2 + 16)
  }
}

function drawTitle(ctx, canvas, text) {
  ctx.fillStyle = '#1E3A5F'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(text, canvas.width / 2, 8)
  ctx.textBaseline = 'alphabetic'
}

/* --- 各题型画图函数 --- */

function draw和差问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 和差问题 - 线段图')
  const lineY = h / 2 - 20
  const lineY2 = h / 2 + 30
  const totalW = w - padding * 2

  const firstRatio = 0.6
  const firstW = totalW * firstRatio
  drawBox(ctx, padding, lineY - 8, firstW, 16, COLORS.blue, '较大数', COLORS.blue)
  const secondW = totalW * (1 - firstRatio)
  drawBox(ctx, padding, lineY2 - 8, secondW, 16, COLORS.green, '较小数', COLORS.green)
  drawBracket(ctx, padding - 5, lineY - 12, padding + totalW + 5, lineY2 + 12, '总和 = ?')
}

function draw倍数关系(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 倍数关系 - 线段图')
  const unitW = 22
  const gap = 5
  const lineY = h / 2 - 25
  const lineY2 = h / 2 + 25
  const n = 5

  drawBox(ctx, padding, lineY - 8, unitW, 16, COLORS.green, '1份', COLORS.green)
  for (let i = 0; i < n; i++) {
    drawBox(ctx, padding + i * (unitW + gap), lineY2 - 8, unitW, 16, COLORS.blue)
  }
  ctx.fillStyle = COLORS.blue
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${n}份 (倍数)`, padding + (n * (unitW + gap)) / 2, lineY2 - 14)
  ctx.strokeStyle = COLORS.amber
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, lineY2 + 10)
  ctx.lineTo(padding + n * (unitW + gap) - gap, lineY2 + 10)
  ctx.stroke()
  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('是多少倍？', padding + (n * (unitW + gap)) / 2, lineY2 + 28)
}

function draw行程问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 行程问题 - 路程图')
  const midY = h / 2
  const lineW = w - padding * 2

  // 路线横线
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(padding, midY)
  ctx.lineTo(padding + lineW, midY)
  ctx.stroke()

  // 起点/终点
  ctx.fillStyle = COLORS.green
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.beginPath()
  ctx.arc(padding, midY, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLORS.green
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('A', padding, midY + 22)

  ctx.fillStyle = COLORS.red
  ctx.beginPath()
  ctx.arc(padding + lineW, midY, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLORS.red
  ctx.fillText('B', padding + lineW, midY + 22)

  // 方向箭头
  const arrowY = midY - 18
  ctx.fillStyle = COLORS.blue
  ctx.font = '12px sans-serif'
  ctx.fillText('→ 速度 × 时间 = 路程 →', padding + lineW / 2, arrowY)

  // 距离标注
  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('距离 = ?', padding + lineW / 2, midY + 40)
}

function draw鸡兔同笼(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 鸡兔同笼 - 假设法')
  const midY = h / 2 - 10

  // 画鸡（圆圈+两条腿）
  const startX = padding + 20
  for (let i = 0; i < 4; i++) {
    const cx = startX + i * 45
    const cy = midY - 15
    // 头
    ctx.fillStyle = COLORS.amber
    ctx.beginPath()
    ctx.arc(cx, cy, 10, 0, Math.PI * 2)
    ctx.fill()
    // 身体
    ctx.fillStyle = '#FDE68A'
    ctx.beginPath()
    ctx.ellipse(cx, cy + 18, 12, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    // 脚
    ctx.strokeStyle = COLORS.orange
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - 4, cy + 28)
    ctx.lineTo(cx - 6, cy + 38)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + 4, cy + 28)
    ctx.lineTo(cx + 6, cy + 38)
    ctx.stroke()
  }

  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('鸡（2只脚）', startX + 90, midY + 55)

  // 画兔（圆圈+四条腿）
  const rStartX = w / 2 + 10
  for (let i = 0; i < 3; i++) {
    const cx = rStartX + i * 45
    const cy = midY - 15
    ctx.fillStyle = '#D1D5DB'
    ctx.beginPath()
    ctx.arc(cx, cy, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#9CA3AF'
    ctx.beginPath()
    ctx.ellipse(cx, cy + 18, 12, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = COLORS.gray
    ctx.lineWidth = 2
    for (let j = -1; j <= 1; j += 2) {
      ctx.beginPath()
      ctx.moveTo(cx + j * 4, cy + 28)
      ctx.lineTo(cx + j * 5, cy + 36)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + j * 4, cy + 28)
      ctx.lineTo(cx + j * 6, cy + 40)
      ctx.stroke()
    }
  }
  ctx.fillStyle = COLORS.gray
  ctx.fillText('兔（4只脚）', rStartX + 45, midY + 55)
}

function draw归一问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 归一问题 - 先求单一量')
  const midY = h / 2 - 10
  const unitW = 20
  const gap = 6
  const itemsPerRow = 8

  // 第一行：总量
  for (let i = 0; i < itemsPerRow; i++) {
    drawBox(ctx, padding + i * (unitW + gap), midY - 35, unitW, 14, COLORS.blue)
  }
  ctx.fillStyle = COLORS.blue
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('总价 ÷ 数量 = 单价', padding + (itemsPerRow * (unitW + gap)) / 2, midY - 42)

  // 箭头
  ctx.fillStyle = COLORS.amber
  ctx.font = '16px sans-serif'
  ctx.fillText('↓', padding + (itemsPerRow * (unitW + gap)) / 2, midY - 8)

  // 第二行：单一量 × 新的数量
  const unit = 1
  drawBox(ctx, padding + 20, midY + 5, unitW * unit + 8, 16, COLORS.green, '1份', COLORS.green)

  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('→', padding + unitW + 36, midY + 17)

  // 新总量
  for (let i = 0; i < 5; i++) {
    drawBox(ctx, padding + unitW + 48 + i * (unitW + gap), midY + 5, unitW, 16, COLORS.blue)
  }
  ctx.fillStyle = '#1E3A5F'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('单价 × 新数量 = 新总价', padding + 200, midY + 34)
}

function draw归总问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 归总问题 - 总量不变')
  const midY = h / 2 - 10
  const unitW = 22
  const gap = 5

  // 第一行：多份 → 总量
  const row1Count = 6
  for (let i = 0; i < row1Count; i++) {
    drawBox(ctx, padding + i * (unitW + gap), midY - 35, unitW, 16, COLORS.blue)
  }
  ctx.fillStyle = '#1E3A5F'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('每份量 × 份数', padding + (row1Count * (unitW + gap)) / 2, midY - 42)

  // 箭头
  ctx.fillStyle = COLORS.amber
  ctx.font = '16px sans-serif'
  ctx.fillText('↓ 总量不变', padding + (row1Count * (unitW + gap)) / 2, midY - 8)

  // 大括号 + 下面分成不同份数
  const totalW = row1Count * (unitW + gap) - gap
  ctx.strokeStyle = COLORS.amber
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, midY)
  ctx.lineTo(padding, midY + 25)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(padding + totalW, midY)
  ctx.lineTo(padding + totalW, midY + 25)
  ctx.stroke()

  // 第二行：不同分法
  const row2Count = 4
  for (let i = 0; i < row2Count; i++) {
    drawBox(ctx, padding + i * (unitW + gap + 6), midY + 28, unitW, 16, COLORS.green)
  }
  ctx.fillStyle = '#1E3A5F'
  ctx.fillText('新每份量 × 新份数', padding + (row2Count * (unitW + gap + 6)) / 2, midY + 58)
}

function draw平均数问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 平均数问题 - 移多补少')
  const midY = h / 2

  // 几个不同高度的柱子
  const bars = [
    { h: 30, color: COLORS.blue },
    { h: 55, color: COLORS.green, label: '最多' },
    { h: 20, color: COLORS.cyan },
    { h: 45, color: COLORS.purple },
    { h: 35, color: COLORS.orange },
  ]
  const barW = 30
  const gap = 10
  const totalBarsW = bars.length * (barW + gap) - gap
  const startX = (w - totalBarsW) / 2

  bars.forEach((bar, i) => {
    const x = startX + i * (barW + gap)
    const y = midY + 20 - bar.h
    drawBox(ctx, x, y, barW, bar.h, bar.color)
    if (bar.label) {
      ctx.fillStyle = bar.color
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(bar.label, x + barW / 2, y - 4)
    }
  })

  // 平均线
  const avgY = midY + 20 - 32
  ctx.strokeStyle = COLORS.amber
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(startX - 5, avgY)
  ctx.lineTo(startX + totalBarsW + 5, avgY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('平均数', startX + totalBarsW + 30, avgY + 5)
}

function draw植树问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 植树问题 - 间隔图')
  const midY = h / 2 - 5

  // 画树🌲
  const treeCount = 6
  const spacing = (w - padding * 2) / (treeCount - 1)

  for (let i = 0; i < treeCount; i++) {
    const x = padding + i * spacing
    const y = midY
    // 树干
    ctx.fillStyle = '#92400E'
    ctx.fillRect(x - 3, y + 5, 6, 15)
    // 树冠
    ctx.fillStyle = COLORS.green
    ctx.beginPath()
    ctx.moveTo(x, y - 15)
    ctx.lineTo(x - 12, y + 5)
    ctx.lineTo(x + 12, y + 5)
    ctx.closePath()
    ctx.fill()
  }

  // 间隔标注
  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('间隔', padding + spacing / 2, midY + 35)
  ctx.fillText('间隔', padding + spacing * 1.5, midY + 35)

  ctx.fillStyle = '#1E3A5F'
  ctx.font = '11px sans-serif'
  ctx.fillText(`棵数 = 间隔数 + 1（两端都栽）`, w / 2, midY + 55)
}

function draw年龄问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 年龄问题 - 时间轴')
  const midY = h / 2 - 5

  // 时间轴
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, midY)
  ctx.lineTo(w - padding, midY)
  ctx.stroke()

  // 年龄标注
  const points = [
    { x: padding + 30, label: '过去', color: COLORS.gray },
    { x: padding + 110, label: '现在', color: COLORS.amber },
    { x: padding + 190, label: '未来', color: COLORS.blue },
  ]

  points.forEach((p) => {
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, midY, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(p.label, p.x, midY + 20)
  })

  // 年龄差标注
  ctx.strokeStyle = COLORS.amber
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding + 30, midY - 25)
  ctx.lineTo(padding + 190, midY - 25)
  ctx.stroke()
  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('年龄差不变', (padding + 30 + padding + 190) / 2, midY - 30)

  // 说明
  ctx.fillStyle = '#1E3A5F'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('👨 爸爸 + 👦 儿子 = 年龄和（逐年+2）', w / 2, midY + 45)
}

function draw工程问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 工程问题 - 工作进度图')
  const midY = h / 2 - 5
  const barW = w - padding * 2
  const barH = 20

  // 总工作量
  ctx.fillStyle = '#E2E8F0'
  ctx.beginPath()
  ctx.roundRect(padding, midY - 15, barW, barH, 8)
  ctx.fill()
  ctx.fillStyle = '#94A3B8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('总工作量 = 1', w / 2, midY - 6)
  ctx.textBaseline = 'alphabetic'

  // 完成部分（蓝色进度条）
  const doneRatio = 0.4
  ctx.fillStyle = COLORS.blue
  ctx.beginPath()
  ctx.roundRect(padding, midY - 15, barW * doneRatio, barH, [8, 0, 0, 8])
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`已完成 ${doneRatio * 100}%`, padding + barW * doneRatio / 2, midY + 2)

  // 工作效率标注
  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('⬇ 效率 = 工作量 ÷ 时间', w / 2, midY + 30)

  ctx.fillStyle = '#1E3A5F'
  ctx.font = '11px sans-serif'
  ctx.fillText('合作效率 = 甲效率 + 乙效率', w / 2, midY + 50)
}

function draw分数应用题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 分数应用题 - 线段图')
  const midY = h / 2 - 15
  const barW = w - padding * 2

  // 总长度（单位1）
  ctx.fillStyle = '#E2E8F0'
  ctx.beginPath()
  ctx.roundRect(padding, midY - 8, barW, 16, 4)
  ctx.fill()
  ctx.fillStyle = COLORS.gray
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('单位"1"', w / 2, midY - 14)

  // 分成5份，标记2/5
  const parts = 5
  const partW = barW / parts
  for (let i = 0; i < parts; i++) {
    ctx.strokeStyle = '#CBD5E1'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding + i * partW, midY - 8)
    ctx.lineTo(padding + i * partW, midY + 8)
    ctx.stroke()
  }

  // 前2份高亮
  ctx.fillStyle = COLORS.blue
  ctx.globalAlpha = 0.4
  ctx.fillRect(padding, midY - 8, partW * 2, 16)
  ctx.globalAlpha = 1

  ctx.fillStyle = COLORS.blue
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('2/5', padding + partW, midY + 30)

  ctx.fillStyle = '#1E3A5F'
  ctx.font = '11px sans-serif'
  ctx.fillText('找对应关系：几分之几 = 部分量 ÷ 总量', w / 2, midY + 50)
}

function draw百分数应用题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 百分数问题 - 百分比图')
  const midY = h / 2 - 5
  const barW = w - padding * 2

  // 100% 进度条
  ctx.fillStyle = '#E2E8F0'
  ctx.beginPath()
  ctx.roundRect(padding, midY - 10, barW, 20, 10)
  ctx.fill()

  // 分段
  const segments = [
    { pct: 30, color: COLORS.blue, label: '30%' },
    { pct: 25, color: COLORS.green, label: '25%' },
    { pct: 20, color: COLORS.amber, label: '20%' },
    { pct: 25, color: COLORS.purple, label: '25%' },
  ]
  let curX = padding
  segments.forEach((seg) => {
    const segW = (seg.pct / 100) * barW
    ctx.fillStyle = seg.color
    ctx.beginPath()
    const isFirst = curX === padding
    const isLast = curX + segW >= padding + barW - 1
    if (isFirst && isLast) {
      ctx.roundRect(curX, midY - 10, segW, 20, 10)
    } else if (isFirst) {
      ctx.roundRect(curX, midY - 10, segW, 20, [10, 0, 0, 10])
    } else if (isLast) {
      ctx.roundRect(curX, midY - 10, segW, 20, [0, 10, 10, 0])
    } else {
      ctx.rect(curX, midY - 10, segW, 20)
    }
    ctx.fill()

    ctx.fillStyle = 'white'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(seg.label, curX + segW / 2, midY + 5)
    curX += segW
  })

  ctx.fillStyle = '#1E3A5F'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('百分数 × 总量 = 部分量    部分量 ÷ 总量 = 百分数', w / 2, midY + 35)
}

function draw盈亏问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 盈亏问题 - 分配图')
  const midY = h / 2 - 20

  // 第一行分配
  const boxes1 = 5
  const boxW = 20
  const gap = 4
  for (let i = 0; i < boxes1; i++) {
    drawBox(ctx, padding + i * (boxW + gap), midY - 20, boxW, 16, COLORS.blue)
  }
  ctx.fillStyle = COLORS.blue
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('每人×个，多出...（盈）', padding + boxes1 * (boxW + gap) + 10, midY - 8)

  // 第二行分配
  const boxes2 = 7
  for (let i = 0; i < boxes2; i++) {
    drawBox(ctx, padding + i * (boxW + gap), midY + 12, boxW, 16, COLORS.green)
    const x = padding + boxes2 * (boxW + gap) + 10
    if (i === 0) {
      ctx.fillStyle = COLORS.green
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('每人×个，还缺...（亏）', x, midY + 24)
    }
  }

  // 公式
  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('（盈 + 亏）÷ 每人分配差 = 人数', w / 2, midY + 50)
}

function draw周期问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 周期问题 - 循环图')
  const midY = h / 2 - 5

  const cycle = ['🔴', '🟡', '🔵', '🟢', '🔴', '🟡', '🔵', '🟢']
  const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981']
  const items = 8
  const itemW = 28
  const gap = 6
  const totalW = items * (itemW + gap) - gap
  const startX = (w - totalW) / 2

  for (let i = 0; i < items; i++) {
    const x = startX + i * (itemW + gap)
    const c = colors[i % colors.length]
    ctx.fillStyle = c
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    ctx.roundRect(x, midY - 10, itemW, 24, 6)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.fillStyle = '#1E293B'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(cycle[i % colors.length], x + itemW / 2, midY + 4)
  }

  ctx.fillStyle = '#1E3A5F'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`周期长度 = ${colors.length}    余数法确定位置`, w / 2, midY + 35)
}

function draw等量代换(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 等量代换 - 天平图')
  const midY = h / 2 - 5

  // 天平
  ctx.strokeStyle = '#92400E'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(w / 2 - 60, midY)
  ctx.lineTo(w / 2 + 60, midY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(w / 2, midY)
  ctx.lineTo(w / 2, midY + 25)
  ctx.stroke()

  // 天平底座
  ctx.beginPath()
  ctx.moveTo(w / 2 - 15, midY + 25)
  ctx.lineTo(w / 2 + 15, midY + 25)
  ctx.stroke()

  // 左边：2个物品
  ctx.fillStyle = COLORS.blue
  ctx.beginPath()
  ctx.arc(w / 2 - 35, midY - 20, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'white'
  ctx.font = 'bold 10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('A', w / 2 - 35, midY - 17)
  ctx.fillStyle = COLORS.blue
  ctx.beginPath()
  ctx.arc(w / 2 - 10, midY - 20, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'white'
  ctx.fillText('A', w / 2 - 10, midY - 17)

  // 右边：1个大物品
  ctx.fillStyle = COLORS.amber
  ctx.beginPath()
  ctx.arc(w / 2 + 35, midY - 22, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'white'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('B', w / 2 + 35, midY - 19)

  // 公式
  ctx.fillStyle = '#1E3A5F'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('A + A = B    →    A = B ÷ 2', w / 2, midY + 50)
}

function draw购物策略(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 购物策略 - 比价图')
  const midY = h / 2 - 20

  // 两个方案并排比较
  const barW = 60

  // 方案A
  drawBox(ctx, padding + 20, midY - 5, barW, 16, COLORS.blue, '方案A', COLORS.blue)
  ctx.fillStyle = COLORS.blue
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('原价', padding + 20 + barW / 2, midY + 28)
  ctx.fillText('折扣价', padding + 20 + barW / 2, midY + 42)

  // 方案A 折扣柱
  drawBox(ctx, padding + 20, midY + 50, barW * 0.75, 16, COLORS.cyan)

  // 方案B
  const bX = w / 2 + 20
  drawBox(ctx, bX, midY - 5, barW, 16, COLORS.green, '方案B', COLORS.green)
  ctx.fillText('原价', bX + barW / 2, midY + 28)
  ctx.fillStyle = COLORS.green
  ctx.fillText('折扣价', bX + barW / 2, midY + 42)
  drawBox(ctx, bX, midY + 50, barW * 0.6, 16, COLORS.emerald)

  // 比较箭头
  ctx.fillStyle = COLORS.amber
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('↔ 比较总花费', w / 2, midY + 55)

  ctx.fillStyle = '#1E3A5F'
  ctx.font = '11px sans-serif'
  ctx.fillText('选更省钱方案', w / 2, midY + 72)
}

function draw方阵问题(ctx, w, h, padding) {
  drawTitle(ctx, ctx.canvas, '📐 方阵问题 - 点阵图')
  const midY = h / 2 - 5
  const rows = 5
  const cols = 5
  const dotSize = 7
  const spacingX = 22
  const spacingY = 22
  const totalW = (cols - 1) * spacingX
  const totalH = (rows - 1) * spacingY
  const startX = (w - totalW) / 2
  const startY = midY - totalH / 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isEdge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1
      ctx.fillStyle = isEdge ? COLORS.amber : COLORS.blue
      ctx.globalAlpha = isEdge ? 1 : 0.4
      ctx.beginPath()
      ctx.arc(startX + c * spacingX, startY + r * spacingY, dotSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = '#1E3A5F'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`最外层人数 = (每边人数 - 1) × 4`, w / 2, midY + totalH / 2 + 20)
  ctx.fillText(`总人数 = 每边人数 × 每边人数`, w / 2, midY + totalH / 2 + 36)
}

/* --- 主绘图函数 --- */
export function drawProblemDiagram(ctx, canvas, problem) {
  const w = canvas.width
  const h = canvas.height
  const padding = 40
  const type = problem.type || ''

  ctx.clearRect(0, 0, w, h)
  ctx.textBaseline = 'alphabetic'

  const drawerMap = {
    '和差问题': draw和差问题,
    '倍数关系': draw倍数关系,
    '行程问题': draw行程问题,
    '鸡兔同笼': draw鸡兔同笼,
    '归一问题': draw归一问题,
    '归总问题': draw归总问题,
    '平均数问题': draw平均数问题,
    '植树问题': draw植树问题,
    '年龄问题': draw年龄问题,
    '工程问题': draw工程问题,
    '分数应用题': draw分数应用题,
    '百分数应用题': draw百分数应用题,
    '盈亏问题': draw盈亏问题,
    '周期问题': draw周期问题,
    '等量代换': draw等量代换,
    '购物策略': draw购物策略,
    '方阵问题': draw方阵问题,
  }

  // 题型别名映射（处理数据库中的变体名称）
  const typeAliases = {
    '和差倍问题': '和差问题',
    '和差倍': '和差问题',
    '和差': '和差问题',
    '倍数': '倍数关系',
    '归一': '归一问题',
    '归总': '归总问题',
    '平均数': '平均数问题',
    '植树': '植树问题',
    '年龄': '年龄问题',
    '工程': '工程问题',
    '行程': '行程问题',
    '鸡兔同笼': '鸡兔同笼',
    '分数': '分数应用题',
    '百分数': '百分数应用题',
    '盈亏': '盈亏问题',
    '周期': '周期问题',
    '等量代换': '等量代换',
    '购物': '购物策略',
    '方阵': '方阵问题',
  }

  let resolvedType = type
  // 精确匹配
  let drawFn = drawerMap[type]
  // 别名匹配
  if (!drawFn && typeAliases[type]) {
    resolvedType = typeAliases[type]
    drawFn = drawerMap[resolvedType]
  }
  // 子串匹配：如果包含已知题型名称，尝试使用
  if (!drawFn) {
    for (const [alias, standard] of Object.entries(typeAliases)) {
      if (type.includes(alias) || alias.includes(type)) {
        drawFn = drawerMap[standard]
        resolvedType = standard
        if (drawFn) break
      }
    }
  }

  if (drawFn) {
    drawFn(ctx, w, h, padding)
  } else {
    ctx.fillStyle = '#6B7280'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🔍 侦探正在画线索板…', w / 2, h / 2 - 10)
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`(${type}题型暂无预设画图，可以自己画哦)`, w / 2, h / 2 + 25)
  }
}
