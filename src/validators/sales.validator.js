const z = require('zod');

const salesInvoiceItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  productName: z.string().min(1),
  sku: z.string().min(1),
  hsnCode: z.string().optional().nullable(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discount: z.number().nonnegative().optional().default(0),
  taxableValue: z.number().nonnegative(),
  gstRate: z.number().nonnegative(),
  cgstAmount: z.number().nonnegative().optional().default(0),
  sgstAmount: z.number().nonnegative().optional().default(0),
  igstAmount: z.number().nonnegative().optional().default(0),
  totalAmount: z.number().nonnegative(),
});

const createInvoiceSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID").optional().nullable(),
  subTotal: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  cgstAmount: z.number().nonnegative().optional().default(0),
  sgstAmount: z.number().nonnegative().optional().default(0),
  igstAmount: z.number().nonnegative().optional().default(0),
  discount: z.number().nonnegative().optional().default(0),
  grandTotal: z.number().nonnegative(),
  items: z.array(salesInvoiceItemSchema).min(1, "At least one item is required"),
}).strict();

const addSalesPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.string().datetime().optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
  referenceNo: z.string().optional().nullable(),
}).strict();

module.exports = {
  createInvoiceSchema,
  addSalesPaymentSchema,
};
