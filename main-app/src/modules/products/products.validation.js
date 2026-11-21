const Joi = require("joi");

module.exports = {
    create: {
        body: Joi.object({
            name: Joi.string().trim().min(2).max(100).required(),
            price: Joi.number().integer().positive().required(),
            stock:Joi.number().integer().min(0).optional(),
            imageUrl: Joi.string().required(),
            description: Joi.string().allow("").optional()
        }),
    },

    update: {
        body: Joi.object({
            name: Joi.string().trim().min(2).max(100).optional(),
            price: Joi.number().integer().positive().optional(),
            stock:Joi.number().integer().min(0).optional(),
            imageUrl: Joi.string().optional(), 
            description: Joi.string().allow("").optional()
        }),
    },
};