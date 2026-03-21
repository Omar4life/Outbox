import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Pricing({ currentTier = 'free' }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleUpgrade = async (plan, billing) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const originUrl = window.location.origin;
      
      const response = await axios.post(
        `${API}/checkout/session`,
        { plan, billing, origin_url: originUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple pricing</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Start free. Upgrade when you're crushing it.</p>
          
          <div className="mt-8 inline-flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Save $24</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Good enough for most people</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">5 emails per day</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">3 writing samples</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Subject + body + follow-up</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Reply Handler</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Unlimited emails</span>
              </li>
            </ul>

            {currentTier === 'free' ? (
              <button
                disabled
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-semibold rounded-lg cursor-not-allowed"
              >
                Current plan
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="w-full py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              >
                Start free
              </button>
            )}
          </div>

          {/* Pro Plan */}
          <div className="bg-indigo-600 dark:bg-indigo-500 rounded-xl border-2 border-indigo-600 dark:border-indigo-500 p-8 text-white relative">
            <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'monthly' ? '7' : '5'}
                </span>
                <span className="text-indigo-100">/month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-indigo-100 mt-2">$60 billed yearly</p>
              )}
              <p className="text-sm text-indigo-100 mt-2">When you're serious about outreach</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <span className="font-medium">Unlimited emails</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <span className="font-medium">Unlimited writing samples</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <span className="font-medium">Reply Handler</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <span className="font-medium">Everything in Free</span>
              </li>
            </ul>

            {currentTier === 'pro' ? (
              <button
                disabled
                className="w-full py-3 bg-white/20 text-white font-semibold rounded-lg cursor-not-allowed"
              >
                Current plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('pro', billingCycle)}
                disabled={loading}
                className="w-full py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upgrade now'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
