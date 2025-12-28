import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Chip, Avatar, IconButton } from '@mui/material';
import { Mic, PlayArrow, Delete, Download, Share, Add } from '@mui/icons-material';
import { useAppSelector } from '../../hooks/reduxHooks';

const VoiceLibraryPage: React.FC = () => {
  const { models } = useAppSelector((state) => state.voice) as any;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
            Voice Library 📚
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your voice models and samples
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>
          Add New Model
        </Button>
      </Box>

      {models.length > 0 ? (
        <Grid container spacing={3}>
          {models.map((model: any) => (
            <Grid item xs={12} sm={6} md={4} key={model.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Mic />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {model.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {model.language} • {model.gender}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={model.quality} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    {model.isPublic && (
                      <Chip 
                        label="Public" 
                        color="success" 
                        size="small" 
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {model.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <IconButton size="small" color="primary">
                        <PlayArrow />
                      </IconButton>
                      <IconButton size="small">
                        <Download />
                      </IconButton>
                      <IconButton size="small">
                        <Share />
                      </IconButton>
                    </Box>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Mic sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              No Voice Models Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first voice model to get started with voice cloning
            </Typography>
            <Button variant="contained" startIcon={<Add />}>
              Create Your First Model
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default VoiceLibraryPage;