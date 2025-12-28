import { truncateAddress } from '../../lib/stacks';
import { BitcoinWalletButton } from '../BitcoinWalletButton';

interface HeaderProps {
  isConnected: boolean;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function Header({ isConnected, address, onConnect, onDisconnect }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <span className="text-2xl font-bold text-white">StacksPledge</span>
            <span className="px-2 py-1 bg-purple-600/30 rounded text-purple-300 text-xs">Beta</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Explore</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">My Pledges</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Leaderboard</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Bitcoin Wallet (Reown AppKit) */}
            <BitcoinWalletButton />

            {/* Stacks Wallet (Primary for pledges) */}
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-gray-300 font-mono text-sm">
                    {truncateAddress(address || '', 4)}
                  </span>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
              >
                🦊 Connect Stacks
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
