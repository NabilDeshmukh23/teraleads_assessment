const prisma = require('../config/prisma'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



exports.registerStaff = async (fullName, email, password) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  return await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      role: 'STAFF'
    }
  });
};

exports.loginStaff = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user && await bcrypt.compare(password, user.password)) {
  
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    ); 
    
    return { token, role: user.role, fullName: user.fullName };
  }
  return null;
};