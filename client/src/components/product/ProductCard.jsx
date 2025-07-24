import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, IconButton, Box, Rating } from '@mui/material';
import { motion } from 'framer-motion';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { OptimizedImage } from '../../utils/imageOptimizer';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        hover: { y: -5, transition: { duration: 0.2 } }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
        >
            <Card 
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover .product-actions': {
                        opacity: 1
                    }
                }}
            >
                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                        <OptimizedImage
                            src={product.images[0]}
                            alt={product.name}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                            }}
                            sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                        />
                    </Box>
                </Link>

                <Box
                    className="product-actions"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 1,
                        padding: 0.5
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToCart(product);
                        }}
                        sx={{ 
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark'
                            }
                        }}
                    >
                        <ShoppingCartIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToWishlist(product);
                        }}
                        sx={{ 
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'error.dark'
                            }
                        }}
                    >
                        <FavoriteIcon fontSize="small" />
                    </IconButton>
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography 
                        variant="h6" 
                        component="h2"
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={product.rating} precision={0.5} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary">
                            ({product.numReviews})
                        </Typography>
                    </Box>

                    <Typography 
                        variant="h6" 
                        color="primary"
                        sx={{ 
                            marginTop: 'auto',
                            fontWeight: 600
                        }}
                    >
                        ₹{product.price.toLocaleString('en-IN')}
                    </Typography>

                    {product.countInStock === 0 && (
                        <Typography 
                            variant="body2" 
                            color="error"
                            sx={{ fontWeight: 500 }}
                        >
                            Out of Stock
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default React.memo(ProductCard); 