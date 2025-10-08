
const express = require('express');
const router = express.Router();
const LinkItem = require('../models/linkItem');
const auth = require('../middleware/auth');

// List (optionally filter by subcategory)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.subcategory) filter.subcategory = req.query.subcategory;
    const items = await LinkItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const { title, url, subcategory } = req.body;
    if (!url || !subcategory) return res.status(400).json({ msg: 'url και subcategory είναι υποχρεωτικά' });
    const doc = await LinkItem.create({ title, url, subcategory });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await LinkItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await LinkItem.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;
