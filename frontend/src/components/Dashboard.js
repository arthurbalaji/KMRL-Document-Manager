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
        ? 'നിങ്ങളുടെ എല്ലാ ഡോക്യുമെന്റുകളും കേന്ദ്രീകൃത സ്ഥലത്ത് കാണുകയും കൈകാര്യം ചെയ്യുകയും ചെയ്യുക. വിപുലമായ ഫിൽട്ടറിംഗ്, സോർട്ടിംഗ്, കൂടാതെ വിശദമായ മെറ്റാഡാറ്റ കാഴ്ചകൾ.' 
        : 'Access and manage your complete document repository with advanced filtering, sorting, and detailed metadata views. Enterprise-grade document lifecycle management.',
      icon: <Description className="h-8 w-8" />,
      action: () => navigate('/documents'),
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      title: t('upload'),
      description: isMalayalam 
        ? 'ബുദ്ധിപരമായ ഓട്ടോമാറ്റിക് പ്രോസസിംഗ്, OCR, കൂടാതെ മെറ്റാഡാറ്റ എക്സ്ട്രാക്ഷൻ എന്നിവയോടെ പുതിയ ഡോക്യുമെന്റുകൾ അപ്‌ലോഡ് ചെയ്യുക.'
        : 'Upload new documents with intelligent automatic processing, OCR capabilities, and metadata extraction. Supports bulk uploads and format validation.',
      icon: <UploadFile className="h-8 w-8" />,
      action: () => navigate('/upload'),
      color: 'from-indigo-600 to-indigo-700',
      bgColor: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: t('globalSearch'),
      description: isMalayalam 
        ? 'AI-പവർഡ് സെമാന്റിക് സെർച്ച് എഞ്ചിൻ ഉപയോഗിച്ച് എല്ലാ ഡോക്യുമെന്റുകളിലും സ്മാർട്ട് കണ്ടെത്തൽ. പ്രകൃതിദത്ത ഭാഷാ അന്വേഷണങ്ങൾ പിന്തുണയ്ക്കുന്നു.'
        : 'AI-powered semantic search engine with smart discovery across all documents. Natural language queries with contextual understanding and relevance ranking.',
      icon: <Search className="h-8 w-8" />,
      action: () => navigate('/search'),
      color: 'from-violet-600 to-violet-700',
      bgColor: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Professional Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-500/12 to-blue-600/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s', animationDuration: '8s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-indigo-600/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s', animationDuration: '10s'}}></div>
        
        {/* Professional geometric patterns */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-blue-500/20 rounded-xl rotate-45 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-indigo-500/20 rounded-full animate-pulse" style={{animationDelay: '1s', animationDuration: '5s'}}></div>
        <div className="absolute top-1/3 left-10 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg animate-pulse" style={{animationDelay: '3s', animationDuration: '6s'}}></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </div>
      </div>

      {/* Professional Header */}
      <header className="relative backdrop-blur-md bg-slate-900/80 shadow-2xl shadow-blue-900/20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Corporate Logo and Title */}
            <div className="flex items-center space-x-4 animate-fade-in-up">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
                <Folder className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent ${isMalayalam ? 'font-malayalam' : ''}`}>
                  KMRL Document Management
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                  Kochi Metro Rail Limited
                </p>
              </div>
            </div>

            {/* User Info and Professional Actions */}
            <div className="flex items-center space-x-3 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <LanguageSwitcher size="small" standalone={true} />
              
              <div className="flex items-center space-x-2 backdrop-blur-sm bg-slate-800/60 rounded-xl px-3 py-1.5 border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 max-w-48 overflow-hidden">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Person className="h-5 w-5 text-blue-400" />
                </div>
                <div className="hidden sm:block min-w-0 flex-1 overflow-hidden">
                  <p className={`text-xs font-semibold text-slate-200 truncate leading-tight ${isMalayalam ? 'font-malayalam' : ''}`}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 font-medium truncate leading-tight">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white backdrop-blur-sm bg-slate-800/60 hover:bg-slate-700/60 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-blue-500/50 hover:shadow-lg"
              >
                <Logout className="h-4 w-4" />
                <span className={isMalayalam ? 'font-malayalam' : ''}>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Welcome Section */}
        <div className="backdrop-blur-lg bg-slate-900/60 rounded-3xl shadow-2xl shadow-blue-900/20 border border-slate-800/50 p-8 mb-8 animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0.2s'}}>
          {/* Professional background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
          
          <div className="text-center relative z-10">
            <h2 className={`text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent mb-4 ${isMalayalam ? 'font-malayalam' : ''}`}>
              {t('welcome')}, {user?.firstName} {user?.lastName}!
            </h2>
            <p className={`text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed ${isMalayalam ? 'font-malayalam' : ''}`}>
              {isMalayalam 
                ? 'KMRL ഡോക്യുമെന്റ് മാനേജ്‌മെന്റ് സിസ്റ്റത്തിലേക്ക് സ്വാഗതം. ഇവിടെ നിങ്ങൾക്ക് എല്ലാ പ്രധാന ഡോക്യുമെന്റുകളും കാര്യക്ഷമമായി കൈകാര്യം ചെയ്യാം.' 
                : 'Welcome to the KMRL Document Management System. Your comprehensive platform for managing, processing, and securing all critical organizational documents with cutting-edge technology and enterprise-grade security.'
              }
            </p>
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center space-x-2 backdrop-blur-sm bg-emerald-900/30 border border-emerald-600/30 rounded-full px-6 py-3 shadow-lg">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className={`text-sm font-semibold text-emerald-300 ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {isMalayalam ? 'സിസ്റ്റം ഓൺലൈൻ & സുരക്ഷിതം' : 'System Online & Secure'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl shadow-2xl shadow-blue-900/20 border border-blue-500/20 p-6 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-500 animate-fade-in-up group cursor-pointer relative overflow-hidden" style={{animationDelay: '0.3s'}}>
            {/* Professional animated background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className={`text-sm font-semibold text-slate-500 mb-2 group-hover:text-slate-400 transition-colors ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {isMalayalam ? 'മൊത്തം ഡോക്യുമെന്റുകൾ' : 'Total Documents'}
                </p>
                <p className="text-3xl font-bold text-slate-200 group-hover:text-white transition-colors">
                  {stats.loading ? (
                    <div className="h-8 bg-slate-800/50 rounded-lg animate-pulse w-16"></div>
                  ) : (
                    stats.totalDocuments
                  )}
                </p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25 group-hover:shadow-xl group-hover:shadow-blue-600/40 transform group-hover:scale-110 transition-all duration-300">
                <Analytics className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 relative z-10">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Live Data</span>
            </div>
          </div>
          
          <div className="backdrop-blur-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-2xl shadow-2xl shadow-indigo-900/20 border border-indigo-500/20 p-6 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-900/30 transition-all duration-500 animate-fade-in-up group cursor-pointer relative overflow-hidden" style={{animationDelay: '0.4s'}}>
            {/* Professional animated background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className={`text-sm font-semibold text-slate-500 mb-2 group-hover:text-slate-400 transition-colors ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {isMalayalam ? 'സമീപകാല പ്രവർത്തനം' : 'Recent Activity'}
                </p>
                <p className="text-3xl font-bold text-slate-200 group-hover:text-white transition-colors">
                  {stats.loading ? (
                    <div className="h-8 bg-slate-800/50 rounded-lg animate-pulse w-16"></div>
                  ) : (
                    stats.recentActivity
                  )}
                </p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:shadow-xl group-hover:shadow-indigo-600/40 transform group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 relative z-10">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Active Now</span>
            </div>
          </div>
          
          <div className="backdrop-blur-lg bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-2xl shadow-2xl shadow-violet-900/20 border border-violet-500/20 p-6 transform hover:scale-105 hover:shadow-2xl hover:shadow-violet-900/30 transition-all duration-500 animate-fade-in-up group cursor-pointer relative overflow-hidden" style={{animationDelay: '0.5s'}}>
            {/* Professional animated background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className={`text-sm font-semibold text-slate-500 mb-2 group-hover:text-slate-400 transition-colors ${isMalayalam ? 'font-malayalam' : ''}`}>
                  {isMalayalam ? 'നിങ്ങളുടെ റോൾ' : 'Your Role'}
                </p>
                <p className="text-2xl font-bold text-slate-200 group-hover:text-white transition-colors capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/25 group-hover:shadow-xl group-hover:shadow-violet-600/40 transform group-hover:scale-110 transition-all duration-300">
                <Person className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 relative z-10">
              <Person className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">Authenticated</span>
            </div>
          </div>
        </div>

        {/* Professional Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className="group animate-fade-in-up" 
              style={{animationDelay: `${0.6 + index * 0.1}s`}}
            >
              <div className={`backdrop-blur-lg bg-slate-900/30 rounded-3xl shadow-2xl hover:shadow-2xl border ${item.borderColor} overflow-hidden transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative`}>
                {/* Professional Gradient Header */}
                <div className={`h-3 bg-gradient-to-r ${item.color} relative`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
                
                <div className="p-8 relative">
                  {/* Professional background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  {/* Floating Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${item.bgColor} backdrop-blur-sm rounded-3xl mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 border ${item.borderColor} relative z-10`}>
                    <div className={`${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-2xl font-bold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent mb-4 group-hover:from-white group-hover:to-slate-200 transition-all duration-300 relative z-10 ${isMalayalam ? 'font-malayalam' : ''}`}>
                    {item.title}
                  </h3>
                  
                  {/* Description */}
                  <p className={`text-slate-500 mb-8 leading-relaxed line-clamp-3 group-hover:text-slate-400 transition-colors duration-300 relative z-10 ${isMalayalam ? 'font-malayalam' : ''}`}>
                    {item.description}
                  </p>
                  
                  {/* Action Button */}
                  <button
                    onClick={item.action}
                    className={`w-full bg-gradient-to-r ${item.color} text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden z-10`}
                  >
                    {/* Button shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    <span className={`relative flex items-center justify-center space-x-2 ${isMalayalam ? 'font-malayalam' : ''}`}>
                      <span>{isMalayalam ? 'തുറക്കുക' : 'Access Now'}</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Quick Tips */}
        <div className="mt-12 bg-gradient-to-r from-slate-900/50 to-blue-950/50 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
          {/* Professional background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl"></div>
          
          <h3 className={`text-2xl font-bold text-slate-200 mb-4 relative z-10 ${isMalayalam ? 'font-malayalam' : ''}`}>
            {isMalayalam ? 'വേഗത്തിലുള്ള നുറുങ്ങുകൾ' : 'Quick Tips'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold text-sm">1</span>
              </div>
              <p className={`text-slate-400 ${isMalayalam ? 'font-malayalam' : ''}`}>
                {isMalayalam 
                  ? 'AI യാന്ത്രികമായി ഡോക്യുമെന്റുകൾ വിശകലനം ചെയ്യുകയും ടാഗ് ചെയ്യുകയും ചെയ്യുന്നു' 
                  : 'AI automatically analyzes and tags your documents for better organization'
                }
              </p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-400 font-bold text-sm">2</span>
              </div>
              <p className={`text-slate-400 ${isMalayalam ? 'font-malayalam' : ''}`}>
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
