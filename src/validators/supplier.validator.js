const z = require('zod');

const createSupplierSchema = z.object({
  name: z.string().min(2, "Name is required"),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN").optional().nullable(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  address: z.string().optional().nullable(),
}).strict();

const updateSupplierSchema = createSupplierSchema.partial();

module.exports = {
  createSupplierSchema,
  updateSupplierSchema,
};
