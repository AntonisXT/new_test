const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true }, // slug-like
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

SubcategorySchema.index({ key: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', SubcategorySchema);