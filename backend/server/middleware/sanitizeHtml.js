const sanitizeHtml = require('sanitize-html');

const DEFAULT = {
  allowedTags: [
    'b','i','em','strong','a','p','br','ul','ol','li','blockquote','code','pre','span','h1','h2','h3','h4','h5','h6','img'
  ],
  allowedAttributes: {
    a: ['href','name','target','rel'],
    img: ['src','alt'],
    '*': ['class']
  },
  allowedSchemes: ['http','https','data','mailto'],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
  },
};

module.exports = function sanitizeBodyHtml(options = {}) {
  const cfg = { ...DEFAULT, ...options };
  return (req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      for (const [key, value] of Object.entries(req.body)) {
        if (((/(Html|HTML)$/.test(key) || ['content','description','bio','biography'].includes(key)) && typeof value === 'string')) {
          req.body[key] = sanitizeHtml(value, cfg);
        }
      }
    }
    next();
  };
};
