const express = require('express');
const router = express.Router();
const Biography = require('../models/biography');
const auth = require('../middleware/auth');

// Get biography content by subcategory id
router.get('/:subcategoryId', async (req, res) => {
  try {
    const doc = await Biography.findOne({ subcategory: req.params.subcategoryId });
    res.json(doc || null);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Upsert biography content
router.post('/:subcategoryId', auth, async (req, res) => {
  try {
    const { contentHtml } = req.body;
    const updated = await Biography.findOneAndUpdate(
      { subcategory: req.params.subcategoryId },
      { contentHtml, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.delete('/:subcategoryId', auth, async (req, res) => {
  try {
    await Biography.findOneAndDelete({ subcategory: req.params.subcategoryId });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;