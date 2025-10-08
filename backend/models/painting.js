const mongoose = require('mongoose');

const PaintingSchema = new mongoose.Schema({
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  title: { type: String },
  description: { type: String },
  originalName: { type: String },
  imageData: { type: Buffer, required: true },
  mimeType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Painting', PaintingSchema);