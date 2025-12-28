import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Switch, FormControlLabel, Button } from '@mui/material';
import { Settings as SettingsIcon, Person, Security, Notifications, Language } from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
        Settings ⚙️
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Customize your voice cloning experience
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Profile Settings
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Show profile publicly"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Allow others to clone my voice"
                />
                <Button variant="outlined" fullWidth>
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Processing complete alerts"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Weekly usage reports"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Security & Privacy
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Two-factor authentication"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Encrypt voice data"
                />
                <Button variant="outlined" fullWidth>
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Language sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Language & Region
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Auto-detect language"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Use regional accents"
                />
                <Button variant="outlined" fullWidth>
                  Language Preferences
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;