import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DiamondIcon from '@mui/icons-material/Diamond';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ParkIcon from '@mui/icons-material/Park';
import StyleIcon from '@mui/icons-material/Style';
import StarIcon from '@mui/icons-material/Star';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalMallIcon from '@mui/icons-material/LocalMall';

// Premium image imports
const heroImage = 'http://res.cloudinary.com/dibb74win/image/upload/v1739548336/sigma-clothing/about/k45c6tsjpzoe7p81orip.png';
const storyImage = 'http://res.cloudinary.com/dibb74win/image/upload/v1739548336/sigma-clothing/about/k45c6tsjpzoe7p81orip.png';
const luxuryPatternBg = 'https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=2039&auto=format&fit=crop';

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Add smooth scroll behavior and remove navbar margin
    const html = document.documentElement;
    const body = document.body;
    const navbar = document.querySelector('header'); // Assuming the navbar is in a header tag
    
    if (navbar) {
      navbar.style.marginBottom = '0';
    }
    
    html.style.scrollBehavior = 'smooth';
    body.style.scrollBehavior = 'smooth';
    
    return () => {
      html.style.scrollBehavior = 'auto';
      body.style.scrollBehavior = 'auto';
      if (navbar) {
        navbar.style.marginBottom = ''; // Reset to default on unmount
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const scrollToStory = (e) => {
    e.preventDefault();
    const storySection = document.getElementById('our-story');
    const headerOffset = 0;
    const elementPosition = storySection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const processSteps = [
    {
      icon: <AutoAwesomeIcon />,
      title: 'Concept & Design',
      description: 'Inspired by timeless fashion trends',
    },
    {
      icon: <DiamondIcon />,
      title: 'Premium Materials',
      description: 'Carefully selected, ethically sourced fabrics',
    },
    {
      icon: <StyleIcon />,
      title: 'Expert Craftsmanship',
      description: 'Precision tailoring and attention to detail',
    },
    {
      icon: <LocalShippingIcon />,
      title: 'Delivered to You',
      description: 'Effortless shopping, fast shipping',
    },
  ];

  const values = [
    {
      icon: <StarIcon />,
      title: 'Timeless Design',
      description: 'Fashion that never fades',
    },
    {
      icon: <DiamondIcon />,
      title: 'Premium Craftsmanship',
      description: 'Quality that speaks for itself',
    },
    {
      icon: <ParkIcon />,
      title: 'Sustainable Approach',
      description: 'Ethical, eco-friendly materials',
    },
    {
      icon: <VerifiedUserIcon />,
      title: 'Effortless Luxury',
      description: 'Comfort meets sophistication',
    },
  ];

  const whyChooseUsItems = [
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Global Community',
      text: '10,000+ satisfied customers worldwide',
      stat: '10K+',
      description: 'Join our growing family of fashion enthusiasts who trust in our quality and style.',
    },
    {
      icon: <ParkIcon sx={{ fontSize: 40 }} />,
      title: 'Sustainable Fashion',
      text: '100% ethical production',
      stat: '100%',
      description: 'Every piece is crafted with respect for the environment and our artisans.',
    },
    {
      icon: <LocalMallIcon sx={{ fontSize: 40 }} />,
      title: 'Premium Quality',
      text: 'Luxury craftsmanship',
      stat: '5★',
      description: 'Meticulously designed and crafted for durability and timeless elegance.',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: 'Dedicated Support',
      text: '24/7 customer service',
      stat: '24/7',
      description: 'Our expert team is always here to assist you with any questions or concerns.',
    },
  ];

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.default', 
        color: 'text.primary',
        position: 'relative',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        '& header': {
          marginBottom: 0,
        },
      }}
    >
      {/* Hero Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          height: '100vh',
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          marginTop: '-64px', // Offset the navbar height
          marginBottom: '32px', // Reduced bottom margin
          paddingTop: '64px', // Add padding to compensate for navbar height
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            textAlign: 'center',
            color: 'white',
            p: 4,
            maxWidth: '800px',
          }}
        >
          <Typography
            variant="h1"
            component={motion.h1}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 'bold',
              mb: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: 0,
              padding: 0,
            }}
          >
            Redefining Elegance,
            <br />
            One Stitch at a Time
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={scrollToStory}
            sx={{
              borderWidth: 2,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              letterSpacing: '0.1em',
              mt: 4,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
            endIcon={<KeyboardArrowDownIcon />}
          >
            Explore Our Story
          </Button>
        </Box>
      </Box>

      {/* Our Story Section */}
      <Box
        id="our-story"
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        sx={{ 
          position: 'relative',
          width: '100vw',
          height: '100vh',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.6)), url(${luxuryPatternBg})`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          color: 'white',
          zIndex: 1,
        }}
      >
        <Container 
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box component={motion.div} variants={itemVariants}>
                <Typography 
                  variant="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Our Story
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  At Sigma Clothing, we craft timeless fashion that blends sophistication with modern trends. 
                  Our commitment to premium materials and exceptional craftsmanship ensures that every piece 
                  reflects elegance and durability.
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  Designed for those who appreciate luxury and comfort, Sigma Clothing is more than just 
                  fashion—it's an experience that transforms the ordinary into extraordinary.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{
                  height: { xs: '300px', md: '500px' },
                  backgroundImage: `url(${storyImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '4px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  transform: 'perspective(1000px) rotateY(-5deg)',
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(0deg)',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Process Section */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Our Process
          </Typography>
          <Grid container spacing={4}>
            {processSteps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  component={motion.div}
                  variants={itemVariants}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    bgcolor: 'background.default',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent>
                    <IconButton
                      sx={{
                        mb: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      {step.icon}
                    </IconButton>
                    <Typography variant="h6" gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        sx={{ py: { xs: 8, md: 12 } }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Our Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  component={motion.div}
                  variants={itemVariants}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    bgcolor: 'background.default',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <CardContent>
                    <IconButton
                      sx={{
                        mb: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      {value.icon}
                    </IconButton>
                    <Typography variant="h6" gutterBottom>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section - Enhanced */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        sx={{ 
          pt: { xs: 8, md: 12 },
          pb: { xs: 4, md: 6 },
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ 
              mb: 8,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Why Choose Us
          </Typography>
          <Grid container spacing={4}>
            {whyChooseUsItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  component={motion.div}
                  variants={itemVariants}
                  elevation={3}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      marginBottom: 3,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      mb: 1,
                      color: 'primary.main',
                    }}
                  >
                    {item.stat}
                  </Typography>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default About; 