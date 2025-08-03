
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNetflixNavigation } from '@/hooks/useNetflixNavigation'

interface NetflixNavigationContextType {
  currentArea: string
  currentIndex: number
  isNavigating: boolean
  switchToArea: (area: any, index?: number) => void
  registerElement: (item: any) => void
  unregisterElement: (id: string, area: any) => void
}

const NetflixNavigationContext = createContext<NetflixNavigationContextType | undefined>(undefined)

interface NetflixNavigationProviderProps {
  children: ReactNode
}

export function NetflixNavigationProvider({ children }: NetflixNavigationProviderProps) {
  const navigation = useNetflixNavigation()
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Crear efectos de sonido suaves para navegación (opcional)
  useEffect(() => {
    // Los sonidos se pueden habilitar más tarde si se desea
    // Por ahora solo proporcionamos feedback visual
  }, [])

  // Agregar indicadores visuales de navegación
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .netflix-navigation-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        pointer-events: none;
      }
      
      .netflix-navigation-indicator.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Mostrar indicador de navegación cuando se use el control remoto
  useEffect(() => {
    let indicator: HTMLDivElement | null = null
    let timeout: NodeJS.Timeout

    const showNavigationIndicator = (area: string) => {
      if (!indicator) {
        indicator = document.createElement('div')
        indicator.className = 'netflix-navigation-indicator'
        document.body.appendChild(indicator)
      }

      const areaNames = {
        sidebar: '📱 Menú',
        content: '🎬 Contenido',
        search: '🔍 Búsqueda',
        chat: '💬 Chat'
      }

      indicator.textContent = areaNames[area as keyof typeof areaNames] || area
      indicator.classList.add('visible')

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (indicator) {
          indicator.classList.remove('visible')
        }
      }, 2000)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        showNavigationIndicator(navigation.currentArea)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (indicator) {
        document.body.removeChild(indicator)
      }
      clearTimeout(timeout)
    }
  }, [navigation.currentArea])

  const contextValue: NetflixNavigationContextType = {
    currentArea: navigation.currentArea,
    currentIndex: navigation.currentIndex,
    isNavigating: false,
    switchToArea: navigation.switchToArea,
    registerElement: navigation.registerNavigationItem,
    unregisterElement: navigation.unregisterNavigationItem
  }

  return (
    <NetflixNavigationContext.Provider value={contextValue}>
      {children}
    </NetflixNavigationContext.Provider>
  )
}

export function useNetflixNavigationContext() {
  const context = useContext(NetflixNavigationContext)
  if (context === undefined) {
    throw new Error('useNetflixNavigationContext must be used within a NetflixNavigationProvider')
  }
  return context
}
