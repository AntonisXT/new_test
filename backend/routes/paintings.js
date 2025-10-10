// backend/routes/paintings.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Painting = require('../models/painting');
const auth = require('../middleware/auth');
const validate = require('../server/middleware/validate');
const { pagination, subcategoryParam, idParam } = require('../server/validation/schemas');
const paginate = require('../server/utils/paginate');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// List by subcategory (smart paginate)
router.get('/:subcategoryId', validate({ params: subcategoryParam, query: pagination }), async (req, res) => {
  try {
    const q = Painting.find({ subcategory: req.params.subcategoryId });
    const { items, total, page, pages, hasMore } = await paginate(q, {
      page: req.query.page,
      limit: req.query.limit,
      sort: { createdAt: -1 },
    });

    // convert to base64 for frontend
    const payload = items.map(p => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      originalName: p.originalName,
      mimeType: p.mimeType,
      createdAt: p.createdAt,
      dataUrl: `data:${p.mimeType};base64,${p.imageData.toString('base64')}`,
    }));

    res.json({ items: payload, total, page, pages, hasMore });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Upload one or more images
router.post('/upload/:subcategoryId',
  auth,
  validate({ params: subcategoryParam }),
  upload.array('images', 20),
  async (req, res) => {
    try {
      const subcategoryId = req.params.subcategoryId;
      if (!req.files?.length) return res.status(400).json({ msg: 'No files uploaded' });

      const descriptions = Array.isArray(req.body.descriptions) ? req.body.descriptions : [];
      const docs = [];

      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        if (!f.mimetype?.startsWith('image/')) {
          return res.status(400).json({ msg: 'Only image uploads are allowed' });
        }
        docs.push({
          subcategory: subcategoryId,
          title: f.originalname,
          originalName: f.originalname,
          imageData: f.buffer,
          mimeType: f.mimetype,
          description: descriptions[i] || '',
        });
      }

      const created = await Painting.insertMany(docs);
      res.status(201).json({ ok: true, inserted: created.length });
    } catch (e) {
      res.status(400).json({ msg: e.message });
    }
  }
);

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
