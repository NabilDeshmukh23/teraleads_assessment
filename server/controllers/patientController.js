const patientService = require('../services/patientService');

// GET /list
exports.listPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    
   
    const search = req.query.search || '';

  
    const data = await patientService.getAllPatients(page, limit, search);

    res.json({ 
      message: "Patients retrieved successfully", 
      ...data 
    });
  } catch (error) {
    console.error("LIST_PATIENTS_ERROR:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};

// POST /add
exports.addPatient = async (req, res) => {
  try {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json({ 
      message: `Successfully added patient: ${patient.name}`, 
      patient 
    });
  } catch (error) {
    if (error.message === "PATIENT_EXISTS_WITH_EMAIL") {
      return res.status(409).json({ error: "Patient exists with same email" });
    }
    
    if (error.message === "NAME_EMAIL_PHONE_REQUIRED") {
      return res.status(400).json({ error: "Name, Email, and Phone are required" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// PUT /update/:id
exports.updatePatient = async (req, res) => {
  try {
    const updated = await patientService.updatePatient(req.params.id, req.body);
    res.json({
      message: `Successfully updated records for: ${updated.name}`,
      patient: updated
    });
  } catch (error) {
    res.status(404).json({ error: "Patient not found or update failed" });
  }
};

// DELETE /delete/:id
exports.deletePatient = async (req, res) => {
  const { id } = req.params;
  const patientId = Number(id);

  try {
    await prisma.chatMessage.deleteMany({
      where: { patientId: patientId }
    });

    await prisma.patient.delete({
      where: { id: patientId }
    });

    res.json({ message: "PATIENT AND HISTORY DELETED SUCCESSFULLY" });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};