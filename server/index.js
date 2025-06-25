import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://localhost:5173"],
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

// Game state management
const games = new Map()
const waitingPlayers = []
const testWaitingPlayers = []
const playerSockets = new Map()

// Minesweeper grid generation
function generateGrid(width = 10, height = 10, mineCount = 15, seed = Date.now()) {
  // Use seed for reproducible randomness
  let rng = seed
  const seededRandom = () => {
    rng = (rng * 9301 + 49297) % 233280
    return rng / 233280
  }

  const grid = Array(height).fill().map(() => 
    Array(width).fill().map(() => ({
      isMine: false,
      revealed: false,
      adjacentMines: 0
    }))
  )

  // Place mines
  let minesPlaced = 0
  while (minesPlaced < mineCount) {
    const x = Math.floor(seededRandom() * width)
    const y = Math.floor(seededRandom() * height)
    
    if (!grid[y][x].isMine) {
      grid[y][x].isMine = true
      minesPlaced++
    }
  }

  // Calculate adjacent mine counts
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!grid[y][x].isMine) {
        let count = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy
            const nx = x + dx
            if (ny >= 0 && ny < height && nx >= 0 && nx < width && grid[ny][nx].isMine) {
              count++
            }
          }
        }
        grid[y][x].adjacentMines = count
      }
    }
  }

  return grid
}

// Create a new game
function createGame(player1, player2, stakeAmount, isTestMode = false) {
  const gameId = uuidv4()
  const seed = Date.now()
  const grid = generateGrid(10, 10, 15, seed)
  
  const game = {
    id: gameId,
    players: [player1, player2],
    currentTurn: player1.publicKey,
    grid: grid,
    seed: seed,
    status: 'playing',
    stakeAmount: stakeAmount,
    isTestMode: isTestMode,
    playerStats: {
      [player1.publicKey]: { safeRevealed: 0 },
      [player2.publicKey]: { safeRevealed: 0 }
    },
    chatMessages: [],
    startTime: Date.now()
  }
  
  games.set(gameId, game)
  return game
}

// Reveal tile and check game state
function revealTile(game, x, y, playerPublicKey) {
  const tile = game.grid[y][x]
  if (tile.revealed) return { valid: false }
  
  tile.revealed = true
  
  if (tile.isMine) {
    // Player hit a mine - they lose
    game.status = 'finished'
    game.winner = game.players.find(p => p.publicKey !== playerPublicKey).publicKey
    return { valid: true, hitMine: true, gameEnded: true }
  } else {
    // Safe tile - increment score
    game.playerStats[playerPublicKey].safeRevealed++
    
    // Check if all safe tiles are revealed
    const totalSafeTiles = 100 - 15 // 10x10 grid with 15 mines
    const totalRevealed = Object.values(game.playerStats).reduce((sum, stats) => sum + stats.safeRevealed, 0)
    
    if (totalRevealed >= totalSafeTiles) {
      // Game finished - player with most safe tiles wins
      game.status = 'finished'
      const player1Stats = game.playerStats[game.players[0].publicKey]
      const player2Stats = game.playerStats[game.players[1].publicKey]
      
      if (player1Stats.safeRevealed > player2Stats.safeRevealed) {
        game.winner = game.players[0].publicKey
      } else if (player2Stats.safeRevealed > player1Stats.safeRevealed) {
        game.winner = game.players[1].publicKey
      } else {
        // Tie - current player wins
        game.winner = playerPublicKey
      }
      
      return { valid: true, hitMine: false, gameEnded: true }
    }
    
    // Switch turns
    game.currentTurn = game.players.find(p => p.publicKey !== playerPublicKey).publicKey
    return { valid: true, hitMine: false, gameEnded: false }
  }
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  socket.on('joinGame', ({ stakeAmount, publicKey, isTestMode = false }) => {
    const player = { socketId: socket.id, publicKey: publicKey || `test-player-${socket.id}` }
    playerSockets.set(socket.id, player)
    
    // Add to appropriate waiting list
    const waitingList = isTestMode ? testWaitingPlayers : waitingPlayers
    waitingList.push({ ...player, stakeAmount: stakeAmount || 0, isTestMode })
    
    console.log(`Player ${player.publicKey} joined ${isTestMode ? 'test' : 'real'} game queue`)
    
    // Try to match players from the same mode
    if (waitingList.length >= 2) {
      const player1 = waitingList.shift()
      const player2 = waitingList.shift()
      
      // Create new game
      const game = createGame(player1, player2, Math.max(player1.stakeAmount, player2.stakeAmount), isTestMode)
      
      // Join both players to game room
      io.sockets.sockets.get(player1.socketId)?.join(game.id)
      io.sockets.sockets.get(player2.socketId)?.join(game.id)
      
      console.log(`Game ${game.id} created with players ${player1.publicKey} and ${player2.publicKey}`)
      
      // Notify players
      io.to(game.id).emit('gameJoined', {
        gameId: game.id,
        players: game.players,
        stakeAmount: game.stakeAmount,
        isTestMode: game.isTestMode
      })
      
      io.to(game.id).emit('gameStarted', {
        gameId: game.id,
        currentTurn: game.currentTurn,
        grid: game.grid,
        seed: game.seed
      })
    } else {
      socket.emit('waitingForOpponent')
    }
  })

  socket.on('revealTile', ({ gameId, x, y }) => {
    const game = games.get(gameId)
    const player = playerSockets.get(socket.id)
    
    if (!game || !player || game.currentTurn !== player.publicKey || game.status !== 'playing') {
      return
    }

    const result = revealTile(game, x, y, player.publicKey)
    
    if (result.valid) {
      io.to(gameId).emit('tileRevealed', {
        x, y,
        grid: game.grid,
        nextTurn: game.currentTurn,
        playerStats: game.playerStats,
        hitMine: result.hitMine
      })
      
      if (result.gameEnded) {
        console.log(`Game ${gameId} ended. Winner: ${game.winner}`)
        io.to(gameId).emit('gameEnded', {
          winner: game.winner,
          finalStats: game.playerStats,
          reason: result.hitMine ? 'mine' : 'completion'
        })
        
        // Clean up
        setTimeout(() => {
          games.delete(gameId)
        }, 30000) // Keep game state for 30 seconds
      }
    }
  })

  socket.on('chatMessage', ({ gameId, message }) => {
    const game = games.get(gameId)
    const player = playerSockets.get(socket.id)
    
    if (game && player) {
      const chatMessage = {
        playerId: player.publicKey,
        message: message,
        timestamp: Date.now()
      }
      
      game.chatMessages.push(chatMessage)
      
      // Broadcast to both players with ownership info
      game.players.forEach(p => {
        const targetSocket = io.sockets.sockets.get(p.socketId)
        if (targetSocket) {
          targetSocket.emit('chatMessage', {
            ...chatMessage,
            isOwn: p.publicKey === player.publicKey
          })
        }
      })
    }
  })

  socket.on('avatarReaction', ({ gameId, reaction }) => {
    const game = games.get(gameId)
    const player = playerSockets.get(socket.id)
    
    if (game && player) {
      socket.to(gameId).emit('avatarReaction', {
        playerId: player.publicKey,
        reaction: reaction,
        timestamp: Date.now()
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)
    
    // Remove from waiting lists
    const waitingIndex = waitingPlayers.findIndex(p => p.socketId === socket.id)
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1)
    }
    
    const testWaitingIndex = testWaitingPlayers.findIndex(p => p.socketId === socket.id)
    if (testWaitingIndex !== -1) {
      testWaitingPlayers.splice(testWaitingIndex, 1)
    }
    
    // Handle game disconnection
    const player = playerSockets.get(socket.id)
    if (player) {
      // Find and end any active games
      for (const [gameId, game] of games.entries()) {
        if (game.players.some(p => p.socketId === socket.id)) {
          if (game.status === 'playing') {
            // Other player wins by forfeit
            const otherPlayer = game.players.find(p => p.socketId !== socket.id)
            game.winner = otherPlayer.publicKey
            game.status = 'finished'
            
            socket.to(gameId).emit('gameEnded', {
              winner: game.winner,
              finalStats: game.playerStats,
              reason: 'forfeit'
            })
          }
          break
        }
      }
    }
    
    playerSockets.delete(socket.id)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Real game waiting players: ${waitingPlayers.length}`)
  console.log(`Test game waiting players: ${testWaitingPlayers.length}`)
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    games: games.size, 
    waitingPlayers: waitingPlayers.length,
    testWaitingPlayers: testWaitingPlayers.length,
    timestamp: new Date().toISOString()
  })
})

export default app