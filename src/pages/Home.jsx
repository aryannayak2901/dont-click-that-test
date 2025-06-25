import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame } from '../contexts/GameContext'
import { Play, Coins, Users, Zap, TestTube, Gamepad2, Bot } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { connected } = useWallet()
  const { joinGame } = useGame()
  const [stakeAmount, setStakeAmount] = useState(10)
  const [isJoining, setIsJoining] = useState(false)

  const handleStartGame = async (isTestMode = false) => {
    if (!isTestMode && !connected) {
      alert('Please connect your wallet first!')
      return
    }

    setIsJoining(true)
    try {
      await joinGame(isTestMode ? 0 : stakeAmount, isTestMode)
      navigate('/game')
    } catch (error) {
      console.error('Failed to join game:', error)
      alert('Failed to join game. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-500/20 p-4 rounded-full">
              <Gamepad2 className="h-16 w-16 text-primary-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Don't Click That!
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
            The ultimate 1v1 on-chain Minesweeper battle. Stake GORBA tokens and outsmart your opponent!
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-500/20 p-3 sm:p-4 rounded-full mb-2 mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary-400" />
              </div>
              <p className="text-sm text-gray-400">Fast-paced</p>
            </div>
            <div className="text-center">
              <div className="bg-success-500/20 p-3 sm:p-4 rounded-full mb-2 mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-success-400" />
              </div>
              <p className="text-sm text-gray-400">Stake & Win</p>
            </div>
            <div className="text-center">
              <div className="bg-warning-500/20 p-3 sm:p-4 rounded-full mb-2 mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-warning-400" />
              </div>
              <p className="text-sm text-gray-400">1v1 Battles</p>
            </div>
          </div>
        </div>

        {/* Game Setup Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Real Game Card */}
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Real Game</h2>
              <p className="text-gray-400 text-sm">Stake GORBA tokens and compete for real rewards</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stake Amount (GORBA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-dark-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  min="1"
                  max="1000"
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <Coins className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Winner takes all! Minimum stake: 1 GORBA
              </p>
            </div>

            <button
              onClick={() => handleStartGame(false)}
              disabled={isJoining || !connected}
              className={`w-full py-3 sm:py-4 px-6 rounded-lg font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 transition-all ${
                connected && !isJoining
                  ? 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Finding Opponent...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>{connected ? 'Start Real Game' : 'Connect Wallet First'}</span>
                </>
              )}
            </button>
          </div>

          {/* Test Mode Card */}
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Test Mode</h2>
              <p className="text-gray-400 text-sm">Practice against AI bot - perfect for developers!</p>
            </div>
            
            <div className="mb-6 p-4 bg-warning-500/10 border border-warning-500/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="h-5 w-5 text-purple-400" />
                <span className="text-purple-400 font-medium text-sm">AI Bot Opponent</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• No wallet connection required</li>
                <li>• Play against intelligent AI bot</li>
                <li>• No token staking</li>
                <li>• Full game functionality</li>
                <li>• Perfect for testing & learning</li>
              </ul>
            </div>

            <button
              onClick={() => handleStartGame(true)}
              disabled={isJoining}
              className={`w-full py-3 sm:py-4 px-6 rounded-lg font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 transition-all ${
                !isJoining
                  ? 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Starting Bot Game...</span>
                </>
              ) : (
                <>
                  <Bot className="h-5 w-5" />
                  <span>Play vs AI Bot</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">How to Play</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Game Rules:</h4>
              <ul className="space-y-1">
                <li>• Take turns revealing tiles on a 10×10 grid</li>
                <li>• First player to hit a mine loses</li>
                <li>• If no mines hit, most safe tiles wins</li>
                <li>• Winner takes the entire token pot</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Real-time multiplayer action</li>
                <li>• AI bot for testing & practice</li>
                <li>• Animated avatar reactions</li>
                <li>• In-game chat and emojis</li>
                <li>• Automatic on-chain payouts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}