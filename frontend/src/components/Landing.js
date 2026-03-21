import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Zap, Clock, MessageSquare, Check, Crown } from 'lucide-react';

const Logo = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect x="12" y="24" width="40" height="28" rx="2" fill="#6366F1" />
    <path d="M12 24 L32 38 L52 24" stroke="#4F46E5" strokeWidth="2" fill="none" />
    <path d="M32 20 L32 8 M32 8 L28 12 M32 8 L36 12" 
          stroke="url(#arrowGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="text-2xl font-bold text-gray-900" style={{fontFamily: '"Work Sans", sans-serif'}}>
                Outbox
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/auth?mode=login')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                data-testid="header-login-button"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                data-testid="header-signup-button"
              >
                Get started free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-60"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-full text-sm font-medium mb-6 shadow-sm">
                <Sparkles className="w-4 h-4" />
                5 free emails daily
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight" style={{fontFamily: '"Work Sans", sans-serif'}}>
                Cold emails that <span className="text-indigo-600">actually get replies</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Stop staring at blank emails. Outbox writes personalized outreach in your voice—no templates, no BS, just emails that convert.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/auth?mode=signup')}
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                  data-testid="hero-cta-button"
                >
                  Start writing for free
                </button>
                <button
                  onClick={() => navigate('/auth?mode=login')}
                  className="px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-all"
                >
                  Sign in
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-6 flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600" />
                  Free forever
                </span>
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">Generated in 3.2s</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Subject</p>
                    <p className="text-sm font-semibold text-gray-900">Quick question about your content workflow</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Hey Jordan,<br /><br />
                      Saw your post about spending hours on blog drafts. We built something that cuts that down to minutes.<br /><br />
                      No fluff, no learning curve. Just faster writing.<br /><br />
                      Worth 5 mins to see it?
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">No jargon detected</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">87 words</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: '"Work Sans", sans-serif'}}>
              Write like a human, scale like a machine
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every feature designed to make you sound authentic, not automated
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 hover:shadow-lg transition-all">
              <div className="absolute top-4 right-4 text-4xl opacity-10">✍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mirror your voice</h3>
              <p className="text-gray-600 mb-4">
                Paste examples of your writing. The AI learns your rhythm, vocabulary, and tone—then replicates it perfectly.
              </p>
              <div className="text-sm text-indigo-600 font-medium">Optional writing samples →</div>
            </div>
            
            <div className="relative p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 hover:shadow-lg transition-all">
              <div className="absolute top-4 right-4 text-4xl opacity-10">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hyper-personalized openers</h3>
              <p className="text-gray-600 mb-4">
                No generic "hope this finds you well." Every email starts with something specific about them—LinkedIn posts, pain points, recent news.
              </p>
              <div className="text-sm text-purple-600 font-medium">Context-aware AI →</div>
            </div>
            
            <div className="relative p-6 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100 hover:shadow-lg transition-all">
              <div className="absolute top-4 right-4 text-4xl opacity-10">💬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reply Handler</h3>
              <p className="text-gray-600 mb-4">
                They replied? Paste it in. Get the perfect response instantly. No more overthinking, no more drafts.
              </p>
              <div className="text-sm text-amber-600 font-medium flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                Pro feature →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">89%</div>
              <p className="text-sm text-gray-600">Higher reply rates</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">3.2s</div>
              <p className="text-sm text-gray-600">Average generation time</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">120</div>
              <p className="text-sm text-gray-600">Words or less</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">$0</div>
              <p className="text-sm text-gray-600">To get started</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: '"Work Sans", sans-serif'}}>
              From blank page to sent email in 60 seconds
            </h2>
          </div>
          
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-amber-200 hidden md:block"></div>
            
            <div className="space-y-12">
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg z-10">
                  1
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Fill in the basics</h3>
                  <p className="text-gray-600 mb-3">Who are you? Who are you reaching out to? What do you want? That's it. Takes 20 seconds.</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 italic">"I'm Alex, CEO. Reaching out to Sarah, VP Sales at TechCorp. She posted about losing deals in follow-ups."</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg z-10">
                  2
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hit generate</h3>
                  <p className="text-gray-600 mb-3">The AI crafts three things: a punchy subject line, a short personalized email, and a follow-up for later.</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Subject</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Body</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">Follow-up</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg z-10">
                  3
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Copy, send, close</h3>
                  <p className="text-gray-600">One click copies everything. Paste into your email client. Send. No editing needed (but you can if you want).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{fontFamily: '"Work Sans", sans-serif'}}>
            Ready to write emails people actually read?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join thousands of founders, sales teams, and freelancers closing deals with better cold emails.
          </p>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg"
          >
            Start writing for free
          </button>
          <p className="text-sm text-indigo-200 mt-6">5 emails/day · No credit card · Upgrade anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 Outbox. Built with Emergent AI.</p>
        </div>
      </footer>
    </div>
  );
}
