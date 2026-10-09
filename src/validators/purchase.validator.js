const z = require('zod');

const purchaseItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  hsnCode: z.string().optional().nullable(),
  gstRate: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

const createPurchaseSchema = z.object({
  supplierId: z.string().uuid("Invalid supplier ID"),
  invoiceNumber: z.string().optional().nullable(),
  purchaseDate: z.string().datetime().optional(),
  subTotal: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  discount: z.number().nonnegative().optional().default(0),
  grandTotal: z.number().nonnegative(),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
}).strict();

const addPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.string().datetime().optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
  referenceNo: z.string().optional().nullable(),
}).strict();

module.exports = {
  createPurchaseSchema,
  addPaymentSchema,
};
