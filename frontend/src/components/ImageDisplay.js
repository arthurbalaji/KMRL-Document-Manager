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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ImageDisplay = ({ images, title }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('noImagesFound')}
        </Typography>
      </Box>
    );
  }

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title} ({images.length})
        </Typography>
      )}
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
        {images.map((image, index) => (
          <Card 
            key={image.id || index} 
            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
            onClick={() => handleImageClick(image)}
          >
            <CardMedia
              component="img"
              height="120"
              image={`data:image/png;base64,${image.imageData}`}
              alt={`${t('imageFromPage', { page: image.pageNumber || 'unknown' })}`}
              sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
            />
            <CardContent sx={{ p: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                {t('imageFromPage', { page: image.pageNumber || 'N/A' })}
              </Typography>
              {image.languagesDetected && image.languagesDetected.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {image.languagesDetected.map((lang, idx) => (
                    <Chip
                      key={idx}
                      label={lang === 'en' ? 'EN' : lang === 'ml' ? 'ML' : lang}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.6rem', height: '16px' }}
                    />
                  ))}
                </Box>
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
          {selectedImage && t('imageFromPage', { page: selectedImage.pageNumber || 'N/A' })}
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img
                  src={`data:image/png;base64,${selectedImage.imageData}`}
                  alt={t('viewFullImage')}
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              </Box>
              
              {selectedImage.textContent && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">{t('ocrText')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontFamily: selectedImage.languagesDetected?.includes('ml') ? '"Noto Sans Malayalam", sans-serif' : 'inherit'
                      }}
                    >
                      {selectedImage.textContent}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {selectedImage.languagesDetected && selectedImage.languagesDetected.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('languagesDetected')}:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedImage.languagesDetected.map((lang, idx) => (
                      <Chip
                        key={idx}
                        label={lang === 'en' ? 'English' : lang === 'ml' ? 'മലയാളം' : lang}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {selectedImage.confidenceScore && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OCR Confidence: {(selectedImage.confidenceScore * 100).toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ImageDisplay;