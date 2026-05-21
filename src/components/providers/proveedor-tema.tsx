'use client'

import { ThemeProvider } from 'next-themes'

interface Props {
  children: React.ReactNode
}

export function ProvedorTema({ children }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
