const z = require('zod');

const createProductSchema = z.object({
  name: z.string().min(2),
  productType: z.string().optional(),
  hsnCode: z.string().optional(),
  unit: z.string().optional(),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  gstRate: z.number().min(0),
  active: z.boolean().optional(),
  variantId: z.string().uuid(),
  glassPosition: z.string().min(2),
  openingStock: z.number().min(0).optional().default(0),
  minStockLevel: z.number().min(0).optional().default(0)
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema,
};
