"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilteredData = exports.getAllBookings = exports.getSlots = exports.addSlot = void 0;
const responseFormat_1 = require("../responseFormat");
const MongoClient_1 = require("../utils/MongoClient");
const AdminSchemaValidator_1 = require("../validator/AdminSchemaValidator");
const addSlot = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { date, time, availableCapacity } = body;
        const db = await (0, MongoClient_1.slotdbConnect)();
        const sloValidate = AdminSchemaValidator_1.addSlotValidate.validate(body);
        console.log(sloValidate);
        if (sloValidate.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Format error", sloValidate.error.message);
        }
        const slot = await db?.insertOne({ date, time, availableCapacity });
        return (0, responseFormat_1.ResponseFormat)(200, "Slot added successfully", slot);
    }
    catch (error) {
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went wrong", error);
    }
};
exports.addSlot = addSlot;
const getSlots = async () => {
    try {
        const db = await (0, MongoClient_1.slotdbConnect)();
        const slotData = await db?.find().toArray();
        return (0, responseFormat_1.ResponseFormat)(200, "All slots found", slotData);
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something went wrong", error);
    }
};
exports.getSlots = getSlots;
const getAllBookings = async () => {
    try {
        const db = await (0, MongoClient_1.dbConnect)();
        const bookingsData = await db?.find({ bookedSlot: { $ne: null } }).toArray();
        console.log(bookingsData);
        return (0, responseFormat_1.ResponseFormat)(200, "All bookings found", bookingsData);
    }
    catch (error) {
        return (0, responseFormat_1.ResponseFormat)(400, "Something went wrong", error);
    }
};
exports.getAllBookings = getAllBookings;
const getFilteredData = async (event) => {
    try {
        const age = event.queryStringParameters?.age;
        const pincode = event.queryStringParameters?.pincode;
        const vaccinationStatus = event.queryStringParameters?.vaccinationStatus;
        console.log(age);
        console.log(pincode);
        console.log(vaccinationStatus);
        const db = await (0, MongoClient_1.dbConnect)();
        let query = { age, pincode, vaccinationStatus };
        const filterData = AdminSchemaValidator_1.filteredData.validate(query);
        if (filterData.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Format error", filterData.error.message);
        }
        console.log(filterData.error);
        let finalquery = {};
        if (filterData.value.age !== undefined) {
            finalquery.age = filterData.value.age;
        }
        if (filterData.value.pincode !== undefined) {
            finalquery.pincode = filterData.value.pincode;
        }
        if (filterData.value.vaccinationStatus !== undefined) {
            finalquery.vaccinationStatus = filterData.value.vaccinationStatus;
        }
        const data = await db?.find(finalquery).toArray();
        console.log(data);
        return (0, responseFormat_1.ResponseFormat)(200, "All filtered data found", data);
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something went wrong", error);
    }
};
exports.getFilteredData = getFilteredData;
