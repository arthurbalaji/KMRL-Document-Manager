import React, { useState, useCallback } from 'react';
import {
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  ArrowBack, 
  CloudUpload, 
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';

export default function Upload() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError('');
    setMessage('');

    try {
      const response = await documentAPI.uploadDocument(file);
      setMessage(`Document uploaded successfully: ${response.filename}`);
      setTimeout(() => {
        navigate('/documents', { state: { refresh: true }, replace: true });
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Professional Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Professional geometric patterns */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-blue-500/20 rounded-xl rotate-45 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-indigo-500/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Professional Header */}
      <header className="relative backdrop-blur-md bg-slate-900/70 shadow-2xl shadow-blue-900/20 border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 animate-fade-in-up">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-3 rounded-xl backdrop-blur-sm bg-slate-800/50 border border-blue-500/20 text-slate-400 hover:text-white hover:bg-slate-700/50 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowBack className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t('uploadDocument')}
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                AI-powered document processing with enterprise security
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Professional Main Upload Card */}
        <div className="backdrop-blur-lg bg-slate-900/40 rounded-3xl shadow-2xl shadow-blue-900/20 border border-blue-500/20 overflow-hidden animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <div className="relative">
              <div className="mx-auto h-20 w-20 backdrop-blur-sm bg-white/20 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/25 transform hover:scale-110 transition-all duration-500">
                <CloudUpload className="h-10 w-10 animate-pulse" />
              </div>
              <h2 className="text-4xl font-bold mb-4">{t('uploadDocument')}</h2>
              <p className="text-blue-100 text-xl font-medium max-w-2xl mx-auto">
                {t('aiPoweredProcessing', 'Experience next-generation AI-powered document processing with multilingual support, OCR technology, and intelligent content analysis for KMRL operations')}
              </p>
            </div>
          </div>

          <div className="p-10">
            {/* Professional Alerts */}
            {error && (
              <div className="mb-8 animate-fade-in-up">
                <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/20 rounded-2xl p-6 shadow-2xl shadow-red-900/20">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center">
                      <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-300 mb-1">Upload Failed</h4>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {message && (
              <div className="mb-8 animate-fade-in-up">
                <div className="backdrop-blur-sm bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl shadow-emerald-900/20">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                      <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-1">Upload Successful</h4>
                      <p className="text-emerald-400 text-sm">{message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Upload Drop Zone */}
            <div
              {...getRootProps()}
              className={`relative backdrop-blur-sm border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-500 group animate-fade-in-up overflow-hidden ${
                isDragActive 
                  ? 'border-blue-400/60 bg-blue-500/10 scale-[1.02] shadow-2xl shadow-blue-900/20' 
                  : 'border-slate-600/60 hover:border-blue-400/60 hover:bg-blue-500/5 bg-slate-800/30 hover:shadow-2xl hover:shadow-blue-900/20 hover:scale-[1.01]'
              }`}
              style={{animationDelay: '0.2s'}}
            >
              <input {...getInputProps()} />
              
              {/* Professional background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {uploading ? (
                <div className="space-y-6 relative z-10">
                  <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/25 animate-pulse">
                    <CircularProgress size={50} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent mb-3">
                      {t('processing')}
                    </h3>
                    <p className="text-slate-400 text-lg font-medium mb-6">
                      AI is analyzing your document with advanced intelligence...
                    </p>
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="flex items-center justify-center space-x-3 text-sm text-slate-400 backdrop-blur-sm bg-slate-800/40 rounded-full px-6 py-3 border border-blue-500/20">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Extracting text and images</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm text-slate-400 backdrop-blur-sm bg-slate-800/40 rounded-full px-6 py-3 border border-blue-500/20">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <span className="font-medium">Generating multilingual summary</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm text-slate-400 backdrop-blur-sm bg-slate-800/40 rounded-full px-6 py-3 border border-blue-500/20">
                        <div className="h-2 w-2 bg-violet-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        <span className="font-medium">Applying security classifications</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                        <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse animation-delay-400"></div>
                        <span>Analyzing content and tagging</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 relative z-10">
                  <div className={`mx-auto h-28 w-28 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-500 ${
                    isDragActive 
                      ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 shadow-lg shadow-blue-600/25' 
                      : 'bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 group-hover:border-blue-500/30'
                  }`}>
                    <CloudUpload className={`h-14 w-14 animate-pulse ${
                      isDragActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'
                    }`} />
                  </div>
                  
                  <div>
                    <h3 className={`text-3xl font-bold mb-3 transition-all duration-300 ${
                      isDragActive
                        ? 'bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-indigo-400'
                    }`}>
                      {isDragActive
                        ? 'Release to upload your document...'
                        : 'Drop your document here'
                      }
                    </h3>
                    <p className="text-slate-400 mb-4 text-lg font-medium">
                      {t('supportedFormats', 'Or click to browse and select files')}
                    </p>
                    <div className="inline-flex items-center space-x-2 backdrop-blur-sm bg-slate-800/40 rounded-full px-6 py-3 border border-blue-500/20 mb-6">
                      <span className="text-sm font-semibold text-slate-300">
                        Supported: PDF, DOCX, Images • Max: 50MB
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={uploading}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                  >
                    {/* Professional button shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    <DescriptionIcon className="h-6 w-6 mr-3 relative" />
                    <span className="relative font-bold text-lg">{t('selectFile', 'Choose File')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Professional Features Section */}
            <div className="mt-16 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-8 text-center">
                Advanced AI Processing Pipeline
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="group transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  <div className="backdrop-blur-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-3xl shadow-2xl shadow-blue-900/20 border border-blue-500/20 p-8 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-xl"></div>
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <AutoAwesomeIcon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-blue-300 transition-colors">AI Text Extraction</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Advanced OCR technology with machine learning for superior text recognition across multiple languages and document formats
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                  <div className="backdrop-blur-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-3xl shadow-2xl shadow-emerald-900/20 border border-emerald-500/20 p-8 hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl"></div>
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <LanguageIcon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-emerald-300 transition-colors">Multilingual Intelligence</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Generates comprehensive summaries and analysis in both English and Malayalam with cultural context awareness
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                  <div className="backdrop-blur-lg bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-3xl shadow-2xl shadow-violet-900/20 border border-violet-500/20 p-8 hover:shadow-2xl hover:shadow-violet-900/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-xl"></div>
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircleIcon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-violet-300 transition-colors">Smart Categorization</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Automatically tags and categorizes content with precision using advanced semantic analysis and domain expertise
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                  <div className="backdrop-blur-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-3xl shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 p-8 hover:shadow-2xl hover:shadow-indigo-900/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-xl"></div>
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <SecurityIcon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-indigo-300 transition-colors">Enterprise Security</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Role-based access control with enterprise-grade encryption and compliance with government security standards
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                  <div className="backdrop-blur-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-3xl shadow-2xl shadow-blue-900/20 border border-blue-500/20 p-8 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-xl"></div>
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <ScheduleIcon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-blue-300 transition-colors">Smart Retention</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Intelligent retention periods based on document type, content analysis, and organizational compliance requirements
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                  <div className="backdrop-blur-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/5 rounded-3xl shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 p-8 hover:shadow-2xl hover:shadow-indigo-900/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-xl"></div>
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-indigo-300 transition-colors">AI Insights</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Advanced analytics and insights extraction to help identify patterns, trends, and critical information across your document library
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Quick Tips */}
            <div className="mt-16 backdrop-blur-lg bg-gradient-to-br from-slate-900/50 to-blue-950/50 rounded-3xl shadow-2xl shadow-blue-900/20 border border-blue-500/20 p-10 animate-fade-in-up relative overflow-hidden" style={{animationDelay: '1s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-8 text-center relative z-10">
                Upload Best Practices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="flex items-start space-x-4 group">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/25 group-hover:shadow-xl group-hover:shadow-blue-600/40 transition-all duration-300">
                    <span className="text-blue-400 font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-2">Document Quality</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Ensure documents are clear and readable for optimal OCR results. High-resolution scans work best for image-based documents.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="h-12 w-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/25 group-hover:shadow-xl group-hover:shadow-emerald-600/40 transition-all duration-300">
                    <span className="text-emerald-400 font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-2">File Organization</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Use descriptive filenames to help the AI system better understand and categorize your documents automatically.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="h-12 w-12 bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-600/25 group-hover:shadow-xl group-hover:shadow-violet-600/40 transition-all duration-300">
                    <span className="text-violet-400 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-2">Security Compliance</h4>
                    <p className="text-slate-400 leading-relaxed">
                      All uploads are encrypted and processed according to KMRL security policies with full audit trail maintenance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="h-12 w-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/25 group-hover:shadow-xl group-hover:shadow-indigo-600/40 transition-all duration-300">
                    <span className="text-indigo-400 font-bold text-lg">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-2">Processing Time</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Larger documents may take longer to process. You'll receive notifications when analysis is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
