import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Mic,
  VolumeUp,
  Translate,
  PlayArrow,
  Add,
  Star,
  Timeline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { models } = useAppSelector((state) => state.voice) as any;

  const stats = [
    {
      title: 'Voice Models',
      value: models.length,
      icon: <Mic />,
      color: '#6366f1',
      action: () => navigate('/library'),
    },
    {
      title: 'Processing Time',
      value: '< 30s',
      icon: <Timeline />,
      color: '#f59e0b',
    },
    {
      title: 'Quality Score',
      value: '98.5%',
      icon: <Star />,
      color: '#10b981',
    },
    {
      title: 'Languages',
      value: '12',
      icon: <Translate />,
      color: '#8b5cf6',
    },
  ];

  const quickActions = [
    {
      title: 'Clone New Voice',
      description: 'Upload audio and create a new voice model',
      icon: <Mic />,
      action: () => navigate('/voice-cloning'),
      color: '#6366f1',
    },
    {
      title: 'Real-time Processing',
      description: 'Start live voice conversion',
      icon: <VolumeUp />,
      action: () => navigate('/real-time'),
      color: '#f59e0b',
    },
    {
      title: 'Voice Library',
      description: 'Manage your voice models',
      icon: <VolumeUp />,
      action: () => navigate('/library'),
      color: '#10b981',
    },
  ];

  const recentModels = models.slice(0, 3);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your AI-powered voice cloning workspace
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: stat.action ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': stat.action ? { transform: 'translateY(-4px)' } : {},
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                        border: `1px solid ${action.color}20`,
                      }}
                      onClick={action.action}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: action.color, 
                            mx: 'auto', 
                            mb: 2,
                            width: 56,
                            height: 56,
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Models */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Recent Models
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/voice-cloning')}
                >
                  Add New
                </Button>
              </Box>
              
              {recentModels.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentModels.map((model: any) => (
                    <Box key={model.id} sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <Mic />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {model.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={model.language} 
                            size="small" 
                            sx={{ bgcolor: 'primary.main', color: 'white' }}
                          />
                          <Chip 
                            label={model.quality} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <IconButton size="small">
                        <PlayArrow />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No voice models yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/voice-cloning')}
                  >
                    Create Your First Model
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Subscription Info */}
      {user?.subscriptionTier && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.subscriptionTier === 'free' && 'Upgrade to unlock unlimited voice cloning'}
                  {user.subscriptionTier === 'premium' && 'Enjoy advanced features and higher quality'}
                  {user.subscriptionTier === 'enterprise' && 'Full access to all enterprise features'}
                </Typography>
              </Box>
              {user.subscriptionTier === 'free' && (
                <Button variant="contained" color="secondary">
                  Upgrade Now
                </Button>
              )}
            </Box>
            {user.subscriptionTier === 'free' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Monthly Usage: 3/5 voice models
                </Typography>
                <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default HomePage;