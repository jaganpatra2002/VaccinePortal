"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookSlot = exports.getProfile = exports.loginUser = exports.registerUser = exports.init = void 0;
const mongodb_1 = require("mongodb");
const UserModel_1 = require("../models/UserModel");
const MongoClient_1 = require("../utils/MongoClient");
const UserSchemaValidator_1 = require("../validator/UserSchemaValidator");
const responseFormat_1 = require("../responseFormat");
const init = async () => {
    const db = await (0, MongoClient_1.dbConnect)();
    if (db) {
        console.log("Db collection Connected from UserController");
    }
};
exports.init = init;
(0, exports.init)();
const registerUser = async (event) => {
    try {
        const db = await (0, MongoClient_1.dbConnect)();
        console.log("User is registered");
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Parsed body:", body);
        const { name, mobile, password, aadharNumber, age, pincode, } = body;
        const existingUser = await db.findOne({ mobile });
        if (existingUser) {
            return (0, responseFormat_1.ResponseFormat)(400, "User already exists with this mobile number");
        }
        const newUser = {
            name,
            mobile,
            password,
            aadharNumber,
            age,
            pincode,
            isAdmin: false,
            vaccinationStatus: UserModel_1.VaccinationStatus.None,
            bookedSlot: null,
            doseHistory: [],
        };
        const validateResult = UserSchemaValidator_1.registerValidator.validate(newUser);
        if (validateResult.error) {
            console.error('Validation error:', validateResult.error.message);
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateResult.error.message);
        }
        else {
            console.log('Valid data:', validateResult.value);
            await db.insertOne(newUser);
            return (0, responseFormat_1.ResponseFormat)(201, "User Registered Successfully");
        }
    }
    catch (error) {
        console.log("Error in Register Process:", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.registerUser = registerUser;
const loginUser = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { mobile, password } = body;
        const db = await (0, MongoClient_1.dbConnect)();
        console.log(mobile, password);
        const validateCred = UserSchemaValidator_1.loginValidator.validate(body);
        console.log(validateCred);
        if (validateCred.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateCred.error.message);
        }
        else {
            const existingUser = await db.findOne({ mobile });
            if (!existingUser) {
                return (0, responseFormat_1.ResponseFormat)(400, "User Not found with this mobile number");
            }
            return (0, responseFormat_1.ResponseFormat)(200, "User Information", {
                _id: existingUser?._id,
                name: existingUser?.name,
                mobile: existingUser?.mobile,
                isAdmin: existingUser?.isAdmin || false,
            });
        }
    }
    catch (error) {
        console.log("Error in LoginUser", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.loginUser = loginUser;
const getProfile = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { mobile } = body;
        const db = await (0, MongoClient_1.dbConnect)();
        const validateProfile = UserSchemaValidator_1.profileValidator.validate(body);
        console.log(validateProfile);
        if (validateProfile.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateProfile.error.message);
        }
        const userProfile = await db.findOne({ mobile });
        if (!userProfile) {
            console.log("User not exists in db");
            return (0, responseFormat_1.ResponseFormat)(400, "User not found with this mobile number");
        }
        return (0, responseFormat_1.ResponseFormat)(200, "Profile Information", {
            _id: userProfile?._id,
            name: userProfile?.name,
            mobile: userProfile?.mobile,
        });
    }
    catch (error) {
        console.log("Error in profile api", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.getProfile = getProfile;
const bookSlot = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { slotId } = body;
        const db = await (0, MongoClient_1.slotdbConnect)();
        console.log("SlotId", slotId);
        const objectId = new mongodb_1.ObjectId(slotId);
        console.log("ObjectId", objectId);
        const validateSlotId = UserSchemaValidator_1.slotValidator.validate(body);
        if (validateSlotId.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateSlotId.error.message);
        }
        const checkSLotId = await db?.findOne({ _id: objectId });
        console.log("checkSLotId", checkSLotId);
        if (!checkSLotId) {
            console.log("Slot id is not present in db");
            return (0, responseFormat_1.ResponseFormat)(400, "slot id not exist in db");
        }
        await db?.updateOne({
            _id: objectId
        }, {
            $inc: {
                "availableCapacity": -1
            }
        });
        return (0, responseFormat_1.ResponseFormat)(200, "Slot Booked");
    }
    catch (error) {
        console.log("Error in bookSlot api", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.bookSlot = bookSlot;
