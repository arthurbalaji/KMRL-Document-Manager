import React, { useState, useEffect } from 'react';
import {
  UploadFile,
  Description,
  Search,
  Logout,
  Person,
  TrendingUp,
  Folder,
  Analytics,
  CheckCircle,
  Security,
  Speed,
  Language,
  CloudUpload,
  AutoAwesome,
  Insights
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import api from '../services/api';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isMalayalam } = useLanguage();
  const navigate = useNavigate();

  // State for dashboard statistics
  const [stats, setStats] = useState({
    totalDocuments: 0,
    recentActivity: 0,
    loading: true
  });

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total documents count
        const docsResponse = await api.get('/documents', { 
          params: { page: 0, size: 1 } // Just get first page to get total count
        });
        
        // For recent activity, we'll count documents from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentResponse = await api.get('/documents', {
          params: { 
            page: 0, 
            size: 100, // Get more to filter by date
            sort: 'createdAt,desc' 
          }
        });

        // Count documents from last 7 days
        const recentCount = recentResponse.data.content.filter(doc => {
          const docDate = new Date(doc.createdAt);
          return docDate >= sevenDaysAgo;
        }).length;

        setStats({
          totalDocuments: docsResponse.data.totalElements || 0,
          recentActivity: recentCount,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: t('documents'),
      description: isMalayalam 
        ? 'നിങ്ങളുടെ എല്ലാ ഡോക്യുമെന്റുകളും കേന്ദ്രീകൃത സ്ഥലത്ത് കാണുകയും കൈകാര്യം ചെയ്യുകയും ചെയ്യുക' 
        : 'Access and manage your complete document repository with filtering and sorting',
      icon: <Description className="h-8 w-8" />,
      action: () => navigate('/documents'),
    },
    {
      title: t('upload'),
      description: isMalayalam 
        ? 'ബുദ്ധിപരമായ ഓട്ടോമാറ്റിക് പ്രോസസിംഗ്, OCR, കൂടാതെ മെറ്റാഡാറ്റ എക്സ്ട്രാക്ഷൻ എന്നിവയോടെ പുതിയ ഡോക്യുമെന്റുകൾ അപ്‌ലോഡ് ചെയ്യുക'
        : 'Upload new documents with automatic processing, OCR capabilities, and metadata extraction',
      icon: <UploadFile className="h-8 w-8" />,
      action: () => navigate('/upload'),
    },
    {
      title: t('globalSearch'),
      description: isMalayalam 
        ? 'AI-പവർഡ് സെമാന്റിക് സെർച്ച് എഞ്ചിൻ ഉപയോഗിച്ച് എല്ലാ ഡോക്യുമെന്റുകളിലും സ്മാർട്ട് കണ്ടെത്തൽ'
        : 'AI-powered semantic search engine with smart discovery across all documents',
      icon: <Search className="h-8 w-8" />,
      action: () => navigate('/search'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Folder className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold text-gray-900 ${isMalayalam ? 'font-malayalam' : ''}`}>
                  KMRL Document Management
                </h1>
                <p className="text-sm text-gray-600">
                  Kochi Metro Rail Limited
                </p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-3">
              <LanguageSwitcher size="small" standalone={true} />
              
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1.5 border">
                <div className="h-8 w-8 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center">
                  <Person className="h-5 w-5 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-medium text-gray-900 ${isMalayalam ? 'font-malayalam' : ''}`}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 hover:border-gray-400"
              >
                <Logout className="h-4 w-4" />
                <span className={isMalayalam ? 'font-malayalam' : ''}>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <div className="text-center">
            <h2 className={`text-3xl font-bold text-gray-900 mb-4 ${isMalayalam ? 'font-malayalam' : ''}`}>
              {t('welcome')}, {user?.firstName} {user?.lastName}!
            </h2>
            <p className={`text-lg text-gray-600 max-w-3xl mx-auto ${isMalayalam ? 'font-malayalam' : ''}`}>
              {isMalayalam 
                ? 'KMRL ഡോക്യുമെന്റ് മാനേജ്‌മെന്റ് സിസ്റ്റത്തിലേക്ക് സ്വാഗതം. ഇവിടെ നിങ്ങൾക്ക് എല്ലാ പ്രധാന ഡോക്യുമെന്റുകളും കാര്യക്ഷമമായി കൈകാര്യം ചെയ്യാം' 
                : 'Welcome to the KMRL Document Management System. Your platform for managing and securing all organizational documents.'
              }
            </p>
            <div className="mt-4 inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className={`text-sm font-medium text-green-800 ${isMalayalam ? 'font-malayalam' : ''}`}>
                {isMalayalam ? 'സിസ്റ്റം ഓൺലൈൻ & സുരക്ഷിതം' : 'System Online & Secure'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium text-gray-600 mb-2 ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {isMalayalam ? 'മൊത്തം ഡോക്യുമെന്റുകൾ' : 'Total Documents'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  ) : (
                    stats.totalDocuments
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Analytics className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium text-gray-600 mb-2 ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {isMalayalam ? 'സമീപകാല പ്രവർത്തനം' : 'Recent Activity'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  ) : (
                    stats.recentActivity
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium text-gray-600 mb-2 ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {isMalayalam ? 'നിങ്ങളുടെ റോൾ' : 'Your Role'}
                </p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Person className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <div className="text-blue-600">
                    {item.icon}
                  </div>
                </div>
                
                {/* Title */}
                <h3 className={`text-xl font-bold text-gray-900 mb-3 ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {item.title}
                </h3>
                
                {/* Description */}
                <p className={`text-gray-600 mb-6 ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {item.description}
                </p>
                
                {/* Action Button */}
                <button
                  onClick={item.action}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors ${isMalayalam ? 'font-malayalam' : ''}`}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>{isMalayalam ? 'തുറക്കുക' : 'Access Now'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className={`text-xl font-bold text-gray-900 mb-4 ${isMalayalam ? 'font-malayalam' : ''}`}>
            {isMalayalam ? 'വേഗത്തിലുള്ള നുറുങ്ങുകൾ' : 'Quick Tips'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">1</span>
              </div>
              <p className={`text-gray-700 ${isMalayalam ? 'font-malayalam' : ''}`}>
                {isMalayalam 
                  ? 'AI യാന്ത്രികമായി ഡോക്യുമെന്റുകൾ വിശകലനം ചെയ്യുകയും ടാഗ് ചെയ്യുകയും ചെയ്യുന്നു' 
                  : 'AI automatically analyzes and tags your documents for better organization'
                }
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">2</span>
              </div>
              <p className={`text-gray-700 ${isMalayalam ? 'font-malayalam' : ''}`}>
                {isMalayalam 
                  ? 'ഗ്ലോബൽ സെർച്ച് ഉപയോഗിച്ച് എല്ലാ ഡോക്യുമെന്റുകളിലും അറിവ് കണ്ടെത്തുക' 
                  : 'Use global search to find insights across all your documents'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
