module.exports = async function paginate(query, { page, limit, sort } = {}) {
  const p = Math.max(parseInt(page ?? 0, 10), 0);
  const l = Math.max(parseInt(limit ?? 0, 10), 0);

  if (!p && !l) {
    const items = await query.sort(sort || { createdAt: -1 }).lean();
    return { items, total: items.length, page: 0, pages: 1, hasMore: false };
  }

  const [items, total] = await Promise.all([
    query.sort(sort || { createdAt: -1 }).skip(p * l).limit(l > 0 ? l : 0).lean(),
    query.model.countDocuments(query.getQuery()),
  ]);

  const pages = l ? Math.ceil(total / l) : 1;
  return { items, total, page: p, pages, hasMore: p + 1 < pages };
};
