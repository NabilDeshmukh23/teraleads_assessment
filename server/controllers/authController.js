const authService = require('../services/authService');
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const newUser = await authService.registerStaff(fullName, email, password);

    return res.status(201).json({
      message: "Registration successful!",
      user: { 
        id: newUser.id, 
        fullName: newUser.fullName, 
        email: newUser.email 
      }
    });

  } catch (error) {
    console.error("DETAILED BACKEND ERROR:", error); 
    
    if (error.message === "USER_ALREADY_EXISTS") {
      return res.status(400).json({ error: "Email already in use." });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const authData = await authService.loginStaff(email, password);
    
    if (!authData) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    res.json({
      message: "Login successful",
      ...authData
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error during login" });
  }
};