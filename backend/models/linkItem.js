
const mongoose = require('mongoose');

const LinkItemSchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String, required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('LinkItem', LinkItemSchema);
