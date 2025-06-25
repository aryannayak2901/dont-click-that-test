// Game utility functions

export function generateGameSeed() {
  return Date.now() + Math.floor(Math.random() * 1000000)
}

export function generateMinefield(seed, width = 10, height = 10, mineCount = 15) {
  // Seeded random number generator
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

export function calculateScore(grid) {
  let safeRevealed = 0
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x]
      if (tile.revealed && !tile.isMine) {
        safeRevealed++
      }
    }
  }
  
  return safeRevealed
}

export function isGameWon(grid, mineCount = 15) {
  const totalTiles = grid.length * grid[0].length
  const safeTiles = totalTiles - mineCount
  const revealedSafeTiles = calculateScore(grid)
  
  return revealedSafeTiles === safeTiles
}

export function hasHitMine(grid) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x]
      if (tile.revealed && tile.isMine) {
        return true
      }
    }
  }
  return false
}