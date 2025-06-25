import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Trophy, Target, Coins, TrendingUp } from 'lucide-react'

export default function Profile() {
  const { publicKey, connected } = useWallet()
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalEarned: 0,
    winStreak: 0,
    bestWinStreak: 0,
    averageScore: 0,
    rank: 0,
  })

  useEffect(() => {
    if (connected && publicKey) {
      // In a real app, fetch user stats from backend
      setUserStats({
        gamesPlayed: 15,
        gamesWon: 9,
        totalEarned: 250,
        winStreak: 3,
        bestWinStreak: 7,
        averageScore: 12.4,
        rank: 42,
      })
    }
  }, [connected, publicKey])

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    )
  }

  const winRate = userStats.gamesPlayed > 0 ? (userStats.gamesWon / userStats.gamesPlayed * 100) : 0

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Player Profile</h1>
          <p className="text-gray-400 font-mono text-xs sm:text-sm break-all">
            {publicKey?.toString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              <div className="bg-primary-500/20 p-2 rounded-lg">
                <Target className="h-4 w-4 sm:h-6 sm:w-6 text-primary-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white">{userStats.gamesPlayed}</p>
                <p className="text-xs sm:text-sm text-gray-400">Games Played</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              <div className="bg-success-500/20 p-2 rounded-lg">
                <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-success-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white">{userStats.gamesWon}</p>
                <p className="text-xs sm:text-sm text-gray-400">Games Won</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              <div className="bg-warning-500/20 p-2 rounded-lg">
                <Coins className="h-4 w-4 sm:h-6 sm:w-6 text-warning-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white">{userStats.totalEarned}</p>
                <p className="text-xs sm:text-sm text-gray-400">GORBA Earned</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              <div className="bg-danger-500/20 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-danger-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white">#{userStats.rank}</p>
                <p className="text-xs sm:text-sm text-gray-400">Global Rank</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Win Rate</span>
                <span className="text-white font-semibold">{winRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-success-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Current Win Streak</span>
                <span className="text-white font-semibold">{userStats.winStreak}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Best Win Streak</span>
                <span className="text-white font-semibold">{userStats.bestWinStreak}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Average Score</span>
                <span className="text-white font-semibold">{userStats.averageScore}</span>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Recent Games</h3>
            <div className="space-y-3">
              {[
                { result: 'won', opponent: 'Player123', stake: 15, score: 18 },
                { result: 'won', opponent: 'MineHunter', stake: 10, score: 12 },
                { result: 'lost', opponent: 'GridMaster', stake: 20, score: 8 },
                { result: 'won', opponent: 'BombFinder', stake: 5, score: 25 },
              ].map((game, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      game.result === 'won' ? 'bg-success-400' : 'bg-danger-400'
                    }`}></div>
                    <div>
                      <p className="text-white text-xs sm:text-sm font-medium">vs {game.opponent}</p>
                      <p className="text-gray-400 text-xs">Score: {game.score}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs sm:text-sm font-semibold ${
                      game.result === 'won' ? 'text-success-400' : 'text-danger-400'
                    }`}>
                      {game.result === 'won' ? '+' : '-'}{game.stake} GORBA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}