const prisma = require('../config/prisma');

const createCategory = async (data) => prisma.vehicleCategory.create({ data });
const getCategories = async () => prisma.vehicleCategory.findMany();
const updateCategory = async (id, data) => prisma.vehicleCategory.update({ where: { id }, data });
const deleteCategory = async (id) => prisma.vehicleCategory.delete({ where: { id } });

const createBrand = async (data) => prisma.vehicleBrand.create({ data });
const getBrands = async () => prisma.vehicleBrand.findMany();
const updateBrand = async (id, data) => prisma.vehicleBrand.update({ where: { id }, data });
const deleteBrand = async (id) => prisma.vehicleBrand.delete({ where: { id } });

const createModel = async (data) => prisma.vehicleModel.create({ data });
const getModels = async () => prisma.vehicleModel.findMany();
const updateModel = async (id, data) => prisma.vehicleModel.update({ where: { id }, data });
const deleteModel = async (id) => prisma.vehicleModel.delete({ where: { id } });

const createVariant = async (data) => prisma.vehicleVariant.create({ data });
const getVariants = async () => prisma.vehicleVariant.findMany();
const updateVariant = async (id, data) => prisma.vehicleVariant.update({ where: { id }, data });
const deleteVariant = async (id) => prisma.vehicleVariant.delete({ where: { id } });

module.exports = {
  createCategory, getCategories, updateCategory, deleteCategory,
  createBrand, getBrands, updateBrand, deleteBrand,
  createModel, getModels, updateModel, deleteModel,
  createVariant, getVariants, updateVariant, deleteVariant,
};
