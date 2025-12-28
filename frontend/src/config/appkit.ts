import { createAppKit } from '@reown/appkit/react'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

// Get project ID from environment
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || ''

if (!projectId) {
  console.warn('⚠️ VITE_REOWN_PROJECT_ID is not set. Get one at https://cloud.reown.com')
}

// App metadata
const metadata = {
  name: import.meta.env.VITE_APP_NAME || 'StacksPledge',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'A micro-commitment dApp on Stacks',
  url: import.meta.env.VITE_APP_URL || 'https://stackspledge.app',
  icons: [import.meta.env.VITE_APP_ICON || 'https://stackspledge.app/icon.png']
}

// Bitcoin networks (testnet for development, mainnet for production)
const networks: [AppKitNetwork, ...AppKitNetwork[]] =
  import.meta.env.VITE_NETWORK === 'mainnet'
    ? [bitcoin]
    : [bitcoinTestnet]

// Create AppKit instance for Bitcoin wallet support
export const appkit = projectId ? createAppKit({
  projectId,
  networks,
  metadata,
  features: {
    analytics: true, // Enable analytics for tracking
  },
  allWallets: 'SHOW', // Show all available Bitcoin wallets
}) : null

// Export for type checking
export { projectId, metadata, networks }
