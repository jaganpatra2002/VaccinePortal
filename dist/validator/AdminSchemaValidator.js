"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filteredData = exports.addSlotValidate = void 0;
const joi_1 = __importDefault(require("joi"));
const date_1 = __importDefault(require("@joi/date"));
const timeRangeRegex = /^(1[0-5]:[0-5][0-9]|16:[0-3][0-9])$/;
const Joi = joi_1.default.extend(date_1.default);
exports.addSlotValidate = Joi.object({
    date: Joi.date().format('YYYY-MM-DD').required(),
    time: Joi.string().regex(timeRangeRegex).required(),
    availableCapacity: Joi.number().max(10).required()
});
exports.filteredData = Joi.object({
    // age: Joi.number().min(18).optional(),
    // pincode: Joi.number().min(100000).max(999999).optional(),
    // vaccinationStatus: Joi.string().optional(),
    // score: Joi.integer
    //     .min(0)
    //     .max(30)().optional(),
    score: Joi.string().optional(),
    status: Joi.string().optional()
});
