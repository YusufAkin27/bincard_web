import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DirectionsBus as BusIcon,
  CreditCard as CardIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  AccountBalanceWallet as WalletIcon,
  LocalActivity as TicketIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    navigate('/login');
  };

  const drawerWidth = 240;

  const menuItems = [
    { text: 'Ana Sayfa', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Otobüs Seferleri', icon: <BusIcon />, path: '/routes' },
    { text: 'Kartlarım', icon: <CardIcon />, path: '/cards' },
    { text: 'Geçmiş İşlemler', icon: <HistoryIcon />, path: '/history' },
  ];

  const cards = [
    {
      title: 'Bakiye',
      value: '₺150,00',
      icon: <WalletIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      action: 'Bakiye Yükle',
      color: 'linear-gradient(135deg, #1976d2 30%, #64b5f6 100%)',
    },
    {
      title: 'Aktif Biletler',
      value: '2 Bilet',
      icon: <TicketIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      action: 'Biletleri Görüntüle',
      color: 'linear-gradient(135deg, #43cea2 30%, #185a9d 100%)',
    },
    {
      title: 'Puanlar',
      value: '120',
      icon: <StarIcon sx={{ fontSize: 40, color: '#ffb300' }} />,
      action: 'Puanları Kullan',
      color: 'linear-gradient(135deg, #ffb300 30%, #ffd54f 100%)',
    },
  ];

  const recentTransactions = [
    { id: 1, type: 'Bilet Alımı', amount: '-₺3,50', date: '2024-02-20', route: '500T Tuzla-Kadıköy' },
    { id: 2, type: 'Bakiye Yükleme', amount: '+₺50,00', date: '2024-02-19', route: '-' },
    { id: 3, type: 'Bilet Alımı', amount: '-₺3,50', date: '2024-02-19', route: '500T Kadıköy-Tuzla' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: '#1976d2', fontWeight: 900, letterSpacing: 1 }}>
            BinCard Dashboard
          </Typography>
          <Tooltip title="Profil">
            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
                <PersonIcon fontSize="large" />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#f8f9fa',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  mb: 1,
                  mx: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#1976d2' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'transparent',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)', color: 'white', boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: 1 }}>
              Hoş Geldin, Kullanıcı!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Akıllı bilet ve kart yönetim paneline hoş geldin. Buradan bakiyeni, biletlerini ve geçmiş işlemlerini kolayca yönetebilirsin.
            </Typography>
          </Paper>
          <Grid container spacing={3}>
            {cards.map((card, idx) => (
              <Grid item xs={12} sm={6} md={4} key={card.title}>
                <Fade in timeout={600 + idx * 200}>
                  <Card
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      background: card.color,
                      color: 'white',
                      height: '100%',
                      boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.10)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {card.icon}
                        <Typography variant="h6" sx={{ ml: 2, fontWeight: 700, letterSpacing: 0.5 }}>
                          {card.title}
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                        {card.value}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'none',
                          letterSpacing: 0.5,
                          transition: '0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.10)',
                            color: '#fff',
                          },
                        }}
                        fullWidth
                      >
                        {card.action}
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.06)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 700 }}>
                  Son İşlemler
                </Typography>
                {recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {transaction.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.route}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: transaction.amount.startsWith('+') ? 'success.main' : 'error.main',
                            fontWeight: 700,
                          }}
                        >
                          {transaction.amount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.date}
                        </Typography>
                      </Box>
                    </Box>
                    {index < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profil" />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Çıkış Yap" />
        </MenuItem>
      </Menu>

      <ToastContainer />
    </Box>
  );
};

export default Dashboard;
