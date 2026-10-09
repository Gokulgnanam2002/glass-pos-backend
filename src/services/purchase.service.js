const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPurchase = async (data, userId) => {
  // data should contain supplierId, invoiceNumber, purchaseDate, subTotal, taxAmount, discount, grandTotal, and items array
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        supplierId: data.supplierId,
        invoiceNumber: data.invoiceNumber,
        purchaseDate: new Date(data.purchaseDate || Date.now()),
        status: 'DRAFT',
        paymentStatus: 'UNPAID',
        subTotal: data.subTotal || 0,
        taxAmount: data.taxAmount || 0,
        discount: data.discount || 0,
        grandTotal: data.grandTotal || 0,
        paidAmount: 0,
      }
    });

    if (data.items && data.items.length > 0) {
      const itemsData = data.items.map(item => ({
        purchaseId: purchase.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        hsnCode: item.hsnCode,
        gstRate: item.gstRate || 0,
        taxAmount: item.taxAmount || 0,
        total: item.total || 0,
      }));
      await tx.purchaseItem.createMany({ data: itemsData });
    }

    return tx.purchase.findUnique({
      where: { id: purchase.id },
      include: { items: true, supplier: true }
    });
  });
};

const postPurchase = async (purchaseId, userId) => {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true }
    });

    if (!purchase) throw new Error('Purchase not found');
    if (purchase.status !== 'DRAFT') throw new Error('Only DRAFT purchases can be posted');

    // 1. Update purchase status
    const updatedPurchase = await tx.purchase.update({
      where: { id: purchaseId },
      data: { status: 'POSTED' }
    });

    // 2. Update Inventory and create StockMovement for each item
    for (const item of purchase.items) {
      // Upsert inventory
      await tx.inventory.upsert({
        where: { productId: item.productId },
        create: {
          productId: item.productId,
          quantity: item.quantity,
          minStockLevel: 5 // Default if newly creating
        },
        update: {
          quantity: { increment: item.quantity }
        }
      });

      // Create StockMovement
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          movementType: 'PURCHASE',
          quantity: item.quantity,
          referenceType: 'PURCHASE',
          referenceId: purchaseId,
          remarks: `Purchase invoice: ${purchase.invoiceNumber || purchaseId}`,
          createdById: userId
        }
      });
    }

    return updatedPurchase;
  });
};

const getAllPurchases = async () => {
  return prisma.purchase.findMany({
    orderBy: { purchaseDate: 'desc' },
    include: { supplier: true }
  });
};

const getPurchaseById = async (id) => {
  return prisma.purchase.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, supplier: true, payments: true }
  });
};

const addPayment = async (purchaseId, data) => {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) throw new Error('Purchase not found');

    const payment = await tx.supplierPayment.create({
      data: {
        supplierId: purchase.supplierId,
        purchaseId: purchase.id,
        amount: data.amount,
        paymentDate: new Date(data.paymentDate || Date.now()),
        paymentMethod: data.paymentMethod,
        referenceNo: data.referenceNo
      }
    });

    const newPaidAmount = Number(purchase.paidAmount) + Number(data.amount);
    let paymentStatus = 'PARTIAL';
    if (newPaidAmount >= Number(purchase.grandTotal)) {
      paymentStatus = 'PAID';
    }

    await tx.purchase.update({
      where: { id: purchaseId },
      data: { paidAmount: newPaidAmount, paymentStatus }
    });

    return payment;
  });
};

module.exports = {
  createPurchase,
  postPurchase,
  getAllPurchases,
  getPurchaseById,
  addPayment
};
