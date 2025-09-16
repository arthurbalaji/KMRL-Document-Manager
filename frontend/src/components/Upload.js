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
    <div className="min-h-screen bg-gray-50">
      {/* Simple Government Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowBack className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {t('uploadDocument')}
              </h1>
              <p className="text-sm text-gray-600">
                Upload documents for AI analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Main Upload Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-purple-600 p-8 text-white text-center">
            <div className="mx-auto h-16 w-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <CloudUpload className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">{t('uploadDocument')}</h2>
            <p className="text-purple-100">
              {t('aiPoweredProcessing', 'AI-powered document processing with multilingual support')}
            </p>
          </div>

          <div className="p-8">
            {/* Simple Alerts */}
            {error && (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">Upload Failed</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {message && (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">Upload Successful</h4>
                      <p className="text-sm text-green-700 mt-1">{message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simple Upload Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              
              {uploading ? (
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CircularProgress size={40} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t('processing')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Processing your document...
                    </p>
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-100 rounded-lg px-4 py-2">
                        <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                        <span>Extracting text and images</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-100 rounded-lg px-4 py-2">
                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        <span>Generating summary</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-100 rounded-lg px-4 py-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        <span>Applying classifications</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`mx-auto h-20 w-20 rounded-lg flex items-center justify-center ${
                    isDragActive 
                      ? 'bg-purple-100 border border-purple-200' 
                      : 'bg-gray-100 border border-gray-200'
                  }`}>
                    <CloudUpload className={`h-10 w-10 ${
                      isDragActive ? 'text-purple-600' : 'text-gray-500'
                    }`} />
                  </div>
                  
                  <div>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      isDragActive ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {isDragActive
                        ? 'Release to upload your document...'
                        : 'Drop your document here'
                      }
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('supportedFormats', 'Or click to browse and select files')}
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2 mb-4">
                      <span className="text-sm text-gray-700">
                        Supported: PDF, DOCX, Images • Max: 50MB
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={uploading}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DescriptionIcon className="h-5 w-5 mr-2" />
                    <span>{t('selectFile', 'Choose File')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Simple Features Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                AI Processing Features
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <AutoAwesomeIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Text Extraction</h4>
                  <p className="text-gray-600">
                    Advanced OCR technology for superior text recognition across multiple languages and document formats
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <LanguageIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Multilingual Support</h4>
                  <p className="text-gray-600">
                    Generates comprehensive summaries in both English and Malayalam with cultural context
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Categorization</h4>
                  <p className="text-gray-600">
                    Automatically tags and categorizes content using advanced semantic analysis
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <SecurityIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Security</h4>
                  <p className="text-gray-600">
                    Role-based access control with encryption and government security standards compliance
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <ScheduleIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Retention</h4>
                  <p className="text-gray-600">
                    Intelligent retention periods based on document type and compliance requirements
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h4>
                  <p className="text-gray-600">
                    Advanced analytics to identify patterns, trends, and critical information across documents
                  </p>
                </div>
              </div>
            </div>

            {/* Simple Best Practices */}
            <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Upload Best Practices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Document Quality</h4>
                    <p className="text-gray-600 text-sm">
                      Ensure documents are clear and readable for optimal OCR results. High-resolution scans work best.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">File Organization</h4>
                    <p className="text-gray-600 text-sm">
                      Use descriptive filenames to help the AI system better categorize your documents.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Security Compliance</h4>
                    <p className="text-gray-600 text-sm">
                      All uploads are encrypted and processed according to KMRL security policies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Processing Time</h4>
                    <p className="text-gray-600 text-sm">
                      Larger documents may take longer to process. You'll receive notifications when complete.
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
