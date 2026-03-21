import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Moon, Sun, Zap, Mail, TrendingUp } from 'lucide-react';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect x="12" y="24" width="40" height="28" rx="2" fill="#6366F1" />
    <path d="M12 24 L32 38 L52 24" stroke="#4F46E5" strokeWidth="2" fill="none" />
    <path d="M32 20 L32 8 M32 8 L28 12 M32 8 L36 12" 
          stroke="url(#arrowGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Outbox</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero - Asymmetric */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-full text-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              5 free emails daily, no card needed
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.1]">
              Stop staring at<br />
              blank emails
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
              Write personalized cold emails in seconds. No templates. No jargon. Just emails that sound like you—and actually get replies.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-12">
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 group"
              >
                Start writing free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/auth?mode=login')}
                className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg font-medium"
              >
                Sign in
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-8 text-sm">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">2,847</div>
                <div className="text-gray-600 dark:text-gray-400">emails sent today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">89%</div>
                <div className="text-gray-600 dark:text-gray-400">reply rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating email card */}
        <div className="absolute right-0 top-32 w-[500px] hidden xl:block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-5 transform rotate-2">
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <span>Generated in 2.8s</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your content workflow bottleneck</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
              <p>Jordan,</p>
              <p>Caught your tweet about blog drafts taking forever. Built something that might help.</p>
              <p>Cuts writing time by 70%. No setup, no BS.</p>
              <p>5 min demo?</p>
            </div>
            <div className="flex gap-2 mt-4">
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">No jargon</span>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">64 words</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-around gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">3.2s</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">avg generation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">&lt;120</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">words per email</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">$0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">to start</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">5/day</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">free forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Cards with personality */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for speed, not perfection
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Because good enough today beats perfect next week
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mirror your voice</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Paste your writing samples. AI learns how you talk. Every email sounds like it came from you, not a robot.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No generic openers</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Every email starts with something specific about them. LinkedIn post, pain point, recent news. Not "hope you're well."
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reply Handler</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                They responded? Paste it. Get the perfect reply instantly. No overthinking. No drafts.
              </p>
              <span className="inline-flex items-center text-sm font-medium text-amber-600 dark:text-amber-400">
                Pro only →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Simple steps */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-16 text-center">
            From idea to inbox in 60 seconds
          </h2>

          <div className="space-y-16">
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Fill the basics</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Who are you? Who's the recipient? What do you want? Takes 20 seconds.</p>
                <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 italic">
                  "Alex, founder. Reaching out to Sarah—she posted about losing deals to slow follow-ups."
                </div>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Click generate</h3>
                <p className="text-gray-600 dark:text-gray-400">Subject line. Email body. Follow-up. All done in 3 seconds.</p>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Copy, send, done</h3>
                <p className="text-gray-600 dark:text-gray-400">One click copies everything. Paste into Gmail. Hit send. That's it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to hit send?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            Stop planning. Start closing. First 5 emails are on us.
          </p>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-lg inline-flex items-center gap-2 group"
          >
            Start writing for free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">No credit card · 5 emails/day forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2026 Outbox · Made for humans who hate writing cold emails</p>
        </div>
      </footer>
    </div>
  );
}
