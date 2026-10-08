const express = require('express');
const router = express.Router();
const prisma = require('./config/prisma');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const vehicleRoutes = require('./routes/vehicle.routes');

router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      success: true, 
      message: 'API is running successfully.',
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: 'API is running, but database connection failed.',
      error: error.message
    });
  }
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/vehicles', vehicleRoutes);

module.exports = router;
