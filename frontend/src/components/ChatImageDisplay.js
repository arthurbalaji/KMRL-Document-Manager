import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const ChatImageDisplay = ({ images, documentId, isGlobalChat = false }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [dialogImageLoading, setDialogImageLoading] = useState(false);

  useEffect(() => {
    // Load images with authentication
    const loadAuthenticatedImages = async () => {
      if (!images || images.length === 0) return;
      
      for (const image of images) {
        if (!imageUrls[image.id]) {
          await loadImageWithAuth(image);
        }
      }
    };
    
    loadAuthenticatedImages();
  }, [images, documentId, isGlobalChat]);

  const loadImageWithAuth = async (image) => {
    try {
      setLoadingImages(prev => ({ ...prev, [image.id]: true }));
      
      const docId = isGlobalChat ? image.document_id : documentId;
      const url = `/documents/ai-service/images/${docId}/${image.id}`;
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      // Create object URL from blob
      const objectUrl = URL.createObjectURL(response.data);
      setImageUrls(prev => ({ ...prev, [image.id]: objectUrl }));
      
    } catch (error) {
      console.error('Failed to load image:', image.id, error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [image.id]: false }));
    }
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageClick = async (image) => {
    console.log('Image clicked:', image.id); // Debug log
    console.log('Current imageUrls:', imageUrls); // Debug log
    setSelectedImage(image);
    setDialogImageLoading(true);
    
    // Always load a fresh authenticated image for the dialog to ensure it works
    console.log('Loading fresh authenticated image for dialog:', image.id); // Debug log
    await loadImageWithAuth(image);
    setDialogImageLoading(false);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
    setDialogImageLoading(false);
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        mt: 1,
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {images.map((image, index) => (
          <Card 
            key={image.id || index} 
            sx={{ 
              width: '120px',
              cursor: 'pointer', 
              transition: 'transform 0.2s', 
              '&:hover': { transform: 'scale(1.05)' },
              border: '1px solid #ddd'
            }}
            onClick={() => handleImageClick(image)}
          >
            {loadingImages[image.id] && (
              <Skeleton variant="rectangular" height={80} />
            )}
            {imageUrls[image.id] && !loadingImages[image.id] && (
              <CardMedia
                component="img"
                height="80"
                src={imageUrls[image.id]}
                alt={`${t('imageFromPage', { page: image.page || 'unknown' })}`}
                sx={{ 
                  objectFit: 'contain', 
                  bgcolor: 'grey.100'
                }}
              />
            )}
            {!imageUrls[image.id] && !loadingImages[image.id] && (
              <Box 
                sx={{ 
                  height: 80, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.100'
                }}
              >
                <ImageIcon sx={{ color: 'grey.400' }} />
              </Box>
            )}
            <CardContent sx={{ p: 0.5 }}>
              <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                {isGlobalChat && image.document_filename ? (
                  <>
                    {image.document_filename} - {t('imageFromPage', { page: image.page || 'N/A' })}
                  </>
                ) : (
                  t('imageFromPage', { page: image.page || 'N/A' })
                )}
              </Typography>
              {image.relevance_score && (
                <Chip
                  label={`${Math.round(image.relevance_score * 100)}%`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: '0.6rem', height: '16px', mt: 0.5 }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Full size image dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon />
            {selectedImage && (
              isGlobalChat && selectedImage.document_filename ? (
                `${selectedImage.document_filename} - ${t('imageFromPage', { page: selectedImage.page || 'N/A' })}`
              ) : (
                t('imageFromPage', { page: selectedImage.page || 'N/A' })
              )
            )}
            {selectedImage && selectedImage.relevance_score && (
              <Chip
                label={`${Math.round(selectedImage.relevance_score * 100)}% ${t('relevant')}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage && imageUrls[selectedImage.id] && !dialogImageLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <img
                src={imageUrls[selectedImage.id]}
                alt={`${isGlobalChat && selectedImage.document_filename ? 
                  `${selectedImage.document_filename} - ` : ''}${t('imageFromPage', { page: selectedImage.page || 'unknown' })}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
                onLoad={() => console.log('Dialog image loaded')} // Debug log
                onError={(e) => console.error('Dialog image load error:', e)} // Debug log
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                {t('loadingImage')}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChatImageDisplay;