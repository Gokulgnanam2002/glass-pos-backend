const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB Seed... This will create exactly 10 records for each table.');

  // Clean the database first to avoid unique constraint errors during re-seeding
  await prisma.stockMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.vehicleGlass.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vehicleVariant.deleteMany();
  await prisma.vehicleModel.deleteMany();
  await prisma.vehicleBrand.deleteMany();
  await prisma.vehicleCategory.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users (10 Records)
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = [];
  users.push(await prisma.user.create({ data: { name: 'Admin Super', email: 'admin@glasspos.com', phone: '1234567890', passwordHash, role: 'ADMIN' } }));
  for (let i = 1; i <= 9; i++) {
    users.push(await prisma.user.create({ data: { name: `Staff ${i}`, email: `staff${i}@glasspos.com`, phone: `987654321${i}`, passwordHash, role: 'STAFF' } }));
  }
  const adminId = users[0].id;

  // 2. Categories (10 Records)
  const categoryNames = ['Car', 'Van', 'Auto', 'Lorry', 'Bus', 'Tractor', 'Crane', 'JCB', 'Mini Truck', 'Tempo'];
  const categories = [];
  for (let i = 0; i < 10; i++) {
    categories.push(await prisma.vehicleCategory.create({
      data: { name: categoryNames[i], code: `CAT-${i+1}` }
    }));
  }

  // 3. Brands (10 Records)
  const brandNames = ['Hyundai', 'Honda', 'Toyota', 'Ford', 'Maruti Suzuki', 'Mahindra', 'Tata', 'Kia', 'Volkswagen', 'Skoda'];
  const brands = [];
  for (let i = 0; i < 10; i++) {
    brands.push(await prisma.vehicleBrand.create({
      data: { categoryId: categories[i % categories.length].id, name: brandNames[i], code: brandNames[i].substring(0,3).toUpperCase() }
    }));
  }

  // 4. Models (10 Records)
  const modelNames = ['Santro', 'City', 'Innova', 'Endeavour', 'Swift', 'XUV700', 'Nexon', 'Seltos', 'Polo', 'Slavia'];
  const models = [];
  for (let i = 0; i < 10; i++) {
    models.push(await prisma.vehicleModel.create({
      data: { brandId: brands[i].id, name: modelNames[i], code: `MOD-${i+1}` }
    }));
  }

  // 5. Variants (10 Records)
  const variants = [];
  for (let i = 0; i < 10; i++) {
    variants.push(await prisma.vehicleVariant.create({
      data: { modelId: models[i].id, name: `Gen ${i+1}`, code: `VAR-${i+1}`, yearFrom: 2010 + i, yearTo: 2015 + i }
    }));
  }

  const positions = ['FRONT_WINDSHIELD', 'REAR_WINDSHIELD', 'FRONT_DOOR_LEFT', 'FRONT_DOOR_RIGHT', 'REAR_DOOR_LEFT', 'REAR_DOOR_RIGHT', 'QUARTER_GLASS_LEFT', 'QUARTER_GLASS_RIGHT', 'SUNROOF', 'FRONT_WINDSHIELD'];
  const products = [];
  for (let i = 0; i < 10; i++) {
    products.push(await prisma.product.create({
      data: {
        sku: `GLS-100${i}`,
        name: `${modelNames[i]} ${positions[i].replace(/_/g, ' ')}`,
        productType: 'GLASS',
        hsnCode: '70072190',
        purchasePrice: 2000 + (i * 200),
        sellingPrice: 3500 + (i * 300),
        gstRate: 28.00
      }
    }));
  }
  
  // Add an 11th Product specifically for Swift REAR_DOOR_RIGHT
  products.push(await prisma.product.create({
    data: {
      sku: `GLS-1010`,
      name: `Swift REAR DOOR RIGHT`,
      productType: 'GLASS',
      hsnCode: '70072190',
      purchasePrice: 2800,
      sellingPrice: 4700,
      gstRate: 28.00
    }
  }));

  // 7. VehicleGlass (10 Records - Mapping 1-to-1 for seed purposes)
  const vehicleGlasses = [];
  for (let i = 0; i < 10; i++) {
    vehicleGlasses.push(await prisma.vehicleGlass.create({
      data: {
        variantId: variants[i].id,
        productId: products[i].id,
        glassPosition: positions[i]
      }
    }));
  }

  // Map the 11th product to the Swift variant (which is index 4)
  vehicleGlasses.push(await prisma.vehicleGlass.create({
    data: {
      variantId: variants[4].id,
      productId: products[10].id,
      glassPosition: 'REAR_DOOR_RIGHT'
    }
  }));

  // 8. Inventory (10 Records)
  const inventories = [];
  for (let i = 0; i < 10; i++) {
    inventories.push(await prisma.inventory.create({
      data: {
        productId: products[i].id,
        quantity: 15 + i,
        minStockLevel: 5
      }
    }));
  }

  inventories.push(await prisma.inventory.create({
    data: {
      productId: products[10].id,
      quantity: 12,
      minStockLevel: 5
    }
  }));

  // 9. StockMovement (10 Records)
  for (let i = 0; i < 10; i++) {
    await prisma.stockMovement.create({
      data: {
        productId: products[i].id,
        movementType: 'OPENING_STOCK',
        quantity: 15 + i,
        remarks: 'Initial Database Seed',
        createdById: adminId
      }
    });
  }

  await prisma.stockMovement.create({
    data: {
      productId: products[10].id,
      movementType: 'OPENING_STOCK',
      quantity: 12,
      remarks: 'Initial Database Seed',
      createdById: adminId
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
