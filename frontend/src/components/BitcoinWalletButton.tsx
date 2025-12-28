import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Wallet } from 'lucide-react'

/**
 * BitcoinWalletButton - Connect/Disconnect Bitcoin wallets via Reown AppKit
 *
 * Provides a button to connect Bitcoin wallets (Unisat, Xverse, Leather, etc.)
 * Shows connected Bitcoin address when wallet is connected
 */
export function BitcoinWalletButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const truncateAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <button
      onClick={() => open()}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <Wallet className="w-4 h-4" />
      {isConnected && address ? (
        <span className="flex items-center gap-2">
          <span className="hidden sm:inline">Bitcoin:</span>
          <span className="font-mono text-sm">{truncateAddress(address)}</span>
        </span>
      ) : (
        <span>Connect Bitcoin</span>
      )}
    </button>
  )
}
