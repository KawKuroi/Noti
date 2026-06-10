'use client'

import { useEffect, useState } from 'react'

export function useScrollReveal(): void {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('.landing-root .reveal:not(.in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export function useTypewriter(text: string, speed = 38, startDelay = 200): string {
  const [out, setOut] = useState('')

  // Reset inmediato cuando cambia el texto (adjust state during render);
  // el effect solo maneja los timers (sincronizacion externa legitima).
  const [textoPrevio, setTextoPrevio] = useState(text)
  if (textoPrevio !== text) {
    setTextoPrevio(text)
    setOut('')
  }

  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    const startId = setTimeout(() => {
      if (cancelled) return
      let i = 0
      intervalId = setInterval(() => {
        i += 1
        setOut(text.slice(0, i))
        if (i >= text.length && intervalId) clearInterval(intervalId)
      }, speed)
    }, startDelay)

    return () => {
      cancelled = true
      clearTimeout(startId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [text, speed, startDelay])

  return out
}
