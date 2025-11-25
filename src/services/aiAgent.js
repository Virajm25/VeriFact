const Groq = require('groq-sdk');
const Tesseract = require('tesseract.js');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper to clean up text using Llama 3
async function summarizeClaimFromText(rawText) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a helper. Extract the main news headline or claim from this messy OCR text. Return ONLY the claim as a single sentence." 
        },
        { role: "user", content: rawText }
      ],
      model: "llama-3.3-70b-versatile",
    });
    return completion.choices[0].message.content;
  } catch (e) {
    return rawText.substring(0, 200); // Fallback
  }
}

// 1. TEXT ANALYSIS
exports.analyzeClaim = async (claim, contextData) => {
  console.log('\n🧠 Sending data to Llama 3 for analysis...');

  const systemPrompt = `
    You are an expert Fact-Checker. 
    Analyze the provided context and determine if the claim is True, False, or Misleading.
    Return strictly JSON: { "verdict": "String", "confidence": Number, "summary": "String" }
  `;

  const userMessage = `CLAIM: "${claim}"\nEVIDENCE: ${contextData}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    return { verdict: "Error", confidence: 0, summary: "AI analysis failed." };
  }
};

// 2. IMAGE ANALYSIS (Using Tesseract OCR + Llama Cleanup)
exports.extractClaimFromImage = async (imageBuffer) => {
  console.log('👁️ Reading image text with Tesseract OCR...');
  
  try {
    // 1. Run OCR to get raw text
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
    
    if (!text || text.trim().length < 5) {
      throw new Error("No readable text found in image.");
    }

    console.log(`📝 Raw OCR Text: "${text.substring(0, 50)}..."`);

    // 2. Use AI to clean up the mess
    const cleanClaim = await summarizeClaimFromText(text);
    
    console.log(`✅ Extracted Claim: "${cleanClaim}"`);
    return cleanClaim;

  } catch (error) {
    console.error("❌ OCR Error:", error.message);
    throw new Error("Failed to read text from image");
  }
};