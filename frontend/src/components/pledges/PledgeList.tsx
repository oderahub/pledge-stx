import { Pledge, truncateAddress, formatTimestamp } from '../../lib/stacks';
import { usePledges } from '../../hooks/usePledges';

interface PledgeListProps {
  pledges: Pledge[];
  loading: boolean;
  currentUser: string | null;
  onVouch?: () => void;
  onComplete?: () => void;
}

export function PledgeList({ pledges, loading, currentUser, onVouch, onComplete }: PledgeListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-24 mb-4" />
            <div className="h-6 bg-gray-700 rounded mb-2" />
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-10 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (pledges.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
        <span className="text-6xl mb-4 block">📝</span>
        <h3 className="text-xl font-semibold text-white mb-2">No Pledges Yet</h3>
        <p className="text-gray-400">Be the first to create a pledge!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pledges.map((pledge) => (
        <PledgeCard 
          key={pledge.id} 
          pledge={pledge}
          currentUser={currentUser}
          onVouch={onVouch}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}

interface PledgeCardProps {
  pledge: Pledge;
  currentUser: string | null;
  onVouch?: () => void;
  onComplete?: () => void;
}

function PledgeCard({ pledge, currentUser, onVouch, onComplete }: PledgeCardProps) {
  const { vouchForPledge, completePledge, vouching, completing } = usePledges();
  const isCreator = currentUser === pledge.creator;
  const isVouching = vouching === pledge.id;
  const isCompleting = completing === pledge.id;

  const handleVouch = async () => {
    const success = await vouchForPledge(pledge.id);
    if (success) onVouch?.();
  };

  const handleComplete = async () => {
    const success = await completePledge(pledge.id);
    if (success) onComplete?.();
  };

  const categoryEmojis: Record<string, string> = {
    health: '💪', fitness: '🏃', learning: '📚', finance: '💰',
    career: '💼', creative: '🎨', social: '🤝', general: '✨',
  };

  return (
    <div className={`bg-gray-800/50 rounded-xl border overflow-hidden transition-all hover:border-purple-500/50 ${
      pledge.completed ? 'border-green-500/30' : 'border-gray-700'
    }`}>
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryEmojis[pledge.category] || '✨'}</span>
            <span className="text-gray-400 text-sm capitalize">{pledge.category}</span>
          </div>
          {pledge.completed && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              ✓ Completed
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-white text-lg mb-4 line-clamp-3">{pledge.message}</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {pledge.creator.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <p className="text-gray-300 text-sm font-mono">{truncateAddress(pledge.creator, 4)}</p>
            <p className="text-gray-500 text-xs">{formatTimestamp(pledge.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-2xl">🤝</span>
            <span className="text-white font-semibold">{pledge.vouches}</span>
            <span className="text-gray-500 text-sm">vouches</span>
          </div>
        </div>

        <div className="flex gap-2">
          {!pledge.completed && !isCreator && currentUser && (
            <button
              onClick={handleVouch}
              disabled={isVouching}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isVouching ? 'bg-gray-700 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isVouching ? 'Vouching...' : '🤝 Vouch'}
            </button>
          )}

          {!pledge.completed && isCreator && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isCompleting ? 'bg-gray-700 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isCompleting ? 'Completing...' : '✓ Complete'}
            </button>
          )}

          {pledge.completed && (
            <div className="flex-1 py-2 px-4 bg-green-500/10 text-green-400 rounded-lg text-center">
              🎉 Completed!
            </div>
          )}

          {!currentUser && !pledge.completed && (
            <div className="flex-1 py-2 px-4 bg-gray-700 text-gray-500 rounded-lg text-center text-sm">
              Connect wallet to vouch
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
