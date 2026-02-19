const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;

exports.generateAIResponse = async (prompt, patient, chatHistory = []) => {
  const isFirstMessage = chatHistory.length === 0;

  if (!API_KEY || API_KEY === "your_api_key_here") {
    console.warn("⚠️ AI_SERVICE: GEMINI_API_KEY is missing. Using fallback response.");

    if (isFirstMessage) {
      return `Hello! I've successfully loaded the records for ${patient.name}. I noticed a medical note regarding: "${patient.medicalNotes || 'No specific history'}". While my advanced clinical analysis is currently offline, I am ready to assist with manual charting or administrative tasks. How can I help you today?`;
    }
    
    return "I'm currently operating in offline mode. I can see the patient's file, but my clinical reasoning engine is temporarily unavailable. Please consult the physical chart for specific treatment advice.";
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const systemInstruction = `
    ROLE: Senior Dentist and Clinical Lead.
    CONTEXT: You are reviewing the file for ${patient.name}.
    
    PATIENT DATA:
    - Name: ${patient.name}
    - History: ${patient.medicalNotes}
    
    INSTRUCTIONS:
    ${isFirstMessage ? 
      `1. This is the start of the chat. Greet the user and provide a natural, professional summary of the patient's file.` : 
      `1. This is an ongoing conversation. Do NOT repeat the patient summary. Answer the user's specific question directly and concisely.`
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
    return `I'm having trouble reaching my clinical database right now, but I have ${patient.name}'s file open. Please let me know if you need help with basic data entry in the meantime.`;
  }
};