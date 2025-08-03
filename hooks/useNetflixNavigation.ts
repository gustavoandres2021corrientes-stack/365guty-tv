
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type NavigationDirection = 'up' | 'down' | 'left' | 'right'
export type NavigationArea = 'sidebar' | 'content' | 'search' | 'chat'

export interface NavigationItem {
  id: string
  area: NavigationArea
  element: HTMLElement | null
  row?: number
  col?: number
  canReceiveFocus?: boolean
}

export interface NavigationGrid {
  rows: number
  cols: number
  items: NavigationItem[]
}

export function useNetflixNavigation() {
  const [currentArea, setCurrentArea] = useState<NavigationArea>('sidebar')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationItems = useRef<Map<NavigationArea, NavigationItem[]>>(new Map())
  const focusTimeout = useRef<NodeJS.Timeout>()

  // Registrar elementos para navegación
  const registerNavigationItem = useCallback((item: NavigationItem) => {
    const areaItems = navigationItems.current.get(item.area) || []
    const existingIndex = areaItems.findIndex(existing => existing.id === item.id)
    
    if (existingIndex >= 0) {
      areaItems[existingIndex] = item
    } else {
      areaItems.push(item)
    }
    
    navigationItems.current.set(item.area, areaItems)
  }, [])

  // Remover elementos de navegación
  const unregisterNavigationItem = useCallback((id: string, area: NavigationArea) => {
    const areaItems = navigationItems.current.get(area) || []
    const filtered = areaItems.filter(item => item.id !== id)
    navigationItems.current.set(area, filtered)
  }, [])

  // Aplicar foco visual estilo Netflix
  const applyNetflixFocus = useCallback((element: HTMLElement | null, focused: boolean = true) => {
    if (!element) return

    if (focused) {
      element.classList.add('netflix-focus')
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      })
    } else {
      element.classList.remove('netflix-focus')
    }
  }, [])

  // Navegar entre elementos
  const navigate = useCallback((direction: NavigationDirection) => {
    if (isNavigating) return

    setIsNavigating(true)
    
    const currentItems = navigationItems.current.get(currentArea) || []
    const currentItem = currentItems[currentIndex]

    if (currentItem?.element) {
      applyNetflixFocus(currentItem.element, false)
    }

    let newArea = currentArea
    let newIndex = currentIndex

    switch (direction) {
      case 'up':
        if (currentArea === 'content' && currentIndex >= 6) {
          newIndex = Math.max(0, currentIndex - 6)
        } else if (currentArea === 'content' && currentIndex < 6) {
          newArea = 'sidebar'
          newIndex = Math.min(currentIndex, (navigationItems.current.get('sidebar')?.length || 1) - 1)
        } else if (currentArea === 'sidebar' && currentIndex > 0) {
          newIndex = currentIndex - 1
        }
        break

      case 'down':
        const sidebarItems = navigationItems.current.get('sidebar') || []
        const contentItems = navigationItems.current.get('content') || []
        
        if (currentArea === 'sidebar' && currentIndex < sidebarItems.length - 1) {
          newIndex = currentIndex + 1
        } else if (currentArea === 'sidebar' && contentItems.length > 0) {
          newArea = 'content'
          newIndex = Math.min(currentIndex, contentItems.length - 1)
        } else if (currentArea === 'content' && currentIndex + 6 < contentItems.length) {
          newIndex = Math.min(contentItems.length - 1, currentIndex + 6)
        }
        break

      case 'left':
        if (currentArea === 'content' && currentIndex % 6 > 0) {
          newIndex = currentIndex - 1
        } else if (currentArea === 'content' && currentIndex % 6 === 0) {
          newArea = 'sidebar'
          const sidebarLength = (navigationItems.current.get('sidebar')?.length || 1)
          newIndex = Math.min(Math.floor(currentIndex / 6), sidebarLength - 1)
        } else if (currentArea === 'search' || currentArea === 'chat') {
          newArea = 'sidebar'
          newIndex = 0
        }
        break

      case 'right':
        const contentItemsRight = navigationItems.current.get('content') || []
        
        if (currentArea === 'sidebar' && contentItemsRight.length > 0) {
          newArea = 'content'
          newIndex = Math.min(currentIndex * 6, contentItemsRight.length - 1)
        } else if (currentArea === 'content' && (currentIndex % 6) < 5 && currentIndex < contentItemsRight.length - 1) {
          newIndex = currentIndex + 1
        }
        break
    }

    setCurrentArea(newArea)
    setCurrentIndex(newIndex)

    // Aplicar foco con un pequeño delay para suavizar la transición
    if (focusTimeout.current) {
      clearTimeout(focusTimeout.current)
    }

    focusTimeout.current = setTimeout(() => {
      const newItems = navigationItems.current.get(newArea) || []
      const newItem = newItems[newIndex]
      
      if (newItem?.element) {
        applyNetflixFocus(newItem.element, true)
        
        // Trigger focus para accesibilidad
        if (newItem.canReceiveFocus !== false) {
          newItem.element.focus()
        }
      }
      
      setIsNavigating(false)
    }, 50)

  }, [currentArea, currentIndex, isNavigating, applyNetflixFocus])

  // Manejar entrada de control remoto
  const handleRemoteInput = useCallback((key: string) => {
    switch (key) {
      case 'ArrowUp':
        navigate('up')
        break
      case 'ArrowDown':
        navigate('down')
        break
      case 'ArrowLeft':
        navigate('left')
        break
      case 'ArrowRight':
        navigate('right')
        break
      case 'Enter':
        const currentItems = navigationItems.current.get(currentArea) || []
        const currentItem = currentItems[currentIndex]
        if (currentItem?.element) {
          currentItem.element.click()
        }
        break
    }
  }, [navigate, currentArea, currentIndex])

  // Cambiar área manualmente
  const switchToArea = useCallback((area: NavigationArea, index: number = 0) => {
    const currentItems = navigationItems.current.get(currentArea) || []
    const currentItem = currentItems[currentIndex]
    
    if (currentItem?.element) {
      applyNetflixFocus(currentItem.element, false)
    }

    setCurrentArea(area)
    setCurrentIndex(index)

    const newItems = navigationItems.current.get(area) || []
    const newItem = newItems[index]
    
    if (newItem?.element) {
      applyNetflixFocus(newItem.element, true)
    }
  }, [currentArea, currentIndex, applyNetflixFocus])

  // Inicializar navegación
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
        event.preventDefault()
        handleRemoteInput(event.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (focusTimeout.current) {
        clearTimeout(focusTimeout.current)
      }
    }
  }, [handleRemoteInput])

  // Inicializar foco en el primer elemento del sidebar
  useEffect(() => {
    const sidebarItems = navigationItems.current.get('sidebar') || []
    if (sidebarItems.length > 0 && sidebarItems[0]?.element) {
      applyNetflixFocus(sidebarItems[0].element, true)
    }
  }, [applyNetflixFocus])

  return {
    currentArea,
    currentIndex,
    registerNavigationItem,
    unregisterNavigationItem,
    navigate,
    switchToArea,
    applyNetflixFocus,
    handleRemoteInput
  }
}
