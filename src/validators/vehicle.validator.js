const z = require('zod');

const categorySchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  active: z.boolean().optional()
});

const brandSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2),
  code: z.string().min(2),
  active: z.boolean().optional()
});

const modelSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  active: z.boolean().optional()
});

const variantSchema = z.object({
  modelId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  yearFrom: z.number().int().optional(),
  yearTo: z.number().int().optional(),
  active: z.boolean().optional()
});

module.exports = {
  categorySchema,
  brandSchema,
  modelSchema,
  variantSchema,
  updateCategorySchema: categorySchema.partial(),
  updateBrandSchema: brandSchema.partial(),
  updateModelSchema: modelSchema.partial(),
  updateVariantSchema: variantSchema.partial(),
};
