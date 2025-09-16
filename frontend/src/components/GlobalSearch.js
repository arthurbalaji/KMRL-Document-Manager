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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-6 p-2 border border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                <ArrowBackIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <AnalyticsIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold text-gray-900 ${language === 'ml' ? 'font-malayalam' : ''}`}>
                    {language === 'ml' ? 'ഗ്ലോബൽ ഡോക്യുമെന്റ് അനാലിസിസ്' : 'Global Document Analysis'}
                  </h1>
                  <p className="text-gray-600">
                    {language === 'ml' 
                      ? 'എല്ലാ ഡോക്യുമെന്റുകളിലും AI-പവർഡ് ഇൻസൈറ്റുകൾ'
                      : 'AI-powered insights across all your documents'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-2 text-sm font-medium rounded ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🇺🇸 EN
              </button>
              <button
                onClick={() => setLanguage('ml')}
                className={`px-3 py-2 text-sm font-medium rounded ${
                  language === 'ml'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🇮🇳 മല
              </button>
            </div>
          </div>
        </div>
        {/* Feature Overview */}
        <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <AutoAwesomeIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'ml' ? 'ഇന്റലിജന്റ് ഡോക്യുമെന്റ് അനാലിസിസ്' : 'Intelligent Document Analysis'}
              </h3>
              <p className={`text-gray-600 leading-relaxed ${language === 'ml' ? 'font-malayalam' : ''}`}>
                {language === 'ml' 
                  ? `${user?.fullName}, നിങ്ങളുടെ റോൾ (${user?.role}) അനുസരിച്ച് ആക്സസ് ചെയ്യാവുന്ന എല്ലാ ഡോക്യുമെന്റുകളും AI വിശകലനം ചെയ്യും. സാധാരണ ചോദ്യങ്ങൾ ചോദിക്കുക, ട്രെൻഡുകൾ കണ്ടെത്തുക, അല്ലെങ്കിൽ ഡോക്യുമെന്റുകളിലുടനീളം വിവരങ്ങൾ താരതമ്യം ചെയ്യുക.`
                  : `Welcome ${user?.fullName}! The AI will analyze all documents accessible to your role (${user?.role}) and provide intelligent insights. Ask questions, identify trends, compare information across documents.`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border overflow-hidden h-fit">
              {/* Chat Header */}
              <div className="bg-purple-600 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                    <QAIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${language === 'ml' ? 'font-malayalam' : ''}`}>
                      {language === 'ml' ? 'AI അസിസ്റ്റന്റ്' : 'AI Assistant'}
                    </h2>
                    <p className="text-purple-100 text-sm">Intelligent document analysis</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : message.type === 'error' 
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : message.type === 'system'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className={`text-sm whitespace-pre-wrap ${language === 'ml' ? 'font-malayalam' : ''}`}>
                          {message.content}
                        </p>
                        
                        {/* Show relevant documents for AI responses */}
                        {message.type === 'ai' && message.relevantDocuments && message.relevantDocuments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className={`text-xs text-gray-600 mb-2 font-medium ${language === 'ml' ? 'font-malayalam' : ''}`}>
                              {language === 'ml' ? 'പ്രസക്തമായ ഡോക്യുമെന്റുകൾ:' : 'Relevant Documents:'}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {message.relevantDocuments.slice(0, 3).map((doc, docIndex) => (
                                <button
                                  key={docIndex}
                                  onClick={() => handleDocumentClick(doc.id)}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 flex items-center space-x-2">
                        <CircularProgress size={16} />
                        <span className={`text-sm text-gray-600 ${language === 'ml' ? 'font-malayalam' : ''}`}>
                          {language === 'ml' ? 'ഡോക്യുമെന്റുകൾ വിശകലനം ചെയ്യുന്നു...' : 'Analyzing documents...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-3">
                  <textarea
                    placeholder={language === 'ml' ? 'നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...' : 'Type your question here...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={loading}
                    rows={3}
                    className={`flex-1 block w-full rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none ${
                      language === 'ml' ? 'font-malayalam' : ''
                    }`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!query.trim() || loading}
                    className="inline-flex items-center p-3 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                  >
                    <SendIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Suggestions */}
            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                    <SearchIcon className="h-3 w-3" />
                  </div>
                  <h3 className={`text-sm font-medium ${language === 'ml' ? 'font-malayalam' : ''}`}>
                    {language === 'ml' ? 'സാധാരണ ചോദ്യങ്ങൾ' : 'Common Questions'}
                  </h3>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {getSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className={`w-full text-left p-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border hover:border-blue-300 ${
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
              <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                <div className="bg-blue-600 p-4 text-white">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                      <DocumentIcon className="h-3 w-3" />
                    </div>
                    <h3 className={`text-sm font-medium ${language === 'ml' ? 'font-malayalam' : ''}`}>
                      {language === 'ml' ? 'പ്രസക്തമായ ഡോക്യുമെന്റുകൾ' : 'Relevant Documents'}
                    </h3>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {relevantDocuments.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => handleDocumentClick(doc.id)}
                      className="w-full text-left p-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                          <DocumentIcon className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.filename}
                          </p>
                          {doc.summary_en && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
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
            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
              <div className="bg-orange-600 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                    <SecurityIcon className="h-3 w-3" />
                  </div>
                  <h3 className={`text-sm font-medium ${language === 'ml' ? 'font-malayalam' : ''}`}>
                    {language === 'ml' ? 'നിങ്ങളുടെ ആക്സസ്' : 'Your Access'}
                  </h3>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-gray-500 rounded flex items-center justify-center">
                    <SecurityIcon className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium text-gray-900 ${language === 'ml' ? 'font-malayalam' : ''}`}>
                      {language === 'ml' ? 'റോൾ:' : 'Role:'} {user?.role}
                    </p>
                  </div>
                </div>
                <p className={`text-sm text-gray-600 ${language === 'ml' ? 'font-malayalam' : ''}`}>
                  {language === 'ml' 
                    ? 'നിങ്ങളുടെ റോൾ അനുസരിച്ച് അനുവദിച്ച എല്ലാ ഡോക്യുമെന്റുകളും AI വിശകലനം ചെയ്യും.'
                    : 'AI will analyze all documents authorized for your role.'
                  }
                </p>
              </div>
            </div>

            {/* Analytics Card */}
            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
              <div className="bg-indigo-600 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                    <TrendingUpIcon className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Analytics</h3>
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sessions Today</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Documents Analyzed</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Queries Processed</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
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
