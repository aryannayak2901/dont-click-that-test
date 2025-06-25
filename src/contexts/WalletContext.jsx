import { createContext, useContext } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

const WalletContext = createContext()

export function WalletContextProvider({ children }) {
  // Using devnet for development - replace with Gorbagana RPC for production
  const endpoint = clusterApiUrl('devnet')
  
  const wallets = [
    new BackpackWalletAdapter(),
    new PhantomWalletAdapter(),
  ]

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContext.Provider value={{}}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export const useWalletContext = () => useContext(WalletContext)