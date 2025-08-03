
'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatProps, ChatMessageWithUser } from '@/lib/types'
import { Send, MessageCircle, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'

export function Chat({ isAdmin, userName, userId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Polling cada 3 segundos
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          isAdmin,
          userName,
          userId: isAdmin ? null : userId
        })
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="w-full h-full bg-slate-900/50 rounded-lg p-4">
      {/* Header del Chat */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-semibold">Chat 365GUTY💙-TV</h3>
        </div>
        <div className="text-xs text-gray-400">
          {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="h-80 mb-4 overflow-y-auto bg-slate-800/50 rounded-lg p-3 tv-navigation chat-input-focus">
        <ScrollArea className="h-full">
          <div className="space-y-3">
            {messages?.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col space-y-1 chat-message ${
                    message.isAdmin ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg transition-all duration-200 ${
                      message.isAdmin
                        ? 'bg-red-600 text-white border border-red-500'
                        : 'bg-slate-700 text-gray-100 border border-slate-600'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className={message.isAdmin ? 'text-red-300 font-semibold' : ''}>
                      {message.isAdmin ? '👑 ' : ''}{message.userName}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay mensajes aún</p>
                  <p className="text-xs">¡Sé el primero en escribir!</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input para Nuevo Mensaje */}
      <div className="flex space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isAdmin ? "Escribe un anuncio para todos..." : "Pide una película o envía sugerencias..."}
          className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 tv-navigation chat-input-focus"
          tabIndex={0}
          aria-label="Campo de mensaje de chat"
        />
        <Button
          onClick={sendMessage}
          size="sm"
          className="bg-red-600 hover:bg-red-700 tv-navigation"
          disabled={!newMessage.trim()}
          tabIndex={0}
          aria-label="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Instrucciones de navegación */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        {isAdmin ? (
          "💡 Los mensajes de administrador aparecen resaltados para todos los usuarios"
        ) : (
          "💡 Usa este chat para pedir películas o enviar sugerencias al administrador"
        )}
      </div>
    </div>
  )
}
