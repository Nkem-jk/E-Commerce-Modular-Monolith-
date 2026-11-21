const Joi = require("joi");

const email = Joi.string().trim().lowercase().email().max(254).required();

const password = Joi.string().min(8).max(72).required();

module.exports = {
  register: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(100).required(),
      email,
      password,
    }),
  },

  login: {
    body: Joi.object({
      email,
      password: Joi.string().required(),
    }),
  },

  forgotPassword: {
    body: Joi.object({ email }),
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().hex().length(64).required(),
      password,
    }),
  },
};
