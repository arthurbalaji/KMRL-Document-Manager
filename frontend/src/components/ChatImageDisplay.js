import React, { useState } from 'react';
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
  Skeleton
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ChatImageDisplay = ({ images, documentId }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  const getImageUrl = (imageId) => {
    const url = `/api/documents/ai-service/images/${documentId}/${imageId}`;
    console.log('Generated image URL:', url); // Debug log
    return url;
  };

  const handleImageLoad = (imageId) => {
    console.log('Image loaded successfully:', imageId); // Debug log
    setLoadingImages(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageError = (imageId, error) => {
    console.error('Image failed to load:', imageId, error); // Debug log
    setLoadingImages(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoadStart = (imageId) => {
    console.log('Image loading started:', imageId); // Debug log
    setLoadingImages(prev => ({ ...prev, [imageId]: true }));
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
            <CardMedia
              component="img"
              height="80"
              src={getImageUrl(image.id)}
              alt={`${t('imageFromPage', { page: image.page || 'unknown' })}`}
              sx={{ 
                objectFit: 'contain', 
                bgcolor: 'grey.100',
                display: loadingImages[image.id] ? 'none' : 'block'
              }}
              onLoad={() => handleImageLoad(image.id)}
              onError={() => handleImageError(image.id)}
              onLoadStart={() => handleImageLoadStart(image.id)}
            />
            <CardContent sx={{ p: 0.5 }}>
              <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                {t('imageFromPage', { page: image.page || 'N/A' })}
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
            {selectedImage && t('imageFromPage', { page: selectedImage.page || 'N/A' })}
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
          {selectedImage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <img
                src={getImageUrl(selectedImage.id)}
                alt={`${t('imageFromPage', { page: selectedImage.page || 'unknown' })}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChatImageDisplay;