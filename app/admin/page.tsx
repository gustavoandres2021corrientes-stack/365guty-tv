
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Movie } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Save, ArrowLeft, Users, MessageSquare, Settings, Film, Clock, UserX, UserCheck } from 'lucide-react'

export default function AdminPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [contactInfo, setContactInfo] = useState('')
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    year: 2024,
    duration: '',
    genre: '',
    rating: '',
    director: '',
    cast: '',
    videoUrl: '',
    imageUrl: '',
    type: 'movie',
    featured: false
  })
  const [episodes, setEpisodes] = useState([{
    title: '',
    description: '',
    episodeNumber: 1,
    season: 1,
    duration: '',
    videoUrl: '',
    imageUrl: ''
  }])
  const [editingMovie, setEditingMovie] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    password: '',
    dni: '',
    userType: 'standard',
    status: 'active',
    demoHours: 1,
    isAdmin: false
  })
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchMovies()
      fetchUsers()
      fetchContactInfo()
    }
  }, [status, session])

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies')
      if (response.ok) {
        const data = await response.json()
        setMovies(data)
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/contact')
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data?.content || '')
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }

  const addEpisode = () => {
    setEpisodes([...episodes, {
      title: '',
      description: '',
      episodeNumber: episodes.length + 1,
      season: 1,
      duration: '',
      videoUrl: '',
      imageUrl: ''
    }])
  }

  const removeEpisode = (index: number) => {
    if (episodes.length > 1) {
      setEpisodes(episodes.filter((_, i) => i !== index))
    }
  }

  const updateEpisode = (index: number, field: string, value: any) => {
    const updatedEpisodes = episodes.map((episode, i) => 
      i === index ? { ...episode, [field]: value } : episode
    )
    setEpisodes(updatedEpisodes)
  }

  const resetForm = () => {
    setNewMovie({
      title: '',
      description: '',
      year: 2024,
      duration: '',
      genre: '',
      rating: '',
      director: '',
      cast: '',
      videoUrl: '',
      imageUrl: '',
      type: 'movie',
      featured: false
    })
    setEpisodes([{
      title: '',
      description: '',
      episodeNumber: 1,
      season: 1,
      duration: '',
      videoUrl: '',
      imageUrl: ''
    }])
  }

  const handleCreateMovie = async () => {
    try {
      const movieData = newMovie.type === 'series' 
        ? { ...newMovie, videoUrl: null, episodes }
        : { ...newMovie, episodes: null }

      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData)
      })

      if (response.ok) {
        fetchMovies()
        resetForm()
      }
    } catch (error) {
      console.error('Error creating movie:', error)
    }
  }

  const handleDeleteMovie = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta película?')) {
      try {
        const response = await fetch(`/api/movies/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchMovies()
        }
      } catch (error) {
        console.error('Error deleting movie:', error)
      }
    }
  }

  const resetUserForm = () => {
    setNewUser({
      name: '',
      password: '',
      dni: '',
      userType: 'standard',
      status: 'active',
      demoHours: 1,
      isAdmin: false
    })
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        fetchUsers()
        resetUserForm()
        alert('Usuario creado exitosamente')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear usuario')
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser({
      ...user,
      password: '', // No mostrar la contraseña actual
      demoHours: user.demoExpiresAt ? 
        Math.round((new Date(user.demoExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60)) : 1
    })
    setShowEditDialog(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      })

      if (response.ok) {
        fetchUsers()
        setShowEditDialog(false)
        setEditingUser(null)
        alert('Usuario actualizado exitosamente')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar usuario')
    }
  }

  const handleSuspendUser = async (userId: string, reason: string = '') => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'suspended',
          suspensionReason: reason || 'Suspendido por administrador'
        })
      })

      if (response.ok) {
        fetchUsers()
        alert('Usuario suspendido')
      }
    } catch (error) {
      console.error('Error suspending user:', error)
      alert('Error al suspender usuario')
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'active',
          suspensionReason: null
        })
      })

      if (response.ok) {
        fetchUsers()
        alert('Usuario activado')
      }
    } catch (error) {
      console.error('Error activating user:', error)
      alert('Error al activar usuario')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchUsers()
          alert('Usuario eliminado')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error al eliminar usuario')
      }
    }
  }

  const handleExtendDemo = async (userId: string, hours: number = 1) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'demo',
          demoHours: hours
        })
      })

      if (response.ok) {
        fetchUsers()
        alert(`Demo extendido por ${hours} hora(s)`)
      }
    } catch (error) {
      console.error('Error extending demo:', error)
      alert('Error al extender demo')
    }
  }

  const formatTimeRemaining = (demoExpiresAt: string) => {
    const now = new Date()
    const expires = new Date(demoExpiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expirado'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'suspended': return 'text-red-400'
      case 'inactive': return 'text-gray-400'
      default: return 'text-gray-300'
    }
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'text-purple-400'
      case 'demo': return 'text-yellow-400'
      case 'standard': return 'text-blue-400'
      default: return 'text-gray-300'
    }
  }

  const handleUpdateContactInfo = async () => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contactInfo })
      })

      if (response.ok) {
        alert('Información de contacto actualizada')
      }
    } catch (error) {
      console.error('Error updating contact info:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-blue-400 text-xl">Cargando panel de administración...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          </div>
          <div className="text-gray-300">
            Administrador: {session?.user?.name}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="movies" className="flex items-center space-x-2">
              <Film className="w-4 h-4" />
              <span>Películas</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </TabsTrigger>
          </TabsList>

          {/* Gestión de Películas */}
          <TabsContent value="movies" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Agregar Nueva Película</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Título"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Director"
                    value={newMovie.director}
                    onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Año"
                    type="number"
                    value={newMovie.year}
                    onChange={(e) => setNewMovie({ ...newMovie, year: parseInt(e.target.value) })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Duración (ej: 120 min)"
                    value={newMovie.duration}
                    onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Género"
                    value={newMovie.genre}
                    onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Clasificación"
                    value={newMovie.rating}
                    onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Select value={newMovie.type} onValueChange={(value) => setNewMovie({ ...newMovie, type: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Tipo de contenido" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="movie" className="text-white hover:bg-slate-700">Película</SelectItem>
                      <SelectItem value="series" className="text-white hover:bg-slate-700">Series</SelectItem>
                      <SelectItem value="tv" className="text-white hover:bg-slate-700">TV</SelectItem>
                      <SelectItem value="tv-show" className="text-white hover:bg-slate-700">TV Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="Reparto principal (separado por comas)"
                  value={newMovie.cast}
                  onChange={(e) => setNewMovie({ ...newMovie, cast: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                
                <Textarea
                  placeholder="Descripción"
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                
                {/* URL del video solo para películas */}
                {newMovie.type !== 'series' && (
                  <Input
                    placeholder="URL del video (pixeldrain, m3u8, mp4, etc.)"
                    value={newMovie.videoUrl}
                    onChange={(e) => setNewMovie({ ...newMovie, videoUrl: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                )}
                
                <Input
                  placeholder="URL de la imagen/poster"
                  value={newMovie.imageUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, imageUrl: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />

                {/* Sección de capítulos para series */}
                {newMovie.type === 'series' && (
                  <div className="space-y-4 border border-slate-600 rounded-lg p-4 bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Capítulos de la Serie</h3>
                      <Button
                        type="button"
                        onClick={addEpisode}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Capítulo
                      </Button>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {episodes.map((episode, index) => (
                        <div key={index} className="border border-slate-500 rounded-lg p-3 bg-slate-700/50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium">Capítulo {episode.episodeNumber}</span>
                            {episodes.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeEpisode(index)}
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              placeholder="Título del capítulo"
                              value={episode.title}
                              onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                              className="bg-slate-600 border-slate-500 text-white text-sm"
                            />
                            <Input
                              placeholder="Duración (ej: 45 min)"
                              value={episode.duration}
                              onChange={(e) => updateEpisode(index, 'duration', e.target.value)}
                              className="bg-slate-600 border-slate-500 text-white text-sm"
                            />
                            <Input
                              placeholder="Temporada"
                              type="number"
                              value={episode.season}
                              onChange={(e) => updateEpisode(index, 'season', parseInt(e.target.value) || 1)}
                              className="bg-slate-600 border-slate-500 text-white text-sm"
                            />
                            <Input
                              placeholder="Número de capítulo"
                              type="number"
                              value={episode.episodeNumber}
                              onChange={(e) => updateEpisode(index, 'episodeNumber', parseInt(e.target.value) || 1)}
                              className="bg-slate-600 border-slate-500 text-white text-sm"
                            />
                          </div>
                          
                          <Textarea
                            placeholder="Descripción del capítulo (opcional)"
                            value={episode.description}
                            onChange={(e) => updateEpisode(index, 'description', e.target.value)}
                            className="bg-slate-600 border-slate-500 text-white text-sm mt-2"
                            rows={2}
                          />
                          
                          <Input
                            placeholder="URL del video del capítulo *"
                            value={episode.videoUrl}
                            onChange={(e) => updateEpisode(index, 'videoUrl', e.target.value)}
                            className="bg-slate-600 border-slate-500 text-white text-sm mt-2"
                          />
                          
                          <Input
                            placeholder="URL de imagen del capítulo (opcional)"
                            value={episode.imageUrl}
                            onChange={(e) => updateEpisode(index, 'imageUrl', e.target.value)}
                            className="bg-slate-600 border-slate-500 text-white text-sm mt-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={newMovie.featured}
                    onChange={(e) => setNewMovie({ ...newMovie, featured: e.target.checked })}
                    className="rounded"
                  />
                  <span>Destacar en la página principal</span>
                </label>
                
                <Button
                  onClick={handleCreateMovie}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {newMovie.type === 'series' ? 'Agregar Serie' : 'Agregar Película'}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de películas */}
            <div className="grid gap-4">
              {movies?.map((movie) => (
                <Card key={movie.id} className="bg-slate-900/80 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{movie.title}</h3>
                        <p className="text-gray-300 text-sm">{movie.year} • {movie.genre} • {movie.duration}</p>
                        <p className="text-gray-400 text-sm mt-1">{movie.description?.slice(0, 100)}...</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMovie(movie.id)}
                          className="border-blue-500 text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMovie(movie.id)}
                          className="border-red-500 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gestión de Usuarios */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Agregar Nuevo Usuario</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    placeholder="Nombre"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Contraseña"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="DNI (opcional)"
                    value={newUser.dni}
                    onChange={(e) => setNewUser({ ...newUser, dni: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  
                  <Select value={newUser.userType} onValueChange={(value) => setNewUser({ ...newUser, userType: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Tipo de usuario" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="standard" className="text-white hover:bg-slate-700">Usuario Estándar</SelectItem>
                      <SelectItem value="demo" className="text-white hover:bg-slate-700">Usuario Demo</SelectItem>
                      <SelectItem value="admin" className="text-white hover:bg-slate-700">Administrador</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={newUser.status} onValueChange={(value) => setNewUser({ ...newUser, status: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="active" className="text-white hover:bg-slate-700">Activo</SelectItem>
                      <SelectItem value="suspended" className="text-white hover:bg-slate-700">Suspendido</SelectItem>
                      <SelectItem value="inactive" className="text-white hover:bg-slate-700">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>

                  {newUser.userType === 'demo' && (
                    <Input
                      placeholder="Horas de demo"
                      type="number"
                      min="1"
                      max="24"
                      value={newUser.demoHours}
                      onChange={(e) => setNewUser({ ...newUser, demoHours: parseInt(e.target.value) || 1 })}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={newUser.isAdmin}
                      onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                      className="rounded"
                    />
                    <span>Privilegios de Administrador</span>
                  </label>
                </div>

                <Button
                  onClick={handleCreateUser}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Usuario
                </Button>
              </CardContent>
            </Card>

            {/* Lista de usuarios */}
            <div className="grid gap-4">
              {users?.map((user) => (
                <Card key={user.id} className="bg-slate-900/80 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-white font-semibold">{user.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getUserStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Activo' : 
                             user.status === 'suspended' ? 'Suspendido' : 'Inactivo'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getUserTypeColor(user.userType)}`}>
                            {user.userType === 'standard' ? 'Estándar' : 
                             user.userType === 'demo' ? 'Demo' : 'Admin'}
                          </span>
                          {user.isAdmin && (
                            <span className="px-2 py-1 bg-purple-600 rounded text-xs font-medium text-white">
                              ADMIN
                            </span>
                          )}
                        </div>
                        
                        <div className="text-gray-300 text-sm space-y-1">
                          {user.dni && <p>DNI: {user.dni}</p>}
                          
                          {user.userType === 'demo' && user.demoExpiresAt && (
                            <p className="text-yellow-400">
                              Demo expira en: {formatTimeRemaining(user.demoExpiresAt)}
                            </p>
                          )}
                          
                          {user.status === 'suspended' && user.suspensionReason && (
                            <p className="text-red-400">
                              Razón: {user.suspensionReason}
                            </p>
                          )}
                          
                          {user.suspendedAt && (
                            <p className="text-red-300 text-xs">
                              Suspendido: {new Date(user.suspendedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-gray-400 text-xs space-y-1">
                          <p>Creado: {new Date(user.createdAt).toLocaleDateString()}</p>
                          {user.lastLogin && (
                            <p>Último acceso: {new Date(user.lastLogin).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          {user.status === 'suspended' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateUser(user.id)}
                              className="border-green-500 text-green-400 hover:bg-green-500/10"
                            >
                              Activar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = prompt('Razón de la suspensión (opcional):')
                                if (reason !== null) handleSuspendUser(user.id, reason)
                              }}
                              className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                            >
                              Suspender
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {user.userType === 'demo' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExtendDemo(user.id, 1)}
                              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                            >
                              +1h
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExtendDemo(user.id, 2)}
                              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                            >
                              +2h
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Chat - Vista administrativa */}
          <TabsContent value="chat">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Chat del Sistema</CardTitle>
                <CardDescription className="text-gray-400">
                  Aquí puedes ver y moderar los mensajes del chat. Usa el chat flotante para responder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  El chat está disponible en la esquina inferior derecha. Desde ahí puedes:
                </p>
                <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                  <li>Enviar anuncios importantes</li>
                  <li>Responder a solicitudes de películas</li>
                  <li>Comunicarte directamente con los usuarios</li>
                  <li>Ver el historial de mensajes</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Información de Contacto</CardTitle>
                <CardDescription className="text-gray-400">
                  Este texto se mostrará en la página de login para que los usuarios puedan contactarte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escribe información de contacto (teléfonos, emails, etc.)"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white min-h-[120px]"
                />
                <Button
                  onClick={handleUpdateContactInfo}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Información
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de edición de usuario */}
      {showEditDialog && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Editar Usuario: {editingUser.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nombre"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  placeholder="Nueva contraseña (dejar vacío para mantener)"
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  placeholder="DNI (opcional)"
                  value={editingUser.dni || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, dni: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                
                <Select 
                  value={editingUser.userType} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, userType: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Tipo de usuario" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="standard" className="text-white hover:bg-slate-700">Usuario Estándar</SelectItem>
                    <SelectItem value="demo" className="text-white hover:bg-slate-700">Usuario Demo</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-slate-700">Administrador</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={editingUser.status} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="active" className="text-white hover:bg-slate-700">Activo</SelectItem>
                    <SelectItem value="suspended" className="text-white hover:bg-slate-700">Suspendido</SelectItem>
                    <SelectItem value="inactive" className="text-white hover:bg-slate-700">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                {editingUser.userType === 'demo' && (
                  <Input
                    placeholder="Horas de demo"
                    type="number"
                    min="1"
                    max="24"
                    value={editingUser.demoHours || 1}
                    onChange={(e) => setEditingUser({ ...editingUser, demoHours: parseInt(e.target.value) || 1 })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                )}
              </div>

              {editingUser.status === 'suspended' && (
                <Textarea
                  placeholder="Razón de la suspensión"
                  value={editingUser.suspensionReason || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, suspensionReason: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={3}
                />
              )}

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={editingUser.isAdmin}
                    onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                    className="rounded"
                  />
                  <span>Privilegios de Administrador</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false)
                    setEditingUser(null)
                  }}
                  className="border-gray-500 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
