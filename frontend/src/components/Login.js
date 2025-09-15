import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { t, i18n } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ENGINEER',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginForm);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await register(registerForm);
    
    if (result.success) {
      setSuccess('Registration successful! You can now login.');
      setTab(0);
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'ENGINEER',
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Professional Animated Background */}
      <div className="absolute inset-0">
        {/* Deep Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950"></div>
        
        {/* Floating Geometric Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-violet-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s', animationDuration: '5s'}}></div>
        
        {/* Professional Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-[linear-gradient(rgba(59,130,246,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </div>
        
        {/* Radial Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-950/20 to-transparent"></div>
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Panel - Professional Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative">
          <div className="flex flex-col justify-center px-12 xl:px-16 w-full">
            {/* Corporate Logo Section */}
            <div className="mb-12 animate-fade-in-up">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <svg className="w-8 h-8 text-white relative" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white font-sans tracking-tight">KMRL</h1>
                  <p className="text-blue-300 font-medium tracking-wide">Document Intelligence</p>
                </div>
              </div>
              
              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 font-sans leading-tight tracking-tight">
                Enterprise-Grade
                <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
                  Document Platform
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
                Advanced AI-powered document management with military-grade security, 
                intelligent automation, and seamless collaboration for modern enterprises.
              </p>
            </div>

            {/* Professional Feature Highlights */}
            <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center space-x-4 group cursor-pointer">
                <div className="w-12 h-12 bg-blue-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-600/30 group-hover:border-blue-500/50 group-hover:bg-blue-800/50 transition-all duration-300">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">AI-Powered Processing</h3>
                  <p className="text-slate-500 text-sm font-light">Real-time document analysis and intelligent insights</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 group cursor-pointer">
                <div className="w-12 h-12 bg-indigo-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-indigo-600/30 group-hover:border-indigo-500/50 group-hover:bg-indigo-800/50 transition-all duration-300">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Enterprise Security</h3>
                  <p className="text-slate-500 text-sm font-light">Military-grade encryption and compliance standards</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 group cursor-pointer">
                <div className="w-12 h-12 bg-violet-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-violet-600/30 group-hover:border-violet-500/50 group-hover:bg-violet-800/50 transition-all duration-300">
                  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Global Intelligence</h3>
                  <p className="text-slate-500 text-sm font-light">Multi-language processing and cultural context</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Professional Authentication */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Corporate Logo */}
            <div className="lg:hidden text-center mb-8 animate-fade-in-up">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-sans">KMRL</h1>
                  <p className="text-blue-300 text-sm">Document Intelligence</p>
                </div>
              </div>
            </div>
            
            {/* Premium Glass Card Container */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl shadow-blue-900/20 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              {/* Language Switcher */}
              <div className="flex justify-center space-x-2 mb-8">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    i18n.language === 'en'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
                  }`}
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => changeLanguage('ml')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    i18n.language === 'ml'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
                  }`}
                >
                  🇮🇳 മലയാളം
                </button>
              </div>

              {/* Professional Welcome Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">
                  {i18n.language === 'ml' ? 'സ്വാഗതം' : 'Welcome Back'}
                </h3>
                <p className="text-slate-400 font-light">
                  {i18n.language === 'ml' 
                    ? 'നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് സൈൻ ഇൻ ചെയ്യുക'
                    : 'Sign in to access your secure workspace'
                  }
                </p>
              </div>

              {/* Professional Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-950/50 border border-red-800/50 rounded-2xl backdrop-blur-sm animate-fade-in-up">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-red-300 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Professional Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-800/50 rounded-2xl backdrop-blur-sm animate-fade-in-up">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-emerald-300 text-sm font-medium">{success}</p>
                  </div>
                </div>
              )}
              {/* Professional Tab Navigation */}
              <div className="flex space-x-1 bg-slate-800/40 p-1.5 rounded-xl mb-8 backdrop-blur-sm border border-slate-700/30">
                <button
                  onClick={() => setTab(0)}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    tab === 0
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {i18n.language === 'ml' ? 'സൈൻ ഇൻ' : 'Sign In'}
                </button>
                <button
                  onClick={() => setTab(1)}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    tab === 1
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {i18n.language === 'ml' ? 'രജിസ്റ്റർ' : 'Register'}
                </button>
              </div>

              {/* Professional Login Form */}
              {tab === 0 && (
                <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {i18n.language === 'ml' ? 'ഉപയോക്തൃനാമം' : 'Username'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                        placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ ഉപയോക്തൃനാമം' : 'Enter your username'}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {i18n.language === 'ml' ? 'പാസ്‌വേഡ്' : 'Password'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                        placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ പാസ്‌വേഡ്' : 'Enter your password'}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{i18n.language === 'ml' ? 'സൈൻ ഇൻ ചെയ്യുന്നു...' : 'Signing in...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{i18n.language === 'ml' ? 'സൈൻ ഇൻ' : 'Sign In'}</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                          </svg>
                        </>
                      )}
                    </div>
                  </button>
                </form>
              )}

              {/* Professional Registration Form */}
              {tab === 1 && (
                <form onSubmit={handleRegister} className="space-y-6 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {i18n.language === 'ml' ? 'പേര്' : 'First Name'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                          placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ പേര്' : 'Enter your first name'}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {i18n.language === 'ml' ? 'അവസാന പേര്' : 'Last Name'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                          placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ അവസാന പേര്' : 'Enter your last name'}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {i18n.language === 'ml' ? 'ഇമെയിൽ' : 'Email'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                        placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ ഇമെയിൽ' : 'Enter your email'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {i18n.language === 'ml' ? 'ഉപയോക്തൃനാമം' : 'Username'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                          placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ ഉപയോക്തൃനാമം' : 'Choose a username'}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {i18n.language === 'ml' ? 'റോൾ' : 'Role'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                        <select
                          value={registerForm.role}
                          onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                          required
                        >
                          <option value="ENGINEER">
                            {i18n.language === 'ml' ? 'എഞ്ചിനീയർ' : 'Engineer'}
                          </option>
                          <option value="HR">
                            {i18n.language === 'ml' ? 'എച്ച്.ആർ' : 'Human Resources'}
                          </option>
                          <option value="FINANCE">
                            {i18n.language === 'ml' ? 'ധനകാര്യം' : 'Finance'}
                          </option>
                          <option value="LEADERSHIP">
                            {i18n.language === 'ml' ? 'നേതൃത്വം' : 'Leadership'}
                          </option>
                          <option value="ADMIN">
                            {i18n.language === 'ml' ? 'അഡ്മിൻ' : 'Administrator'}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {i18n.language === 'ml' ? 'പാസ്‌വേഡ്' : 'Password'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-300"
                        placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ പാസ്‌വേഡ്' : 'Create a password'}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{i18n.language === 'ml' ? 'രജിസ്റ്റർ ചെയ്യുന്നു...' : 'Creating account...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{i18n.language === 'ml' ? 'രജിസ്റ്റർ' : 'Create Account'}</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                          </svg>
                        </>
                      )}
                    </div>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
