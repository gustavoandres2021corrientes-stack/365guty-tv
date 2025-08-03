
'use client'

import { useEffect } from 'react'
import { RemoteNavigationProps } from '@/lib/types'

export function RemoteNavigation({
  onUp,
  onDown,
  onLeft,
  onRight,
  onEnter,
  onBack
}: RemoteNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo manejar navegación si no hay otros manejadores activos
      if (event.defaultPrevented) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          onUp?.()
          break
        case 'ArrowDown':
          event.preventDefault()
          onDown?.()
          break
        case 'ArrowLeft':
          event.preventDefault()
          onLeft?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          onRight?.()
          break
        case 'Enter':
          event.preventDefault()
          onEnter?.()
          break
        case 'Escape':
        case 'Backspace':
          event.preventDefault()
          onBack?.()
          break
        // Agregar soporte para control remoto de TV
        case 'Home':
          event.preventDefault()
          onBack?.()
          break
        case 'Menu':
          event.preventDefault()
          // Mostrar menú contextual si está disponible
          break
      }
    }

    // Usar captura para tener prioridad
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [onUp, onDown, onLeft, onRight, onEnter, onBack])

  return null
}
