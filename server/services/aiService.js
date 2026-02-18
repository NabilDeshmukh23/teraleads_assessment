const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
exports.generateAIResponse = async (prompt, patient, chatHistory = []) => {
  const isFirstMessage = chatHistory.length === 0;

  const systemInstruction = `
    ROLE: Senior Dentist and Clinical Lead.
    CONTEXT: You are reviewing the file for ${patient.name}.
    
    PATIENT DATA:
    - Name: ${patient.name}
    - History: ${patient.medicalNotes}
    
    INSTRUCTIONS:
    ${isFirstMessage ? 
      `1. This is the start of the chat. Greet the user and provide a natural, professional summary of the patient's file.` : 
      `1. This is an ongoing conversation. Do NOT repeat the patient summary or the "Hello! I've pulled up the records" greeting. Answer the user's specific question directly and concisely.`
    }
    2. Always use standard sentence casing. No ALL CAPS.
    3. Maintain a clinical focus on the allergy to high-power medicines.
    4. Speak naturally like a human colleague, not a robot.
  `;

  try {
    const result = await model.generateContent(`${systemInstruction}\n\nUSER MESSAGE: ${prompt}`);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("AI_GEN_ERROR:", error);
    throw new Error("AI_OFFLINE");
  }
};