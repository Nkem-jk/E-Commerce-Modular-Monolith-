const Joi = require("joi")

module.exports = {
  add: {
    body: Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).default(1),
    }),
  },
  update: {
    body: Joi.object({
      quantity: Joi.number().integer().min(1).required(),
    }),
  },
};


