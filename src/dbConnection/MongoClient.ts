import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb+srv://jaganpatra_db_user:Patra123@cluster0.twvcjqe.mongodb.net/?appName=Cluster0");
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
        console.log("DB Connected Successfully");
        return userDB;
    } catch (error) {
        console.log("Error in DB Connection", error);
    }
}
export const slotdbConnect = async () => {
    try {
        await getClient();
        const slotDB = client.db("VaccineDatabase").collection("slots");
        console.log("DB Connected Successfully");
        return slotDB;
    } catch (error) {
        console.log("Error in DB Connection", error);
    }
}