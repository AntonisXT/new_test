module.exports = async function paginate(query, { page, limit, sort } = {}) {
  const sortObj = sort || { createdAt: -1 };
  const asked = (page !== undefined) || (limit !== undefined);
  const p = Number.isFinite(parseInt(page ?? 0, 10)) ? Math.max(parseInt(page ?? 0, 10), 0) : 0;
  const l = Number.isFinite(parseInt(limit ?? 0, 10)) ? Math.max(parseInt(limit ?? 0, 10), 0) : 0;

  if (asked) {
    if (!l) {
      const items = await query.sort(sortObj).lean();
      return { items, total: items.length, page: 0, pages: 1, hasMore: false };
    }
    const [items, total] = await Promise.all([
      query.sort(sortObj).skip(p * l).limit(l).lean(),
      query.model.countDocuments(query.getQuery()),
    ]);
    const pages = l ? Math.ceil(total / l) : 1;
    return { items, total, page: p, pages, hasMore: p + 1 < pages };
  }

  const total = await query.model.countDocuments(query.getQuery());
  if (total > 12) {
    const L = 12;
    const items = await query.sort(sortObj).limit(L).lean();
    const pages = Math.ceil(total / L);
    return { items, total, page: 0, pages, hasMore: pages > 1 };
  }

  const items = await query.sort(sortObj).lean();
  return { items, total, page: 0, pages: 1, hasMore: false };
};
