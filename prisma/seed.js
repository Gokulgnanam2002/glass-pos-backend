const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  // Delete in correct relational order to avoid foreign key errors
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.roleDef.deleteMany();
  
  await prisma.payment.deleteMany();
  await prisma.salesInvoiceItem.deleteMany();
  await prisma.insuranceClaim.deleteMany();
  await prisma.salesInvoice.deleteMany();
  await prisma.customer.deleteMany();

  await prisma.supplierPayment.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.supplier.deleteMany();

  await prisma.stockMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.vehicleGlass.deleteMany();
  await prisma.product.deleteMany();
  
  await prisma.vehicleVariant.deleteMany();
  await prisma.vehicleModel.deleteMany();
  await prisma.vehicleBrand.deleteMany();
  await prisma.vehicleCategory.deleteMany();
  
  await prisma.user.deleteMany();

  console.log('Creating Permissions & Roles...');
  // 1. Roles and Permissions
  const pSalesCreate = await prisma.permission.create({ data: { code: 'sales.create', module: 'sales', description: 'Create Sales Invoices' } });
  const pSalesView = await prisma.permission.create({ data: { code: 'sales.view', module: 'sales', description: 'View Sales Invoices' } });
  const pInventoryManage = await prisma.permission.create({ data: { code: 'inventory.manage', module: 'inventory', description: 'Manage Stock' } });
  const pPurchasesManage = await prisma.permission.create({ data: { code: 'purchases.manage', module: 'purchases', description: 'Manage Purchases' } });

  const roleAdmin = await prisma.roleDef.create({
    data: {
      name: 'System Administrator',
      description: 'Full access to all modules',
      rolePermissions: {
        create: [
          { permissionId: pSalesCreate.id },
          { permissionId: pSalesView.id },
          { permissionId: pInventoryManage.id },
          { permissionId: pPurchasesManage.id },
        ]
      }
    }
  });

  const roleCashier = await prisma.roleDef.create({
    data: {
      name: 'Cashier',
      rolePermissions: {
        create: [
          { permissionId: pSalesCreate.id },
          { permissionId: pSalesView.id }
        ]
      }
    }
  });

  console.log('Creating Users...');
  // 2. Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Boss',
      email: 'admin@glasspos.com',
      passwordHash,
      role: 'ADMIN',
      userRoles: { create: { roleId: roleAdmin.id } }
    }
  });

  const staffUser = await prisma.user.create({
    data: {
      name: 'Sales Staff',
      email: 'staff@glasspos.com',
      passwordHash,
      role: 'STAFF',
      userRoles: { create: { roleId: roleCashier.id } }
    }
  });

  console.log('Creating Vehicles...');
  // 3. Vehicles Hierarchy
  const catCar = await prisma.vehicleCategory.create({ data: { name: 'Car', code: 'CAT-CAR' } });
  
  // Brands
  const brandHyundai = await prisma.vehicleBrand.create({ data: { name: 'Hyundai', code: 'HYU', categoryId: catCar.id } });
  const brandHonda = await prisma.vehicleBrand.create({ data: { name: 'Honda', code: 'HON', categoryId: catCar.id } });
  const brandSkoda = await prisma.vehicleBrand.create({ data: { name: 'Skoda', code: 'SKO', categoryId: catCar.id } });
  const brandVW = await prisma.vehicleBrand.create({ data: { name: 'Volkswagen', code: 'VW', categoryId: catCar.id } });

  // Models
  const modelSantro = await prisma.vehicleModel.create({ data: { name: 'Santro', code: 'SAN', brandId: brandHyundai.id } });
  const modelCity = await prisma.vehicleModel.create({ data: { name: 'City', code: 'CIT', brandId: brandHonda.id } });
  const modelRapid = await prisma.vehicleModel.create({ data: { name: 'Rapid', code: 'RAP', brandId: brandSkoda.id } });
  const modelVento = await prisma.vehicleModel.create({ data: { name: 'Vento', code: 'VEN', brandId: brandVW.id } });

  // Variants (Real Indian market variants)
  const varSantro = await prisma.vehicleVariant.create({ data: { name: 'Sportz MT', code: 'SAN-SPT', modelId: modelSantro.id, yearFrom: 2018, yearTo: 2022 } });
  const varCity4 = await prisma.vehicleVariant.create({ data: { name: 'VX MT (4th Gen)', code: 'CIT-VX4', modelId: modelCity.id, yearFrom: 2014, yearTo: 2020 } });
  const varCity5 = await prisma.vehicleVariant.create({ data: { name: 'ZX CVT (5th Gen)', code: 'CIT-ZX5', modelId: modelCity.id, yearFrom: 2020, yearTo: 2026 } });
  const varRapid = await prisma.vehicleVariant.create({ data: { name: 'Style AT', code: 'RAP-STY', modelId: modelRapid.id, yearFrom: 2016, yearTo: 2021 } });
  const varVento = await prisma.vehicleVariant.create({ data: { name: 'Highline Plus', code: 'VEN-HLP', modelId: modelVento.id, yearFrom: 2015, yearTo: 2022 } });

  console.log('Creating Products & Inventory...');
  // 4. Products (Showing cross-compatibility)
  
  // Product 1: Santro Windshield (Only fits 1 car)
  const prodSantro = await prisma.product.create({
    data: {
      name: 'Hyundai Santro Front Windshield',
      sku: 'GLS-SAN-FR',
      hsnCode: '70072190',
      purchasePrice: 2000.00,
      sellingPrice: 3500.00,
      gstRate: 28.00,
      inventory: { create: { quantity: 10, minStockLevel: 5 } },
      stockMovements: {
        create: { movementType: 'OPENING_STOCK', quantity: 10, createdById: adminUser.id, remarks: 'Initial Seed' }
      },
      vehicleGlasses: {
        create: [{ variantId: varSantro.id, glassPosition: 'FRONT_WINDSHIELD' }]
      }
    }
  });

  // Product 2: Rapid / Vento Shared Windshield (Cross-brand compatibility!)
  const prodRapidVento = await prisma.product.create({
    data: {
      name: 'Skoda Rapid / VW Vento Front Windshield',
      sku: 'GLS-RAPVEN-FR',
      hsnCode: '70072190',
      purchasePrice: 3000.00,
      sellingPrice: 5500.00,
      gstRate: 28.00,
      inventory: { create: { quantity: 5, minStockLevel: 2 } },
      stockMovements: {
        create: { movementType: 'OPENING_STOCK', quantity: 5, createdById: adminUser.id, remarks: 'Initial Seed' }
      },
      vehicleGlasses: {
        create: [
          { variantId: varRapid.id, glassPosition: 'FRONT_WINDSHIELD' },
          { variantId: varVento.id, glassPosition: 'FRONT_WINDSHIELD' }
        ]
      }
    }
  });

  // Product 3: Honda City Shared Door Glass (Cross-variant compatibility!)
  const prodCityDoor = await prisma.product.create({
    data: {
      name: 'Honda City Gen4/Gen5 Front Left Door',
      sku: 'GLS-CIT-FLD',
      hsnCode: '70072190',
      purchasePrice: 1500.00,
      sellingPrice: 2800.00,
      gstRate: 28.00,
      inventory: { create: { quantity: 2, minStockLevel: 3 } }, // Low stock!
      stockMovements: {
        create: { movementType: 'OPENING_STOCK', quantity: 2, createdById: adminUser.id, remarks: 'Initial Seed' }
      },
      vehicleGlasses: {
        create: [
          { variantId: varCity4.id, glassPosition: 'FRONT_LEFT_DOOR' },
          { variantId: varCity5.id, glassPosition: 'FRONT_LEFT_DOOR' }
        ]
      }
    }
  });

  console.log('Creating Suppliers & Purchases...');
  // 5. Suppliers and Purchases
  const supplier1 = await prisma.supplier.create({
    data: { name: 'AIS Auto Glass Wholesale', phone: '9876543210', gstin: '29ABCDE1234F1Z5' }
  });

  const purchase = await prisma.purchase.create({
    data: {
      supplierId: supplier1.id,
      invoiceNumber: 'SUP-9912',
      purchaseDate: new Date(),
      status: 'POSTED',
      paymentStatus: 'PAID',
      subTotal: 3000.00,
      taxAmount: 840.00, // 28%
      grandTotal: 3840.00,
      paidAmount: 3840.00,
      items: {
        create: [
          {
            productId: prodRapidVento.id,
            quantity: 1,
            unitPrice: 3000.00,
            hsnCode: '70072190',
            gstRate: 28.00,
            taxAmount: 840.00,
            total: 3840.00
          }
        ]
      },
      payments: {
        create: [{ supplierId: supplier1.id, amount: 3840.00, paymentMethod: 'BANK_TRANSFER' }]
      }
    }
  });

  // Adjust stock for the purchase we just mocked
  await prisma.inventory.update({ where: { productId: prodRapidVento.id }, data: { quantity: { increment: 1 } }});
  await prisma.stockMovement.create({
    data: { productId: prodRapidVento.id, movementType: 'PURCHASE', quantity: 1, referenceType: 'PURCHASE', referenceId: purchase.id, createdById: adminUser.id }
  });

  console.log('Creating Customers & Sales...');
  // 6. Customers and Sales
  const customer1 = await prisma.customer.create({
    data: { name: 'Rahul Sharma', phone: '9988776655' }
  });

  const sale = await prisma.salesInvoice.create({
    data: {
      customerId: customer1.id,
      invoiceNumber: 'INV-2026-27-0001',
      invoiceDate: new Date(),
      status: 'POSTED',
      paymentStatus: 'PARTIAL',
      subTotal: 3500.00,
      taxAmount: 980.00,
      cgstAmount: 490.00,
      sgstAmount: 490.00,
      grandTotal: 4480.00,
      paidAmount: 2000.00,
      items: {
        create: [
          {
            productId: prodSantro.id,
            productName: prodSantro.name,
            sku: prodSantro.sku,
            quantity: 1,
            unitPrice: 3500.00,
            taxableValue: 3500.00,
            gstRate: 28.00,
            cgstAmount: 490.00,
            sgstAmount: 490.00,
            totalAmount: 4480.00
          }
        ]
      },
      payments: {
        create: [{ customerId: customer1.id, amount: 2000.00, paymentMethod: 'CASH' }]
      }
    }
  });

  // Adjust stock for the sale we just mocked
  await prisma.inventory.update({ where: { productId: prodSantro.id }, data: { quantity: { decrement: 1 } }});
  await prisma.stockMovement.create({
    data: { productId: prodSantro.id, movementType: 'SALE', quantity: -1, referenceType: 'SALE_INVOICE', referenceId: sale.id, createdById: staffUser.id }
  });

  console.log('Seed data successfully inserted! ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
