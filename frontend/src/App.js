import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Copy, RefreshCw, Sparkles, ChevronDown, ChevronUp, Sun, Moon, LogOut, Send } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  
  // Auth form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  
  // Email form states
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
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

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
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(error.response?.data?.detail || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setGenerated(false);
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
    } catch (error) {
      console.error("Error generating email:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert("Failed to generate email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-2xl mb-4 shadow-lg shadow-teal-500/30">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2" style={{fontFamily: '"Work Sans", sans-serif'}}>Outbox</h1>
              <p className="text-slate-600 dark:text-slate-400">Generate Cold Emails using YOUR style</p>
            </div>

            {/* Auth Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                    authMode === 'login'
                      ? 'bg-teal-500 text-white shadow-md'
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
                      ? 'bg-teal-500 text-white shadow-md'
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
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
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
                  className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="auth-submit-button"
                >
                  {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Log In' : 'Create Account')}
                </button>
              </form>
            </div>

            {/* Dark Mode Toggle */}
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

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/30">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{fontFamily: '"Work Sans", sans-serif'}}>Outbox</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Generate Cold Emails using YOUR style</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">Hey, {user?.name}!</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Sender Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="sender-section">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
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
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition-all"
                    data-testid="sender-offer-input"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="recipient-section">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-coral-500 rounded-full"></div>
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
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition-all"
                    data-testid="recipient-context-input"
                  />
                </div>
              </div>
            </div>

            {/* Writing Style */}
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
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    data-testid="writing-style-input"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Leave blank for natural, conversational style</p>
                </div>
                <div>
                  <button
                    onClick={() => setShowSample(!showSample)}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
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
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition-all mt-2"
                      data-testid="writing-sample-input"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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

          {/* Output Section */}
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
                <div className="w-20 h-20 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="w-10 h-10 text-teal-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Analyzing your inputs...</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Creating personalized emails that sound like you</p>
              </div>
            )}

            {generated && !loading && (
              <>
                {/* Subject Line Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="subject-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Subject Line</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(subjectLine, 0)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                        data-testid="copy-subject-button"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleRegenerate}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                        data-testid="regenerate-subject-button"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium text-lg">{subjectLine}</p>
                  {copiedIndex === 0 && <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 font-medium">✓ Copied to clipboard</p>}
                </div>

                {/* Email Body Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="body-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Email Body</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(emailBody, 1)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                        data-testid="copy-body-button"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleRegenerate}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                        data-testid="regenerate-body-button"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{emailBody}</p>
                  {copiedIndex === 1 && <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 font-medium">✓ Copied to clipboard</p>}
                </div>

                {/* Follow-up Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all" data-testid="followup-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Follow-up</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(followUp, 2)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                        data-testid="copy-followup-button"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleRegenerate}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                        data-testid="regenerate-followup-button"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{followUp}</p>
                  {copiedIndex === 2 && <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 font-medium">✓ Copied to clipboard</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;