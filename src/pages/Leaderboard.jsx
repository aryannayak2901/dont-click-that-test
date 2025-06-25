import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('all') // all, week, month

  useEffect(() => {
    // In a real app, fetch from backend API
    setTimeout(() => {
      setLeaderboardData([
        {
          rank: 1,
          publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          username: 'GridMaster',
          gamesWon: 47,
          totalEarned: 1250,
          winRate: 89.5,
          winStreak: 12,
        },
        {
          rank: 2,
          publicKey: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZqff4P3ONfrC',
          username: 'MineHunter',
          gamesWon: 38,
          totalEarned: 890,
          winRate: 76.8,
          winStreak: 5,
        },
        {
          rank: 3,
          publicKey: '8UeLnKzfzgzGBhXrHBdrWKFJhKb7aWiTH4VWDd9xKj2v',
          username: 'BombFinder',
          gamesWon: 32,
          totalEarned: 720,
          winRate: 71.2,
          winStreak: 8,
        },
        {
          rank: 4,
          publicKey: '2RNeqFFWVeRGLULRKYjx3mvVYaFW7QaGc8Zo4JdVMxN',
          username: 'SafeClicker',
          gamesWon: 29,
          totalEarned: 650,
          winRate: 69.8,
          winStreak: 3,
        },
        {
          rank: 5,
          publicKey: '9WzDXwBbmkg8ZTbNMqUBvUtjn5fVKwqBdz2WG85J4k8Z',
          username: 'TileExplorer',
          gamesWon: 24,
          totalEarned: 480,
          winRate: 63.4,
          winStreak: 1,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [timeFilter])

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
      default:
        return <span className="text-base sm:text-lg font-bold text-gray-400">#{rank}</span>
    }
  }

  const truncateAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Loading Leaderboard...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-gray-400 text-sm sm:text-base">Top players competing in Don't Click That!</p>
          </div>
          
          <div className="flex space-x-2">
            {['all', 'week', 'month'].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  timeFilter === filter
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-gray-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {leaderboardData.slice(0, 3).map((player, index) => (
            <div
              key={player.publicKey}
              className={`bg-gradient-to-br rounded-2xl p-4 sm:p-6 text-center ${
                index === 0
                  ? 'from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30'
                  : index === 1
                  ? 'from-gray-400/20 to-gray-500/10 border border-gray-400/30'
                  : 'from-amber-600/20 to-amber-700/10 border border-amber-600/30'
              }`}
            >
              <div className="mb-4">
                {getRankIcon(player.rank)}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{player.username}</h3>
              <p className="text-gray-400 text-xs sm:text-sm font-mono mb-4">
                {truncateAddress(player.publicKey)}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Games Won</span>
                  <span className="text-white font-semibold">{player.gamesWon}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">GORBA Earned</span>
                  <span className="text-success-400 font-semibold">{player.totalEarned}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-white font-semibold">{player.winRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard Table */}
        <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-900/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-400">Rank</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-400">Player</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-400">Won</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-400">GORBA</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-400">Rate</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-400">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboardData.map((player) => (
                  <tr key={player.publicKey} className="hover:bg-dark-900/30 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center">
                        {getRankIcon(player.rank)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">{player.username}</p>
                        <p className="text-gray-400 text-xs font-mono">
                          {truncateAddress(player.publicKey)}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-white font-semibold text-sm sm:text-base">
                      {player.gamesWon}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-success-400 font-semibold text-sm sm:text-base">
                      {player.totalEarned}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-white font-semibold text-sm sm:text-base">
                      {player.winRate}%
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary-400" />
                        <span className="text-white font-semibold text-sm sm:text-base">{player.winStreak}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}