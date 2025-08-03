
'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Volume2, VolumeX, RotateCcw, Settings, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Canal {
  id: number
  numero: string
  nombre: string
  logo: string
  categoria: string
  descripcion: string
  url: string
}

interface TVPlayerProps {
  canal: Canal
  onClose: () => void
}

export function TVPlayer({ canal, onClose }: TVPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Simular carga del stream
    const loadTimeout = setTimeout(() => {
      setIsLoading(false)
      // Simular que algunos canales no tienen stream disponible
      if (!canal.url || canal.url === '') {
        setHasError(true)
      }
    }, 2000)

    return () => clearTimeout(loadTimeout)
  }, [canal])

  useEffect(() => {
    // Auto-hide info after 5 seconds
    const infoTimeout = setTimeout(() => {
      setShowInfo(false)
    }, 5000)

    return () => clearTimeout(infoTimeout)
  }, [])

  useEffect(() => {
    // Handle keyboard navigation
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
        case 'Backspace':
          onClose()
          break
        case 'm':
        case 'M':
          toggleMute()
          break
        case 'i':
        case 'I':
          setShowInfo(!showInfo)
          break
        case ' ':
          e.preventDefault()
          showControlsTemporarily()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [showInfo])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const handleMouseMove = () => {
    showControlsTemporarily()
  }

  const retryConnection = () => {
    setIsLoading(true)
    setHasError(false)
    setTimeout(() => {
      setIsLoading(false)
      setHasError(true) // Simular que sigue sin funcionar
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Container */}
      <div 
        className="flex-1 relative bg-black"
        onMouseMove={handleMouseMove}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-white text-xl">
                Conectando con {canal.nombre}...
              </div>
              <div className="text-blue-400">
                Canal {canal.numero} • {canal.categoria}
              </div>
            </div>
          </div>
        )}

        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center space-y-6 max-w-md">
              <div className="text-red-400 text-6xl mb-4">📺</div>
              <div className="text-white text-2xl font-bold">
                Señal no disponible
              </div>
              <div className="text-gray-400 text-lg">
                El canal {canal.nombre} no está transmitiendo en este momento
              </div>
              <div className="text-blue-400 text-sm">
                Canal {canal.numero} • {canal.categoria}
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={retryConnection}
                  className="bg-blue-600 hover:bg-blue-700 tv-navigation"
                  tabIndex={0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 tv-navigation"
                  tabIndex={0}
                >
                  <X className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </div>
            </div>
          </div>
        )}

        {!hasError && !isLoading && (
          <>
            {/* Placeholder para el video - en producción sería un video real */}
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-8xl mb-8">📺</div>
                <div className="text-white text-3xl font-bold mb-2">
                  {canal.nombre}
                </div>
                <div className="text-blue-400 text-xl mb-4">
                  Canal {canal.numero} • {canal.categoria}
                </div>
                <div className="text-green-400 flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>EN VIVO</span>
                </div>
                <div className="text-gray-400 text-sm mt-8">
                  🎬 Transmisión simulada - Contenido de ejemplo
                </div>
              </div>
            </div>
            
            {/* Video element (hidden for demo, would be visible in production) */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover hidden"
              autoPlay
              muted={isMuted}
              controls={false}
            >
              {canal.url && <source src={canal.url} type="application/x-mpegURL" />}
            </video>
          </>
        )}

        {/* Channel Info Overlay */}
        {showInfo && !isLoading && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-sm animate-fade-in">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded">
                {canal.numero}
              </div>
              <div className="text-white font-bold text-lg">
                {canal.nombre}
              </div>
            </div>
            <div className="text-blue-400 text-sm mb-2">
              {canal.categoria}
            </div>
            <div className="text-gray-300 text-sm mb-3">
              {canal.descripcion}
            </div>
            <div className="flex items-center space-x-2 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>EN VIVO</span>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && !isLoading && (
          <div className="absolute inset-0 bg-black/20">
            {/* Top Controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                onClick={() => setShowInfo(!showInfo)}
                className="bg-black/60 hover:bg-black/80 text-white border-0 tv-navigation"
                size="sm"
                tabIndex={0}
                aria-label="Mostrar/ocultar información"
              >
                <Info className="w-4 h-4" />
              </Button>
              <Button
                onClick={onClose}
                className="bg-black/60 hover:bg-black/80 text-white border-0 tv-navigation"
                size="sm"
                tabIndex={0}
                aria-label="Cerrar reproductor"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={toggleMute}
                    className="bg-transparent hover:bg-white/10 text-white border-0 tv-navigation"
                    size="sm"
                    tabIndex={0}
                    aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="text-white text-sm">
                  {canal.numero} • {canal.nombre}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    className="bg-transparent hover:bg-white/10 text-white border-0 tv-navigation"
                    size="sm"
                    tabIndex={0}
                    aria-label="Configuración"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-black/90 backdrop-blur-sm text-center py-2 text-gray-400 text-sm">
        Presiona ESC para volver • M para silenciar • I para información • Espacio para controles
      </div>
    </div>
  )
}
