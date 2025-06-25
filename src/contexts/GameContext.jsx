import { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { useWallet } from '@solana/wallet-adapter-react'

const GameContext = createContext()

export function GameProvider({ children }) {
  const { publicKey } = useWallet()
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState({
    gameId: null,
    players: [],
    currentTurn: null,
    grid: null,
    gameStatus: 'waiting', // waiting, playing, finished
    winner: null,
    playerStats: {},
    chatMessages: [],
    stakeAmount: 0,
    isTestMode: false,
  })

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001')
    setSocket(newSocket)

    // Socket event listeners
    newSocket.on('gameJoined', (data) => {
      setGameState(prev => ({
        ...prev,
        gameId: data.gameId,
        players: data.players,
        stakeAmount: data.stakeAmount,
        isTestMode: data.isTestMode || false,
      }))
    })

    newSocket.on('gameStarted', (data) => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'playing',
        currentTurn: data.currentTurn,
        grid: data.grid,
      }))
    })

    newSocket.on('tileRevealed', (data) => {
      setGameState(prev => ({
        ...prev,
        grid: data.grid,
        currentTurn: data.nextTurn,
        playerStats: data.playerStats,
      }))
    })

    newSocket.on('gameEnded', (data) => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: data.winner,
        playerStats: data.finalStats,
      }))
    })

    newSocket.on('chatMessage', (data) => {
      setGameState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, data],
      }))
    })

    newSocket.on('avatarReaction', (data) => {
      // Handle avatar reactions
      console.log('Avatar reaction:', data)
    })

    newSocket.on('waitingForOpponent', () => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'waiting'
      }))
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const joinGame = (stakeAmount, isTestMode = false) => {
    if (socket) {
      const playerKey = publicKey?.toString() || `test-player-${Date.now()}`
      socket.emit('joinGame', { 
        stakeAmount, 
        publicKey: playerKey,
        isTestMode 
      })
    }
  }

  const revealTile = (x, y) => {
    if (socket && gameState.gameId) {
      socket.emit('revealTile', { gameId: gameState.gameId, x, y })
    }
  }

  const sendChatMessage = (message) => {
    if (socket && gameState.gameId) {
      socket.emit('chatMessage', { gameId: gameState.gameId, message })
    }
  }

  const sendAvatarReaction = (reaction) => {
    if (socket && gameState.gameId) {
      socket.emit('avatarReaction', { gameId: gameState.gameId, reaction })
    }
  }

  return (
    <GameContext.Provider value={{
      gameState,
      socket,
      joinGame,
      revealTile,
      sendChatMessage,
      sendAvatarReaction,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)