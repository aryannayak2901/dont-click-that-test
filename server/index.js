import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}))
app.use(express.json())

// Game state management
const games = new Map()
const waitingPlayers = []
const playerSockets = new Map()

// Bot configuration
const BOT_PLAYER = {
  socketId: 'bot-player',
  publicKey: 'bot-player-ai',
  stakeAmount: 0,
  isTestMode: true
}

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
    startTime: Date.now(),
    hasBot: player2.publicKey === 'bot-player-ai'
  }
  
  games.set(gameId, game)
  
  // If playing against a bot, we need to announce the game start to the player
  if (game.hasBot) {
    console.log(`Bot game ${gameId} created - emitting gameStarted to player ${player1.socketId}`)
    io.to(player1.socketId).emit('gameStarted', {
      currentTurn: game.currentTurn,
      grid: game.grid
    })
    
    // Schedule bot move if it's bot's turn to start
    if (game.currentTurn === 'bot-player-ai') {
      scheduleBotMove(gameId)
    }
  }
  
  return game
}

// Bot AI logic
function getBotMove(game) {
  const grid = game.grid
  const availableTiles = []
  
  // Find all unrevealed tiles
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (!grid[y][x].revealed) {
        availableTiles.push({ x, y })
      }
    }
  }
  
  if (availableTiles.length === 0) return null
  
  // Simple AI strategy: prefer corner and edge tiles first (safer statistically)
  const cornerTiles = availableTiles.filter(tile => 
    (tile.x === 0 || tile.x === 9) && (tile.y === 0 || tile.y === 9)
  )
  
  const edgeTiles = availableTiles.filter(tile => 
    tile.x === 0 || tile.x === 9 || tile.y === 0 || tile.y === 9
  )
  
  if (cornerTiles.length > 0) {
    return cornerTiles[Math.floor(Math.random() * cornerTiles.length)]
  } else if (edgeTiles.length > 0) {
    return edgeTiles[Math.floor(Math.random() * edgeTiles.length)]
  } else {
    // Pick random tile
    return availableTiles[Math.floor(Math.random() * availableTiles.length)]
  }
}

// Execute bot move with delay
function scheduleBotMove(gameId) {
  const game = games.get(gameId)
  if (!game) {
    console.log(`Cannot schedule bot move: game ${gameId} not found`)
    return
  }
  
  if (game.status !== 'playing') {
    console.log(`Cannot schedule bot move: game ${gameId} not in playing state (${game.status})`)
    return
  }
  
  if (game.currentTurn !== 'bot-player-ai') {
    console.log(`Cannot schedule bot move: not bot's turn (current turn: ${game.currentTurn})`)
    return
  }
  
  console.log(`Bot scheduling move for game ${gameId}`)
  
  // Bot thinks for 1-2 seconds (making it faster for better UX)
  const thinkTime = 1000 + Math.random() * 1000
  
  setTimeout(() => {
    const currentGame = games.get(gameId)
    if (!currentGame || currentGame.status !== 'playing' || currentGame.currentTurn !== 'bot-player-ai') {
      console.log(`Bot move cancelled for game ${gameId} - game state changed`)
      return
    }
    
    const move = getBotMove(currentGame)
    if (move) {
      console.log(`Bot making move at ${move.x}, ${move.y} in game ${gameId}`)
      const result = revealTile(currentGame, move.x, move.y, 'bot-player-ai')
      
      if (result.valid) {
        io.to(gameId).emit('tileRevealed', {
          x: move.x, 
          y: move.y,
          grid: currentGame.grid,
          nextTurn: currentGame.currentTurn,
          playerStats: currentGame.playerStats,
          hitMine: result.hitMine
        })
        
        // Bot sends a reaction occasionally
        if (Math.random() < 0.3) {
          const reactions = ['🤖', '🎯', '💭', '⚡', '🔍']
          const reaction = reactions[Math.floor(Math.random() * reactions.length)]
          
          setTimeout(() => {
            io.to(gameId).emit('avatarReaction', {
              playerId: 'bot-player-ai',
              reaction: reaction,
              timestamp: Date.now()
            })
          }, 500)
        }
        
        if (result.gameEnded) {
          console.log(`Game ${gameId} ended. Winner: ${currentGame.winner}`)
          io.to(gameId).emit('gameEnded', {
            winner: currentGame.winner,
            finalStats: currentGame.playerStats,
            reason: result.hitMine ? 'mine' : 'completion'
          })
          
          // Clean up
          setTimeout(() => {
            games.delete(gameId)
          }, 30000)
        } else {
          // Schedule next bot move if it's still bot's turn
          if (currentGame.currentTurn === 'bot-player-ai') {
            scheduleBotMove(gameId)
          }
        }
      }
    }
  }, thinkTime)
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
  console.log('Player connected with socket ID:', socket.id)
  console.log('Client headers:', socket.handshake.headers)
  console.log('Client query params:', socket.handshake.query)

  socket.on('joinGame', ({ stakeAmount, publicKey, isTestMode = false }) => {
    const player = { socketId: socket.id, publicKey: publicKey || `test-player-${Date.now()}` }
    playerSockets.set(socket.id, player)
    console.log(`Player joined: ${player.publicKey}, isTestMode: ${isTestMode}`)
    
    if (isTestMode) {
      console.log(`Creating test game for player ${player.publicKey}`)
      
      // In test mode, immediately pair with bot
      const humanPlayer = { ...player, stakeAmount: 0, isTestMode: true }
      const botPlayer = { ...BOT_PLAYER }
      
      // Create new game with bot - ALWAYS make human player go first for better UX
      const game = createGame(humanPlayer, botPlayer, 0, true)
      
      // Force human player to go first in bot games
      game.currentTurn = humanPlayer.publicKey
      
      // Join human player to game room
      socket.join(game.id)
      
      console.log(`Test game ${game.id} created with player ${humanPlayer.publicKey} vs Bot`)
      console.log(`Current turn set to human player: ${game.currentTurn}`)
      
      // Notify player immediately
      socket.emit('gameJoined', {
        gameId: game.id,
        players: [
          { publicKey: humanPlayer.publicKey, isBot: false },
          { publicKey: 'bot-player-ai', isBot: true }
        ],
        stakeAmount: 0,
        isTestMode: true
      })
      
      // Start game immediately
      socket.emit('gameStarted', {
        gameId: game.id,
        currentTurn: game.currentTurn,
        grid: game.grid,
        seed: game.seed
      })
      
      // We don't need to schedule bot move here since human always goes first now
      
    } else {
      // Real game mode - add to waiting list
      waitingPlayers.push({ ...player, stakeAmount: stakeAmount || 0, isTestMode: false })
      
      console.log(`Player ${player.publicKey} joined real game queue`)
      
      // Try to match players
      if (waitingPlayers.length >= 2) {
        const player1 = waitingPlayers.shift()
        const player2 = waitingPlayers.shift()
        
        // Create new game
        const game = createGame(player1, player2, Math.max(player1.stakeAmount, player2.stakeAmount), false)
        
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
    }
  })

  socket.on('revealTile', ({ gameId, x, y }) => {
    const game = games.get(gameId)
    const player = playerSockets.get(socket.id)
    
    // Debug log for every tile reveal attempt
    console.log(`Tile reveal attempt: gameId=${gameId}, x=${x}, y=${y}`)
    console.log(`Game exists: ${!!game}, Player exists: ${!!player}`)
    if (game) {
      console.log(`Game currentTurn: ${game.currentTurn}, Player publicKey: ${player?.publicKey}`)
      console.log(`Game status: ${game.status}, hasBot: ${game.hasBot}`)
      console.log(`All players in game:`, game.players.map(p => p.publicKey))
    }
    
    if (!game || !player || game.currentTurn !== player.publicKey || game.status !== 'playing') {
      console.log(`Invalid tile reveal attempt: game=${!!game}, player=${!!player}, turn=${game?.currentTurn}, playerKey=${player?.publicKey}`)
      return
    }

    console.log(`Player ${player.publicKey} revealing tile ${x}, ${y} in game ${gameId}`)
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
        }, 30000)
      } else {
        // If it's now bot's turn, schedule bot move
        if (game.hasBot && game.currentTurn === 'bot-player-ai') {
          console.log('Scheduling bot move after player turn')
          // Use a very short delay to ensure client gets the turn update first
          setTimeout(() => {
            scheduleBotMove(gameId)
          }, 500)
        }
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
      
      // Broadcast to human player with ownership info
      socket.emit('chatMessage', {
        ...chatMessage,
        isOwn: true
      })
      
      // Bot occasionally responds to chat
      if (game.hasBot && Math.random() < 0.4) {
        const botResponses = [
          '🤖 Beep boop!',
          '🎯 Good move!',
          '💭 Calculating...',
          '⚡ Nice try!',
          '🔍 Interesting choice',
          '🎮 Let\'s play!',
          '🚀 Game on!',
          '🧠 Processing...',
          '⭐ Well played!',
          '🎲 Random is fun!'
        ]
        
        setTimeout(() => {
          const botMessage = {
            playerId: 'bot-player-ai',
            message: botResponses[Math.floor(Math.random() * botResponses.length)],
            timestamp: Date.now(),
            isOwn: false
          }
          
          socket.emit('chatMessage', botMessage)
        }, 1000 + Math.random() * 2000)
      }
    }
  })

  socket.on('avatarReaction', ({ gameId, reaction }) => {
    const game = games.get(gameId)
    const player = playerSockets.get(socket.id)
    
    if (game && player) {
      // In bot games, only emit to the same socket since there's no other human player
      if (game.hasBot) {
        // Don't emit to other players since bot doesn't need to see reactions
      } else {
        socket.to(gameId).emit('avatarReaction', {
          playerId: player.publicKey,
          reaction: reaction,
          timestamp: Date.now()
        })
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)
    
    // Remove from waiting lists
    const waitingIndex = waitingPlayers.findIndex(p => p.socketId === socket.id)
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1)
    }
    
    // Handle game disconnection
    const player = playerSockets.get(socket.id)
    if (player) {
      // Find and end any active games
      for (const [gameId, game] of games.entries()) {
        if (game.players.some(p => p.socketId === socket.id)) {
          if (game.status === 'playing') {
            // Other player wins by forfeit (or bot wins if it's a test game)
            const otherPlayer = game.players.find(p => p.socketId !== socket.id)
            game.winner = otherPlayer.publicKey
            game.status = 'finished'
            
            // Only emit to real players, not bots
            if (otherPlayer.socketId !== 'bot-player') {
              socket.to(gameId).emit('gameEnded', {
                winner: game.winner,
                finalStats: game.playerStats,
                reason: 'forfeit'
              })
            }
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
  console.log(`=====================================`)
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.IO ready for connections`)
  console.log(`CORS configured to accept all origins`)
  console.log(`Real game waiting players: ${waitingPlayers.length}`)
  console.log(`Bot AI enabled for test mode`)
  console.log(`=====================================`)
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    games: games.size, 
    waitingPlayers: waitingPlayers.length,
    botEnabled: true,
    timestamp: new Date().toISOString()
  })
})

// Simple ping endpoint for connectivity testing
app.get('/ping', (req, res) => {
  console.log('Ping received from', req.ip)
  res.send('pong')
})

export default app