import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useWallet } from '@solana/wallet-adapter-react'
import GameGrid from '../components/GameGrid'
import PlayerAvatar from '../components/PlayerAvatar'
import ChatPanel from '../components/ChatPanel'
import GameStats from '../components/GameStats'
import { ArrowLeft, Crown, Bomb, TestTube } from 'lucide-react'

export default function Game() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { publicKey } = useWallet()
  const { gameState, revealTile, sendAvatarReaction } = useGame()
  const [selectedTile, setSelectedTile] = useState(null)
  const [showEndModal, setShowEndModal] = useState(false)

  useEffect(() => {
    if (gameState.gameStatus === 'finished') {
      setShowEndModal(true)
    }
  }, [gameState.gameStatus])

  const handleTileClick = (x, y) => {
    if (gameState.gameStatus !== 'playing') return
    
    const playerKey = publicKey?.toString() || `test-player-${Date.now()}`
    if (gameState.currentTurn !== playerKey) return
    
    setSelectedTile({ x, y })
    revealTile(x, y)
  }

  const handleBackHome = () => {
    navigate('/')
  }

  const playerKey = publicKey?.toString() || `test-player-${Date.now()}`
  const currentPlayer = gameState.players.find(p => p.publicKey === playerKey)
  const opponent = gameState.players.find(p => p.publicKey !== playerKey)
  const isMyTurn = gameState.currentTurn === playerKey

  if (gameState.gameStatus === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Waiting for opponent...</h2>
          {gameState.isTestMode ? (
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TestTube className="h-4 w-4 text-warning-400" />
              <span className="text-warning-400 text-sm">Test Mode</span>
            </div>
          ) : (
            <p className="text-gray-400">Stake: {gameState.stakeAmount} GORBA</p>
          )}
          <button
            onClick={handleBackHome}
            className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={handleBackHome}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-lg sm:text-2xl font-bold text-white">Don't Click That!</h1>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              {gameState.isTestMode ? (
                <>
                  <TestTube className="h-4 w-4 text-warning-400" />
                  <span className="text-warning-400">Test Mode</span>
                </>
              ) : (
                <>
                  <span>Pot: {gameState.stakeAmount * 2} GORBA</span>
                </>
              )}
            </div>
          </div>
          
          <div className="w-16 sm:w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Player Avatars - Mobile: Horizontal, Desktop: Vertical */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4">
              <div className="flex-1 lg:flex-none">
                <PlayerAvatar
                  player={currentPlayer}
                  isCurrentPlayer={true}
                  isActive={isMyTurn}
                  stats={gameState.playerStats[currentPlayer?.publicKey] || { safeRevealed: 0 }}
                />
              </div>
              <div className="flex-1 lg:flex-none">
                <PlayerAvatar
                  player={opponent}
                  isCurrentPlayer={false}
                  isActive={!isMyTurn}
                  stats={gameState.playerStats[opponent?.publicKey] || { safeRevealed: 0 }}
                />
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="lg:col-span-2 order-3 lg:order-2">
            <div className="text-center mb-2 sm:mb-4">
              <div className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-sm ${
                isMyTurn ? 'bg-success-500/20 text-success-400' : 'bg-warning-500/20 text-warning-400'
              }`}>
                {isMyTurn ? (
                  <>
                    <Crown className="h-4 w-4" />
                    <span>Your Turn</span>
                  </>
                ) : (
                  <>
                    <div className="animate-pulse h-2 w-2 bg-warning-400 rounded-full"></div>
                    <span>Opponent's Turn</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <GameGrid
                grid={gameState.grid}
                onTileClick={handleTileClick}
                disabled={!isMyTurn || gameState.gameStatus !== 'playing'}
                selectedTile={selectedTile}
              />
            </div>
          </div>

          {/* Chat & Stats - Mobile: Above grid, Desktop: Right side */}
          <div className="lg:col-span-1 order-2 lg:order-3 space-y-4">
            <div className="block lg:hidden">
              <GameStats gameState={gameState} />
            </div>
            <div className="hidden lg:block">
              <GameStats gameState={gameState} />
            </div>
            <div className="hidden sm:block">
              <ChatPanel />
            </div>
          </div>
        </div>

        {/* Mobile Chat Panel */}
        <div className="sm:hidden mt-4">
          <ChatPanel />
        </div>
      </div>

      {/* Game End Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
            {gameState.winner === playerKey ? (
              <>
                <div className="text-4xl sm:text-6xl mb-4">🏆</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-success-400 mb-2">You Win!</h2>
                {gameState.isTestMode ? (
                  <p className="text-gray-300 mb-6">
                    Great job! You won this test game.
                  </p>
                ) : (
                  <p className="text-gray-300 mb-6">
                    You've won {gameState.stakeAmount * 2} GORBA tokens!
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="text-4xl sm:text-6xl mb-4">💥</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-danger-400 mb-2">Boom! You Lose</h2>
                <p className="text-gray-300 mb-6">
                  Better luck next time! Your opponent gets the pot.
                </p>
              </>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full btn-primary py-3"
              >
                Play Again
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className="w-full text-gray-400 hover:text-white transition-colors py-2"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}