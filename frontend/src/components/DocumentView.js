import React, { useState, useEffect, useRef } from 'react';
import {
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Download as DownloadIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  Shield as ShieldIcon,
  TrendingUp as TrendingUpIcon,
  Label as LabelIcon,
  Security as SecurityIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../services/api';
import ImageDisplay from './ImageDisplay';
import ChatImageDisplay from './ChatImageDisplay';
import LanguageSwitcher from './LanguageSwitcher';

const DocumentView = ({ document, onBack, showChat = true }) => {
  const { t, i18n } = useTranslation();
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [documentImages, setDocumentImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState('');
  const chatMessagesEndRef = useRef(null);

  // Update selected language when i18n language changes
  useEffect(() => {
    setSelectedLanguage(i18n.language);
    translateDynamicContent();
  }, [i18n.language]);

  // Translate dynamic content when language changes
  const translateDynamicContent = async () => {
    if (!document) return;
    
    try {
      // Use the correct summary fields from backend (summaryEn and summaryMl)
      if (i18n.language === 'ml') {
        // For Malayalam, prefer summaryMl, fallback to translating summaryEn
        if (document.summaryMl) {
          setTranslatedSummary(document.summaryMl);
        } else if (document.summaryEn) {
          // Translate English summary to Malayalam
          const response = await api.post('/documents/ai-service/translate', {
            text: document.summaryEn,
            target_language: 'ml'
          });
          setTranslatedSummary(response.data.translated_text);
        } else {
          setTranslatedSummary('');
        }
      } else {
        // For English, use summaryEn directly
        setTranslatedSummary(document.summaryEn || '');
      }

      // Translate existing chat messages
      if (chatMessages.length > 0 && i18n.language !== selectedLanguage) {
        const translatedMessages = await Promise.all(
          chatMessages.map(async (message) => {
            if (message.type === 'ai' && message.language !== i18n.language) {
              try {
                const response = await api.post('/ai-service/translate', {
                  text: message.content,
                  target_language: i18n.language
                });
                return {
                  ...message,
                  content: response.data.translated_text,
                  language: i18n.language,
                  originalContent: message.content,
                  originalLanguage: message.language
                };
              } catch (err) {
                console.error('Translation error for message:', err);
                return message;
              }
            }
            return message;
          })
        );
        setChatMessages(translatedMessages);
      }
    } catch (err) {
      console.error('Error translating content:', err);
    }
  };

  // Load document images when component mounts
  useEffect(() => {
    if (document?.id && document.imagesCount > 0) {
      loadDocumentImages();
    }
  }, [document?.id]);

  // Initialize translated summary when document loads
  useEffect(() => {
    if (document) {
      translateDynamicContent();
    }
  }, [document]);

  // Auto-scroll to bottom when chat messages change
  useEffect(() => {
    const scrollToBottom = () => {
      // Method 1: Use ref (most reliable in React)
      if (chatMessagesEndRef.current) {
        chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Method 2: Fallback to getElementById
      const chatContainer = window.document.getElementById('chat-messages');
      if (chatContainer) {
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
      }
    };

    if (chatMessages.length > 0 || chatLoading) {
      // Use both immediate and delayed scroll for reliability
      scrollToBottom();
      setTimeout(scrollToBottom, 200);
    }
  }, [chatMessages, chatLoading]);

  const loadDocumentImages = async () => {
    if (!document?.id) return;
    
    setImagesLoading(true);
    try {
      const response = await api.get(`/documents/${document.id}/images`);
      setDocumentImages(response.data || []);
    } catch (err) {
      console.error('Error loading document images:', err);
    } finally {
      setImagesLoading(false);
    }
  };

  // Add null check for document
  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-danger-500/20 to-danger-600/20 border border-danger-500/30 rounded-full flex items-center justify-center mb-4 shadow-glow">
            <DescriptionIcon className="h-12 w-12 text-danger-400" />
          </div>
          <h3 className="text-lg font-medium text-dark-100 mb-2">
            {t('error.documentNotFound', 'Document not found')}
          </h3>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-dark-600 rounded-lg shadow-glow text-sm font-medium text-dark-300 bg-gradient-to-br from-dark-800/60 to-dark-700/40 hover:bg-dark-700/80 hover:text-electric-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-500 transition-all duration-300"
          >
            <ArrowBackIcon className="h-4 w-4 mr-2" />
            {t('common.back', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !document) return;

    const userMessage = newMessage;
    setNewMessage('');
    setChatMessages(prev => [...prev, { 
      type: 'user', 
      content: userMessage,
      timestamp: new Date().toLocaleTimeString()
    }]);
    setChatLoading(true);

    try {
      const response = await api.post(`/documents/${document.id}/chat`, {
        question: userMessage,
        language: selectedLanguage
      });

      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        content: response.data.answer,
        language: response.data.language,
        images: response.data.relevant_images || [],
        timestamp: new Date().toLocaleTimeString()
      }]);
      setError(null);
    } catch (err) {
      setError(t('error.chatFailed', 'Chat failed'));
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      const response = await api.get(`/documents/${document.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.originalFilename || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border p-6 mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-6 p-2 border border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowBackIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {document.originalFilename}
              </h1>
              <p className="text-gray-600">
                {selectedLanguage === 'ml' 
                  ? 'ഡോക്യുമെന്റ് വിശകലനവും AI ചാറ്റ് ഇന്റർഫേസും'
                  : 'AI-Powered Document Analysis & Interactive Chat Interface'
                }
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              <span>{t('document.download', 'Download')}</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* LEFT SIDE: Document Details and Summary (50%) */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* Document Metadata Card */}
            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <DescriptionIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{t('document.details', 'Document Details')}</h2>
                    <p className="text-blue-100 text-sm">
                      {selectedLanguage === 'ml' 
                        ? 'സമഗ്രമായ ഡോക്യുമെന്റ് വിശകലനം'
                        : 'Comprehensive AI-powered document analysis'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <ScheduleIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {selectedLanguage === 'ml' ? 'അപ്‌ലോഡ് തീയതി' : 'Upload Date'}
                      </p>
                      <p className="text-sm text-gray-900" title={format(new Date(document.uploadDate), 'PPpp')}>
                        {formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(document.uploadDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <StorageIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {selectedLanguage === 'ml' ? 'ഫയൽ സൈസ്' : 'File Size'}
                      </p>
                      <p className="text-sm text-gray-900">
                        {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedLanguage === 'ml' ? 'എൻക്രിപ്റ്റഡ് സ്റ്റോറേജ്' : 'Encrypted Storage'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <ShieldIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {selectedLanguage === 'ml' ? 'സെൻസിറ്റിവിറ്റി ലെവൽ' : 'Sensitivity Level'}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        document.sensitivityLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                        document.sensitivityLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {document.sensitivityLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <TrendingUpIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {selectedLanguage === 'ml' ? 'AI കോൺഫിഡൻസ്' : 'AI Confidence'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-900">
                          {document.aiConfidence ? `${(document.aiConfidence * 100).toFixed(1)}%` : 'N/A'}
                        </p>
                        {document.aiConfidence && (
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full"
                              style={{width: `${document.aiConfidence * 100}%`}}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {document.languagesDetected && document.languagesDetected.length > 0 && (
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LanguageIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          {selectedLanguage === 'ml' ? 'തിരിച്ചറിഞ്ഞ ഭാഷകൾ' : 'Languages Detected'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {document.languagesDetected.map((lang, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {lang === 'en' ? '🇺🇸 English' : lang === 'ml' ? '🇮🇳 മലയാളം' : `🌐 ${lang}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {document.imagesCount > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-pink-600 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {selectedLanguage === 'ml' ? 'ചിത്രങ്ങൾ' : 'Images Detected'}
                        </p>
                        <p className="text-sm text-gray-900">
                          {document.imagesCount} {document.imagesCount === 1 ? 'image' : 'images'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedLanguage === 'ml' ? 'AI വിശകലനത്തിൽ ഉൾപ്പെടുത്തിയിട്ടുണ്ട്' : 'Processed with AI analysis'}
                        </p>
                      </div>
                    </div>
                  )}

                  {document.hasMultilingualContent && (
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
                        <LanguageIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {selectedLanguage === 'ml' ? 'ബഹുഭാഷാ ഉള്ളടക്കം' : 'Multilingual Content'}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800">
                          {selectedLanguage === 'ml' ? 'അതെ' : 'Available'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 bg-gray-500 rounded flex items-center justify-center flex-shrink-0">
                        <LabelIcon className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {document.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Allowed Roles */}
                {document.allowedRoles && document.allowedRoles.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                        <SecurityIcon className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-2">Allowed Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {document.allowedRoles.map((role, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Summary Card */}
            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
              <div className="bg-green-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                      <DescriptionIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{t('document.summary', 'Document Summary')}</h2>
                      <p className="text-green-100 text-sm">AI-generated analysis</p>
                    </div>
                  </div>
                  <LanguageSwitcher 
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    size="medium"
                    showLabel={true}
                  />
                </div>
              </div>

              <div className="p-4">
                <div className={`${selectedLanguage === 'ml' ? 'font-malayalam' : ''}`}>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {translatedSummary || t('document.noSummary', 'No summary available')}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Images */}
            {document.imagesCount > 0 && (
              <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    className="bg-orange-600 text-white"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {t('extractedImages', 'Extracted Images')} ({document.imagesCount})
                        </h3>
                        <p className="text-orange-100 text-sm">View extracted document images</p>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className="p-4">
                    {imagesLoading ? (
                      <div className="flex justify-center py-8">
                        <CircularProgress />
                      </div>
                    ) : (
                      <ImageDisplay images={documentImages} />
                    )}
                  </AccordionDetails>
                </Accordion>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Chat Interface (50%) */}
          {showChat ? (
            <div className="bg-white rounded-lg shadow-md border overflow-hidden flex flex-col h-[calc(100vh-200px)]">
              <div className="bg-purple-600 p-4 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                      <ChatIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{t('document.chat', 'AI Document Chat')}</h2>
                      <p className="text-purple-100 text-sm">AI-powered document analysis</p>
                    </div>
                  </div>
                  <LanguageSwitcher 
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    size="small"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Error Alert */}
                {error && (
                  <Alert severity="error" className="mx-4 mt-4 mb-2">
                    {error}
                  </Alert>
                )}

                {/* Chat Messages */}
                <div 
                  className="flex-1 overflow-y-auto bg-gray-50 mx-4 mb-2 rounded-lg p-4 space-y-4" 
                  id="chat-messages"
                >
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChatIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-gray-600 font-medium">
                        {selectedLanguage === 'ml' 
                          ? 'ഡോക്യുമെന്റിനെക്കുറിച്ച് എന്തെങ്കിലും ചോദിക്കൂ'
                          : 'Ask me anything about this document'
                        }
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {selectedLanguage === 'ml' 
                          ? 'AI നിങ്ങളെ സഹായിക്കാൻ തയ്യാറാണ്'
                          : 'AI is ready to help you understand the content'
                        }
                      </p>
                    </div>
                  )}

                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-sm lg:max-w-lg px-4 py-3 rounded-lg shadow-sm ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {message.images && message.images.length > 0 && (
                          <div className="mt-3">
                            <ChatImageDisplay images={message.images} documentId={document?.id} />
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm">
                            {selectedLanguage === 'ml' ? 'AI ചിന്തിക്കുന്നു...' : 'AI is thinking...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll anchor element */}
                  <div ref={chatMessagesEndRef} id="chat-end"></div>
                </div>

                {/* Chat Input */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={selectedLanguage === 'ml' 
                        ? 'ഡോക്യുമെന്റിനെക്കുറിച്ച് ചോദിക്കൂ...'
                        : t('document.askQuestion', 'Ask a question about this document...')
                      }
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || chatLoading}
                      className="inline-flex items-center p-2 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SendIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Chat interface disabled</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentView;