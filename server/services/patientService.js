const prisma = require('../config/prisma');

exports.getAllPatients = async (page, limit, search = '') => {
  const skip = (page - 1) * limit;

  
  const where = search 
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }
    : {};

  
  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where, 
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        createdAt: true, 
        dob: true, 
        medicalNotes: true 
      }
    }),
    prisma.patient.count({ where })
  ]);

  return { 
    patients, 
    total, 
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};


exports.createPatient = async (data) => {
  const { name, email, phone } = data;
  if (!name || !email || !phone) throw new Error("NAME_EMAIL_PHONE_REQUIRED");

  try {
    
    return await prisma.patient.create({ data });
  } catch (error) {
    if (error.code === 'P2002') throw new Error("PATIENT_EXISTS_WITH_EMAIL");
    throw error;
  }
};

exports.getDashboardInsights = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [total, recentlyAdded] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({
      where: {
        createdAt: { gte: oneDayAgo }
      }
    })
  ]);

  return { total, recentlyAdded };
};


exports.updatePatient = async (id, data) => {
  try {
    return await prisma.patient.update({
      where: { id: Number(id) },
      data
    });
  } catch (error) {
    if (error.code === 'P2025') throw new Error("PATIENT_NOT_FOUND");
    throw error;
  }
};


exports.deletePatient = async (id) => {
  try {
    return await prisma.patient.delete({
      where: { id: Number(id) }
    });
  } catch (error) {
    if (error.code === 'P2025') throw new Error("PATIENT_NOT_FOUND");
    throw error;
  }
};