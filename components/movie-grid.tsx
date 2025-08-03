
'use client'

import { useState, useEffect, useRef } from 'react'
import { Movie, Episode } from '@prisma/client'
import { MovieGridProps } from '@/lib/types'
import { Play, Star, Clock } from 'lucide-react'
import { useNetflixNavigation } from '@/hooks/useNetflixNavigation'
import { MovieDetailsModal } from './movie-details-modal'
import Image from 'next/image'

type MovieWithEpisodes = Movie & { episodes?: Episode[] }

interface ExtendedMovieGridProps extends Omit<MovieGridProps, 'movies'> {
  movies: MovieWithEpisodes[]
}

export function MovieGrid({ movies, onMovieSelect }: ExtendedMovieGridProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedMovie, setSelectedMovie] = useState<MovieWithEpisodes | null>(movies[0] || null)
  const [modalMovie, setModalMovie] = useState<MovieWithEpisodes | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const movieRefs = useRef<(HTMLDivElement | null)[]>([])
  const { registerNavigationItem, unregisterNavigationItem } = useNetflixNavigation()

  // Registrar elementos de película para navegación
  useEffect(() => {
    movies.forEach((movie, index) => {
      const element = movieRefs.current[index]
      if (element) {
        registerNavigationItem({
          id: `movie-${movie.id}`,
          area: 'content',
          element,
          row: Math.floor(index / 6),
          col: index % 6,
          canReceiveFocus: true
        })
      }
    })

    return () => {
      movies.forEach((movie) => {
        unregisterNavigationItem(`movie-${movie.id}`, 'content')
      })
    }
  }, [movies, registerNavigationItem, unregisterNavigationItem])

  const handleNavigation = (direction: 'up' | 'down' | 'left' | 'right') => {
    const rows = Math.ceil(movies.length / 6)
    const currentRow = Math.floor(selectedIndex / 6)
    const currentCol = selectedIndex % 6

    let newIndex = selectedIndex

    switch (direction) {
      case 'up':
        if (currentRow > 0) {
          newIndex = Math.max(0, selectedIndex - 6)
        }
        break
      case 'down':
        if (currentRow < rows - 1) {
          newIndex = Math.min(movies.length - 1, selectedIndex + 6)
        }
        break
      case 'left':
        if (currentCol > 0) {
          newIndex = selectedIndex - 1
        }
        break
      case 'right':
        if (currentCol < 5 && selectedIndex < movies.length - 1) {
          newIndex = selectedIndex + 1
        }
        break
    }

    setSelectedIndex(newIndex)
    setSelectedMovie(movies[newIndex] || null)
  }

  const handleMovieClick = (movie: MovieWithEpisodes, index: number) => {
    setSelectedIndex(index)
    setSelectedMovie(movie)
    // Abrir el modal de detalles
    setModalMovie(movie)
    setIsModalOpen(true)
  }

  const handleSelect = (movie?: MovieWithEpisodes) => {
    const movieToSelect = movie || selectedMovie
    if (movieToSelect) {
      setModalMovie(movieToSelect)
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalMovie(null)
  }

  const handlePlayFromModal = (movie: Movie, episode?: Episode) => {
    setIsModalOpen(false)
    setModalMovie(null)
    onMovieSelect(movie)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          handleNavigation('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          handleNavigation('down')
          break
        case 'ArrowLeft':
          event.preventDefault()
          handleNavigation('left')
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNavigation('right')
          break
        case 'Enter':
          event.preventDefault()
          handleSelect()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, selectedMovie])

  return (
    <div className="p-2 max-w-6xl mx-auto">
      {/* Película destacada */}
      {selectedMovie && (
        <div className="mb-4 relative rounded-lg overflow-hidden bg-gradient-to-r from-slate-900 to-red-900">
          <div className="flex items-center p-4">
            <div className="flex-1 space-y-2">
              <h1 className="text-xl font-bold text-white">{selectedMovie.title}</h1>
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{selectedMovie.rating}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{selectedMovie.duration}</span>
                </span>
                <span>{selectedMovie.year}</span>
                <span className="px-1 py-0.5 bg-red-600 rounded text-xs">{selectedMovie.genre}</span>
              </div>
              <p className="text-gray-300 text-sm max-w-xl line-clamp-2">{selectedMovie.description}</p>
              <button
                onClick={() => handleSelect()}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors tv-navigation"
              >
                <Play className="w-3 h-3" />
                <span>Ver</span>
              </button>
            </div>
            
            {selectedMovie.imageUrl && (
              <div className="ml-4 relative w-24 h-32 rounded overflow-hidden">
                <Image
                  src={selectedMovie.imageUrl}
                  alt={selectedMovie.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid de películas */}
      <div className="grid grid-cols-6 gap-2">
        {movies?.map((movie, index) => (
          <div
            key={movie.id}
            ref={(el) => (movieRefs.current[index] = el)}
            className={`group relative rounded overflow-hidden transition-all duration-300 cursor-pointer tv-navigation ${
              index === selectedIndex 
                ? 'movie-card-focus' 
                : 'hover:movie-card-focus'
            }`}
            onClick={() => handleMovieClick(movie, index)}
            onDoubleClick={() => handleSelect(movie)}
            tabIndex={0}
            role="button"
            aria-label={`Película: ${movie.title}`}
          >
            <div className="relative aspect-[2/3] bg-slate-800">
              {movie.imageUrl ? (
                <Image
                  src={movie.imageUrl}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                  <Play className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-semibold text-xs mb-0.5 line-clamp-2">{movie.title}</h3>
                <div className="flex items-center space-x-1 text-gray-300 text-xs">
                  <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                  <span>{movie.rating}</span>
                  <span>•</span>
                  <span>{movie.year}</span>
                </div>
              </div>

              {/* Indicador de selección estilo Netflix */}
              {index === selectedIndex && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="bg-red-600 rounded-full p-2">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalles de película/serie */}
      {modalMovie && (
        <MovieDetailsModal
          movie={modalMovie}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPlay={handlePlayFromModal}
        />
      )}
    </div>
  )
}
