"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slots = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGO_URI;
if (!uri) {
    throw new Error("MONGO_URI environment variable is not set.");
}
const client = new mongodb_1.MongoClient(uri);
const Slots = async () => {
    await client.connect();
    const myDB = client.db("VaccineDatabase");
    const slotData = myDB.collection("slots");
    const StartDate = new Date("2024-11-01");
    const EndDate = new Date("2024-11-30");
    const slots = [];
    const timeSLots = [
        '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30'
    ];
    for (let d = new Date(StartDate); d <= EndDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        for (const t of timeSLots) {
            slots.push({
                date: dateStr,
                time: t,
                availableCapacity: 10,
                bookedCount: 0
            });
        }
    }
    const result = await slotData.insertMany(slots);
};
exports.Slots = Slots;
(0, exports.Slots)();
