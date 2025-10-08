const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const auth = require('../middleware/auth');


// --- helper: Greek -> Latin slug ---
function slugifyElToKey(str='') {
  const map = {
    'ά':'a','α':'a','Α':'a','Ά':'a',
    'έ':'e','ε':'e','Ε':'e','Έ':'e',
    'ί':'i','ϊ':'i','ΐ':'i','ι':'i','Ι':'i','Ί':'i','Ϊ':'i',
    'ό':'o','ο':'o','Ο':'o','Ό':'o',
    'ύ':'y','ϋ':'y','ΰ':'y','υ':'y','Ύ':'y','Ϋ':'y',
    'ή':'h','η':'h','Ή':'h',
    'ώ':'o','ω':'o','Ώ':'o',
    'β':'v','Β':'v','γ':'g','Γ':'g','δ':'d','Δ':'d','ζ':'z','Ζ':'z','θ':'th','Θ':'th',
    'κ':'k','Κ':'k','λ':'l','Λ':'l','μ':'m','Μ':'m','ν':'n','Ν':'n','ξ':'x','Ξ':'x',
    'π':'p','Π':'p','ρ':'r','Ρ':'r','σ':'s','ς':'s','Σ':'s','τ':'t','Τ':'t',
    'φ':'f','Φ':'f','χ':'ch','Χ':'ch','ψ':'ps','Ψ':'ps','q':'q','w':'w'
  };
  const latin = str.split('').map(ch => map[ch] ?? ch).join('');
  return latin
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');
}


// -----------------------------
// Ensure base categories exist
// -----------------------------
const BASE_CATS = [
  { name: 'Βιογραφία', key: 'biography', slug: 'biography', description: 'Κείμενα βιογραφίας' },
  { name: 'Πίνακες', key: 'paintings', slug: 'paintings', description: 'Συλλογές εικόνων' },
  { name: 'Εκθέσεις', key: 'exhibitions', slug: 'exhibitions', description: 'Κατηγορίες εκθέσεων' },
  { name: 'Σύνδεσμοι', key: 'links', slug: 'links', description: 'Κατηγορίες συνδέσμων' },
];

router.use(async (_req, _res, next) => {
  try {
    // Backfill: αν υπάρχουν παλιές εγγραφές με slug null/λείπει, βάλε slug = key
    try {
      await Category.updateMany(
        { $or: [ { slug: { $exists: false } }, { slug: null } ] },
        [ { $set: { slug: { $ifNull: ["$key", "$slug"] } } } ]
      );
    } catch (e) {
      console.warn('slug backfill warning:', e.message);
    }

    // Ensure base categories
    for (const c of BASE_CATS) {
      await Category.updateOne(
        { key: c.key },
        { $setOnInsert: { ...c }, $set: { slug: c.slug || c.key } },
        { upsert: true }
      );
    }
    next();
  } catch (err) {
    console.error('ensure base categories error:', err);
    next();
  }
});

// -----------------------------
// Categories (list / create)
// -----------------------------
router.get('/', async (_req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// (Μπορείς να αφαιρέσεις αυτό το endpoint αν δεν θες να δημιουργούνται άλλες κατηγορίες)
router.post('/', auth, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.json(cat);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// -----------------------------
// Subcategories CRUD
// -----------------------------
router.get('/:catId/subcategories', async (req, res) => {
  try {
    const subs = await Subcategory.find({ category: req.params.catId }).sort({ order: 1, name: 1 });
    res.json(subs);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.post('/:catId/subcategories', auth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.name || !payload.name.trim()) {
      return res.status(400).json({ msg: 'Απαιτείται όνομα υποκατηγορίας' });
    }
    if (!payload.key || !payload.key.trim()) {
      payload.key = slugifyElToKey(payload.name);
    }
    payload.category = req.params.catId;
    const sub = await Subcategory.create(payload);
    res.json(sub);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});
router.put('/subcategories/:id', auth, async (req, res) => {
  try {
    const sub = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sub);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.delete('/subcategories/:id', auth, async (req, res) => {
  try {
    await Subcategory.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;
