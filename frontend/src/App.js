import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Copy, RefreshCw, Sparkles, ChevronDown, ChevronUp, Sun, Moon, LogOut, Send, Crown, MessageSquare, Check, X } from "lucide-react";
import Landing from "./components/Landing";
import Pricing from "./components/Pricing";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode') || 'login';

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [authMode, setAuthMode] = useState(initialMode);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login' 
        ? { email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword, name: authName };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (error) {
      setAuthError(error.response?.data?.detail || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2" style={{fontFamily: '"Work Sans", sans-serif'}}>Outbox</h1>
            <p className="text-slate-600 dark:text-slate-400">Generate Cold Emails using YOUR style</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                  authMode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                data-testid="login-tab"
              >
                Log In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                  authMode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                data-testid="signup-tab"
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required={authMode === 'signup'}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                    data-testid="auth-name-input"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  data-testid="auth-email-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  data-testid="auth-password-input"
                />
              </div>

              {authError && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg" data-testid="auth-error">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="auth-submit-button"
              >
                {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Log In' : 'Create Account')}
              </button>
            </form>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
              data-testid="theme-toggle"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');
  
  const [senderName, setSenderName] = useState("");
  const [senderRole, setSenderRole] = useState("");
  const [senderOffer, setSenderOffer] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [recipientContext, setRecipientContext] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [writingSample, setWritingSample] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [subjectLine, setSubjectLine] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [originalEmail, setOriginalEmail] = useState("");
  const [recipientReply, setRecipientReply] = useState("");
  const [replyContext, setReplyContext] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState("");

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth?mode=login');
      return;
    }
    verifyToken(token);
    fetchUsage(token);
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/auth?mode=login');
    }
  };

  const fetchUsage = async (token) => {
    try {
      const response = await axios.get(`${API}/usage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsage(response.data);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleGenerate = async () => {
    if (!senderName || !senderRole || !senderOffer || !recipientName || !recipientRole || !recipientContext) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/generate-email`, {
        sender_name: senderName,
        sender_role: senderRole,
        sender_offer: senderOffer,
        recipient_name: recipientName,
        recipient_role_company: recipientRole,
        recipient_context: recipientContext,
        writing_style: writingStyle || null,
        writing_sample: showSample ? writingSample : null,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubjectLine(response.data.subject_line);
      setEmailBody(response.data.email_body);
      setFollowUp(response.data.follow_up);
      setGenerated(true);
      fetchUsage(token);
    } catch (error) {
      console.error("Error generating email:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else if (error.response?.status === 429) {
        alert(error.response.data.detail);
      } else {
        alert("Failed to generate email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReplyGenerate = async () => {
    if (!originalEmail || !recipientReply) {
      alert("Please fill in both the original email and their reply");
      return;
    }

    setReplyLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/reply-handler`, {
        original_email: originalEmail,
        recipient_reply: recipientReply,
        context: replyContext || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuggestedResponse(response.data.suggested_response);
    } catch (error) {
      console.error("Error generating reply:", error);
      if (error.response?.status === 403) {
        alert(error.response.data.detail);
        navigate('/pricing');
      } else {
        alert("Failed to generate reply. Please try again.");
      }
    } finally {
      setReplyLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
      }
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const isPro = user?.subscription_tier === 'pro';

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{fontFamily: '"Work Sans", sans-serif'}}>
                  Outbox
                  {isPro && <Crown className="w-5 h-5 text-amber-500" />}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Generate Cold Emails using YOUR style</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                Hey, {user?.name}!
                {!isPro && <button onClick={() => navigate('/pricing')} className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium">Upgrade</button>}
              </span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                data-testid="theme-toggle-main"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                data-testid="logout-button"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {usage && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Emails today: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {usage.daily_emails_used}/{usage.daily_emails_limit === 999999 ? '∞' : usage.daily_emails_limit}
                  </span>
                </div>
                <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 usage-bar rounded-full"
                    style={{width: `${Math.min((usage.daily_emails_used / usage.daily_emails_limit) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
              {!isPro && (
                <button
                  onClick={() => navigate('/pricing')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {isPro && (
          <div className="mb-6 flex gap-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('generate')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'generate'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Generate Email
              {activeTab === 'generate' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reply')}
              className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'reply'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Reply Handler
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">PRO</span>
              {activeTab === 'reply' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
              )}
            </button>
          </div>
        )}

        {activeTab === 'generate' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="sender-section">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sender Info</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                      data-testid="sender-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role *</label>
                    <input
                      type="text"
                      value={senderRole}
                      onChange={(e) => setSenderRole(e.target.value)}
                      placeholder="e.g., CEO, Sales Director"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                      data-testid="sender-role-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Offer *</label>
                    <textarea
                      value={senderOffer}
                      onChange={(e) => setSenderOffer(e.target.value)}
                      placeholder="What are you offering?"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all"
                      data-testid="sender-offer-input"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="recipient-section">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recipient Info</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Recipient's name"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                      data-testid="recipient-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role/Company *</label>
                    <input
                      type="text"
                      value={recipientRole}
                      onChange={(e) => setRecipientRole(e.target.value)}
                      placeholder="e.g., VP Marketing at TechCorp"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                      data-testid="recipient-role-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Context/Pain Points *</label>
                    <textarea
                      value={recipientContext}
                      onChange={(e) => setRecipientContext(e.target.value)}
                      placeholder="LinkedIn bio, pain points, recent activity..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all"
                      data-testid="recipient-context-input"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="writing-style-section">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Writing Style</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Style Description (optional)</label>
                    <input
                      type="text"
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                      placeholder="e.g., casual and witty, professional and direct"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                      data-testid="writing-style-input"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Leave blank for natural, conversational style</p>
                  </div>
                  <div>
                    <button
                      onClick={() => setShowSample(!showSample)}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                      data-testid="toggle-sample-button"
                    >
                      {showSample ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {showSample ? "Hide" : "+ Add"} writing sample
                    </button>
                    {showSample && (
                      <textarea
                        value={writingSample}
                        onChange={(e) => setWritingSample(e.target.value)}
                        placeholder="Paste a sample of your writing style here..."
                        rows={4}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all mt-2"
                        data-testid="writing-sample-input"
                      />
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                data-testid="generate-button"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Crafting your email...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Email
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6" data-testid="output-section">
              {!generated && !loading && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <Send className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ready to craft your email</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">Fill in the details and click Generate to create personalized cold emails</p>
                </div>
              )}

              {loading && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                    <Sparkles className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Analyzing your inputs...</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Creating personalized emails that sound like you</p>
                </div>
              )}

              {generated && !loading && (
                <>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="subject-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Subject Line</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(subjectLine, 0)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          data-testid="copy-subject-button"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleGenerate}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          data-testid="regenerate-subject-button"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium text-lg">{subjectLine}</p>
                    {copiedIndex === 0 && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">✓ Copied to clipboard</p>}
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="body-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Email Body</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(emailBody, 1)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          data-testid="copy-body-button"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleGenerate}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          data-testid="regenerate-body-button"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{emailBody}</p>
                    {copiedIndex === 1 && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">✓ Copied to clipboard</p>}
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="followup-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Follow-up</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(followUp, 2)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          data-testid="copy-followup-button"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleGenerate}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          data-testid="regenerate-followup-button"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{followUp}</p>
                    {copiedIndex === 2 && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">✓ Copied to clipboard</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Reply Handler
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">PRO</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Got a reply? Paste it here and get the perfect response instantly.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Original Email You Sent *</label>
                    <textarea
                      value={originalEmail}
                      onChange={(e) => setOriginalEmail(e.target.value)}
                      placeholder="Paste the cold email you originally sent..."
                      rows={4}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Their Reply *</label>
                    <textarea
                      value={recipientReply}
                      onChange={(e) => setRecipientReply(e.target.value)}
                      placeholder="Paste their response here..."
                      rows={5}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Additional Context (optional)</label>
                    <textarea
                      value={replyContext}
                      onChange={(e) => setReplyContext(e.target.value)}
                      placeholder="Any extra context to help craft the response..."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleReplyGenerate}
                  disabled={replyLoading}
                  className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {replyLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Crafting response...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Response
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              {!suggestedResponse && !replyLoading && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ready to handle replies</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">Paste their reply and generate the perfect response</p>
                </div>
              )}

              {replyLoading && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                    <Sparkles className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Analyzing the conversation...</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Crafting the perfect response</p>
                </div>
              )}

              {suggestedResponse && !replyLoading && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="reply-response-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Suggested Response</h3>
                    <button
                      onClick={() => handleCopy(suggestedResponse, 3)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{suggestedResponse}</p>
                  {copiedIndex === 3 && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">✓ Copied to clipboard</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('success');

  useEffect(() => {
    // Upgrade happened via webhook, just show success and redirect
    const timer = setTimeout(() => {
      // Refresh user data
      const token = localStorage.getItem('token');
      if (token) {
        axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          localStorage.setItem('user', JSON.stringify(response.data));
          navigate('/dashboard');
        }).catch(() => {
          navigate('/dashboard');
        });
      } else {
        navigate('/dashboard');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Welcome to Pro. Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
