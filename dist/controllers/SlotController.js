"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewSlot = void 0;
const responseFormat_1 = require("../responseFormat");
const SlotSchemaValidator_1 = require("../validator/SlotSchemaValidator");
const MongoClient_1 = require("../utils/MongoClient");
const viewSlot = async (event) => {
    try {
        const db = await (0, MongoClient_1.slotdbConnect)();
        const body = event.queryStringParameters?.date;
        console.log("Body", body);
        const dateToValidate = { date: body };
        console.log("Date", dateToValidate.date);
        const info = dateToValidate.date;
        console.log("info", info);
        const validateDate = SlotSchemaValidator_1.validateSlot.validate({ date: info });
        console.log("validateDate", validateDate);
        const dat1 = validateDate.value.info;
        console.log("$$", dat1);
        if (validateDate.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Format Error", validateDate.error);
        }
        const slotcheck = validateDate.value;
        console.log("slotcheck", slotcheck);
        const slotData = await db?.find({ dat1 }).toArray();
        return (0, responseFormat_1.ResponseFormat)(200, "All slots", slotData);
    }
    catch (error) {
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.viewSlot = viewSlot;
