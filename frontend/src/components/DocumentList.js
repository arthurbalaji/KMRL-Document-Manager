import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Typography
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Autorenew as ReprocessIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Document Viewer Frame Component
const DocumentViewerFrame = ({ documentId, filename }) => {
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/documents/${documentId}/view`, {
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'application/pdf' 
        });
        const url = window.URL.createObjectURL(blob);
        setDocumentUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      loadDocument();
    }

    // Cleanup function to revoke object URL
    return () => {
      if (documentUrl) {
        window.URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <CircularProgress size={48} />
        <p className="ml-4 text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-gray-500">Unable to display document: {filename}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {documentUrl && (
        <embed
          src={documentUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      )}
    </div>
  );
};

const DocumentList = ({ onDocumentSelect }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [page, searchTerm, location.key]); // Add location.key to trigger refresh on navigation

  // Add effect to refresh when component becomes visible (e.g., after upload)
  useEffect(() => {
    const handleFocus = () => {
      fetchDocuments();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Also refresh when location state indicates a new upload
  useEffect(() => {
    if (location.state?.refresh) {
      fetchDocuments();
    }
  }, [location.state]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {
        page: page - 1,
        size: 10,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await api.get('/documents', { params });
      setDocuments(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError(t('error.fetchDocuments'));
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(i18n.language === 'ml' ? 'ഡൗൺലോഡ് പരാജയപ്പെട്ടു' : 'Download failed');
    }
  };

  const handleView = async (documentId, filename) => {
    try {
      // Store document info and open viewer modal
      setViewingDocument({ id: documentId, filename });
      setViewerOpen(true);
    } catch (err) {
      console.error('Error opening document viewer:', err);
      setError(i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് കാണാൻ കഴിയുന്നില്ല' : 'Unable to view document');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/documents/${selectedDocument.id}/status`, {
        status: newStatus
      });
      setStatusDialogOpen(false);
      setSelectedDocument(null);
      setNewStatus('');
      fetchDocuments(); // Refresh the list
    } catch (err) {
      console.error('Error updating document status:', err);
      setError('Failed to update document status');
    }
  };

  const handleDeleteDocument = async () => {
    try {
      await api.delete(`/documents/${selectedDocument.id}`);
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
      fetchDocuments(); // Refresh the list
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  const handleReprocessDocument = async (documentId) => {
    try {
      await api.post(`/documents/${documentId}/reprocess`);
      fetchDocuments(); // Refresh the list
    } catch (err) {
      console.error('Error reprocessing document:', err);
      setError('Failed to reprocess document');
    }
  };

  const openStatusDialog = (document) => {
    setSelectedDocument(document);
    setNewStatus(document.status);
    setStatusDialogOpen(true);
  };

  const openDeleteDialog = (document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  if (loading && documents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        {/* Premium Loading Animation Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-electric-500/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-neon-500/20 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-32 left-40 w-72 h-72 bg-accent-500/20 rounded-full blur-xl animate-pulse-soft"></div>
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center backdrop-blur-lg bg-dark-800/40 p-12 rounded-3xl shadow-glow border border-dark-700">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-electric-500 to-neon-500 rounded-full blur-lg opacity-75 animate-pulse-glow"></div>
              <CircularProgress 
                size={64} 
                className="relative text-electric-500" 
                thickness={3}
              />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-electric-400 to-neon-400 bg-clip-text text-transparent mb-4">
              {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading Documents...'}
            </h3>
            <p className="text-dark-300 text-lg font-medium">
              {i18n.language === 'ml' ? 'അത്യാധുനിക AI സിസ്റ്റം ഉപയോഗിച്ച് നിങ്ങളുടെ ഡോക്യുമെന്റുകൾ തയ്യാറാക്കുന്നു' : 'Preparing your documents with cutting-edge AI technology'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Professional Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Professional geometric patterns */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-blue-500/20 rounded-xl rotate-45 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-indigo-500/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Professional Header */}
      <header className="relative backdrop-blur-xl bg-slate-900/40 border-b border-blue-500/20 shadow-2xl shadow-blue-900/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative h-16 w-16 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 animate-pulse">
                  <DescriptionIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
                  {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് ലൈബ്രറി' : 'Document Library'}
                </h1>
                <p className="text-slate-400 font-medium mt-1">
                  {i18n.language === 'ml' ? 'അത്യാധുനിക AI-പവർഡ് ഡോക്യുമെന്റ് മാനേജ്മെന്റ്' : 'Advanced AI-Powered Document Management'}
                </p>
              </div>
            </div>
            
            {/* Professional Stats Cards */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="backdrop-blur-lg bg-slate-900/50 rounded-2xl px-6 py-4 border border-blue-500/20 shadow-lg shadow-blue-900/20">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-glow">
                    <span className="text-white font-bold text-sm">{documents.length}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ' : 'Documents'}
                    </p>
                    <p className="text-sm font-bold text-slate-200">
                      {i18n.language === 'ml' ? 'സജീവമായത്' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="backdrop-blur-lg bg-dark-800/50 rounded-2xl px-6 py-4 border border-dark-600 shadow-glow">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {i18n.language === 'ml' ? 'AI സിസ്റ്റം' : 'AI System'}
                    </p>
                    <p className="text-sm font-bold text-slate-200">
                      {i18n.language === 'ml' ? 'ഓൺലൈൻ' : 'Online'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header */}
        <div className="backdrop-blur-lg bg-slate-900/40 rounded-3xl shadow-2xl shadow-blue-900/20 border border-blue-500/20 p-8 mb-8 animate-fade-in-up relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
          <div className="text-center relative z-10">
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent mb-4 ${i18n.language === 'ml' ? 'font-malayalam' : ''}`}>
              {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ' : 'Documents'}
            </h1>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              {i18n.language === 'ml' 
                ? 'AI-പവർഡ് ഇൻസൈറ്റുകൾ ഉപയോഗിച്ച് നിങ്ങളുടെ ഡോക്യുമെന്റുകൾ കൈകാര്യം ചെയ്യുകയും വിശകലനം ചെയ്യുകയും ചെയ്യുക'
                : 'Manage and analyze your documents with AI-powered insights and enterprise-grade security'
              }
            </p>
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center space-x-2 backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 shadow-lg shadow-blue-900/20">
                <DescriptionIcon className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">
                  {documents.length} {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ' : 'Documents'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Search and Filter Bar */}
        <div className="relative backdrop-blur-xl bg-slate-900/50 rounded-3xl shadow-2xl shadow-blue-900/20 border border-blue-500/20 p-8 mb-12 animate-fade-in-up overflow-hidden" style={{animationDelay: '0.1s'}}>
          {/* Professional Background Elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Professional Search Input */}
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
                <div className="relative backdrop-blur-lg bg-slate-800/70 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-900/20 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-75"></div>
                      <SearchIcon className="relative h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={i18n.language === 'ml' ? '🔍 AI ഉപയോഗിച്ച് ഡോക്യുമെന്റുകൾ തിരയുക...' : '🔍 Search documents with AI intelligence...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-16 pr-6 py-5 bg-transparent border-0 focus:ring-0 placeholder-slate-500 text-slate-200 font-medium text-lg focus:outline-none"
                  />
                  {searchTerm && (
                    <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                      <button
                        onClick={() => setSearchTerm('')}
                        className="h-8 w-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:from-slate-600 hover:to-slate-500 hover:text-white transition-all duration-200 transform hover:scale-110"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Professional Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchDocuments}
                  disabled={loading}
                  className="group relative inline-flex items-center px-8 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/40 text-white font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <RefreshIcon className={`relative h-6 w-6 mr-3 ${loading ? 'animate-spin' : ''}`} />
                  <span className="relative">
                    {i18n.language === 'ml' ? 'പുതുക്കുക' : 'Refresh'}
                  </span>
                </button>
                
                <button className="group relative inline-flex items-center px-8 py-5 bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/40 text-white font-semibold focus:outline-none focus:ring-4 focus:ring-violet-500/50 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <FilterIcon className="relative h-6 w-6 mr-3" />
                  <span className="relative">
                    {i18n.language === 'ml' ? 'ഫിൽട്ടർ' : 'Filter'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Search Stats */}
            {searchTerm && (
              <div className="mt-6 pt-6 border-t border-blue-500/20">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 font-medium">
                    {i18n.language === 'ml' 
                      ? `"${searchTerm}" നു വേണ്ടി ${documents.length} ഫലങ്ങൾ കണ്ടെത്തി`
                      : `Found ${documents.length} results for "${searchTerm}"`
                    }
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-success-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-dark-400 font-medium">
                      {i18n.language === 'ml' ? 'AI പവർഡ് സെർച്ച്' : 'AI-Powered Search'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Error Alert */}
        {error && (
          <div className="backdrop-blur-lg bg-red-500/10 border border-red-500/20 rounded-3xl p-6 mb-8 animate-fade-in-up shadow-2xl shadow-red-900/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-300 mb-1">
                  {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ ലോഡ് ചെയ്യുന്നതിൽ പിശക്' : 'Error Loading Documents'}
                </h3>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Professional Loading State */}
        {loading && documents.length === 0 && (
          <div className="backdrop-blur-lg bg-slate-900/40 rounded-3xl shadow-2xl shadow-blue-900/20 border border-blue-500/20 p-12 text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-3xl mb-6">
              <CircularProgress size={32} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">
              {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ ലോഡ് ചെയ്യുന്നു' : 'Loading Documents'}
            </h3>
            <p className="text-slate-400">
              {i18n.language === 'ml' ? 'നിങ്ങളുടെ ഡോക്യുമെന്റുകൾ ലഭിക്കുന്നതുവരെ കാത്തിരിക്കുക...' : 'Please wait while we fetch your documents...'}
            </p>
          </div>
        )}

        {/* Professional Documents Grid */}
        {!loading || documents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {documents.map((doc, index) => (
              <div 
                key={doc.id} 
                className="group relative backdrop-blur-xl bg-gradient-to-br from-slate-900/60 via-blue-950/40 to-slate-900/20 rounded-3xl shadow-2xl hover:shadow-2xl border border-blue-500/30 overflow-hidden transform hover:scale-[1.02] hover:-translate-y-3 transition-all duration-700 animate-fade-in-up hover:border-blue-400/50"
                style={{animationDelay: `${0.1 + index * 0.05}s`}}
              >
                {/* Professional Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Document Header */}
                <div className="relative p-6 border-b border-blue-500/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="relative">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 group-hover:shadow-xl group-hover:shadow-blue-600/40 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          <DescriptionIcon className="h-8 w-8 text-white drop-shadow-sm" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent truncate group-hover:from-white group-hover:to-slate-200 transition-all duration-300">
                          {doc.originalFilename}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-1 backdrop-blur-sm bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                            <ScheduleIcon className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-blue-300 font-medium" title={format(new Date(doc.uploadDate), 'PPpp')}>
                              {formatDistanceToNow(new Date(doc.uploadDate), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Summary with Enhanced Design */}
                  <div className="relative">
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-blue-400 rounded-full"></div>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 pl-4 font-medium">
                      {(() => {
                        const summary = i18n.language === 'ml' 
                          ? (doc.summaryMl || doc.summaryEn) 
                          : (doc.summaryEn || doc.summaryMl);
                        const fallbackText = i18n.language === 'ml' 
                          ? 'AI-പവർഡ് ഡോക്യുമെന്റ് വിശകലനം തീർപ്പാക്കാത്തത്...'
                          : 'AI-powered document analysis pending...';
                        const displayText = summary?.substring(0, 150) || fallbackText;
                        return displayText + (summary?.length > 150 ? '...' : '');
                      })()}
                    </p>
                  </div>
                  
                  {/* Enhanced Status & Metadata Row */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm border shadow-soft ${
                        doc.status === 'APPROVED' 
                          ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200/60'
                          : doc.status === 'PENDING' 
                          ? 'bg-amber-50/90 text-amber-700 border-amber-200/60'
                          : 'bg-slate-50/90 text-slate-700 border-slate-200/60'
                      }`}>
                        {doc.status}
                      </span>
                      
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm border ${
                        doc.sensitivityLevel === 'LOW' ? 'bg-green-50/80 text-green-700 border-green-200/50' :
                        doc.sensitivityLevel === 'MEDIUM' ? 'bg-yellow-50/80 text-yellow-700 border-yellow-200/50' :
                        doc.sensitivityLevel === 'HIGH' || doc.sensitivityLevel === 'CONFIDENTIAL' ? 'bg-red-50/80 text-red-700 border-red-200/50' :
                        'bg-gray-50/80 text-gray-700 border-gray-200/50'
                      }`}>
                        {doc.sensitivityLevel}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                      <span className="text-xs text-slate-500 font-semibold">
                        {i18n.language === 'ml' ? 'ലൈവ്' : 'Live'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Tags Section */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="px-6 py-4 border-b border-blue-500/20">
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transition-all duration-300">
                          #{tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm bg-gradient-to-r from-slate-500/10 to-slate-600/10 text-slate-400 border border-slate-500/30 shadow-lg shadow-slate-900/20">
                          +{doc.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Action Buttons */}
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(doc.id, doc.originalFilename)}
                        className="group/btn inline-flex items-center p-3 backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-2xl text-blue-400 hover:text-blue-300 hover:from-blue-500/20 hover:to-blue-600/10 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                        title={i18n.language === 'ml' ? 'ബ്രൗസറിൽ കാണുക' : 'View in Browser'}
                      >
                        <VisibilityIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-200" />
                      </button>

                      <button
                        onClick={() => onDocumentSelect(doc.id)}
                        className="group/btn inline-flex items-center p-3 backdrop-blur-sm bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 border border-indigo-500/30 rounded-2xl text-indigo-400 hover:text-indigo-300 hover:from-indigo-500/20 hover:to-indigo-600/10 hover:shadow-lg hover:shadow-indigo-900/20 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                        title={i18n.language === 'ml' ? 'വിശദാംശങ്ങൾ' : 'Details & Analysis'}
                      >
                        <DescriptionIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-200" />
                      </button>
                      
                      <button
                        onClick={() => handleDownload(doc.id, doc.originalFilename)}
                        className="group/btn inline-flex items-center p-3 backdrop-blur-sm bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl text-emerald-400 hover:text-emerald-300 hover:from-emerald-500/20 hover:to-emerald-600/10 hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                        title={i18n.language === 'ml' ? 'ഡൗൺലോഡ്' : 'Download'}
                      >
                        <DownloadIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-200" />
                      </button>
                      
                      <button
                        onClick={() => onDocumentSelect(doc.id)}
                        className="group/btn inline-flex items-center p-3 backdrop-blur-sm bg-gradient-to-r from-violet-500/10 to-violet-600/5 border border-violet-500/30 rounded-2xl text-violet-400 hover:text-violet-300 hover:from-violet-500/20 hover:to-violet-600/10 hover:shadow-lg hover:shadow-violet-900/20 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                        title={i18n.language === 'ml' ? 'AI ചാറ്റ്' : 'AI Chat'}
                      >
                        <ChatIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-200" />
                      </button>
                    </div>

                    {/* Professional Admin Actions */}
                    {user?.role === 'ADMIN' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openStatusDialog(doc)}
                          className="group/btn inline-flex items-center p-2.5 backdrop-blur-sm bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl text-amber-400 hover:text-amber-300 hover:from-amber-500/20 hover:to-amber-600/10 hover:shadow-lg hover:shadow-amber-900/20 transition-all duration-300 transform hover:scale-110"
                          title={i18n.language === 'ml' ? 'സ്റ്റാറ്റസ് മാറ്റുക' : 'Change Status'}
                        >
                          <EditIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                        </button>
                        
                        <button
                          onClick={() => handleReprocessDocument(doc.id)}
                          className="group/btn inline-flex items-center p-2.5 backdrop-blur-sm bg-gradient-to-r from-blue-50/60 to-blue-100/40 border border-blue-200/50 rounded-xl text-blue-600 hover:text-blue-700 hover:from-blue-100/80 hover:to-blue-50/60 hover:shadow-glass transition-all duration-300 transform hover:scale-110"
                          title={i18n.language === 'ml' ? 'AI ഉപയോഗിച്ച് പുനഃപ്രോസസ്സ് ചെയ്യുക' : 'Reprocess with AI'}
                        >
                          <ReprocessIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                        </button>
                        
                        <button
                          onClick={() => openDeleteDialog(doc)}
                          className="group/btn inline-flex items-center p-2.5 backdrop-blur-sm bg-gradient-to-r from-red-50/60 to-red-100/40 border border-red-200/50 rounded-xl text-red-600 hover:text-red-700 hover:from-red-100/80 hover:to-red-50/60 hover:shadow-glass transition-all duration-300 transform hover:scale-110"
                          title={i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് ഇല്ലാതാക്കുക' : 'Delete Document'}
                        >
                          <DeleteIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Premium Hover Effect Border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-200/20 via-violet-200/20 to-blue-200/20 animate-gradient-shift"></div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Enhanced Empty State */}
        {documents.length === 0 && !loading && (
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 rounded-3xl shadow-luxury border border-white/40 p-16 text-center animate-fade-in-up overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100/80 to-slate-200/60 backdrop-blur-sm rounded-3xl mb-8 shadow-luxury">
                <DescriptionIcon className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-6">
                {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ കണ്ടെത്തിയില്ല' : 'No Documents Found'}
              </h3>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                {i18n.language === 'ml' 
                  ? 'ആരംഭിക്കാൻ നിങ്ങളുടെ ആദ്യത്തെ ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക. AI-പവർഡ് ഡോക്യുമെന്റ് മാനേജ്മെന്റിന്റെ ശക്തി അനുഭവിക്കുക.'
                  : 'Upload your first document to get started with AI-powered document management and unlock the power of intelligent analysis.'
                }
              </p>
              <button 
                onClick={() => window.location.href = '/upload'}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-bold rounded-2xl shadow-luxury hover:shadow-glow transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
              >
                <DescriptionIcon className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Document'}
                <div className="ml-2 w-0 group-hover:w-5 overflow-hidden transition-all duration-300">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Professional Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2 backdrop-blur-xl bg-slate-900/40 border border-blue-500/30 rounded-2xl p-2 shadow-2xl shadow-blue-900/20">
              {/* Previous Button */}
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`inline-flex items-center p-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  page === 1
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-900/20 transform hover:scale-105'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-900/20'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              {/* Next Button */}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`inline-flex items-center p-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  page === totalPages
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-900/20 transform hover:scale-105'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Professional Status Update Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)}
        PaperProps={{
          style: {
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(59,130,246,0.3)',
            boxShadow: '0 25px 50px -12px rgba(59,130,246,0.25), 0 0 0 1px rgba(59,130,246,0.1)',
          }
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
          }
        }}
      >
        <DialogTitle className="pb-2">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/25">
              <EditIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
                {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് സ്റ്റാറ്റസ് അപ്ഡേറ്റ് ചെയ്യുക' : 'Update Document Status'}
              </h3>
              <p className="text-sm text-slate-600 font-medium">
                {selectedDocument?.originalFilename}
              </p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="pt-4">
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel style={{ color: '#64748b', fontWeight: 600 }}>
              {i18n.language === 'ml' ? 'സ്റ്റാറ്റസ്' : 'Status'}
            </InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label={i18n.language === 'ml' ? 'സ്റ്റാറ്റസ്' : 'Status'}
              style={{
                borderRadius: '16px',
                backgroundColor: 'rgba(248,250,252,0.8)',
                border: '1px solid rgba(203,213,225,0.5)',
              }}
            >
              <MenuItem value="ACTIVE" style={{ borderRadius: '12px', margin: '4px' }}>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                  <span className="font-semibold">Active</span>
                </div>
              </MenuItem>
              <MenuItem value="QUARANTINED" style={{ borderRadius: '12px', margin: '4px' }}>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
                  <span className="font-semibold">Quarantined</span>
                </div>
              </MenuItem>
              <MenuItem value="ARCHIVED" style={{ borderRadius: '12px', margin: '4px' }}>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                  <span className="font-semibold">Archived</span>
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions className="px-6 pb-6 pt-4">
          <button
            onClick={() => setStatusDialogOpen(false)}
            className="inline-flex items-center px-6 py-3 backdrop-blur-sm bg-slate-100/60 border border-slate-200/50 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 hover:shadow-soft transition-all duration-300 font-semibold"
          >
            {i18n.language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
          </button>
          <button
            onClick={handleStatusUpdate}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl shadow-luxury hover:shadow-glow transition-all duration-300 transform hover:scale-105"
          >
            {i18n.language === 'ml' ? 'അപ്ഡേറ്റ് ചെയ്യുക' : 'Update Status'}
          </button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          style: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,242,242,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
          }
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
          }
        }}
      >
        <DialogTitle className="pb-2">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-luxury">
              <DeleteIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് ഇല്ലാതാക്കുക' : 'Delete Document'}
              </h3>
              <p className="text-sm text-slate-600 font-medium">
                {i18n.language === 'ml' ? 'ഈ പ്രവർത്തനം പഴയപടിയാക്കാൻ കഴിയില്ല' : 'This action cannot be undone'}
              </p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="pt-4">
          <div className="backdrop-blur-sm bg-red-50/60 border border-red-200/50 rounded-2xl p-6">
            <p className="text-slate-700 font-semibold text-center">
              {i18n.language === 'ml' 
                ? `നിങ്ങൾക്ക് "${selectedDocument?.originalFilename}" ഇല്ലാതാക്കാൻ ഉറപ്പാണോ?`
                : `Are you sure you want to delete "${selectedDocument?.originalFilename}"?`
              }
            </p>
            <p className="text-slate-600 text-sm mt-2 text-center">
              {i18n.language === 'ml' 
                ? 'ഈ ഡോക്യുമെന്റും അതിന്റെ എല്ലാ AI വിശകലനങ്ങളും സ്ഥിരമായി നീക്കം ചെയ്യപ്പെടും.'
                : 'This document and all its AI analysis will be permanently removed.'
              }
            </p>
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-6 pt-4">
          <button
            onClick={() => setDeleteDialogOpen(false)}
            className="inline-flex items-center px-6 py-3 backdrop-blur-sm bg-slate-100/60 border border-slate-200/50 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 hover:shadow-soft transition-all duration-300 font-semibold"
          >
            {i18n.language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
          </button>
          <button
            onClick={handleDeleteDocument}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-2xl shadow-luxury hover:shadow-glow transition-all duration-300 transform hover:scale-105"
          >
            <DeleteIcon className="h-5 w-5 mr-2" />
            {i18n.language === 'ml' ? 'ഇല്ലാതാക്കുക' : 'Delete Document'}
          </button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Document Viewer Modal */}
      <Dialog 
        open={viewerOpen} 
        onClose={() => setViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            height: '90vh',
            maxHeight: '90vh',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
          },
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
          }
        }}
      >
        <DialogTitle className="border-b border-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-luxury">
                <VisibilityIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് കാണുക' : 'Document Viewer'}
                </h3>
                <p className="text-sm text-slate-600 font-medium truncate max-w-md">
                  {viewingDocument?.filename}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (viewingDocument) {
                    handleDownload(viewingDocument.id, viewingDocument.filename);
                  }
                }}
                className="inline-flex items-center p-3 backdrop-blur-sm bg-emerald-50/60 border border-emerald-200/50 rounded-2xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/60 hover:shadow-glass transition-all duration-300 transform hover:scale-110"
                title={i18n.language === 'ml' ? 'ഡൗൺലോഡ്' : 'Download'}
              >
                <DownloadIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewerOpen(false)}
                className="inline-flex items-center p-3 backdrop-blur-sm bg-slate-50/60 border border-slate-200/50 rounded-2xl text-slate-600 hover:text-slate-700 hover:bg-slate-100/60 hover:shadow-glass transition-all duration-300 transform hover:scale-110"
                title={i18n.language === 'ml' ? 'അടയ്ക്കുക' : 'Close'}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </DialogTitle>
        <DialogContent style={{ padding: 0, height: '100%', borderRadius: '0 0 24px 24px' }}>
          {viewingDocument && (
            <DocumentViewerFrame 
              documentId={viewingDocument.id} 
              filename={viewingDocument.filename} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentList;
