/**
 * Paginate a Mongoose query.
 * @param {import('mongoose').Query} query - e.g., Model.find(filter)
 * @param {Object} opts - { page, limit, sort }
 * @returns {Promise<{ items:any[], total:number, page:number, pages:number, hasMore:boolean }>}
 */
module.exports = async function paginate(query, opts = {}) {
  const page = Number.isFinite(+opts.page) && +opts.page >= 0 ? +opts.page : null;
  const limit = Number.isFinite(+opts.limit) && +opts.limit >= 0 ? +opts.limit : null;
  const sort = opts.sort || { createdAt: -1 };

  if (page === null || limit === null) {
    const items = await query.sort(sort).lean();
    return { items, total: items.length, page: 0, pages: 1, hasMore: false };
  }

  const p = page;
  const l = limit;

  const [items, total] = await Promise.all([
    query.sort(sort).skip(p * l).limit(l > 0 ? l : 0).lean(),
    query.model.countDocuments(query.getQuery()),
  ]);

  const pages = l ? Math.ceil(total / l) : 1;
  return { items, total, page: p, pages, hasMore: p + 1 < pages };
};
