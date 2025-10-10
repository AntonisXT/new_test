module.exports = async function paginate(query, { page, limit, sort } = {}) {
  const sortObj = sort || { createdAt: -1 };

  const hasExplicitPaging = (page !== undefined) || (limit !== undefined);
  const p = Number.isFinite(parseInt(page ?? 0, 10)) ? Math.max(parseInt(page ?? 0, 10), 0) : 0;
  const l = Number.isFinite(parseInt(limit ?? 0, 10)) ? Math.max(parseInt(limit ?? 0, 10), 0) : 0;

  // If client explicitly asked for pagination -> honor it
  if (hasExplicitPaging) {
    if (!p && !l) {
      const items = await query.sort(sortObj).lean();
      return { items, total: items.length, page: 0, pages: 1, hasMore: false };
    }
    const [items, total] = await Promise.all([
      query.sort(sortObj).skip(p * l).limit(l > 0 ? l : 0).lean(),
      query.model.countDocuments(query.getQuery()),
    ]);
    const pages = l ? Math.ceil(total / l) : 1;
    return { items, total, page: p, pages, hasMore: p + 1 < pages };
  }

  // Smart mode: if total > 12, return first page with limit=12; else return all
  const total = await query.model.countDocuments(query.getQuery());
  if (total > 12) {
    const l2 = 12;
    const items = await query.sort(sortObj).limit(l2).lean();
    const pages = Math.ceil(total / l2);
    return { items, total, page: 0, pages, hasMore: pages > 1 };
  }

  const items = await query.sort(sortObj).lean();
  return { items, total, page: 0, pages: 1, hasMore: false };
};