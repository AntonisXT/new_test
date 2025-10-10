const Joi = require('joi');

module.exports = (schema) => (req, res, next) => {
  if (!schema) return next();
  const toValidate = {};
  if (schema.body) toValidate.body = req.body;
  if (schema.params) toValidate.params = req.params;
  if (schema.query) toValidate.query = req.query;

  const joiOptions = { abortEarly: false, allowUnknown: true, stripUnknown: false };
  const { error, value } = Joi.compile(schema).prefs(joiOptions).validate(toValidate);
  if (error) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request',
      details: error.details.map(d => ({ path: d.path.join('.'), message: d.message })),
    });
  }
  Object.assign(req, value);
  next();
};
