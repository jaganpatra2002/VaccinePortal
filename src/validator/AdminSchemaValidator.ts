
import coreJoi from "joi";
import joiDate from "@joi/date";
const timeRangeRegex = /^(1[0-5]:[0-5][0-9]|16:[0-3][0-9])$/;
const Joi = coreJoi.extend(joiDate);

export const addSlotValidate = Joi.object({
    date: Joi.date().format('YYYY-MM-DD').required(),
    time: Joi.string().regex(timeRangeRegex).required(),
    availableCapacity: Joi.number().max(10).required()
})

export const filteredData = Joi.object({
    // age: Joi.number().min(18).optional(),
    // pincode: Joi.number().min(100000).max(999999).optional(),
    // vaccinationStatus: Joi.string().optional(),
    // score: Joi.integer
    //     .min(0)
    //     .max(30)().optional(),
    score: Joi.string().optional(),
    status: Joi.string().optional()
})
