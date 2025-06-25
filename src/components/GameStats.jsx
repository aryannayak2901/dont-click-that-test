import { Clock, Users, Coins, TestTube } from 'lucide-react'

export default function GameStats({ gameState }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Game Stats</h3>
      
      <div className="space-y-2 sm:space-y-3">
        {gameState.isTestMode ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TestTube className="h-4 w-4 text-warning-400" />
              <span className="text-gray-400 text-xs sm:text-sm">Mode</span>
            </div>
            <span className="text-warning-400 font-semibold text-xs sm:text-sm">
              Test Game
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-warning-400" />
              <span className="text-gray-400 text-xs sm:text-sm">Total Pot</span>
            </div>
            <span className="text-warning-400 font-semibold text-xs sm:text-sm">
              {gameState.stakeAmount * 2} GORBA
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary-400" />
            <span className="text-gray-400 text-xs sm:text-sm">Players</span>
          </div>
          <span className="text-white font-semibold text-xs sm:text-sm">
            {gameState.players.length}/2
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              gameState.gameStatus === 'playing' ? 'bg-success-400' : 
              gameState.gameStatus === 'waiting' ? 'bg-warning-400' : 'bg-gray-400'
            }`}></div>
            <span className="text-gray-400 text-xs sm:text-sm">Status</span>
          </div>
          <span className="text-white font-semibold text-xs sm:text-sm capitalize">
            {gameState.gameStatus}
          </span>
        </div>

        {gameState.gameStatus === 'playing' && (
          <div className="pt-2 sm:pt-3 border-t border-gray-700">
            <h4 className="text-white font-medium mb-2 text-sm">Scores</h4>
            <div className="space-y-1 sm:space-y-2">
              {gameState.players.map((player) => {
                const stats = gameState.playerStats[player.publicKey] || { safeRevealed: 0 }
                const displayName = player.publicKey.startsWith('test-player-') 
                  ? 'Test Player' 
                  : `${player.publicKey.slice(0, 4)}...`
                return (
                  <div key={player.publicKey} className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">
                      {displayName}
                    </span>
                    <span className="text-success-400 font-semibold text-xs">
                      {stats.safeRevealed}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}