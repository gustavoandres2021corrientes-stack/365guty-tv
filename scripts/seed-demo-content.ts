
import { PrismaClient } from '@prisma/client'
import peliculasPopulares from '../data/peliculas_populares.json'
import peliculasAdicionales from '../data/peliculas_adicionales.json'
import seriesPopulares from '../data/series_populares.json'

const prisma = new PrismaClient()

async function seedDemoContent() {
  console.log('🎬 Iniciando seed de contenido demo...')

  // Limpiar contenido existente (opcional)
  console.log('🧹 Limpiando contenido existente...')
  await prisma.episode.deleteMany({})
  await prisma.movie.deleteMany({})

  // Agregar películas populares
  console.log('🎥 Agregando películas populares...')
  for (const pelicula of peliculasPopulares) {
    await prisma.movie.create({
      data: {
        title: pelicula.titulo,
        description: pelicula.sinopsis,
        year: pelicula.año,
        duration: pelicula.duracion,
        genre: pelicula.genero,
        rating: pelicula.clasificacion,
        director: pelicula.director,
        cast: pelicula.reparto_principal.join(', '),
        type: 'movie',
        imageUrl: pelicula.poster_url,
        videoUrl: `https://demo-streaming.example.com/movies/${pelicula.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp4`,
        trailerUrl: `https://demo-trailers.example.com/${pelicula.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}-trailer.mp4`,
        featured: Math.random() > 0.7, // 30% de probabilidad de ser destacado
        active: true
      }
    })
  }

  // Agregar películas adicionales
  console.log('🎬 Agregando películas adicionales...')
  for (const pelicula of peliculasAdicionales) {
    await prisma.movie.create({
      data: {
        title: pelicula.titulo,
        description: pelicula.sinopsis,
        year: pelicula.año,
        duration: pelicula.duracion,
        genre: pelicula.genero,
        rating: pelicula.clasificacion,
        director: pelicula.director,
        cast: pelicula.reparto_principal.join(', '),
        type: 'movie',
        imageUrl: pelicula.poster_url,
        videoUrl: `https://demo-streaming.example.com/movies/${pelicula.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp4`,
        trailerUrl: `https://demo-trailers.example.com/${pelicula.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}-trailer.mp4`,
        featured: Math.random() > 0.8, // 20% de probabilidad de ser destacado
        active: true
      }
    })
  }

  // Agregar series populares
  console.log('📺 Agregando series populares...')
  for (const serie of seriesPopulares) {
    const serieCreada = await prisma.movie.create({
      data: {
        title: serie.titulo,
        description: serie.sinopsis,
        year: serie.año,
        duration: serie.duracion,
        genre: serie.genero,
        rating: serie.clasificacion,
        director: serie.creador,
        cast: serie.reparto_principal.join(', '),
        type: 'series',
        imageUrl: serie.poster_url,
        featured: Math.random() > 0.6, // 40% de probabilidad de ser destacado
        active: true
      }
    })

    // Agregar episodios demo para cada serie
    console.log(`📺 Agregando episodios para ${serie.titulo}...`)
    for (let temporada = 1; temporada <= Math.min(serie.temporadas, 2); temporada++) {
      const episodiosEnTemporada = temporada === 1 ? 10 : Math.floor(Math.random() * 10) + 6
      
      for (let episodio = 1; episodio <= episodiosEnTemporada; episodio++) {
        await prisma.episode.create({
          data: {
            title: `${serie.titulo} - T${temporada}E${episodio}`,
            description: `Episodio ${episodio} de la temporada ${temporada} de ${serie.titulo}. Una nueva aventura llena de emociones y sorpresas que no te puedes perder.`,
            episodeNumber: episodio,
            season: temporada,
            duration: serie.duracion.split(' ')[0] + ' min',
            videoUrl: `https://imgs.search.brave.com/qf05xav3VayK3cdJYZykcu8jCefdsfbIRI7mtU-8ims/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/cm9sbGluZ3N0b25l/LmNvbS93cC1jb250/ZW50L3VwbG9hZHMv/MjAyNC8wOC85Mi1N/eVNjcmV3dXAuanBn/P3c9MzAw '-')}/t${temporada}e${episodio}.mp4`,
            imageUrl: `https://imgs.search.brave.com/7HImVBhhaLtCuKUdSOulVYQotssHkdSe_tiC3N2_yr8/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9iLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vd245/RU9tQm9EWFdPY01t/eVU3Y1NqNDg4M2w0/TVFBQTFsR3BKcDAy/YWFQdy5qcGc '-')}/t${temporada}e${episodio}.jpg`,
            movieId: serieCreada.id,
            active: true
          }
        })
      }
    }
  }

  const totalPeliculas = await prisma.movie.count({ where: { type: 'movie' } })
  const totalSeries = await prisma.movie.count({ where: { type: 'series' } })
  const totalEpisodios = await prisma.episode.count()

  console.log(`✅ Seed completado!`)
  console.log(`🎥 Películas agregadas: ${totalPeliculas}`)
  console.log(`📺 Series agregadas: ${totalSeries}`)
  console.log(`📼 Episodios agregados: ${totalEpisodios}`)
}

seedDemoContent()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
