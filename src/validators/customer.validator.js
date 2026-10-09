const z = require('zod');

const createCustomerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN").optional().nullable(),
  address: z.string().optional().nullable(),
  stateCode: z.string().length(2, "State code must be 2 characters").optional().nullable(),
  active: z.boolean().optional(),
}).strict();

const updateCustomerSchema = createCustomerSchema.partial();

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
