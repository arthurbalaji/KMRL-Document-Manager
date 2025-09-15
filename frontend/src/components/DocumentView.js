import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-600/20 to-blue-700/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-600/10 to-blue-700/10 rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 p-6 mb-8 animate-fade-in-up">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-6 p-3 backdrop-blur-sm bg-gradient-to-br from-slate-700/60 to-slate-600/40 border border-blue-500/30 rounded-2xl text-slate-300 hover:text-blue-300 hover:bg-slate-600/80 hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            >
              <ArrowBackIcon className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {document.originalFilename}
              </h1>
              <p className="text-slate-300 font-medium">
                {selectedLanguage === 'ml' 
                  ? 'ഡോക്യുമെന്റ് വിശകലനവും AI ചാറ്റ് ഇന്റർഫേസും'
                  : 'AI-Powered Document Analysis & Interactive Chat Interface'
                }
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden"
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
              <DownloadIcon className="h-5 w-5 mr-2 relative" />
              <span className="relative">{t('document.download', 'Download')}</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* LEFT SIDE: Document Details and Summary (50%) */}
          <div className="space-y-8 animate-fade-in-up overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* Document Metadata Card */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="h-16 w-16 backdrop-blur-sm bg-white/20 rounded-3xl flex items-center justify-center shadow-xl">
                    <DescriptionIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t('document.details', 'Document Details')}</h2>
                    <p className="text-blue-100 font-medium">
                      {selectedLanguage === 'ml' 
                        ? 'സമഗ്രമായ ഡോക്യുമെന്റ് വിശകലനം'
                        : 'Comprehensive AI-powered document analysis'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                      <ScheduleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-1">
                        {selectedLanguage === 'ml' ? 'അപ്‌ലോഡ് തീയതി' : 'Upload Date'}
                      </p>
                      <p className="text-slate-100 font-medium" title={format(new Date(document.uploadDate), 'PPpp')}>
                        {formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(document.uploadDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 group">
                    <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <StorageIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-1">
                        {selectedLanguage === 'ml' ? 'ഫയൽ സൈസ്' : 'File Size'}
                      </p>
                      <p className="text-slate-100 font-medium">
                        {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedLanguage === 'ml' ? 'എൻക്രിപ്റ്റഡ് സ്റ്റോറേജ്' : 'Encrypted Storage'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 group">
                    <div className="h-12 w-12 bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <ShieldIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-1">
                        {selectedLanguage === 'ml' ? 'സെൻസിറ്റിവിറ്റി ലെവൽ' : 'Sensitivity Level'}
                      </p>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl ${
                        document.sensitivityLevel === 'LOW' ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 text-emerald-300 border border-emerald-500/30' :
                        document.sensitivityLevel === 'MEDIUM' ? 'bg-gradient-to-r from-violet-600/20 to-violet-700/20 text-violet-300 border border-violet-500/30' :
                        'bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-300 border border-red-500/30'
                      }`}>
                        {document.sensitivityLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 group">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <TrendingUpIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-1">
                        {selectedLanguage === 'ml' ? 'AI കോൺഫിഡൻസ്' : 'AI Confidence'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-slate-100 font-medium">
                          {document.aiConfidence ? `${(document.aiConfidence * 100).toFixed(1)}%` : 'N/A'}
                        </p>
                        {document.aiConfidence && (
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full transition-all duration-1000"
                              style={{width: `${document.aiConfidence * 100}%`}}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {document.languagesDetected && document.languagesDetected.length > 0 && (
                    <div className="flex items-start space-x-4 md:col-span-2 group">
                      <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <LanguageIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-300 mb-3">
                          {selectedLanguage === 'ml' ? 'തിരിച്ചറിഞ്ഞ ഭാഷകൾ' : 'Languages Detected'}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {document.languagesDetected.map((lang, index) => (
                            <span key={index} className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-blue-600/20 to-indigo-700/20 text-blue-300 border border-blue-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                              {lang === 'en' ? '🇺🇸 English' : lang === 'ml' ? '🇮🇳 മലയാളം' : `🌐 ${lang}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {document.imagesCount > 0 && (
                    <div className="flex items-center space-x-4 group">
                      <div className="h-12 w-12 bg-gradient-to-br from-rose-600 to-pink-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-1">
                          {selectedLanguage === 'ml' ? 'ചിത്രങ്ങൾ' : 'Images Detected'}
                        </p>
                        <p className="text-slate-100 font-medium">
                          {document.imagesCount} {document.imagesCount === 1 ? 'image' : 'images'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedLanguage === 'ml' ? 'AI വിശകലനത്തിൽ ഉൾപ്പെടുത്തിയിട്ടുണ്ട്' : 'Processed with AI analysis'}
                        </p>
                      </div>
                    </div>
                  )}

                  {document.hasMultilingualContent && (
                    <div className="flex items-center space-x-4 group">
                      <div className="h-12 w-12 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <LanguageIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-1">
                          {selectedLanguage === 'ml' ? 'ബഹുഭാഷാ ഉള്ളടക്കം' : 'Multilingual Content'}
                        </p>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600/20 to-teal-700/20 text-cyan-300 border border-cyan-500/30 shadow-xl">
                          {selectedLanguage === 'ml' ? 'അതെ' : 'Available'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-600">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LabelIcon className="h-5 w-5 text-slate-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-300 mb-3">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {document.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-slate-600/20 to-slate-700/20 text-slate-300 border border-slate-500/30">
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
                  <div className="mt-6 pt-6 border-t border-slate-600">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <SecurityIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-300 mb-3">Allowed Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {document.allowedRoles.map((role, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-300 border border-blue-500/30">
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
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <DescriptionIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('document.summary', 'Document Summary')}</h2>
                      <p className="text-emerald-100">AI-generated analysis</p>
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

              <div className="p-6">
                <div className={`prose max-w-none ${selectedLanguage === 'ml' ? 'font-malayalam' : ''}`}>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {translatedSummary || t('document.noSummary', 'No summary available')}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Images */}
            {document.imagesCount > 0 && (
              <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden">
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {t('extractedImages', 'Extracted Images')} ({document.imagesCount})
                        </h3>
                        <p className="text-orange-100 text-sm">View extracted document images</p>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className="p-6">
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
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
              <div className="bg-gradient-to-r from-violet-600 to-violet-700 p-6 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <ChatIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('document.chat', 'AI Document Chat')}</h2>
                      <p className="text-violet-100">AI-powered document analysis</p>
                    </div>
                  </div>
                  <LanguageSwitcher 
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    size="small"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col p-6">
                {/* Error Alert */}
                {error && (
                  <Alert severity="error" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto bg-slate-600/30 rounded-xl p-4 space-y-4 mb-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="h-16 w-16 bg-gradient-to-br from-violet-600/20 to-violet-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChatIcon className="h-8 w-8 text-violet-400" />
                      </div>
                      <p className="text-slate-400 font-medium">
                        {selectedLanguage === 'ml' 
                          ? 'ഡോക്യുമെന്റിനെക്കുറിച്ച് എന്തെങ്കിലും ചോദിക്കൂ'
                          : 'Ask me anything about this document'
                        }
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
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
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                            : 'bg-gradient-to-r from-slate-700/80 to-slate-600/60 text-slate-100 border border-slate-500/30'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {message.images && message.images.length > 0 && (
                          <div className="mt-3">
                            <ChatImageDisplay images={message.images} />
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
                      <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/60 text-slate-100 px-4 py-3 rounded-2xl border border-slate-500/30 shadow-xl">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm">
                            {selectedLanguage === 'ml' ? 'AI ചിന്തിക്കുന്നു...' : 'AI is thinking...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-3 flex-shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={selectedLanguage === 'ml' 
                      ? 'ഡോക്യുമെന്റിനെക്കുറിച്ച് ചോദിക്കൂ...'
                      : t('document.askQuestion', 'Ask a question about this document...')
                    }
                    className="flex-1 px-4 py-3 bg-slate-600/30 border border-slate-500/30 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 shadow-xl"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || chatLoading}
                    className="inline-flex items-center p-3 border border-transparent rounded-2xl shadow-xl text-white bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  >
                    <SendIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-3xl shadow-xl border border-blue-500/30 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatIcon className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-400 font-medium">Chat interface disabled</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentView;