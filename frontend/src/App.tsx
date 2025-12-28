import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CreatePledge } from './components/pledges/CreatePledge';
import { PledgeList } from './components/pledges/PledgeList';
import { useWallet } from './hooks/useWallet';
import { usePledges } from './hooks/usePledges';
import './styles/globals.css';

// Initialize Reown AppKit for Bitcoin wallet support
import './config/appkit';

function App() {
  const { isConnected, address, connect, disconnect } = useWallet();
  const { pledges, loading, fetchPledges } = usePledges();

  useEffect(() => {
    fetchPledges();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Toaster position="top-right" />
      
      <Header 
        isConnected={isConnected}
        address={address}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎯 StacksPledge
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Make micro-commitments, get vouched by the community, 
            and achieve your goals on the Bitcoin blockchain.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <span className="px-4 py-2 bg-purple-600/30 rounded-full text-purple-300 text-sm">
              ⚡ Powered by Stacks
            </span>
            <span className="px-4 py-2 bg-orange-600/30 rounded-full text-orange-300 text-sm">
              🔒 Secured by Bitcoin
            </span>
            <span className="px-4 py-2 bg-green-600/30 rounded-full text-green-300 text-sm">
              ✨ Clarity 4
            </span>
          </div>
        </section>

        {/* Create Pledge Section */}
        {isConnected && (
          <section className="mb-12">
            <CreatePledge onSuccess={fetchPledges} />
          </section>
        )}

        {/* Connect Prompt */}
        {!isConnected && (
          <section className="text-center mb-12 p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 mb-6">
              Connect your Stacks wallet to create pledges and vouch for others.
            </p>
            <button
              onClick={connect}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Connect Wallet
            </button>
          </section>
        )}

        {/* Pledge List Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Recent Pledges
            </h2>
            <button
              onClick={fetchPledges}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
          
          <PledgeList 
            pledges={pledges} 
            loading={loading}
            currentUser={address}
            onVouch={fetchPledges}
            onComplete={fetchPledges}
          />
        </section>

        {/* Stats Section */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            label="Total Pledges" 
            value={pledges.length.toString()} 
            icon="📝" 
          />
          <StatCard 
            label="Total Vouches" 
            value={pledges.reduce((acc, p) => acc + p.vouches, 0).toString()} 
            icon="🤝" 
          />
          <StatCard 
            label="Completed" 
            value={pledges.filter(p => p.completed).length.toString()} 
            icon="✅" 
          />
          <StatCard 
            label="Active" 
            value={pledges.filter(p => !p.completed).length.toString()} 
            icon="⚡" 
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-gray-400 text-sm">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
