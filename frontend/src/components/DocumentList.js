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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow p-8 border border-gray-200">
          <CircularProgress size={48} className="text-blue-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading Documents...'}
          </h3>
          <p className="text-gray-600">
            {i18n.language === 'ml' ? 'നിങ്ങളുടെ ഡോക്യുമെന്റുകൾ തയ്യാറാക്കുന്നു' : 'Preparing your documents'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <DescriptionIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് ലൈബ്രറി' : 'Document Library'}
                </h1>
                <p className="text-gray-600">
                  {i18n.language === 'ml' ? 'AI-പവർഡ് ഡോക്യുമെന്റ് മാനേജ്മെന്റ്' : 'AI-Powered Document Management'}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-gray-100 rounded-lg px-4 py-2 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">{documents.length}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ' : 'Documents'}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {i18n.language === 'ml' ? 'സജീവമായത്' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg px-4 py-2 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      {i18n.language === 'ml' ? 'AI സിസ്റ്റം' : 'AI System'}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {i18n.language === 'ml' ? 'ഓൺലൈൻ' : 'Online'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="text-center">
            <h1 className={`text-3xl font-bold text-gray-900 mb-4 ${i18n.language === 'ml' ? 'font-malayalam' : ''}`}>
              {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ' : 'Documents'}
            </h1>
            <p className="text-lg text-gray-600">
              {i18n.language === 'ml' 
                ? 'AI-പവർഡ് ഇൻസൈറ്റുകൾ ഉപയോഗിച്ച് നിങ്ങളുടെ ഡോക്യുമെന്റുകൾ കൈകാര്യം ചെയ്യുകയും വിശകലനം ചെയ്യുകയും ചെയ്യുക'
                : 'Manage and analyze your documents with AI-powered insights'
              }
            </p>
            <div className="mt-4 inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
              <DescriptionIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {documents.length} {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ' : 'Documents'}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={i18n.language === 'ml' ? 'ডোক্যুমেন্টুকൾ തিরয়ুক...' : 'Search documents...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-700"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDocuments}
                disabled={loading}
                className="inline-flex items-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                <RefreshIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {i18n.language === 'ml' ? 'പুതുക്കുক' : 'Refresh'}
              </button>
              
              <button className="inline-flex items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                <FilterIcon className="h-5 w-5 mr-2" />
                {i18n.language === 'ml' ? 'ഫിൽട്ടർ' : 'Filter'}
              </button>
            </div>
          </div>
          
          {/* Search Stats */}
          {searchTerm && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                {i18n.language === 'ml' 
                  ? `"${searchTerm}" നു വേണ്ടി ${documents.length} ഫലങ്ങൾ കണ്ടെത്തി`
                  : `Found ${documents.length} results for "${searchTerm}"`
                }
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ ലോഡ് ചെയ്യുന്നതിൽ പിശക്' : 'Error Loading Documents'}
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && documents.length === 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
            <CircularProgress size={32} className="text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ ലോഡ് ചെയ്യുന്നു' : 'Loading Documents'}
            </h3>
            <p className="text-gray-600">
              {i18n.language === 'ml' ? 'നിങ്ങളുടെ ഡോക്യുമെന്റുകൾ ലഭിക്കുന്നതുവരെ കാത്തിരിക്കുക...' : 'Please wait while we fetch your documents...'}
            </p>
          </div>
        )}

        {/* Documents Grid */}
        {!loading || documents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <div 
                key={doc.id} 
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Document Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DescriptionIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {doc.originalFilename}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded border">
                            <ScheduleIcon className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600" title={format(new Date(doc.uploadDate), 'PPpp')}>
                              {formatDistanceToNow(new Date(doc.uploadDate), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Summary */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
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
                  
                  {/* Status & Metadata */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.status}
                      </span>
                      
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        doc.sensitivityLevel === 'LOW' ? 'bg-green-100 text-green-700' :
                        doc.sensitivityLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        doc.sensitivityLevel === 'HIGH' || doc.sensitivityLevel === 'CONFIDENTIAL' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.sensitivityLevel}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500 font-medium">
                        {i18n.language === 'ml' ? 'ലൈവ്' : 'Live'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags Section */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          #{tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          +{doc.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(doc.id, doc.originalFilename)}
                        className="inline-flex items-center p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        title={i18n.language === 'ml' ? 'ബ്രൗസറിൽ കാണുക' : 'View in Browser'}
                      >
                        <VisibilityIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDocumentSelect(doc.id)}
                        className="inline-flex items-center p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                        title={i18n.language === 'ml' ? 'വിശദാംശങ്ങൾ' : 'Details & Analysis'}
                      >
                        <DescriptionIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDownload(doc.id, doc.originalFilename)}
                        className="inline-flex items-center p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                        title={i18n.language === 'ml' ? 'ഡൗൺലോഡ്' : 'Download'}
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => onDocumentSelect(doc.id)}
                        className="inline-flex items-center p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                        title={i18n.language === 'ml' ? 'AI ചാറ്റ്' : 'AI Chat'}
                      >
                        <ChatIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Admin Actions */}
                    {user?.role === 'ADMIN' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openStatusDialog(doc)}
                          className="inline-flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 transition-colors"
                          title={i18n.language === 'ml' ? 'സ്റ്റാറ്റസ് മാറ്റുക' : 'Change Status'}
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleReprocessDocument(doc.id)}
                          className="inline-flex items-center p-2 bg-blue-50 border border-blue-200 rounded text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          title={i18n.language === 'ml' ? 'AI ഉപയോഗിച്ച് പുനഃപ്രോസസ്സ് ചെയ്യുക' : 'Reprocess with AI'}
                        >
                          <ReprocessIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => openDeleteDialog(doc)}
                          className="inline-flex items-center p-2 bg-red-50 border border-red-200 rounded text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                          title={i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് ഇല്ലാതാക്കുക' : 'Delete Document'}
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Empty State */}
        {documents.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-6">
              <DescriptionIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {i18n.language === 'ml' ? 'ഡോക്യുമെന്റുകൾ കണ്ടെത്തിയില്ല' : 'No Documents Found'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              {i18n.language === 'ml' 
                ? 'ആരംഭിക്കാൻ നിങ്ങളുടെ ആദ്യത്തെ ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക. AI-പവർഡ് ഡോക്യുമെന്റ് മാനേജ്മെന്റിന്റെ ശക്തി അനുഭവിക്കുക.'
                : 'Upload your first document to get started with AI-powered document management and analysis.'
              }
            </p>
            <button 
              onClick={() => window.location.href = '/upload'}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <DescriptionIcon className="h-5 w-5 mr-2" />
              {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Document'}
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1 shadow">
              {/* Previous Button */}
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`inline-flex items-center p-2 rounded text-sm font-medium transition-colors ${
                  page === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              {/* Next Button */}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`inline-flex items-center p-2 rounded text-sm font-medium transition-colors ${
                  page === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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

      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <EditIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് സ്റ്റാറ്റസ് അപ്ഡേറ്റ് ചെയ്യുക' : 'Update Document Status'}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedDocument?.originalFilename}
              </p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="pt-4">
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>
              {i18n.language === 'ml' ? 'സ്റ്റാറ്റസ്' : 'Status'}
            </InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label={i18n.language === 'ml' ? 'സ്റ്റാറ്റസ്' : 'Status'}
            >
              <MenuItem value="ACTIVE">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
              </MenuItem>
              <MenuItem value="QUARANTINED">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <span>Quarantined</span>
                </div>
              </MenuItem>
              <MenuItem value="ARCHIVED">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
                  <span>Archived</span>
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions className="px-6 pb-6 pt-4">
          <button
            onClick={() => setStatusDialogOpen(false)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
          >
            {i18n.language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
          </button>
          <button
            onClick={handleStatusUpdate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {i18n.language === 'ml' ? 'അപ്ഡേറ്റ് ചെയ്യുക' : 'Update Status'}
          </button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DeleteIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">
                {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് ഇല്ലാതാക്കുക' : 'Delete Document'}
              </h3>
              <p className="text-sm text-gray-600">
                {i18n.language === 'ml' ? 'ഈ പ്രവർത്തനം പഴയപടിയാക്കാൻ കഴിയില്ല' : 'This action cannot be undone'}
              </p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-gray-800 text-center">
              {i18n.language === 'ml' 
                ? `നിങ്ങൾക്ക് "${selectedDocument?.originalFilename}" ഇല്ലാതാക്കാൻ ഉറപ്പാണോ?`
                : `Are you sure you want to delete "${selectedDocument?.originalFilename}"?`
              }
            </p>
            <p className="text-gray-600 text-sm mt-2 text-center">
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
            className="px-4 py-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
          >
            {i18n.language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
          </button>
          <button
            onClick={handleDeleteDocument}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <DeleteIcon className="h-4 w-4 mr-2" />
            {i18n.language === 'ml' ? 'ഇല്ലാതാക്കുക' : 'Delete Document'}
          </button>
        </DialogActions>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog 
        open={viewerOpen} 
        onClose={() => setViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            height: '90vh',
            maxHeight: '90vh',
            borderRadius: '12px',
          },
        }}
      >
        <DialogTitle className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <VisibilityIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {i18n.language === 'ml' ? 'ഡോക്യുമെന്റ് കാണുക' : 'Document Viewer'}
                </h3>
                <p className="text-sm text-gray-600 truncate max-w-md">
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
                className="inline-flex items-center p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                title={i18n.language === 'ml' ? 'ഡൗൺലോഡ്' : 'Download'}
              >
                <DownloadIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewerOpen(false)}
                className="inline-flex items-center p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                title={i18n.language === 'ml' ? 'അടയ്ക്കുക' : 'Close'}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogTitle>
        <DialogContent style={{ padding: 0, height: '100%' }}>
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
