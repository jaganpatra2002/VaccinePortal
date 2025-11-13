"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotValidator = exports.profileValidator = exports.loginValidator = exports.registerValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerValidator = joi_1.default.object({
    name: joi_1.default.string().min(3).max(30).required(),
    mobile: joi_1.default.string().length(10).required(),
    password: joi_1.default.string().pattern(new RegExp('[A-Za-z@1-9]')).required(),
    age: joi_1.default.number().min(18).required(),
    pincode: joi_1.default.number().min(100000).max(999999).required(),
    aadharNumber: joi_1.default.number().min(100000000000).max(999999999999).required()
}).unknown(true);
exports.loginValidator = joi_1.default.object({
    mobile: joi_1.default.string().length(10).required(),
    password: joi_1.default.string().pattern(new RegExp('[A-Za-z@1-9]')).required()
});
exports.profileValidator = joi_1.default.object({
    mobile: joi_1.default.string().length(10).required(),
});
exports.slotValidator = joi_1.default.object({
    slotId: joi_1.default.string().max(30).required(),
});
