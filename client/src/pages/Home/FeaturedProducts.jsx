import React from 'react';
import { Box, Container, Typography, Grid, Button, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';

const FeaturedProducts = ({ products, imageLoadErrors = {} }) => {
  const navigate = useNavigate();
  const categories = ['men', 'women', 'accessories'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <Box sx={{ py: 2 }}>
      <Container maxWidth="xl">
        {categories.map((category) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  textTransform: 'capitalize',
                  fontWeight: 600,
                }}
              >
                {category}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/shop?category=${category}`)}
              >
                View All
              </Button>
            </Box>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <Grid container spacing={3}>
                {products[category]?.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <motion.div variants={itemVariants}>
                      {imageLoadErrors[product._id] ? (
                        <Box
                          sx={{
                            width: '100%',
                            height: '280px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                          }}
                        >
                          <Skeleton 
                            variant="rectangular" 
                            width="100%" 
                            height="100%" 
                            animation={false}
                          />
                        </Box>
                      ) : (
                        <ProductCard 
                          product={{
                            ...product,
                            imagePosition: product.imagePosition || 'center',
                            imageScale: product.imageScale || 1,
                            imageFit: product.imageFit || 'cover'
                          }} 
                        />
                      )}
                    </motion.div>
                  </Grid>
                ))}
                {(!products[category] || products[category]?.length === 0) && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No featured products in this category yet
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default FeaturedProducts; 