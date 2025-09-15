import React, { useState, useRef, useEffect } from 'react';
import {
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  QuestionAnswer as QAIcon,
  AutoAwesome as AutoAwesomeIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState(i18n.language);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [relevantDocuments, setRelevantDocuments] = useState([]);
  const messagesEndRef = useRef(null);

  // Update language when i18n language changes
  useEffect(() => {
    const newLanguage = i18n.language;
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      translateExistingMessages(newLanguage);
    }
  }, [i18n.language]);

  // Translate existing chat messages when language changes
  const translateExistingMessages = async (newLanguage) => {
    if (chatHistory.length === 0) return;

    try {
      const translatedHistory = await Promise.all(
        chatHistory.map(async (message) => {
          if (message.type === 'ai' || message.type === 'system') {
            try {
              const response = await api.translate(message.content, newLanguage);
              return {
                ...message,
                content: response.translated_text,
                originalContent: message.content
              };
            } catch (err) {
              console.error('Translation error:', err);
              return message;
            }
          }
          return message;
        })
      );
      setChatHistory(translatedHistory);
    } catch (err) {
      console.error('Error translating chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    // Add welcome message
    setChatHistory([{
      type: 'system',
      content: language === 'ml' 
        ? 'നമസ്കാരം! കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡിന്റെ ഡോക്യുമെന്റ് അനാലിസിസ് അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ ആക്സസ് ചെയ്യാവുന്ന എല്ലാ ഡോക്യുമെന്റുകളും വിശകലനം ചെയ്ത് സാധാരണ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകാൻ എനിക്ക് കഴിയും.'
        : 'Welcome to KMRL Document Analysis Assistant! I can analyze all documents you have access to and answer general questions about your document collection.',
      timestamp: new Date().toISOString()
    }]);
  }, [language]);

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMessage = query;
    setQuery('');
    
    // Add user message to chat
    setChatHistory(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/documents/search', {
        query: userMessage,
        language: language
      });

      // Add AI response to chat
      setChatHistory(prev => [...prev, {
        type: 'ai',
        content: response.data.answer,
        timestamp: new Date().toISOString(),
        relevantDocuments: response.data.relevant_documents || []
      }]);

      // Update relevant documents for display
      setRelevantDocuments(response.data.relevant_documents || []);

    } catch (err) {
      console.error('Global search error:', err);
      setError(err.response?.data?.error || 'Failed to search documents');
      
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        type: 'error',
        content: language === 'ml' 
          ? 'ക്ഷമിക്കണം, വിശകലനത്തിൽ പിഴവ് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
          : 'Sorry, there was an error analyzing your query. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  const getSuggestions = () => {
    const suggestions = language === 'ml' ? [
      'ഏറ്റവും പുതിയ നയ അപ്‌ഡേറ്റുകൾ എന്താണ്?',
      'ധനകാര്യ റിപ്പോർട്ടുകളിൽ പ്രധാന കണ്ടെത്തലുകൾ എന്താണ്?',
      'എഞ്ചിനീയറിംഗ് പദ്ധതികളുടെ നിലവിലെ അവസ്ഥ എന്താണ്?',
      'ജീവനക്കാരുടെ നയങ്ങളിൽ ഏതെങ്കിലും മാറ്റങ്ങൾ ഉണ്ടോ?',
      'ബഡ്ജറ്റ് അനുവദനങ്ങളും ചെലവുകളും സംഗ്രഹിക്കുക'
    ] : [
      'What are the latest policy updates?',
      'What are the key findings in financial reports?',
      'What is the current status of engineering projects?',
      'Are there any changes in employee policies?',
      'Summarize budget allocations and expenses'
    ];

    return suggestions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-600/20 to-blue-700/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-600/10 to-blue-700/10 rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 p-8 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-6 p-3 backdrop-blur-sm bg-gradient-to-br from-blue-700/60 to-indigo-700/50 border border-blue-400/60 rounded-2xl text-white hover:text-white hover:from-blue-600/80 hover:to-indigo-600/70 hover:border-blue-300/80 hover:shadow-xl hover:shadow-blue-900/40 transition-all duration-300 transform hover:scale-110"
              >
                <ArrowBackIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-700 rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  <AnalyticsIcon className="h-8 w-8 text-white relative" />
                </div>
                <div>
                  <h1 className={`text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2 ${language === 'ml' ? 'font-malayalam' : ''}`}>
                    {language === 'ml' ? 'ഗ്ലോബൽ ഡോക്യുമെന്റ് അനാലിസിസ്' : 'Global Document Analysis'}
                  </h1>
                  <p className="text-slate-300 font-medium text-lg">
                    {language === 'ml' 
                      ? 'എല്ലാ ഡോക്യുമെന്റുകളിലും AI-പവർഡ് ഇൻസൈറ്റുകൾ'
                      : 'AI-powered insights across all your documents with enterprise intelligence'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Language Toggle */}
            <div className="flex backdrop-blur-sm bg-slate-800/60 rounded-2xl border border-blue-500/30 p-2 shadow-xl">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl transform scale-105'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/60'
                }`}
              >
                🇺🇸 EN
              </button>
              <button
                onClick={() => setLanguage('ml')}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  language === 'ml'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl transform scale-105'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/60'
                }`}
              >
                🇮🇳 മल
              </button>
            </div>
          </div>
        </div>
        {/* Premium Feature Overview */}
        <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-3xl shadow-xl border border-blue-500/30 p-8 mb-8 animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0.1s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5"></div>
          <div className="flex items-start space-x-4 relative z-10">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
              <AutoAwesomeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                {language === 'ml' ? 'ഇന്റലിജന്റ് ഡോക്യുമെന്റ് അനാലിസിസ്' : 'Intelligent Document Analysis'}
              </h3>
              <p className={`text-slate-300 leading-relaxed ${language === 'ml' ? 'font-malayalam' : ''}`}>
                {language === 'ml' 
                  ? `${user?.fullName}, നിങ്ങളുടെ റോൾ (${user?.role}) അനുസരിച്ച് ആക്സസ് ചെയ്യാവുന്ന എല്ലാ ഡോക്യുമെന്റുകളും AI വിശകലനം ചെയ്യും. സാധാരണ ചോദ്യങ്ങൾ ചോദിക്കുക, ട്രെൻഡുകൾ കണ്ടെത്തുക, അല്ലെങ്കിൽ ഡോക്യുമെന്റുകളിലുടനീളം വിവരങ്ങൾ താരതമ്യം ചെയ്യുക.`
                  : `Welcome ${user?.fullName}! The AI will analyze all documents accessible to your role (${user?.role}) and provide intelligent insights. Ask questions, identify trends, compare information across documents, or discover hidden patterns in your organizational knowledge base.`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden h-fit">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-violet-600 to-violet-700 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                <div className="flex items-center space-x-3 relative z-10">
                  <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-xl">
                    <QAIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${language === 'ml' ? 'font-malayalam' : ''}`}>
                      {language === 'ml' ? 'AI അസിസ്റ്റന്റ്' : 'AI Assistant'}
                    </h2>
                    <p className="text-violet-100">Intelligent document analysis</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-sm ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl' 
                          : message.type === 'error' 
                          ? 'bg-gradient-to-br from-red-600/20 to-red-700/20 text-red-300 border border-red-500/30 shadow-xl'
                          : message.type === 'system'
                          ? 'bg-gradient-to-br from-violet-600/20 to-violet-700/20 text-violet-300 border border-violet-500/30 shadow-xl'
                          : 'bg-gradient-to-br from-slate-700/60 to-slate-600/40 text-slate-100 shadow-xl border border-slate-500'
                      }`}>
                        <p className={`text-sm whitespace-pre-wrap ${language === 'ml' ? 'font-malayalam' : ''}`}>
                          {message.content}
                        </p>
                        
                        {/* Show relevant documents for AI responses */}
                        {message.type === 'ai' && message.relevantDocuments && message.relevantDocuments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-500">
                            <p className={`text-xs text-slate-300 mb-2 font-semibold ${language === 'ml' ? 'font-malayalam' : ''}`}>
                              {language === 'ml' ? 'പ്രസക്തമായ ഡോക്യുമെന്റുകൾ:' : 'Relevant Documents:'}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {message.relevantDocuments.slice(0, 3).map((doc, docIndex) => (
                                <button
                                  key={docIndex}
                                  onClick={() => handleDocumentClick(doc.id)}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-br from-slate-600/60 to-slate-500/40 text-slate-200 hover:bg-slate-500/80 hover:text-blue-300 transition-colors duration-200 border border-slate-500"
                                >
                                  {doc.filename}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-br from-slate-700/60 to-slate-600/40 px-4 py-3 rounded-2xl shadow-xl border border-slate-500 flex items-center space-x-2">
                        <CircularProgress size={16} />
                        <span className={`text-sm text-slate-300 ${language === 'ml' ? 'font-malayalam' : ''}`}>
                          {language === 'ml' ? 'ഡോക്യുമെന്റുകൾ വിശകലനം ചെയ്യുന്നു...' : 'Analyzing documents...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-600 bg-gradient-to-br from-slate-800/60 to-slate-700/40">
                <div className="flex space-x-3">
                  <textarea
                    placeholder={language === 'ml' ? 'നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...' : 'Type your question here...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={loading}
                    rows={3}
                    className={`flex-1 block w-full rounded-lg bg-slate-700/60 border-slate-500 text-slate-200 placeholder-slate-400 shadow-xl focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none ${
                      language === 'ml' ? 'font-malayalam' : ''
                    }`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!query.trim() || loading}
                    className="inline-flex items-center p-3 border border-transparent rounded-lg shadow-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed self-end transition-all duration-300"
                  >
                    <SendIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Suggestions */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <SearchIcon className="h-4 w-4" />
                  </div>
                  <h3 className={`text-lg font-semibold ${language === 'ml' ? 'font-malayalam' : ''}`}>
                    {language === 'ml' ? 'സാധാരണ ചോദ്യങ്ങൾ' : 'Common Questions'}
                  </h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {getSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className={`w-full text-left p-3 text-sm text-white bg-gradient-to-br from-blue-700/60 to-indigo-700/50 hover:from-blue-600/80 hover:to-indigo-600/70 hover:text-white hover:shadow-lg hover:shadow-blue-900/30 rounded-lg border border-blue-400/50 hover:border-blue-300/70 transition-all duration-200 transform hover:scale-[1.02] ${
                      language === 'ml' ? 'font-malayalam' : ''
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Relevant Documents */}
            {relevantDocuments.length > 0 && (
              <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <DocumentIcon className="h-4 w-4" />
                    </div>
                    <h3 className={`text-lg font-semibold ${language === 'ml' ? 'font-malayalam' : ''}`}>
                      {language === 'ml' ? 'പ്രസക്തമായ ഡോക്യുമെന്റുകൾ' : 'Relevant Documents'}
                    </h3>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {relevantDocuments.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => handleDocumentClick(doc.id)}
                      className="w-full text-left p-3 border border-slate-500/30 rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-600/40 hover:bg-slate-600/80 hover:border-blue-500/50 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <DocumentIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {doc.filename}
                          </p>
                          {doc.summary_en && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {doc.summary_en.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* User Access Info */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <SecurityIcon className="h-4 w-4" />
                  </div>
                  <h3 className={`text-lg font-semibold ${language === 'ml' ? 'font-malayalam' : ''}`}>
                    {language === 'ml' ? 'നിങ്ങളുടെ ആക്സസ്' : 'Your Access'}
                  </h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                    <SecurityIcon className="h-4 w-4 text-slate-300" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium text-slate-200 ${language === 'ml' ? 'font-malayalam' : ''}`}>
                      {language === 'ml' ? 'റോൾ:' : 'Role:'} {user?.role}
                    </p>
                  </div>
                </div>
                <p className={`text-sm text-slate-400 ${language === 'ml' ? 'font-malayalam' : ''}`}>
                  {language === 'ml' 
                    ? 'നിങ്ങളുടെ റോൾ അനുസരിച്ച് അനുവദിച്ച എല്ലാ ഡോക്യുമെന്റുകളും AI വിശകലനം ചെയ്യും.'
                    : 'AI will analyze all documents authorized for your role.'
                  }
                </p>
              </div>
            </div>

            {/* Analytics Card */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <TrendingUpIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold">Analytics</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Sessions Today</span>
                    <span className="text-sm font-semibold text-slate-200">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Documents Analyzed</span>
                    <span className="text-sm font-semibold text-slate-200">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Queries Processed</span>
                    <span className="text-sm font-semibold text-slate-200">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8">
            <Alert severity="error">{error}</Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
