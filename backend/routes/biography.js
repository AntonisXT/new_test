const express = require('express');
const router = express.Router();
const Biography = require('../models/biography');
const auth = require('../middleware/auth');
const validate = require('../server/middleware/validate');
const { subcategoryParam } = require('../server/validation/schemas');

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
router.post('/:subcategoryId', auth, validate({ params: subcategoryParam }), async (req, res) => {
  try {
    const { contentHtml } = req.body || {};
    if (typeof contentHtml !== 'string') return res.status(400).json({ msg: 'contentHtml must be a string' });
    const update = { contentHtml, updatedAt: new Date() };
    const doc = await require('../models/biography').findOneAndUpdate(
      { subcategory: req.params.subcategoryId },
      { $set: update, $setOnInsert: { subcategory: req.params.subcategoryId } },
      { new: true, upsert: true }
    );
    res.json(doc);
  } catch (e) { res.status(400).json({ msg: e.message }); }
});
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