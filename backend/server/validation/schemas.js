const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId');

const pagination = Joi.object({
  page: Joi.number().integer().min(0).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const loginBody = Joi.object({
  username: Joi.string().min(3).max(64).required(),
  password: Joi.string().min(6).max(128).required(),
});

const categoryBody = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  order: Joi.number().integer().min(0).default(0),
});

const subcategoryBody = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
});

const biographyBody = Joi.object({
  subcategory: objectId.required(),
  content: Joi.string().allow('').max(100000),
});

const linkItemBody = Joi.object({
  title: Joi.string().allow('').max(240),
  url: Joi.string().uri().required(),
  subcategory: objectId.required(),
});

const idParam = Joi.object({ id: objectId.required() });
const subcategoryParam = Joi.object({ subcategoryId: objectId.required() });

module.exports = {
  objectId,
  pagination,
  loginBody,
  categoryBody,
  subcategoryBody,
  biographyBody,
  linkItemBody,
  idParam,
  subcategoryParam,
};