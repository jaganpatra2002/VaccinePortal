import Joi from "joi";
export const registerValidator = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    mobile: Joi.string().length(10).required(),
    password: Joi.string().pattern(new RegExp('[A-Za-z@1-9]')).required(),
    age: Joi.number().min(18).required(),
    pincode: Joi.number().min(100000).max(999999).required(),
    aadharNumber: Joi.number().min(100000000000).max(999999999999).required()
}).unknown(true);

export const loginValidator = Joi.object({
    mobile: Joi.string().length(10).required(),
    password: Joi.string().pattern(new RegExp('[A-Za-z@1-9]')).required()
});

export const profileValidator = Joi.object({
    mobile: Joi.string().length(10).required(),
})

export const slotValidator = Joi.object({
    slotId: Joi.string().max(30).required(),
})