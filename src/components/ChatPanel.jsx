import { useState, useRef, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { Send, Smile } from 'lucide-react'

const QUICK_REACTIONS = ['😀', '😎', '😤', '😱', '🔥', '💪', '👏', '🎯']
const QUICK_MESSAGES = [
  'Good luck!',
  'Nice move!',
  'Oh no!',
  'So close!',
  'Let\'s go!',
  'GG!',
]

export default function ChatPanel() {
  const { gameState, sendChatMessage } = useGame()
  const [message, setMessage] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [gameState.chatMessages])

  const handleSendMessage = (msg = message) => {
    if (msg.trim()) {
      sendChatMessage(msg.trim())
      setMessage('')
      setShowEmojis(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-gray-700 h-64 sm:h-80 flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2">
        {gameState.chatMessages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-4 sm:mt-8">
            <p>No messages yet.</p>
            <p>Say hello to your opponent!</p>
          </div>
        ) : (
          gameState.chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm ${
                  msg.isOwn
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions */}
      <div className="p-2 border-t border-gray-700">
        <div className="flex flex-wrap gap-1 mb-2">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendMessage(emoji)}
              className="p-1 hover:bg-gray-700 rounded text-sm sm:text-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {QUICK_MESSAGES.map((msg) => (
            <button
              key={msg}
              onClick={() => handleSendMessage(msg)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-2 sm:p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-dark-900 border border-gray-600 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-white text-xs sm:text-sm focus:border-primary-500 focus:outline-none"
            maxLength={100}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!message.trim()}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}