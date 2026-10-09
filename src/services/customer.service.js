const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCustomer = async (data) => {
  return prisma.customer.create({ data });
};

const getAllCustomers = async (filters = {}) => {
  return prisma.customer.findMany({
    where: { active: true, ...filters },
    orderBy: { name: 'asc' }
  });
};

const getCustomerById = async (id) => {
  return prisma.customer.findUnique({
    where: { id },
    include: { invoices: { orderBy: { invoiceDate: 'desc' } } }
  });
};

const updateCustomer = async (id, data) => {
  return prisma.customer.update({
    where: { id },
    data
  });
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
};
