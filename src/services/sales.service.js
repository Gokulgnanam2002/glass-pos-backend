const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateInvoiceNumber = async (tx) => {
  const financialYear = '2026-27'; // In prod, compute dynamically
  
  const seq = await tx.invoiceSequence.upsert({
    where: { documentType_financialYear: { documentType: 'SALES', financialYear } },
    create: { documentType: 'SALES', prefix: 'INV', currentValue: 1, financialYear },
    update: { currentValue: { increment: 1 } }
  });
  
  return `${seq.prefix}-${seq.financialYear}-${seq.currentValue.toString().padStart(4, '0')}`;
};

const createInvoice = async (data, userId) => {
  return prisma.$transaction(async (tx) => {
    const invoiceNumber = await generateInvoiceNumber(tx);

    const invoice = await tx.salesInvoice.create({
      data: {
        customerId: data.customerId || null,
        invoiceNumber,
        status: 'DRAFT',
        paymentStatus: 'UNPAID',
        subTotal: data.subTotal || 0,
        taxAmount: data.taxAmount || 0,
        cgstAmount: data.cgstAmount || 0,
        sgstAmount: data.sgstAmount || 0,
        igstAmount: data.igstAmount || 0,
        discount: data.discount || 0,
        grandTotal: data.grandTotal || 0,
        paidAmount: 0,
      }
    });

    if (data.items && data.items.length > 0) {
      const itemsData = data.items.map(item => ({
        invoiceId: invoice.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        taxableValue: item.taxableValue || 0,
        gstRate: item.gstRate || 0,
        cgstAmount: item.cgstAmount || 0,
        sgstAmount: item.sgstAmount || 0,
        igstAmount: item.igstAmount || 0,
        totalAmount: item.totalAmount || 0,
      }));
      await tx.salesInvoiceItem.createMany({ data: itemsData });
    }

    return tx.salesInvoice.findUnique({
      where: { id: invoice.id },
      include: { items: true, customer: true }
    });
  });
};

const postInvoice = async (invoiceId, userId) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.salesInvoice.findUnique({
      where: { id: invoiceId },
      include: { items: true }
    });

    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status !== 'DRAFT') throw new Error('Only DRAFT invoices can be posted');

    // 1. Verify Stock Availability
    for (const item of invoice.items) {
      const inv = await tx.inventory.findUnique({ where: { productId: item.productId } });
      if (!inv || Number(inv.quantity) < Number(item.quantity)) {
        throw new Error(`Insufficient stock for product ${item.productName}`);
      }
    }

    // 2. Post Invoice
    const updatedInvoice = await tx.salesInvoice.update({
      where: { id: invoiceId },
      data: { status: 'POSTED' }
    });

    // 3. Deduct Stock & Write Stock Movement
    for (const item of invoice.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } }
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          movementType: 'SALE',
          quantity: -Math.abs(Number(item.quantity)),
          referenceType: 'SALE_INVOICE',
          referenceId: invoiceId,
          remarks: `Sale invoice: ${invoice.invoiceNumber}`,
          createdById: userId
        }
      });
    }

    return updatedInvoice;
  });
};

const addPayment = async (invoiceId, data) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.salesInvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error('Invoice not found');

    const payment = await tx.payment.create({
      data: {
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        referenceNo: data.referenceNo
      }
    });

    const newPaidAmount = Number(invoice.paidAmount) + Number(data.amount);
    let paymentStatus = 'PARTIAL';
    if (newPaidAmount >= Number(invoice.grandTotal)) paymentStatus = 'PAID';

    await tx.salesInvoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount, paymentStatus }
    });

    return payment;
  });
};

const getAllInvoices = async () => {
  return prisma.salesInvoice.findMany({
    orderBy: { invoiceDate: 'desc' },
    include: { customer: true }
  });
};

module.exports = {
  createInvoice,
  postInvoice,
  addPayment,
  getAllInvoices
};
