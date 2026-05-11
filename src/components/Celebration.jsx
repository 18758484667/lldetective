import { useMemo } from 'react'

const COLORS = [
  '#F59E0B', '#EF4444', '#3B82F6', '#10B981',
  '#8B5CF6', '#EC4899', '#F97316', '#06B6D4',
  '#EAB308', '#6366F1', '#F43F5E', '#14B8A6',
]

const SHAPES = ['●', '■', '▲', '★', '♦', '♥']

function Celebration() {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const angle = (i / 40) * 360
      const distance = 60 + Math.random() * 140
      const rad = (angle * Math.PI) / 180
      const x = Math.cos(rad) * distance
      const y = Math.sin(rad) * distance
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
      const delay = Math.random() * 0.3
      const size = 14 + Math.random() * 18
      return { x, y, color, shape, delay, size }
    })
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Center burst point */}
      <div className="relative w-1 h-1">
        {particles.map((p, index) => (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold animate-confetti-burst"
            style={{
              color: p.color,
              fontSize: `${p.size}px`,
              '--tx': `${p.x}px`,
              '--ty': `${p.y}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: '2.5s',
            }}
          >
            {p.shape}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Celebration
