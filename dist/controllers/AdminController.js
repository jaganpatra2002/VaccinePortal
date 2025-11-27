"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilteredData = exports.getAllBookings = exports.getSlots = exports.addSlot = exports.connectToDb = void 0;
const responseFormat_1 = require("../utils/responseFormat");
const MongoClient_1 = require("../dbConnection/MongoClient");
const AdminSchemaValidator_1 = require("../validator/AdminSchemaValidator");
const auth_1 = require("../middleware/auth");
const connectToDb = async () => {
    const slotDb = await (0, MongoClient_1.slotdbConnect)();
    const userDb = await (0, MongoClient_1.dbConnect)();
    return { slotDb, userDb };
};
exports.connectToDb = connectToDb;
const addSlot = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
        }
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { date, time, availableCapacity } = body;
        const sloValidate = AdminSchemaValidator_1.addSlotValidate.validate(body);
        console.log(sloValidate);
        if (sloValidate.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Format error", sloValidate.error.message);
        }
        const DB = await (0, exports.connectToDb)();
        const slot = await DB.slotDb?.insertOne({ date, time, availableCapacity });
        return (0, responseFormat_1.ResponseFormat)(200, "Slot added successfully", slot);
    }
    catch (error) {
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went wrong", error);
    }
};
exports.addSlot = addSlot;
const getSlots = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
        }
        const DB = await (0, exports.connectToDb)();
        const slotData = await DB.slotDb?.find().toArray();
        return (0, responseFormat_1.ResponseFormat)(200, "All slots found", slotData);
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something went wrong", error);
    }
};
exports.getSlots = getSlots;
const getAllBookings = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
        }
        const DB = await (0, exports.connectToDb)();
        const bookingsData = await DB.userDb?.find({ bookedSlot: { $ne: null } }).toArray();
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
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        console.log("checkAuth", checkAuth);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid");
        }
        const DB = await (0, exports.connectToDb)();
        const age = event.queryStringParameters?.age;
        const pincode = event.queryStringParameters?.pincode;
        const vaccinationStatus = event.queryStringParameters?.vaccinationStatus;
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
        const data = await DB.userDb?.find(finalquery).toArray();
        console.log(data);
        return (0, responseFormat_1.ResponseFormat)(200, "All filtered data found", data);
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something went wrong", error);
    }
};
exports.getFilteredData = getFilteredData;
