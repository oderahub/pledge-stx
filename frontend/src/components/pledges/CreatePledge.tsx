import React, { useState } from 'react';
import { usePledges } from '../../hooks/usePledges';
import { FEES } from '../../lib/stacks';

interface CreatePledgeProps {
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'health', emoji: '💪' },
  { value: 'fitness', emoji: '🏃' },
  { value: 'learning', emoji: '📚' },
  { value: 'finance', emoji: '💰' },
  { value: 'career', emoji: '💼' },
  { value: 'creative', emoji: '🎨' },
  { value: 'social', emoji: '🤝' },
  { value: 'general', emoji: '✨' },
];

export function CreatePledge({ onSuccess }: CreatePledgeProps) {
  const { createPledge, creating } = usePledges();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length > 140) return;

    const txId = await createPledge(message, category);
    if (txId) {
      setMessage('');
      setCategory('general');
      setExpanded(false);
      onSuccess?.();
    }
  };

  const remainingChars = 140 - message.length;

  return (
    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-800/80 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">✍️</span>
          <div className="text-left">
            <h3 className="text-xl font-semibold text-white">Create a New Pledge</h3>
            <p className="text-gray-400 text-sm">Commit to your goals and get community support</p>
          </div>
        </div>
        <svg className={`w-6 h-6 text-gray-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              What do you pledge to do?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I pledge to exercise for 30 minutes every day..."
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                remainingChars < 0 ? 'border-red-500' : 'border-gray-700'
              }`}
              rows={3}
            />
            <div className="flex justify-between mt-2">
              <span className="text-gray-500 text-xs">Be specific and achievable</span>
              <span className={`text-sm ${remainingChars < 0 ? 'text-red-500' : remainingChars < 20 ? 'text-yellow-500' : 'text-gray-500'}`}>
                {remainingChars} characters remaining
              </span>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === cat.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat.emoji} {cat.value}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Creation Fee</p>
              <p className="text-white font-semibold">{(FEES.PLEDGE_FEE / 1_000_000).toFixed(6)} STX</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Vouch Reward</p>
              <p className="text-green-400 font-semibold">+{(FEES.VOUCH_FEE / 1_000_000).toFixed(6)} STX per vouch</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || !message.trim() || remainingChars < 0}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
              creating || !message.trim() || remainingChars < 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            {creating ? '⏳ Creating Pledge...' : '🎯 Create Pledge'}
          </button>
        </form>
      )}
    </div>
  );
}
