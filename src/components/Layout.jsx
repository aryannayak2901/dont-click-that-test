import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Home, Trophy, User, Gamepad2, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Layout({ children }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      <nav className="bg-dark-800/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Gamepad2 className="h-8 w-8 text-primary-500" />
                <span className="text-xl font-bold text-white hidden sm:block">Don't Click That!</span>
                <span className="text-lg font-bold text-white sm:hidden">DCT!</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.href 
                        ? 'bg-primary-500 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
            
            {/* Wallet Button & Mobile Menu */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <WalletMultiButton className="!bg-primary-500 hover:!bg-primary-600 !text-sm" />
              </div>
              <div className="sm:hidden">
                <WalletMultiButton className="!bg-primary-500 hover:!bg-primary-600 !text-xs !px-2 !py-1" />
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        location.pathname === item.href 
                          ? 'bg-primary-500 text-white' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}