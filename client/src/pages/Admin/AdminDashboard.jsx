import {
  Star as StarIcon
} from '@mui/icons-material';

<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    <Card
      onClick={() => navigate('/admin/featured')}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StarIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6">Featured Products</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage featured products for each category on the home page
        </Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid> 