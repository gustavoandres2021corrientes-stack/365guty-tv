
'use client'

import { useState, useEffect } from 'react'
import { useNetflixNavigation } from '@/hooks/useNetflixNavigation'
import { Play, Tv } from 'lucide-react'

interface Canal {
  id: number
  numero: string
  nombre: string
  logo: string
  categoria: string
  descripcion: string
  url: string
}

interface TVGridProps {
  onChannelSelect?: (canal: Canal) => void
}

export function TVGrid({ onChannelSelect }: TVGridProps) {
  const [canales, setCanales] = useState<Canal[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [filteredCanales, setFilteredCanales] = useState<Canal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { registerNavigationItem, unregisterNavigationItem } = useNetflixNavigation()

  // Cargar canales ficticios
  useEffect(() => {
    const loadCanales = async () => {
      try {
        const response = await fetch('/data/canales_tv.json')
        const data = await response.json()
        setCanales(data.canales)
        setFilteredCanales(data.canales)
      } catch (error) {
        console.error('Error loading channels:', error)
        // Fallback con datos locales si falla la carga
        const fallbackCanales = [
          {
            id: 1,
            numero: "01",
            nombre: "365 GUTY TV",
            logo: "https://imgs.search.brave.com/nfeDvfP0TOQlkWP_lxdBFljwUuT73qDE_jViKAh25RY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bG9nb2pveS5jb20v/d3AtY29udGVudC91/cGxvYWRzLzIwMTgv/MDUvMTgxNTM4NTgv/MTQ3Mi03Njh4NTkx/LnBuZw",
            categoria: "Nacional",
            descripcion: "Canal principal de 365GUTY-TV",
            url: ""
          }
        ]
        setCanales(fallbackCanales)
        setFilteredCanales(fallbackCanales)
      } finally {
        setIsLoading(false)
      }
    }

    loadCanales()
  }, [])

  // Filtrar por categoría
  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredCanales(canales)
    } else {
      setFilteredCanales(canales.filter(canal => canal.categoria === selectedCategory))
    }
  }, [canales, selectedCategory])

  // Registrar elementos para navegación
  useEffect(() => {
    filteredCanales.forEach((canal, index) => {
      const element = document.getElementById(`tv-channel-${canal.id}`)
      if (element) {
        registerNavigationItem({
          id: `tv-channel-${canal.id}`,
          area: 'content',
          element,
          row: Math.floor(index / 6), // Asumiendo 6 columnas por fila
          col: index % 6,
          canReceiveFocus: true
        })
      }
    })

    return () => {
      filteredCanales.forEach((canal) => {
        unregisterNavigationItem(`tv-channel-${canal.id}`, 'content')
      })
    }
  }, [filteredCanales, registerNavigationItem, unregisterNavigationItem])

  const categorias = ['Todos', ...Array.from(new Set(canales.map(canal => canal.categoria)))]

  const handleChannelClick = (canal: Canal) => {
    if (onChannelSelect) {
      onChannelSelect(canal)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-blue-400 text-lg">Cargando canales...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con categorías estilo Flow - REDUCIDO */}
      <div className="tv-header-flow rounded-lg p-3 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">365GUTY💙-TV</h2>
              <p className="text-blue-200 text-xs">Tu guía de televisión digital</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-sm">
              {filteredCanales.length}
            </div>
            <div className="text-blue-200 text-xs">
              canales
            </div>
          </div>
        </div>
        
        {/* Filtros de categoría estilo Flow - REDUCIDO */}
        <div className="flex flex-wrap gap-1.5">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              onClick={() => setSelectedCategory(categoria)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 tv-navigation tv-category-filter ${
                selectedCategory === categoria
                  ? 'active'
                  : ''
              }`}
              tabIndex={0}
              aria-label={`Filtrar por ${categoria}`}
            >
              {categoria}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla de canales estilo Flow - REDUCIDO */}
      <div className="bg-gradient-to-br from-slate-900/80 to-blue-900/30 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20">
        <div className="tv-grid-flow">
          {filteredCanales.map((canal) => (
            <div
              key={canal.id}
              id={`tv-channel-${canal.id}`}
              className="tv-channel-card group cursor-pointer rounded-xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-400 transition-all duration-300 tv-navigation netflix-focus-item shadow-lg"
              onClick={() => handleChannelClick(canal)}
              tabIndex={0}
              role="button"
              aria-label={`Canal ${canal.numero} - ${canal.nombre}`}
            >
              {/* Número del canal estilo Flow - REDUCIDO */}
              <div className="tv-channel-number px-1 py-1 text-center relative">
                <span className="text-white font-bold text-xs">
                  {canal.numero}
                </span>
              </div>
              
              {/* Logo del canal con efecto Flow - REDUCIDO */}
              <div className="aspect-video bg-gradient-to-br from-blue-800/50 to-slate-800/80 flex items-center justify-center p-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                <div className="tv-channel-logo w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-md flex items-center justify-center shadow-lg relative z-10">
                  <span className="text-white font-bold text-center text-xs leading-tight px-1">
                    {canal.nombre}
                  </span>
                </div>
                {/* Efecto de brillo Flow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
              </div>
              
              {/* Información del canal estilo Flow - REDUCIDO */}
              <div className="p-2 bg-gradient-to-b from-slate-800/90 to-slate-900/95">
                <div className="text-white text-xs font-bold line-clamp-1 mb-1">
                  {canal.nombre}
                </div>
                <div className="text-blue-300 text-xs line-clamp-1 mb-2 font-medium">
                  {canal.categoria}
                </div>
                
                {/* Indicador EN VIVO estilo Flow - REDUCIDO */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full live-indicator"></div>
                    <span className="text-green-400 text-xs font-bold tracking-wide">VIVO</span>
                  </div>
                  <div className="w-5 h-5 bg-blue-600/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12">
                    <Play className="w-2.5 h-2.5 text-blue-300" />
                  </div>
                </div>
              </div>
              
              {/* Overlay de activación estilo Flow */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
              
              {/* Borde brillante en hover */}
              <div className="absolute inset-0 rounded-xl border-2 border-blue-400/0 group-hover:border-blue-400/50 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay canales estilo Flow - REDUCIDO */}
        {filteredCanales.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Tv className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-bold mb-2">
              No hay canales en "{selectedCategory}"
            </p>
            <p className="text-blue-300 text-xs max-w-sm mx-auto">
              Selecciona otra categoría o espera a que se agreguen más canales
            </p>
          </div>
        )}
      </div>

      {/* Footer informativo estilo Flow - REDUCIDO */}
      <div className="bg-gradient-to-r from-blue-900/50 via-blue-800/40 to-blue-900/50 rounded-lg p-3 border border-blue-500/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-blue-200">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🎮</span>
            </div>
            <span className="text-xs font-medium">
              Usa control remoto para navegar
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {filteredCanales.length > 0 && (
              <div className="text-right">
                <div className="text-blue-400 text-sm font-bold">
                  {filteredCanales.length}
                </div>
                <div className="text-blue-300 text-xs">
                  activos
                </div>
              </div>
            )}
            <div className="w-2 h-2 bg-green-400 rounded-full live-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Estilos adicionales para los canales de TV - REDUCIDOS
const tvChannelStyles = `
.tv-channel-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.tv-channel-card:hover,
.tv-channel-card:focus,
.tv-channel-card.netflix-focus {
  transform: scale(1.03);
  border-color: #3b82f6 !important;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  z-index: 10;
}

.tv-channel-card.netflix-focus {
  border-color: #ef4444 !important;
  box-shadow: 0 0 18px rgba(239, 68, 68, 0.6);
}
`

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = tvChannelStyles
  document.head.appendChild(styleSheet)
}
