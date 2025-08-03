
'use client'

import { useState, useRef, useEffect } from 'react'
import { VideoPlayerProps, VideoFormat } from '@/lib/types'
import { X, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import { RemoteNavigation } from './remote-navigation'

export function VideoPlayer({ src, title, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [isPlaying, showControls])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const handleSeek = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getVideoFormat = (url: string): VideoFormat => {
    if (url.includes('pixeldrain.com')) return 'pixeldrain'
    if (url.includes('.m3u8')) return 'm3u8'
    if (url.includes('.mp4')) return 'mp4'
    return 'direct'
  }

  const processVideoUrl = (url: string): string => {
    const format = getVideoFormat(url)
    
    if (format === 'pixeldrain') {
      // Convertir URL de pixeldrain para acceso directo
      const fileId = url.split('/').pop()
      return `https://pixeldrain.com/api/file/${fileId}?download`
    }
    
    return url
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <RemoteNavigation
        onEnter={togglePlay}
        onBack={onClose}
        onLeft={() => handleSeek(-10)}
        onRight={() => handleSeek(10)}
        onUp={() => setShowControls(true)}
        onDown={() => setShowControls(true)}
      />
      
      <div 
        className="relative w-full h-full"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={processVideoUrl(src)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          autoPlay
        />

        {/* Controles */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold">{title}</h1>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-400 transition-colors p-2 rounded-full bg-black/50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Controles centrales */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleSeek(-10)}
                className="text-white hover:text-blue-400 transition-colors p-3 rounded-full bg-black/50"
              >
                <SkipBack size={32} />
              </button>
              
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors p-4 rounded-full bg-black/70"
              >
                {isPlaying ? <Pause size={40} /> : <Play size={40} />}
              </button>
              
              <button
                onClick={() => handleSeek(10)}
                className="text-white hover:text-blue-400 transition-colors p-3 rounded-full bg-black/50"
              >
                <SkipForward size={32} />
              </button>
            </div>
          </div>

          {/* Controles inferiores */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              
              <div className="flex-1 flex items-center space-x-2">
                <span className="text-white text-sm min-w-[50px]">
                  {formatTime(currentTime)}
                </span>
                
                <div className="flex-1 bg-white/20 h-1 rounded-full">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                
                <span className="text-white text-sm min-w-[50px]">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
