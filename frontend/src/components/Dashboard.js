import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
} from '@mui/material';
import {
  UploadFile,
  Description,
  Search,
  Chat,
  Logout,
  Language,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ml' : 'en';
    i18n.changeLanguage(newLang);
  };

  const menuItems = [
    {
      title: t('documents'),
      description: 'View and manage documents',
      icon: <Description fontSize="large" />,
      action: () => navigate('/documents'),
    },
    {
      title: t('upload'),
      description: 'Upload new documents',
      icon: <UploadFile fontSize="large" />,
      action: () => navigate('/upload'),
    },
    {
      title: t('globalSearch'),
      description: 'AI-powered analysis across all documents',
      icon: <Search fontSize="large" />,
      action: () => navigate('/search'),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            KMRL Document Management
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.fullName} ({user?.role})
          </Typography>
          <IconButton color="inherit" onClick={changeLanguage}>
            <Language />
          </IconButton>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            {t('logout')}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard')}
        </Typography>
        
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {t('welcome')}, {user?.fullName}!
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button size="large" variant="contained" onClick={item.action}>
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
