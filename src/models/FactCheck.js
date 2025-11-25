const mongoose = require('mongoose');

const FactCheckSchema = new mongoose.Schema({
  claim: { type: String, required: true },
  verdict: { type: String, required: true },
  confidence: { type: Number, required: true },
  summary: { type: String, required: true },
  sources: [{ title: String, link: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FactCheck', FactCheckSchema);