const Joi = require("joi");

const orderIdParams = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

module.exports = { orderIdParams };