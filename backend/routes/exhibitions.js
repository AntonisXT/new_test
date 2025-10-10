
const express = require('express');
const router = express.Router();
const Exhibition = require('../models/exhibition');
const auth = require('../middleware/auth');
const validate = require('../server/middleware/validate');
const { pagination, objectId, idParam } = require('../server/validation/schemas');
const paginate = require('../server/utils/paginate');

// List (optionally filter by subcategory)
router.get('/', validate({ query: pagination.keys({ subcategory: objectId.optional() }) }), async (req, res) => {
  try {
    const filter = {};
    if (req.query.subcategory) filter.subcategory = req.query.subcategory;
    const q = Exhibition.find(filter);
    const result = await paginate(q, { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } });
    res.json(result);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});
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
router.put('/:id', auth, validate({ params: idParam }), async (req, res) => {
  try {
    const doc = await Exhibition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc);
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
