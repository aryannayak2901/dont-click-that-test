# Don't Click That! 🎮💣

A competitive 1v1 on-chain Minesweeper game built on Solana where players stake GORBA tokens and battle for supremacy!

## 🎯 Game Overview

**Don't Click That!** is an intense multiplayer twist on the classic Minesweeper game. Two players compete on the same randomly generated 10×10 minefield, taking turns revealing tiles. The first player to hit a mine loses instantly, or if both players survive, the winner is determined by who revealed more safe tiles. Winner takes the entire token pot!

## ✨ Features

### 🎮 Gameplay
- **1v1 Competitive Battles**: Real-time multiplayer action
- **Shared Minefield**: Both players play on the same board for fairness
- **Token Staking**: Stake GORBA tokens with winner-takes-all payouts
- **Turn-Based Strategy**: Alternating turns create suspense and strategy
- **Multiple Win Conditions**: Hit a mine = instant loss, or most safe tiles wins

### 🎨 User Experience
- **Animated Avatars**: React with emojis during gameplay (😈😭😏😂💣)
- **Real-time Chat**: Communicate with predefined messages and emojis
- **Responsive Design**: Optimized for desktop and mobile
- **Sound Effects**: Immersive audio for tile clicks, explosions, and victories
- **Beautiful UI**: Modern gaming aesthetic with smooth animations

### 🔗 Web3 Integration
- **Solana Wallet Support**: Connect with Backpack, Phantom, and other wallets
- **On-chain Game Logic**: Smart contracts handle staking and payouts
- **Automatic Settlements**: Winners receive tokens automatically
- **Transparent & Fair**: All game outcomes verified on-chain

### 📊 Social Features
- **Global Leaderboard**: Track top players and earnings
- **Player Profiles**: View stats, win rates, and game history
- **Match History**: Review past games and performances

## 🏗️ Technical Architecture

### Frontend
- **React 18** with modern hooks and context
- **Tailwind CSS** for responsive styling
- **Socket.IO Client** for real-time multiplayer
- **Solana Web3.js** for blockchain interactions
- **Zustand** for state management

### Backend
- **Node.js + Express** server
- **Socket.IO** for real-time communication
- **Matchmaking System** for pairing players
- **Game State Management** with validation

### Smart Contracts
- **Anchor Framework** (Solana)
- **Token Staking** with SPL tokens
- **Game Validation** and payout logic
- **PDA-based** game accounts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Solana CLI tools
- Anchor framework
- A Solana wallet with devnet SOL

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/dont-click-that.git
cd dont-click-that
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
# Terminal 1: Start the backend
npm run server

# Terminal 2: Start the frontend
npm run dev
```

5. **Deploy smart contracts** (optional for development)
```bash
anchor build
anchor deploy --provider.cluster devnet
```

### 🎮 How to Play

1. **Connect Wallet**: Use Backpack or Phantom wallet
2. **Set Stake Amount**: Choose how many GORBA tokens to wager
3. **Find Opponent**: Get matched with another player
4. **Take Turns**: Click tiles to reveal them safely
5. **Avoid Mines**: First to hit a mine loses!
6. **Win Tokens**: Winner takes the entire pot

### 🎯 Game Rules

- **Grid Size**: 10×10 tiles with 15 hidden mines
- **Turn System**: Players alternate revealing tiles
- **Win Conditions**: 
  - Opponent hits a mine = You win
  - All safe tiles revealed = Most revealed wins
  - Tie = Current player wins
- **Staking**: Both players stake equal amounts
- **Payout**: Winner receives 2x the stake amount

## 🛠️ Development

### Project Structure
```
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── contexts/          # React contexts
│   └── utils/             # Utility functions
├── server/                # Backend Express server
├── programs/              # Anchor smart contracts
└── tests/                 # Test files
```

### Key Components
- **GameGrid**: Interactive minesweeper grid
- **PlayerAvatar**: Animated player reactions
- **ChatPanel**: Real-time messaging
- **WalletContext**: Solana wallet integration
- **GameContext**: Game state management

### Smart Contract Functions
- `initialize_game()`: Create new game instance
- `join_game()`: Second player joins and stakes
- `finalize_game()`: Distribute winnings to winner

## 🌍 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
# Deploy Express server to your preferred platform
```

### Smart Contracts (Gorbagana)
```bash
anchor build
anchor deploy --provider.cluster gorbagana
```

## 🎨 Customization

### Adding New Reactions
Edit `src/components/PlayerAvatar.jsx`:
```javascript
const AVATAR_REACTIONS = ['😈', '😭', '😏', '😂', '💣', '🎯', '🔥', '💀']
```

### Modifying Game Rules
Update grid size or mine count in `src/utils/game.js`:
```javascript
export function generateMinefield(seed, width = 10, height = 10, mineCount = 15)
```

### Styling Changes
Modify `tailwind.config.js` for theme customization or edit component styles directly.

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
npm test

# Smart contract tests
anchor test
```

### Manual Testing
1. Open two browser windows
2. Connect different wallets
3. Start a game and test all features

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] **Tournament Mode**: Multi-round competitions
- [ ] **Spectator Mode**: Watch games in progress
- [ ] **Custom Game Modes**: Different grid sizes and mine counts
- [ ] **NFT Avatars**: Unique collectible player avatars
- [ ] **Mobile App**: Native iOS/Android versions
- [ ] **AI Opponents**: Practice against bots

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Report bugs via GitHub Issues
- **Discord**: Join our community server for support
- **Email**: Contact us at support@dontclickthat.game

## 🏆 Acknowledgments

- Inspired by classic Minesweeper and modern .io games
- Built with love for the Solana ecosystem
- Special thanks to the Gorbagana testnet community

---

**Ready to test your luck and skill? Don't click that mine! 💣**

*Play responsibly and have fun!* 🎮