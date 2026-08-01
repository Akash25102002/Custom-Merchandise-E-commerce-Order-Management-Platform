const AppError = require('../utils/AppError');

/**
 * Higher-order middleware function to validate request payload against a Joi schema
 * @param {Object} schema - Joi validation schema object containing body, params, query keys
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = {};
  ['params', 'query', 'body'].forEach((key) => {
    if (schema[key]) {
      validSchema[key] = schema[key];
    }
  });

  const objectToValidate = {};
  ['params', 'query', 'body'].forEach((key) => {
    if (schema[key]) {
      objectToValidate[key] = req[key];
    }
  });

  const Joi = require('joi');
  const compiledSchema = Joi.object(validSchema);
  const { value, error } = compiledSchema.validate(objectToValidate, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    return next(new AppError(errorMessage, 400));
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;
