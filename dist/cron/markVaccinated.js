"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVaccinationStatusCron = void 0;
const MongoClient_1 = require("../dbConnection/MongoClient");
const UserModel_1 = require("../models/UserModel");
const responseFormat_1 = require("../utils/responseFormat");
const UpdateVaccinationStatusCron = async (event) => {
    try {
        const userDb = await (0, MongoClient_1.dbConnect)();
        const slotDb = await (0, MongoClient_1.slotdbConnect)();
        const now = new Date();
        const slots = await slotDb?.find({
            "bookedCount": {
                $gt: 0
            }
        }).toArray();
        for (const slot of slots || []) {
            const slotStart = new Date(`${slot.date}T${slot.time}:00`);
            if (slotStart <= now) {
                const users = await userDb?.find({ bookedSlot: slot._id }).toArray();
                for (const user of users || []) {
                    try {
                        let newStatus = user.vaccinationStatus ?? UserModel_1.VaccinationStatus.None;
                        if (user.doseHistory && user.doseHistory.length >= 1) {
                            const lastDose = user.doseHistory[user.doseHistory.length - 1].dose;
                            if (lastDose === UserModel_1.DoseType.One) {
                                newStatus = UserModel_1.VaccinationStatus.FirstDose;
                            }
                            else if (lastDose === UserModel_1.DoseType.Two) {
                                newStatus = UserModel_1.VaccinationStatus.AllDose;
                            }
                        }
                        // persist the user's vaccination status and clear bookedSlot
                        await userDb?.updateOne({ _id: user._id }, { $set: { vaccinationStatus: newStatus, bookedSlot: null } });
                    }
                    catch (uErr) {
                        console.error("Error updating user in cron", user?._id, uErr);
                    }
                }
            }
        }
        return (0, responseFormat_1.ResponseFormat)(200, "Vaccine cron is working");
    }
    catch (error) {
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.UpdateVaccinationStatusCron = UpdateVaccinationStatusCron;
