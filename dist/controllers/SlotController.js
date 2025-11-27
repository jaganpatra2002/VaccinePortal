"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSlot = exports.userSlotBooking = exports.BookSlot = exports.viewSlot = exports.connectToDb = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const responseFormat_1 = require("../utils/responseFormat");
const SlotSchemaValidator_1 = require("../validator/SlotSchemaValidator");
const MongoClient_1 = require("../dbConnection/MongoClient");
const UserModel_1 = require("../models/UserModel");
const mongodb_1 = require("mongodb");
const auth_1 = require("../middleware/auth");
const connectToDb = async () => {
    const slotDb = await (0, MongoClient_1.slotdbConnect)();
    const userDb = await (0, MongoClient_1.dbConnect)();
    return { slotDb, userDb };
};
exports.connectToDb = connectToDb;
const viewSlot = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
        }
        const DB = await (0, exports.connectToDb)();
        const body = event.queryStringParameters?.date;
        const dateToValidate = { date: body };
        const info = dateToValidate.date;
        const validateDate = SlotSchemaValidator_1.validateSlot.validate({ date: info });
        const dat1 = validateDate.value.info;
        if (validateDate.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Format Error", validateDate.error);
        }
        const slotcheck = validateDate.value;
        const slotData = await DB.slotDb?.find({ dat1 }).toArray();
        return (0, responseFormat_1.ResponseFormat)(200, "All slots", slotData);
    }
    catch (error) {
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.viewSlot = viewSlot;
const BookSlot = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
        }
        const DB = await (0, exports.connectToDb)();
        const body = typeof event.body == "string" ? JSON.parse(event.body) : event.body;
        const { mobile, doseType, slotId } = body;
        const validateUserData = SlotSchemaValidator_1.slotBookingValidator.validate(body);
        if (validateUserData.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Format Error", validateUserData.error);
        }
        const existingUser = await DB.userDb?.findOne({ mobile });
        if (!existingUser) {
            return (0, responseFormat_1.ResponseFormat)(400, "User not found");
        }
        if (doseType == UserModel_1.DoseType.Two && existingUser.vaccinationStatus !== UserModel_1.VaccinationStatus.FirstDose) {
            return (0, responseFormat_1.ResponseFormat)(400, "Cannot book 2nd dose before completing 1st dose");
        }
        // slot not found
        const objectId = new mongodb_1.ObjectId(slotId);
        const existingSlotId = await DB.slotDb?.findOne({ _id: objectId });
        console.log(existingSlotId);
        if (!existingSlotId) {
            return (0, responseFormat_1.ResponseFormat)(400, "Slot Id not found");
        }
        // check slot full or not
        if (existingSlotId.availableCapacity <= 0) {
            return (0, responseFormat_1.ResponseFormat)(400, "Slots are full for this id", existingSlotId._id);
        }
        let vaccineStatus = doseType === UserModel_1.DoseType.One
            ? UserModel_1.VaccinationStatus.FirstDose
            : UserModel_1.VaccinationStatus.AllDose;
        // reduce availableCapacity  to 1 of that slot id
        await DB.slotDb?.updateOne({ _id: existingSlotId._id }, {
            $inc: {
                "availableCapacity": -1,
                "bookedCount": +1
            }
        });
        //  update slotid in bookedslot
        await DB.userDb?.updateOne({ mobile: mobile }, {
            $set: {
                "bookedSlot": existingSlotId._id,
                "vaccinationStatus": vaccineStatus
            },
            $push: {
                doseHistory: {
                    dose: doseType,
                    slotId: existingSlotId._id,
                    date: new Date()
                }
            }
        });
        return (0, responseFormat_1.ResponseFormat)(200, `Dose ${doseType} slot booked successfully for slot ${existingSlotId._id}`);
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.BookSlot = BookSlot;
const userSlotBooking = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
        }
        const DB = await (0, exports.connectToDb)();
        const mobile = event.queryStringParameters?.mobile;
        console.log(mobile);
        const obj = { mobile };
        console.log(obj);
        const bookData = SlotSchemaValidator_1.mybooking.validate(obj);
        console.log(bookData.error);
        if (bookData.error) {
            console.log(bookData.error);
            return (0, responseFormat_1.ResponseFormat)(400, "Format Error", bookData.error);
        }
        const existingUser = await DB.userDb?.findOne({ mobile: mobile });
        console.log(existingUser);
        if (!existingUser?.mobile) {
            return (0, responseFormat_1.ResponseFormat)(400, "User Not Found in DB");
        }
        if (existingUser.bookedSlot === null) {
            return (0, responseFormat_1.ResponseFormat)(400, "No Bookings for this User", existingUser);
        }
        return (0, responseFormat_1.ResponseFormat)(200, "Data Found", existingUser);
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.userSlotBooking = userSlotBooking;
const cancelSlot = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
        }
        const DB = await (0, exports.connectToDb)();
        const mobile = event.queryStringParameters.mobile;
        const data = { mobile };
        const slotValidate = SlotSchemaValidator_1.cancelBooking.validate(data);
        if (slotValidate.error) {
            console.log(slotValidate.error);
            return (0, responseFormat_1.ResponseFormat)(400, "Format Error", slotValidate.error);
        }
        const existingUser = await DB.userDb?.findOne({ mobile });
        if (!existingUser) {
            return (0, responseFormat_1.ResponseFormat)(400, "User Not Exists in Db");
        }
        if (existingUser.bookedSlot === null) {
            return (0, responseFormat_1.ResponseFormat)(400, "No Slots to cancel");
        }
        const slotInfo = existingUser.doseHistory[0].date;
        const slotDateTime = new Date(slotInfo);
        console.log(`Parsed slotDateTime object: ${slotDateTime.toISOString()}`);
        if (isNaN(slotDateTime.getTime())) {
            return (0, responseFormat_1.ResponseFormat)(400, "Invalid slot date or time format in database");
        }
        const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log(twentyFourHoursFromNow);
        if (slotDateTime >= twentyFourHoursFromNow) {
            return (0, responseFormat_1.ResponseFormat)(400, "Cannot cancel slot within 24 hours of appointment time");
        }
        const slotId = await existingUser.bookedSlot;
        console.log("$$$", slotId);
        const Info = await DB.slotDb?.findOne({ _id: slotId });
        if (Info?.bookedCount > 10) {
            return (0, responseFormat_1.ResponseFormat)(400, "Booked Slot Limit is 10");
        }
        if (Info?.availableCapacity < 0) {
            return (0, responseFormat_1.ResponseFormat)(400, "Available Capacity Cannot be less than 0");
        }
        await DB.slotDb?.updateOne({ _id: slotId }, {
            $inc: {
                "availableCapacity": +1,
                "bookedCount": -1
            }
        });
        // remove booked SLot from user db
        await DB.userDb?.updateOne({
            _id: existingUser?._id
        }, {
            $set: {
                "bookedSlot": null
            }
        });
        return (0, responseFormat_1.ResponseFormat)(200, "Data Found", existingUser);
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.cancelSlot = cancelSlot;
