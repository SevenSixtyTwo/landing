'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export function NotFoundComponent() {
  const router = useRouter()

  const skeuomorphicButton = `
    relative overflow-hidden bg-gradient-to-b from-yellow-400 to-yellow-500
    text-gray-800 font-bold py-2 px-4 rounded-lg
    shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.3)]
    active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
    active:translate-y-[1px]
    transition-all duration-150
    border-b-4 border-yellow-600
  `

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Zap className="h-20 w-20 text-yellow-400 mb-8" />
      </motion.div>
      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-yellow-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        404 - Страница не найдена
      </motion.h1>
      <motion.p
        className="text-xl mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Запрашиваемой страницы не существует
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <button
          onClick={() => router.push('/')}
          className={`${skeuomorphicButton} text-lg px-8 py-3`}
        >
          На главную
        </button>
      </motion.div>
    </div>
  )
}