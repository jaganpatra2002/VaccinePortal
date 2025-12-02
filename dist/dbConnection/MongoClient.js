"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotdbConnect = exports.dbConnect = void 0;
const mongodb_1 = require("mongodb");
const client = new mongodb_1.MongoClient("mongodb+srv://jaganpatra_db_user:Patra123@cluster0.twvcjqe.mongodb.net/?appName=Cluster0");
let cachedClient = null;
const getClient = async () => {
    if (cachedClient) {
        return cachedClient;
    }
    cachedClient = client;
    return cachedClient;
};
const dbConnect = async () => {
    try {
        await getClient();
        const userDB = client.db("VaccineDatabase").collection("VaccinePortal");
        return userDB;
    }
    catch (error) {
        console.log("Error in DB Connection", error);
    }
};
exports.dbConnect = dbConnect;
const slotdbConnect = async () => {
    try {
        await getClient();
        const slotDB = client.db("VaccineDatabase").collection("slots");
        return slotDB;
    }
    catch (error) {
        console.log("Error in DB Connection", error);
    }
};
exports.slotdbConnect = slotdbConnect;
