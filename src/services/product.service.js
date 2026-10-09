const prisma = require('../config/prisma');

const createProduct = async (data, userId) => {
  const { variantId, glassPosition, openingStock, minStockLevel, ...productData } = data;
  const sku = 'GLS-' + Date.now().toString().slice(-8);

  return prisma.$transaction(async (tx) => {
    // 1. Create Product
    const product = await tx.product.create({ 
      data: { ...productData, sku } 
    });

    // 2. Link to Vehicle Variant
    await tx.vehicleGlass.create({
      data: {
        productId: product.id,
        variantId,
        glassPosition
      }
    });

    // 3. Setup Inventory
    await tx.inventory.create({
      data: {
        productId: product.id,
        quantity: openingStock || 0,
        minStockLevel: minStockLevel || 0
      }
    });

    // 4. Log Stock Movement
    if (openingStock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          movementType: 'OPENING_STOCK',
          quantity: openingStock,
          remarks: 'Initial stock on product creation',
          createdById: userId
        }
      });
    }

    // Return complete product record
    return tx.product.findUnique({
      where: { id: product.id },
      include: {
        inventory: true,
        vehicleGlasses: { include: { variant: true } }
      }
    });
  });
};

const getAllProducts = async (search) => {
  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      {
        vehicleGlasses: {
          some: {
            variant: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { model: { name: { contains: search, mode: 'insensitive' } } },
                { model: { brand: { name: { contains: search, mode: 'insensitive' } } } }
              ]
            }
          }
        }
      }
    ]
  } : {};
  
  return prisma.product.findMany({ 
    where, 
    include: { 
      inventory: true,
      vehicleGlasses: {
        include: {
          variant: {
            include: {
              model: {
                include: { brand: true }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getProductById = async (id) => {
  return prisma.product.findUnique({ 
    where: { id }, 
    include: { inventory: true, vehicleGlasses: { include: { variant: true } } } 
  });
};

const updateProduct = async (id, data) => {
  return prisma.product.update({ 
    where: { id }, 
    data,
    include: { inventory: true }
  });
};

const deleteProduct = async (id) => {
  return prisma.product.delete({ where: { id } });
};

const addVehicleCompatibility = async (productId, data) => {
  return prisma.vehicleGlass.create({
    data: {
      productId,
      variantId: data.variantId,
      glassPosition: data.glassPosition
    },
    include: { variant: { include: { model: { include: { brand: true } } } } }
  });
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addVehicleCompatibility,
};
