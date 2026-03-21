import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Zap, Clock, MessageSquare, Check } from 'lucide-react';

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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Free · 5 emails/day · Powered by AI
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6" style={{fontFamily: '"Work Sans", sans-serif'}}>
            Your cold emails,<br />
            <span className="text-indigo-600">automated.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Describe who you're reaching out to. Outbox crafts personalized cold emails that sound like <em>you</em> — instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              data-testid="hero-cta-button"
            >
              Get started free
            </button>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-300 transition-all text-lg"
            >
              Log in
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">Free forever · No credit card required</p>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
              </div>
              <span className="text-white/80 text-sm ml-4">outbox.app</span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">INPUT</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Sender:</span> <span className="text-gray-900 font-medium">Alex, CEO at Flowly</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Recipient:</span> <span className="text-gray-900 font-medium">Sarah, VP Sales at TechCorp</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Context:</span> <span className="text-gray-900">Posted about manual follow-ups taking too long</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">OUTPUT</h3>
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-indigo-900 mb-2">Subject: Your follow-up problem</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Sarah, saw your post about follow-ups eating your day.<br /><br />
                    We built something that kills that. Takes 2 mins to set up, runs in the background.<br /><br />
                    Worth a look?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2" style={{fontFamily: '"Work Sans", sans-serif'}}>
              Everything you need to close deals.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-powered writing</h3>
              <p className="text-gray-600">Describe your offer and recipient. The AI crafts personalized emails that sound human, not robotic.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your writing style</h3>
              <p className="text-gray-600">Paste examples of your writing. Outbox matches your tone, vocabulary, and rhythm perfectly.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reply Handler</h3>
              <p className="text-gray-600">
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold mb-1">PRO</span>
                <br />Paste their reply, get the perfect response. Never miss your shot.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow-up templates</h3>
              <p className="text-gray-600">Every email comes with a pre-written follow-up. Send it 3 days later if they don't reply.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jargon, no fluff</h3>
              <p className="text-gray-600">Trained to avoid buzzwords and corporate speak. Your emails sound like a person, not a bot.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">$0</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free to start</h3>
              <p className="text-gray-600">5 emails per day, forever free. Upgrade to Pro when you're ready to scale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">How it works</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2" style={{fontFamily: '"Work Sans", sans-serif'}}>
              Up and running in 60 seconds.
            </h2>
          </div>
          
          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                01
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create an account</h3>
                <p className="text-gray-600">Sign up for free — no credit card needed. Your data is saved so you can come back anytime.</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                02
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Describe your outreach</h3>
                <p className="text-gray-600">Fill in sender info, recipient details, and optionally add your writing style. Takes 30 seconds.</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                03
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hit generate</h3>
                <p className="text-gray-600">Get your subject line, email body, and follow-up in seconds. Copy, send, close deals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6" style={{fontFamily: '"Work Sans", sans-serif'}}>
            Stop planning.<br />
            Start closing.
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Outbox turns your ideas into action in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
            >
              Get started free
            </button>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-300 transition-all text-lg"
            >
              Log in
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-6">Free forever · No credit card required</p>
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
