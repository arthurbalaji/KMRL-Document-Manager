import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  List,
  ListItem,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Language as LanguageIcon,
  Analytics as AnalyticsIcon,
  QuestionAnswer as QAIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [relevantDocuments, setRelevantDocuments] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    // Add welcome message
    setChatHistory([{
      type: 'system',
      content: language === 'ml' 
        ? 'നമസ്കാരം! കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡിന്റെ ഡോക്യുമെന്റ് അനാലിസിസ് അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ ആക്സസ് ചെയ്യാവുന്ന എല്ലാ ഡോക്യുമെന്റുകളും വിശകലനം ചെയ്ത് സാധാരണ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകാൻ എനിക്ക് കഴിയും.'
        : 'Welcome to KMRL Document Analysis Assistant! I can analyze all documents you have access to and answer general questions about your document collection.',
      timestamp: new Date().toISOString()
    }]);
  }, [language]);

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMessage = query;
    setQuery('');
    
    // Add user message to chat
    setChatHistory(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/documents/search', {
        query: userMessage,
        language: language
      });

      // Add AI response to chat
      setChatHistory(prev => [...prev, {
        type: 'ai',
        content: response.data.answer,
        timestamp: new Date().toISOString(),
        relevantDocuments: response.data.relevant_documents || []
      }]);

      // Update relevant documents for display
      setRelevantDocuments(response.data.relevant_documents || []);

    } catch (err) {
      console.error('Global search error:', err);
      setError(err.response?.data?.error || 'Failed to search documents');
      
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        type: 'error',
        content: language === 'ml' 
          ? 'ക്ഷമിക്കണം, വിശകലനത്തിൽ പിഴവ് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
          : 'Sorry, there was an error analyzing your query. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  const getSuggestions = () => {
    const suggestions = language === 'ml' ? [
      'ഏറ്റവും പുതിയ നയ അപ്‌ഡേറ്റുകൾ എന്താണ്?',
      'ധനകാര്യ റിപ്പോർട്ടുകളിൽ പ്രധാന കണ്ടെത്തലുകൾ എന്താണ്?',
      'എഞ്ചിനീയറിംഗ് പദ്ധതികളുടെ നിലവിലെ അവസ്ഥ എന്താണ്?',
      'ജീവനക്കാരുടെ നയങ്ങളിൽ ഏതെങ്കിലും മാറ്റങ്ങൾ ഉണ്ടോ?',
      'ബഡ്ജറ്റ് അനുവദനങ്ങളും ചെലവുകളും സംഗ്രഹിക്കുക'
    ] : [
      'What are the latest policy updates?',
      'What are the key findings in financial reports?',
      'What is the current status of engineering projects?',
      'Are there any changes in employee policies?',
      'Summarize budget allocations and expenses'
    ];

    return suggestions;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <AnalyticsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {language === 'ml' ? 'ഗ്ലോബൽ ഡോക്യുമെന്റ് അനാലിസിസ്' : 'Global Document Analysis'}
        </Typography>
        <ToggleButtonGroup
          value={language}
          exclusive
          onChange={(e, value) => value && setLanguage(value)}
          size="small"
        >
          <ToggleButton value="en">EN</ToggleButton>
          <ToggleButton value="ml">ML</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Description */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {language === 'ml' 
            ? `${user?.fullName}, നിങ്ങളുടെ റോൾ (${user?.role}) അനുസരിച്ച് ആക്സസ് ചെയ്യാവുന്ന എല്ലാ ഡോക്യുമെന്റുകളും AI വിശകലനം ചെയ്യും. സാധാരണ ചോദ്യങ്ങൾ ചോദിക്കുക, ട്രെൻഡുകൾ കണ്ടെത്തുക, അല്ലെങ്കിൽ ഡോക്യുമെന്റുകളിലുടനീളം വിവരങ്ങൾ താരതമ്യം ചെയ്യുക.`
            : `${user?.fullName}, the AI will analyze all documents accessible to your role (${user?.role}). Ask general questions, identify trends, or compare information across documents.`
          }
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Chat Interface */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <QAIcon sx={{ mr: 1 }} />
                {language === 'ml' ? 'AI അസിസ്റ്റന്റ്' : 'AI Assistant'}
              </Typography>
            </Box>

            {/* Chat Messages */}
            <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto', bgcolor: 'grey.50' }}>
              <List sx={{ p: 0 }}>
                {chatHistory.map((message, index) => (
                  <ListItem key={index} sx={{ justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', px: 0 }}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        maxWidth: '80%',
                        bgcolor: message.type === 'user' ? 'primary.main' : 
                               message.type === 'error' ? 'error.light' :
                               message.type === 'system' ? 'info.light' : 'white',
                        color: message.type === 'user' || message.type === 'error' || message.type === 'system' ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      
                      {/* Show relevant documents for AI responses */}
                      {message.type === 'ai' && message.relevantDocuments && message.relevantDocuments.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                            {language === 'ml' ? 'പ്രസക്തമായ ഡോക്യുമെന്റുകൾ:' : 'Relevant Documents:'}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {message.relevantDocuments.slice(0, 3).map((doc, docIndex) => (
                              <Chip
                                key={docIndex}
                                label={doc.filename}
                                size="small"
                                clickable
                                onClick={() => handleDocumentClick(doc.id)}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </ListItem>
                ))}
                
                {loading && (
                  <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                        {language === 'ml' ? 'ഡോക്യുമെന്റുകൾ വിശകലനം ചെയ്യുന്നു...' : 'Analyzing documents...'}
                      </Typography>
                    </Paper>
                  </ListItem>
                )}
              </List>
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder={language === 'ml' ? 'നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...' : 'Type your question here...'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  multiline
                  maxRows={3}
                  disabled={loading}
                />
                <IconButton 
                  onClick={handleSendMessage}
                  disabled={!query.trim() || loading}
                  color="primary"
                  sx={{ alignSelf: 'flex-end' }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Suggestions */}
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {language === 'ml' ? 'സാധാരണ ചോദ്യങ്ങൾ' : 'Common Questions'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {getSuggestions().map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => setQuery(suggestion)}
                  sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  {suggestion}
                </Button>
              ))}
            </Box>
          </Paper>

          {/* Relevant Documents */}
          {relevantDocuments.length > 0 && (
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {language === 'ml' ? 'പ്രസക്തമായ ഡോക്യുമെന്റുകൾ' : 'Relevant Documents'}
              </Typography>
              <List dense>
                {relevantDocuments.map((doc, index) => (
                  <ListItem 
                    key={index} 
                    button 
                    onClick={() => handleDocumentClick(doc.id)}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" fontWeight="medium">
                        <DocumentIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                        {doc.filename}
                      </Typography>
                      {doc.summary_en && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {doc.summary_en.substring(0, 100)}...
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* User Access Info */}
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {language === 'ml' ? 'നിങ്ങളുടെ ആക്സസ്' : 'Your Access'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>{language === 'ml' ? 'റോൾ:' : 'Role:'}</strong> {user?.role}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {language === 'ml' 
                ? 'നിങ്ങളുടെ റോൾ അനുസരിച്ച് അനുവദിച്ച എല്ലാ ഡോക്യുമെന്റുകളും AI വിശകലനം ചെയ്യും.'
                : 'AI will analyze all documents authorized for your role.'
              }
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default GlobalSearch;
