import { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { Crown, Target, TestTube } from 'lucide-react'

const AVATAR_REACTIONS = ['😈', '😭', '😏', '😂', '💣', '🎯', '🔥', '💀']

export default function PlayerAvatar({ player, isCurrentPlayer, isActive, stats }) {
  const { sendAvatarReaction, gameState } = useGame()
  const [currentReaction, setCurrentReaction] = useState(null)
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  useEffect(() => {
    if (currentReaction) {
      const timer = setTimeout(() => {
        setCurrentReaction(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentReaction])

  const handleReactionClick = (reaction) => {
    if (isCurrentPlayer) {
      setCurrentReaction(reaction)
      sendAvatarReaction(reaction)
      setShowReactionPicker(false)
    }
  }

  const truncateAddress = (address) => {
    if (!address) return 'Unknown'
    if (address.startsWith('test-player-')) return 'Test Player'
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className={`relative bg-dark-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border transition-all ${
      isActive ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-gray-700'
    }`}>
      {/* Reaction Display */}
      {currentReaction && (
        <div className="avatar-reaction">
          {currentReaction}
        </div>
      )}

      {/* Player Info */}
      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-2xl ${
          isCurrentPlayer ? 'bg-primary-500/20' : 'bg-gray-600/20'
        }`}>
          {isCurrentPlayer ? '🎮' : '🤖'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <p className="text-white font-medium text-sm sm:text-base truncate">
              {isCurrentPlayer ? 'You' : 'Opponent'}
            </p>
            {isActive && <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />}
            {gameState.isTestMode && (
              <TestTube className="h-3 w-3 sm:h-4 sm:w-4 text-warning-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-gray-400 text-xs font-mono truncate">
            {truncateAddress(player?.publicKey)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs sm:text-sm">Safe Tiles</span>
          <div className="flex items-center space-x-1">
            <Target className="h-3 w-3 text-success-400" />
            <span className="text-success-400 font-semibold text-sm">{stats.safeRevealed || 0}</span>
          </div>
        </div>
      </div>

      {/* Reaction Picker for Current Player */}
      {isCurrentPlayer && (
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="w-full bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 text-xs sm:text-sm py-1 sm:py-2 rounded-lg transition-colors"
          >
            React 😎
          </button>
          
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-900 border border-gray-600 rounded-lg p-2 grid grid-cols-4 gap-1 z-10">
              {AVATAR_REACTIONS.map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => handleReactionClick(reaction)}
                  className="p-1 sm:p-2 hover:bg-gray-700 rounded text-base sm:text-lg transition-colors"
                >
                  {reaction}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}