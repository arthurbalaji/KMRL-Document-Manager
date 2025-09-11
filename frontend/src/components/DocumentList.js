import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  IconButton,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Autorenew as ReprocessIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const DocumentList = ({ onDocumentSelect }) => {
  const { t } = useTranslation();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'QUARANTINED': return 'warning';
      case 'ARCHIVED': return 'default';
      default: return 'default';
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

  if (loading && documents.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('documents.title')}
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder={t('documents.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
        />
        <IconButton 
          onClick={fetchDocuments} 
          color="primary"
          title="Refresh documents"
          disabled={loading}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('documents.filename')}</TableCell>
                <TableCell>{t('documents.uploadDate')}</TableCell>
                {user?.role === 'ADMIN' && <TableCell>Status</TableCell>}
                <TableCell>{t('documents.sensitivity')}</TableCell>
                <TableCell>{t('documents.tags')}</TableCell>
                <TableCell align="center">{t('documents.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {doc.originalFilename}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.summaryEn?.substring(0, 100)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(doc.uploadDate), { addSuffix: true })}
                  </TableCell>
                  {user?.role === 'ADMIN' && (
                    <TableCell>
                      <Chip 
                        label={doc.status} 
                        color={getStatusColor(doc.status)}
                        size="small"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip 
                      label={doc.sensitivityLevel} 
                      color={getSensitivityColor(doc.sensitivityLevel)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {doc.tags?.slice(0, 3).map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                      {doc.tags?.length > 3 && (
                        <Chip label={`+${doc.tags.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => onDocumentSelect(doc.id)}
                      color="primary"
                      title={t('documents.view')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDownload(doc.id, doc.originalFilename)}
                      color="secondary"
                      title={t('documents.download')}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => onDocumentSelect(doc.id)}
                      color="info"
                      title={t('documents.chat')}
                    >
                      <ChatIcon />
                    </IconButton>
                    {user?.role === 'ADMIN' && (
                      <>
                        <IconButton 
                          onClick={() => openStatusDialog(doc)}
                          color="warning"
                          title="Change Status"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleReprocessDocument(doc.id)}
                          color="info"
                          title="Reprocess with AI"
                        >
                          <ReprocessIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => openDeleteDialog(doc)}
                          color="error"
                          title="Delete Document"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Document Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="QUARANTINED">Quarantined</MenuItem>
              <MenuItem value="ARCHIVED">Archived</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{selectedDocument?.originalFilename}"? 
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteDocument} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentList;
