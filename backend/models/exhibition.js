
const mongoose = require('mongoose');

const ExhibitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String },
  date: { type: String },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Exhibition', ExhibitionSchema);
