import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletContextProvider } from './contexts/WalletContext'
import { GameProvider } from './contexts/GameContext'
import Home from './pages/Home'
import Game from './pages/Game'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Layout from './components/Layout'

function App() {
  return (
    <WalletContextProvider>
      <GameProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/:gameId?" element={<Game />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </Layout>
        </Router>
      </GameProvider>
    </WalletContextProvider>
  )
}

export default App