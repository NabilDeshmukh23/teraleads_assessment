const prisma = require('../config/prisma');
const aiService = require('../services/aiService');


exports.askAI = async (req, res) => {
  const { patientId, message } = req.body;

  try {
    const patient = await prisma.patient.findUnique({ where: { id: Number(patientId) } });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    await prisma.chatMessage.create({
      data: { patientId: Number(patientId), role: 'user', content: message }
    });

    const aiReply = await aiService.generateAIResponse(message, patient);

    const savedReply = await prisma.chatMessage.create({
      data: { patientId: Number(patientId), role: 'assistant', content: aiReply }
    });

    res.json(savedReply);
  } catch (error) {
    res.status(500).json({ role: 'assistant', content: "Error processing request" });
  }
};


exports.getChatHistory = async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) {
    return res.status(400).json({ error: "PATIENT_ID_REQUIRED" });
  }

  try {
    const history = await prisma.chatMessage.findMany({
      where: { patientId: Number(patientId) },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ history });
  } catch (error) {
    console.error("HISTORY_FETCH_ERROR:", error);
    res.status(500).json({ error: "FETCH_HISTORY_FAILED" });
  }
};