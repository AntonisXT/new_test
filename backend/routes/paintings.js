const express = require('express');
const router = express.Router();
const multer = require('multer');
const Painting = require('../models/painting');
const auth = require('../middleware/auth');
const validate = require('../server/middleware/validate');
const { pagination, subcategoryParam, idParam } = require('../server/validation/schemas');
const paginate = require('../server/utils/paginate');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB per file

// List by subcategory (smart paginate)
router.get('/:subcategoryId', validate({ params: subcategoryParam, query: pagination }), async (req, res) => {
  try {
    const q = Painting.find({ subcategory: req.params.subcategoryId });
    const { items, total, page, pages, hasMore } = await paginate(q, {
      page: req.query.page,
      limit: req.query.limit,
      sort: { createdAt: -1 },
    });
    const payload = items.map(p => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      mimeType: p.mimeType,
      createdAt: p.createdAt,
      dataUrl: `data:${p.mimeType};base64,${p.imageData.toString('base64')}`,
    }));
    res.json({ items: payload, total, page, pages, hasMore });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Upload images to subcategory
router.post('/upload/:subcategoryId', auth, validate({ params: subcategoryParam }), upload.array('images', 20), async (req, res) => {
  try {
    const subcategoryId = req.params.subcategoryId;
    if (!req.files?.length) return res.status(400).json({ msg: 'No files uploaded' });
    const docs = [];
    for (const file of req.files) {
      const { buffer, mimetype, originalname } = file;
      if (!mimetype.startsWith('image/')) {
        return res.status(400).json({ msg: 'Only image uploads are allowed' });
      }
      docs.push({
        subcategory: subcategoryId,
        title: originalname,
        originalName: originalname,
        imageData: buffer,
        mimeType: mimetype,
      });
    }
    const created = await Painting.insertMany(docs);
    res.status(201).json({ ok: true, inserted: created.length });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// Delete item
router.delete('/item/:id', auth, validate({ params: idParam }), async (req, res) => {
  try {
    await Painting.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;
