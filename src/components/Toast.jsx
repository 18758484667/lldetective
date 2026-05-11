import { useEffect } from 'react'

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div
        className={`${bgColor} text-white px-6 py-3 rounded-2xl shadow-xl text-base font-bold flex items-center gap-2`}
      >
        <span>{type === 'success' ? '✅' : '❌'}</span>
        {message}
      </div>
    </div>
  )
}

export default Toast
