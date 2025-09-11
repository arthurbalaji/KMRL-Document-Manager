import React, { useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div">
            {t('uploadDocument')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            {t('uploadDocument')}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              padding: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? '#f5f5f5' : 'transparent',
              '&:hover': {
                backgroundColor: '#f9f9f9',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            
            {uploading ? (
              <Box>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6">
                  {t('processing')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  AI is analyzing your document...
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {isDragActive
                    ? 'Drop the file here...'
                    : t('selectFile')
                  }
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('supportedFormats')}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  disabled={uploading}
                >
                  {t('selectFile')}
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              What happens after upload:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>AI extracts text from your document (OCR if needed)</li>
              <li>Generates bilingual summaries (English & Malayalam)</li>
              <li>Automatically tags and categorizes content</li>
              <li>Determines appropriate role-based access</li>
              <li>Assigns sensitivity level and retention period</li>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
