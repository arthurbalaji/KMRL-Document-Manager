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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kochi Metro Rail Limited</h1>
                <p className="text-sm text-gray-600">Document Management System</p>
              </div>
            </div>
            
            {/* Language Switcher */}
            <div className="flex space-x-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded text-sm ${
                  i18n.language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('ml')}
                className={`px-3 py-1 rounded text-sm ${
                  i18n.language === 'ml'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                മലയാളം
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Left Panel - Government Information */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 px-12 py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {i18n.language === 'ml' ? 'ഡിജിറ്റൽ ഇന്ത്യ' : 'Digital India Initiative'}
              </h2>
              <p className="text-blue-100 text-lg">
                {i18n.language === 'ml' 
                  ? 'കാര്യക്ഷമമായ സർക്കാർ സേവനങ്ങൾക്കായി ആധുനിക സാങ്കേതികവിദ്യ'
                  : 'Modern technology for efficient government services'
                }
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {i18n.language === 'ml' ? 'സുരക്ഷിത സംവിധാനം' : 'Secure System'}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {i18n.language === 'ml' 
                      ? 'എൻക്രിപ്ഷനും ആക്സസ് നിയന്ത്രണവും'
                      : 'Encryption and access control'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {i18n.language === 'ml' ? 'വേഗത്തിലുള്ള പ്രോസസ്സിംഗ്' : 'Fast Processing'}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {i18n.language === 'ml' 
                      ? 'AI ഉപയോഗിച്ച് വേഗത്തിലുള്ള ഡോക്യുമെന്റ് അനാലിസിസ്'
                      : 'AI-powered document analysis'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {i18n.language === 'ml' ? 'ഡിജിറ്റൽ റെക്കോർഡുകൾ' : 'Digital Records'}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {i18n.language === 'ml' 
                      ? 'പേപ്പർലെസ് ഓഫീസ് പരിസ്ഥിതി'
                      : 'Paperless office environment'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">KMRL</h1>
                  <p className="text-sm text-gray-600">Document System</p>
                </div>
              </div>
            </div>
            
            {/* Login Card */}
            <div className="bg-white rounded-lg shadow-lg border p-8">
              {/* Welcome Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {i18n.language === 'ml' ? 'സ്വാഗതം' : 'Welcome'}
                </h3>
                <p className="text-gray-600">
                  {i18n.language === 'ml' 
                    ? 'നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് സൈൻ ഇൻ ചെയ്യുക'
                    : 'Sign in to access your account'
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  {success}
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex mb-6 bg-gray-100 p-1 rounded">
                <button
                  onClick={() => setTab(0)}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
                    tab === 0
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {i18n.language === 'ml' ? 'സൈൻ ഇൻ' : 'Sign In'}
                </button>
                <button
                  onClick={() => setTab(1)}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
                    tab === 1
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {i18n.language === 'ml' ? 'രജിസ്റ്റർ' : 'Register'}
                </button>
              </div>

              {/* Login Form */}
              {tab === 0 && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'ml' ? 'ഉപയോക്തൃനാമം' : 'Username'}
                    </label>
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ ഉപയോക്തൃനാമം' : 'Enter your username'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'ml' ? 'പാസ്‌വേഡ്' : 'Password'}
                    </label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ പാസ്‌വേഡ്' : 'Enter your password'}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {i18n.language === 'ml' ? 'സൈൻ ഇൻ ചെയ്യുന്നു...' : 'Signing in...'}
                      </span>
                    ) : (
                      i18n.language === 'ml' ? 'സൈൻ ഇൻ' : 'Sign In'
                    )}
                  </button>
                </form>
              )}

              {/* Registration Form */}
              {tab === 1 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {i18n.language === 'ml' ? 'പേര്' : 'First Name'}
                      </label>
                      <input
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ പേര്' : 'Enter your first name'}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {i18n.language === 'ml' ? 'അവസാന പേര്' : 'Last Name'}
                      </label>
                      <input
                        type="text"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ അവസാന പേര്' : 'Enter your last name'}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'ml' ? 'ഇമെയിൽ' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ ഇമെയിൽ' : 'Enter your email'}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {i18n.language === 'ml' ? 'ഉപയോക്തൃനാമം' : 'Username'}
                      </label>
                      <input
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ ഉപയോക്തൃനാമം' : 'Choose a username'}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {i18n.language === 'ml' ? 'റോൾ' : 'Role'}
                      </label>
                      <select
                        value={registerForm.role}
                        onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="ENGINEER">{i18n.language === 'ml' ? 'എഞ്ചിനീയർ' : 'Engineer'}</option>
                        <option value="HR">{i18n.language === 'ml' ? 'എച്ച് ആർ' : 'HR'}</option>
                        <option value="FINANCE">{i18n.language === 'ml' ? 'ഫിനാൻസ്' : 'Finance'}</option>
                        <option value="LEADERSHIP">{i18n.language === 'ml' ? 'നേതൃത്വം' : 'Leadership'}</option>
                        <option value="ADMIN">{i18n.language === 'ml' ? 'അഡ്മിൻ' : 'Admin'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'ml' ? 'പാസ്‌വേഡ്' : 'Password'}
                    </label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={i18n.language === 'ml' ? 'നിങ്ങളുടെ പാസ്‌വേഡ്' : 'Create a password'}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {i18n.language === 'ml' ? 'രജിസ്റ്റർ ചെയ്യുന്നു...' : 'Registering...'}
                      </span>
                    ) : (
                      i18n.language === 'ml' ? 'രജിസ്റ്റർ' : 'Register'
                    )}
                  </button>
                </form>
              )}
            </div>
            
            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                {i18n.language === 'ml' 
                  ? '© കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡ്' 
                  : '© Kochi Metro Rail Limited'
                }
              </p>
              <p className="mt-1">
                {i18n.language === 'ml' 
                  ? 'സർക്കാർ ഓഫ് കേരള'
                  : 'Government of Kerala'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
