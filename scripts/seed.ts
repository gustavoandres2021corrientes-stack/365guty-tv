
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...')

  // Leer datos de películas
  const moviesDataPath = path.join(process.cwd(), 'data', 'peliculas_populares.json')
  let moviesData = []
  
  try {
    const rawData = fs.readFileSync(moviesDataPath, 'utf-8')
    const parsedData = JSON.parse(rawData)
    moviesData = parsedData.peliculas || []
  } catch (error) {
    console.log('❌ No se pudo cargar el archivo de películas, creando datos de ejemplo...')
    moviesData = [
      {
        titulo: "El Padrino",
        titulo_original: "The Godfather",
        año: 1972,
        duracion: 175,
        genero: "Drama, Crimen",
        director: "Francis Ford Coppola",
        reparto: ["Marlon Brando", "Al Pacino", "James Caan", "Diane Keaton", "Robert Duvall"],
        sinopsis: "La historia de la familia Corleone, una poderosa familia de la mafia italiana en Nueva York.",
        clasificacion: "R",
        poster_url: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"
      }
    ]
  }

  // Crear usuario administrador de prueba
  const adminPassword = await bcryptjs.hash('admin365guty', 12)
  const testPassword = await bcryptjs.hash('johndoe123', 12)

  try {
    // Usuario administrador principal
    await prisma.user.upsert({
      where: { id: 'admin-1' },
      update: {},
      create: {
        id: 'admin-1',
        name: 'Administrador 365GUTY-TV',
        password: adminPassword,
        isAdmin: true
      }
    })

    // Usuario de prueba (obligatorio según las especificaciones)
    await prisma.user.upsert({
      where: { id: 'test-user-1' },
      update: {},
      create: {
        id: 'test-user-1',
        name: 'John Doe',
        password: testPassword,
        dni: '12345678',
        isAdmin: false
      }
    })

    console.log('✅ Usuarios creados exitosamente')
  } catch (error) {
    console.log('⚠️ Error creando usuarios:', error)
  }

  // Crear películas
  for (const movieData of moviesData) {
    try {
      // Convertir formato de los datos
      const movie = {
        title: movieData.titulo || movieData.title || 'Sin título',
        description: movieData.sinopsis || movieData.description || 'Sin descripción disponible',
        year: movieData.año || movieData.year || 2024,
        duration: movieData.duracion ? `${movieData.duracion} min` : (movieData.duration || '120 min'),
        genre: movieData.genero || movieData.genre || 'Drama',
        rating: movieData.clasificacion || movieData.rating || 'PG-13',
        director: movieData.director || 'Director desconocido',
        cast: Array.isArray(movieData.reparto) ? movieData.reparto.join(', ') : (movieData.cast || 'Reparto desconocido'),
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`, // URL de ejemplo
        imageUrl: movieData.poster_url || movieData.imageUrl || 'https://imgs.search.brave.com/i-jwfvanL2AwqmLTxeB2iXVCYRofakSqKAQu7J3uU-c/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFpMHY2czJaU0wu/anBn',
        featured: Math.random() > 0.7 // Algunas películas destacadas al azar
      }

      await prisma.movie.create({
        data: movie
      })

      console.log(`✅ Película creada: ${movie.title}`)
    } catch (error) {
      console.log(`⚠️ Error creando película ${movieData.titulo || movieData.title}:`, error)
    }
  }

  // Crear información de contacto por defecto
  try {
    await prisma.contactInfo.create({
      data: {
        content: `📱 Contacto 365GUTY💙-TV

📞 Teléfono: +54 11 1234-5678
📧 Email: admin@365guty.tv
💬 WhatsApp: +54 9 11 1234-5678

🕒 Horario de atención:
Lunes a Viernes: 9:00 - 18:00
Sábados: 9:00 - 13:00

¡Estamos aquí para ayudarte!`,
        active: true
      }
    })

    console.log('✅ Información de contacto creada')
  } catch (error) {
    console.log('⚠️ Error creando información de contacto:', error)
  }

  // Crear configuraciones de la aplicación
  try {
    const settings = [
      {
        key: 'platform_name',
        value: '365GUTY💙-TV',
        description: 'Nombre de la plataforma'
      },
      {
        key: 'admin_password',
        value: 'admin365guty',
        description: 'Contraseña especial de administrador'
      },
      {
        key: 'welcome_message',
        value: '¡Bienvenido a 365GUTY💙-TV! Tu plataforma de streaming favorita.',
        description: 'Mensaje de bienvenida'
      }
    ]

    for (const setting of settings) {
      await prisma.appSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      })
    }

    console.log('✅ Configuraciones de la aplicación creadas')
  } catch (error) {
    console.log('⚠️ Error creando configuraciones:', error)
  }

  // Crear algunos mensajes de ejemplo en el chat
  try {
    const sampleMessages = [
      {
        content: '¡Bienvenidos a 365GUTY💙-TV! Aquí podrán solicitar películas y recibir actualizaciones.',
        isAdmin: true,
        userName: 'Administrador',
        userId: null
      },
      {
        content: 'Hemos agregado nuevas películas al catálogo. ¡Disfrútenlas!',
        isAdmin: true,
        userName: 'Administrador',
        userId: null
      },
      {
        content: 'Si tienen alguna solicitud especial o sugerencia, no duden en escribir aquí.',
        isAdmin: true,
        userName: 'Administrador',
        userId: null
      }
    ]

    for (const message of sampleMessages) {
      await prisma.chatMessage.create({
        data: message
      })
    }

    console.log('✅ Mensajes de ejemplo creados en el chat')
  } catch (error) {
    console.log('⚠️ Error creando mensajes de ejemplo:', error)
  }

  console.log('🎉 Seeding completado exitosamente!')
  console.log('\n📝 Credenciales de acceso:')
  console.log('🔧 Administrador: cualquier nombre + contraseña "admin365guty"')
  console.log('👤 Usuario de prueba: "John Doe" + contraseña "johndoe123"')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
