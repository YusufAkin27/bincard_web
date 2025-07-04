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
    // Implement logout logic here
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
    },
    {
      title: 'Aktif Biletler',
      value: '2 Bilet',
      icon: <TicketIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      action: 'Biletleri Görüntüle',
    },
  ];

  const recentTransactions = [
    { id: 1, type: 'Bilet Alımı', amount: '-₺3,50', date: '2024-02-20', route: '500T Tuzla-Kadıköy' },
    { id: 2, type: 'Bakiye Yükleme', amount: '+₺50,00', date: '2024-02-19', route: '-' },
    { id: 3, type: 'Bilet Alımı', amount: '-₺3,50', date: '2024-02-19', route: '500T Kadıköy-Tuzla' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
          bgcolor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1976d2', fontWeight: 700 }}>
            BinCard
          </Typography>
          <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
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
                    bgcolor: 'rgba(25, 118, 210, 0.04)',
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} sm={6} key={card.title}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'white',
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {card.icon}
                      <Typography variant="h6" sx={{ ml: 2, color: '#1976d2' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        color: '#1976d2',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.04)',
                        },
                      }}
                    >
                      {card.action}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'white',
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>
                  Son İşlemler
                </Typography>
                {recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
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
                            color: transaction.amount.startsWith('+') ? 'success.main' : 'text.primary',
                            fontWeight: 500,
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
