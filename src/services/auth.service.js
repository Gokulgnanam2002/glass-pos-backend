const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { generateToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('./email.service');

const register = async (data) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role || 'STAFF',
    },
  });

  const token = generateToken({ userId: user.id, role: user.role });
  
  return { user, token };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.active) {
    throw new Error('Invalid credentials or inactive user');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ userId: user.id, role: user.role });
  
  return { user, token };
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return;
  
  const secret = env.jwtSecret + user.passwordHash;
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '15m' });
  
  await sendPasswordResetEmail(user.email, token);
};

const resetPassword = async (token, newPassword) => {
  const decodedUntrusted = jwt.decode(token);
  if (!decodedUntrusted || !decodedUntrusted.userId) throw new Error('Invalid token');
  
  const user = await prisma.user.findUnique({ where: { id: decodedUntrusted.userId } });
  if (!user) throw new Error('Invalid token');
  
  const secret = env.jwtSecret + user.passwordHash;
  try {
    jwt.verify(token, secret);
  } catch (err) {
    throw new Error('Token is invalid or has expired');
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
