const mongoose = require('mongoose');

const BiographySchema = new mongoose.Schema({
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  contentHtml: { type: String, required: true }, // store rich text/HTML
  updatedAt: { type: Date, default: Date.now }
});

BiographySchema.index({ subcategory: 1 }, { unique: true });

module.exports = mongoose.model('Biography', BiographySchema);