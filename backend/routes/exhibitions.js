const express = require('express');
const router = express.Router();
const Exhibition = require('../models/exhibition');
const auth = require('../middleware/auth');
const validate = require('../server/middleware/validate');
const { pagination, objectId, idParam } = require('../server/validation/schemas');
const paginate = require('../server/utils/paginate');

// List (optionally filter by subcategory), smart paginate
router.get('/', validate({ query: pagination.keys({ subcategory: objectId.optional() }) }), async (req, res) => {
  try {
    const filter = {};
    if (req.query.subcategory) filter.subcategory = req.query.subcategory;
    const q = Exhibition.find(filter);
    const result = await paginate(q, { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } });
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const created = await Exhibition.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Update
router.put('/:id', auth, validate({ params: idParam }), async (req, res) => {
  try {
    const updated = await Exhibition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Delete
router.delete('/:id', auth, validate({ params: idParam }), async (req, res) => {
  try {
    await Exhibition.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;
