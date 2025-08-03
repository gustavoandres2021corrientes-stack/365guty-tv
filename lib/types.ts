
import { User, Movie, ChatMessage, ContactInfo, AppSettings } from '@prisma/client'
import { DefaultSession } from 'next-auth'

export type UserWithRelations = User & {
  chatMessages?: ChatMessage[]
}

export type MovieWithMetadata = Movie

export type ChatMessageWithUser = ChatMessage & {
  user?: User | null
}

export interface StreamingUser {
  id: string
  name: string
  isAdmin: boolean
}

// Extend the default session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin: boolean
      userType?: string
      status?: string
      demoExpiresAt?: Date | null
    }
  }

  interface User {
    isAdmin: boolean
    userType?: string
    status?: string
    demoExpiresAt?: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin: boolean
    userType?: string
    status?: string
    demoExpiresAt?: Date | null
  }
}

export interface LoginCredentials {
  name: string
  password: string
  dni?: string
}

export interface VideoPlayerProps {
  src: string
  title: string
  onClose: () => void
}

export interface MovieGridProps {
  movies: Movie[]
  onMovieSelect: (movie: Movie) => void
}

export interface ChatProps {
  isAdmin: boolean
  userName: string
  userId?: string
}

// Tipos para el reproductor de video
export type VideoFormat = 'mp4' | 'm3u8' | 'pixeldrain' | 'direct'

export interface VideoSource {
  url: string
  format: VideoFormat
  quality?: string
}

// Tipos para navegación con control remoto
export interface RemoteNavigationProps {
  onUp?: () => void
  onDown?: () => void
  onLeft?: () => void
  onRight?: () => void
  onEnter?: () => void
  onBack?: () => void
}

// Configuración de la app
export interface AppConfig {
  adminPassword: string
  contactInfo: string
  platformName: string
  platformLogo?: string
}
