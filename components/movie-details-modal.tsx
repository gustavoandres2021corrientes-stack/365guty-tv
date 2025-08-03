

'use client'

import { useState, useEffect } from 'react'
import { Movie, Episode } from '@prisma/client'
import { X, Play, ArrowLeft, Star, Clock, Calendar, Users, Film, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface MovieDetailsModalProps {
  movie: Movie & { episodes?: Episode[] }
  isOpen: boolean
  onClose: () => void
  onPlay: (movie: Movie, episode?: Episode) => void
}

export function MovieDetailsModal({ movie, isOpen, onClose, onPlay }: MovieDetailsModalProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [showEpisodes, setShowEpisodes] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSelectedEpisode(null)
      setShowEpisodes(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          onClose()
          break
        case 'Enter':
          event.preventDefault()
          handlePlay()
          break
        case 'Backspace':
          event.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handlePlay = () => {
    if (movie.type === 'series' && movie.episodes && movie.episodes.length > 0) {
      const episodeToPlay = selectedEpisode || movie.episodes[0]
      onPlay(movie, episodeToPlay)
    } else {
      onPlay(movie)
    }
  }

  const formatCast = (cast: string | null | undefined) => {
    if (!cast) return 'Reparto no disponible'
    return cast.split(',').slice(0, 4).join(', ')
  }

  const groupEpisodesBySeason = (episodes: Episode[]) => {
    const grouped = episodes.reduce((acc, episode) => {
      const season = episode.season
      if (!acc[season]) {
        acc[season] = []
      }
      acc[season].push(episode)
      return acc
    }, {} as Record<number, Episode[]>)

    // Ordenar episodios por número dentro de cada temporada
    Object.keys(grouped).forEach(season => {
      grouped[parseInt(season)].sort((a, b) => a.episodeNumber - b.episodeNumber)
    })

    return grouped
  }

  if (!isOpen) return null

  const isMovie = movie.type === 'movie'
  const isSeries = movie.type === 'series'
  const groupedEpisodes = isSeries && movie.episodes ? groupEpisodesBySeason(movie.episodes) : {}
  const seasons = Object.keys(groupedEpisodes).map(Number).sort((a, b) => a - b)

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Fondo con la portada */}
      <div className="absolute inset-0">
        {movie.imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={movie.imageUrl}
              alt={movie.title}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/50" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900" />
        )}
      </div>

      {/* Contenido del modal */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header con botones */}
        <div className="flex justify-between items-center p-6">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/20 tv-navigation netflix-focus-item"
            aria-label="Volver atrás"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/20 tv-navigation netflix-focus-item"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Información principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Título y metadatos */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {isMovie ? (
                      <Film className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Tv className="w-6 h-6 text-blue-400" />
                    )}
                    <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-300">
                    {movie.year && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{movie.year}</span>
                      </div>
                    )}
                    
                    {movie.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{movie.duration}</span>
                      </div>
                    )}
                    
                    {movie.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{movie.rating}</span>
                      </div>
                    )}
                    
                    {movie.genre && (
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                        {movie.genre}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handlePlay}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg tv-navigation netflix-focus-item"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isSeries ? 'Ver primer episodio' : 'Reproducir'}
                  </Button>
                  
                  {movie.trailerUrl && (
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-3 tv-navigation netflix-focus-item"
                    >
                      Ver tráiler
                    </Button>
                  )}
                </div>

                {/* Sinopsis */}
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-white">Sinopsis</h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {movie.description || 'Sinopsis no disponible para este contenido.'}
                  </p>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {movie.director && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Director
                      </h3>
                      <p className="text-white">{movie.director}</p>
                    </div>
                  )}
                  
                  {movie.cast && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Reparto
                      </h3>
                      <p className="text-white">{formatCast(movie.cast)}</p>
                    </div>
                  )}
                </div>

                {/* Lista de episodios para series */}
                {isSeries && movie.episodes && movie.episodes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white">Episodios</h2>
                      <Button
                        onClick={() => setShowEpisodes(!showEpisodes)}
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 tv-navigation"
                      >
                        {showEpisodes ? 'Ocultar' : 'Mostrar'} episodios
                      </Button>
                    </div>
                    
                    {showEpisodes && (
                      <div className="space-y-6">
                        {seasons.map(seasonNumber => (
                          <div key={seasonNumber} className="space-y-3">
                            <h3 className="text-lg font-semibold text-blue-400">
                              Temporada {seasonNumber}
                            </h3>
                            <div className="grid gap-3">
                              {groupedEpisodes[seasonNumber].map((episode) => (
                                <div
                                  key={episode.id}
                                  className={`bg-white/5 backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all duration-300 border-2 tv-navigation netflix-focus-item ${
                                    selectedEpisode?.id === episode.id
                                      ? 'border-red-500 bg-red-500/20'
                                      : 'border-transparent hover:border-blue-500/50 hover:bg-white/10'
                                  }`}
                                  onClick={() => setSelectedEpisode(episode)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-white font-medium">
                                      {episode.episodeNumber}. {episode.title}
                                    </h4>
                                    {episode.duration && (
                                      <span className="text-gray-400 text-sm">
                                        {episode.duration}
                                      </span>
                                    )}
                                  </div>
                                  {episode.description && (
                                    <p className="text-gray-300 text-sm line-clamp-2">
                                      {episode.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Poster lateral */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  {movie.imageUrl ? (
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                      <Image
                        src={movie.imageUrl}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[2/3] bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-2xl">
                      {isMovie ? (
                        <Film className="w-16 h-16 text-white/60" />
                      ) : (
                        <Tv className="w-16 h-16 text-white/60" />
                      )}
                    </div>
                  )}
                  
                  {/* Información técnica */}
                  <div className="mt-6 space-y-3 bg-white/5 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-white font-semibold">Información</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tipo:</span>
                        <span className="text-white capitalize">{movie.type === 'movie' ? 'Película' : 'Serie'}</span>
                      </div>
                      {movie.year && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Año:</span>
                          <span className="text-white">{movie.year}</span>
                        </div>
                      )}
                      {movie.genre && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Género:</span>
                          <span className="text-white">{movie.genre}</span>
                        </div>
                      )}
                      {isSeries && movie.episodes && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Episodios:</span>
                          <span className="text-white">{movie.episodes.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con instrucciones */}
        <div className="bg-black/50 backdrop-blur-sm p-4 text-center text-gray-400 text-sm">
          Presiona ESC o Retroceso para volver • Enter para reproducir • Usa las flechas para navegar
        </div>
      </div>
    </div>
  )
}

