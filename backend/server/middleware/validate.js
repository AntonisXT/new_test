const Joi = require('joi');

/**
 * Usage:
 *  const validate = require('../server/middleware/validate');
 *  const Joi = require('joi');
 *  router.get('/', validate({ query: Joi.object({ page:Joi.number().min(0), limit:Joi.number().min(0).max(100) }) }), handler)
 */
module.exports = (schema) => (req, res, next) => {
  if (!schema) return next();
  const segments = {};
  if (schema.body) segments.body = req.body;
  if (schema.params) segments.params = req.params;
  if (schema.query) segments.query = req.query;

  const options = { abortEarly: false, allowUnknown: true, stripUnknown: false };
  const { error, value } = Joi.compile(schema).prefs(options).validate(segments);

  if (error) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request',
      details: error.details.map(d => ({ path: d.path.join('.'), message: d.message })),
    });
  }

  // Merge sanitized values back
  if (value.body) req.body = value.body;
  if (value.params) req.params = value.params;
  if (value.query) req.query = value.query;

  return next();
};
