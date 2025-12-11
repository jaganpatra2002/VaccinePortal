import { MongoClient } from "mongodb";
const url=process.env.MONGODB_URL || "";
const client = new MongoClient(url);

let cachedClient: MongoClient | null = null;
const getClient = async () => {
    if (cachedClient) {
        return cachedClient;
    }
    cachedClient = client;
    return cachedClient;
}
export const dbConnect = async () => {
    try {
        await getClient();
        const userDB = client.db("VaccineDatabase").collection("VaccinePortal");
        return userDB;
    } catch (error) {
        console.log("Error in DB Connection", error);
    }
}
export const slotdbConnect = async () => {
    try {
        await getClient();
        const slotDB = client.db("VaccineDatabase").collection("slots");
        return slotDB;
    } catch (error) {
        console.log("Error in DB Connection", error);
    }
}