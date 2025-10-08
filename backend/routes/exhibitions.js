
const express = require('express');
const router = express.Router();
const Exhibition = require('../models/exhibition');
const auth = require('../middleware/auth');

// List (optionally filter by subcategory)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.subcategory) filter.subcategory = req.query.subcategory;
    const items = await Exhibition.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const { title, location, date, subcategory } = req.body;
    if (!title || !subcategory) return res.status(400).json({ msg: 'title και subcategory είναι υποχρεωτικά' });
    const doc = await Exhibition.create({ title, location, date, subcategory });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Exhibition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await Exhibition.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;
