import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import DocumentView from './components/DocumentView';
import Upload from './components/Upload';
import GlobalSearch from './components/GlobalSearch';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import api from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/documents" 
          element={user ? <DocumentListPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/documents/:id" 
          element={user ? <DocumentViewPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/upload" 
          element={user ? <Upload /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/search" 
          element={user ? <GlobalSearch /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

function DocumentListPage() {
  const navigate = useNavigate();
  
  const handleDocumentSelect = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  return <DocumentList onDocumentSelect={handleDocumentSelect} />;
}

function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/documents/${id}`);
        setDocument(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/documents');
  };

  if (loading) {
    return <div>Loading document...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={handleBack}>Back to Documents</button>
      </div>
    );
  }

  return (
    <DocumentView 
      document={document} 
      onBack={handleBack} 
      showChat={true} 
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
