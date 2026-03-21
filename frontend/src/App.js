import { useState } from "react";
import "@/App.css";
import axios from "axios";
import { Copy, RefreshCw, Mail, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
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

  const handleGenerate = async () => {
    if (!senderName || !senderRole || !senderOffer || !recipientName || !recipientRole || !recipientContext || !writingStyle) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/generate-email`, {
        sender_name: senderName,
        sender_role: senderRole,
        sender_offer: senderOffer,
        recipient_name: recipientName,
        recipient_role_company: recipientRole,
        recipient_context: recipientContext,
        writing_style: writingStyle,
        writing_sample: showSample ? writingSample : null,
      });

      setSubjectLine(response.data.subject_line);
      setEmailBody(response.data.email_body);
      setFollowUp(response.data.follow_up);
      setGenerated(true);
    } catch (error) {
      console.error("Error generating email:", error);
      alert("Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = (type) => {
    // For simplicity, regenerate all
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900" style={{fontFamily: '"Inter", sans-serif'}}>Cold Email Machine</h1>
              <p className="text-xs sm:text-sm text-gray-600">Generate hyper-personalized cold emails in seconds</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Sender Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow" data-testid="sender-section">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Sender Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    data-testid="sender-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
                  <input
                    type="text"
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value)}
                    placeholder="e.g., CEO, Sales Director"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    data-testid="sender-role-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer *</label>
                  <textarea
                    value={senderOffer}
                    onChange={(e) => setSenderOffer(e.target.value)}
                    placeholder="What are you offering?"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                    data-testid="sender-offer-input"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow" data-testid="recipient-section">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Recipient Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    data-testid="recipient-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role/Company *</label>
                  <input
                    type="text"
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    placeholder="e.g., VP Marketing at TechCorp"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    data-testid="recipient-role-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Context/Pain Points *</label>
                  <textarea
                    value={recipientContext}
                    onChange={(e) => setRecipientContext(e.target.value)}
                    placeholder="LinkedIn bio, pain points, recent activity..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all"
                    data-testid="recipient-context-input"
                  />
                </div>
              </div>
            </div>

            {/* Writing Style */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow" data-testid="writing-style-section">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Writing Style
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Style Description *</label>
                  <input
                    type="text"
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    placeholder="e.g., casual and witty, professional and direct"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    data-testid="writing-style-input"
                  />
                </div>
                <div>
                  <button
                    onClick={() => setShowSample(!showSample)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition-all mt-2"
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
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              data-testid="generate-button"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No emails generated yet</h3>
                <p className="text-sm text-gray-600 max-w-xs">Fill in the form and click Generate to create your personalized cold emails</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Crafting your emails...</h3>
                <p className="text-sm text-gray-600">This will take just a moment</p>
              </div>
            )}

            {generated && !loading && (
              <>
                {/* Subject Line Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow" data-testid="subject-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Subject Line</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(subjectLine, 0)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        data-testid="copy-subject-button"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate('subject')}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        data-testid="regenerate-subject-button"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium">{subjectLine}</p>
                  {copiedIndex === 0 && <p className="text-xs text-green-600 mt-2">Copied!</p>}
                </div>

                {/* Email Body Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow" data-testid="body-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Email Body</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(emailBody, 1)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        data-testid="copy-body-button"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate('body')}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        data-testid="regenerate-body-button"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{emailBody}</p>
                  {copiedIndex === 1 && <p className="text-xs text-green-600 mt-2">Copied!</p>}
                </div>

                {/* Follow-up Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow" data-testid="followup-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Follow-up</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(followUp, 2)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        data-testid="copy-followup-button"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate('followup')}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        data-testid="regenerate-followup-button"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{followUp}</p>
                  {copiedIndex === 2 && <p className="text-xs text-green-600 mt-2">Copied!</p>}
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