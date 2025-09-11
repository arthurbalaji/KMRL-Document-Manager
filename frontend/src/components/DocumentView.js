import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

const DocumentView = ({ document, onBack, showChat = false }) => {
  const { t, i18n } = useTranslation();
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  // Add null check for document
  if (!document) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {t('error.documentNotFound', 'Document not found')}
        </Alert>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          {t('common.back', 'Back')}
        </Button>
      </Container>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !document) return;

    const userMessage = newMessage;
    setNewMessage('');
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await api.post(`/documents/${document.id}/chat`, {
        question: userMessage,
        language: selectedLanguage
      });

      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        content: response.data.answer,
        language: response.data.language 
      }]);
      setError(null);
    } catch (err) {
      setError(t('error.chatFailed'));
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      const response = await api.get(`/documents/${document.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.originalFilename || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const getSensitivityColor = (level) => {
    switch (level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CONFIDENTIAL': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {document.originalFilename}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Document Details */}
        <Grid item xs={12} md={showChat ? 6 : 12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('document.details')}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                {t('document.download')}
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('document.uploadDate')}
                </Typography>
                <Typography variant="body1">
                  {formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true })}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('document.fileSize')}
                </Typography>
                <Typography variant="body1">
                  {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('document.sensitivity')}
                </Typography>
                <Chip 
                  label={document.sensitivityLevel} 
                  color={getSensitivityColor(document.sensitivityLevel)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('document.aiConfidence')}
                </Typography>
                <Typography variant="body1">
                  {document.aiConfidence ? `${(document.aiConfidence * 100).toFixed(1)}%` : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('document.tags')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {document.tags?.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('document.allowedRoles')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {document.allowedRoles?.map((role, index) => (
                    <Chip key={index} label={role} size="small" color="primary" />
                  ))}
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              {t('document.summary')}
            </Typography>
            
            <ToggleButtonGroup
              value={selectedLanguage}
              exclusive
              onChange={(e, value) => value && setSelectedLanguage(value)}
              size="small"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="en">English</ToggleButton>
              <ToggleButton value="ml">മലയാളം</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedLanguage === 'ml' && document.summaryMl 
                ? document.summaryMl 
                : document.summaryEn || t('document.noSummary')}
            </Typography>
          </Paper>
        </Grid>

        {/* Chat Interface */}
        {showChat && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '600px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('document.chat')}
                </Typography>
                <ToggleButtonGroup
                  value={selectedLanguage}
                  exclusive
                  onChange={(e, value) => value && setSelectedLanguage(value)}
                  size="small"
                >
                  <ToggleButton value="en">EN</ToggleButton>
                  <ToggleButton value="ml">ML</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                <List>
                  {chatMessages.map((message, index) => (
                    <ListItem key={index} sx={{ 
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                      px: 0
                    }}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          maxWidth: '80%',
                          bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100',
                          color: message.type === 'user' ? 'primary.contrastText' : 'text.primary'
                        }}
                      >
                        <ListItemText 
                          primary={message.content}
                          sx={{ m: 0 }}
                        />
                      </Paper>
                    </ListItem>
                  ))}
                  {chatLoading && (
                    <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
                      <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                        <CircularProgress size={20} />
                      </Paper>
                    </ListItem>
                  )}
                </List>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder={t('document.askQuestion')}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  multiline
                  maxRows={3}
                  disabled={chatLoading}
                />
                <IconButton 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || chatLoading}
                  color="primary"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default DocumentView;
