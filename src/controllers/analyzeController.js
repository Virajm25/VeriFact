const searchAgent = require('../services/searchAgent');
const scraperAgent = require('../services/scraperAgent');
const aiAgent = require('../services/aiAgent');
const FactCheck = require('../models/FactCheck');

// 1. GET RECENT CHECKS
exports.getRecentChecks = async (req, res) => {
  try {
    // Get the newest 40 records
    const recents = await FactCheck.find().sort({ createdAt: -1 }).limit(40);
    res.json({ success: true, data: recents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. VERIFY & SAVE (With FIFO Logic)
exports.verifyRumor = async (req, res) => {
  try {
    let claim = req.body.claim;

    // Handle Image
    if (req.file) {
      console.log(`[${new Date().toISOString()}] 📸 Processing Image...`);
      claim = await aiAgent.extractClaimFromImage(req.file.buffer, req.file.mimetype);
    }

    if (!claim) return res.status(400).json({ success: false, message: 'No claim provided' });

    console.log(`[${new Date().toISOString()}] 🔍 Verifying: "${claim}"`);

    // --- CACHE CHECK ---
    const existing = await FactCheck.findOne({ claim: claim.toLowerCase().trim() });
    if (existing) {
        console.log("⚡ Cache Hit! Returning saved result.");
        return res.json({ success: true, result: existing });
    }

    // --- AGENT FLOW ---
    const searchResults = await searchAgent.searchGoogle(claim);
    
    let analysis;
    if (!searchResults || searchResults.length === 0) {
        analysis = { verdict: "Unverified", confidence: 0, summary: "No credible sources found." };
    } else {
        const urls = searchResults.map(r => r.link);
        const contextData = await scraperAgent.scrapeContent(urls);
        analysis = await aiAgent.analyzeClaim(claim, contextData);
    }

    const finalResult = { 
      ...analysis, 
      sources: searchResults || [],
      claim: claim 
    };

    // ============================================================
    // 🧹 FIFO LOGIC: KEEP DB CLEAN (Max 40 Records)
    // ============================================================
    const MAX_RECORDS = 40;
    const count = await FactCheck.countDocuments();

    if (count >= MAX_RECORDS) {
      // Find the OLDEST record (createdAt: 1 means ascending/oldest)
      const oldest = await FactCheck.findOne().sort({ createdAt: 1 });
      
      if (oldest) {
        console.log(`🗑️ Database full (${count}). Deleting oldest: "${oldest.claim.substring(0, 20)}..."`);
        await FactCheck.findByIdAndDelete(oldest._id);
      }
    }
    await FactCheck.create({
      claim: claim,
      verdict: finalResult.verdict,
      confidence: finalResult.confidence,
      summary: finalResult.summary,
      sources: finalResult.sources
    });

    res.json({ success: true, result: finalResult });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};