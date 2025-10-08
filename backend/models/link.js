const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('Link', LinkSchema);