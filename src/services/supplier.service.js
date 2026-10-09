const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSupplier = async (data) => {
  return prisma.supplier.create({ data });
};

const getAllSuppliers = async (filters = {}) => {
  return prisma.supplier.findMany({
    where: { active: true, ...filters },
    orderBy: { name: 'asc' }
  });
};

const getSupplierById = async (id) => {
  return prisma.supplier.findUnique({
    where: { id },
    include: { purchases: { orderBy: { purchaseDate: 'desc' } } }
  });
};

const updateSupplier = async (id, data) => {
  return prisma.supplier.update({
    where: { id },
    data
  });
};

const deleteSupplier = async (id) => {
  // Soft delete to preserve historical purchase records
  return prisma.supplier.update({
    where: { id },
    data: { active: false }
  });
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};
