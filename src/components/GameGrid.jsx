import { useState } from 'react'

export default function GameGrid({ grid, onTileClick, disabled, selectedTile }) {
  const [hoveredTile, setHoveredTile] = useState(null)

  if (!grid) {
    return (
      <div className="game-grid max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className="tile">
            <div className="animate-pulse bg-gray-600 w-full h-full rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const getTileContent = (tile) => {
    if (!tile.revealed) return ''
    if (tile.isMine) return '💣'
    if (tile.adjacentMines === 0) return '✓'
    return tile.adjacentMines
  }

  const getTileClass = (tile, x, y) => {
    let className = 'tile'
    
    if (tile.revealed) {
      className += tile.isMine ? ' mine' : ' revealed'
    }
    
    if (disabled) {
      className += ' disabled'
    }
    
    if (selectedTile && selectedTile.x === x && selectedTile.y === y) {
      className += ' animate-pulse-glow'
    }
    
    return className
  }

  return (
    <div className="game-grid max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
      {grid.map((row, y) =>
        row.map((tile, x) => (
          <button
            key={`${x}-${y}`}
            className={getTileClass(tile, x, y)}
            onClick={() => !disabled && !tile.revealed && onTileClick(x, y)}
            onMouseEnter={() => setHoveredTile({ x, y })}
            onMouseLeave={() => setHoveredTile(null)}
            disabled={disabled || tile.revealed}
          >
            {getTileContent(tile)}
            {hoveredTile?.x === x && hoveredTile?.y === y && !tile.revealed && !disabled && (
              <div className="absolute inset-0 bg-primary-500/20 rounded"></div>
            )}
          </button>
        ))
      )}
    </div>
  )
}