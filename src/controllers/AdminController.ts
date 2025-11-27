import { Search } from "../models/searchModel";
import { ResponseFormat } from "../utils/responseFormat";
import { slotdbConnect, dbConnect } from "../dbConnection/MongoClient";
import { addSlotValidate, filteredData } from "../validator/AdminSchemaValidator";
import { tokenValidation } from "../middleware/auth";
export const connectToDb = async () => {
    const slotDb = await slotdbConnect();
    const userDb = await dbConnect();
    return { slotDb, userDb }
}
export const addSlot = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { date, time, availableCapacity } = body;
        const sloValidate = addSlotValidate.validate(body);
        if (sloValidate.error) {
            return ResponseFormat(400, "Format error", sloValidate.error.message)
        }
        const DB = await connectToDb();
        const slot = await DB.slotDb?.insertOne({ date, time, availableCapacity });
        return ResponseFormat(200, "Slot added successfully", slot)

    } catch (error) {
        return ResponseFormat(400, "Something Went wrong", error)
    }
}

export const getSlots = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        const DB = await connectToDb();
        const slotData = await DB.slotDb?.find().toArray();
        return ResponseFormat(200, "All slots found", slotData);
    } catch (error) {
        return ResponseFormat(400, "Something went wrong", error);
    }
}

export const getAllBookings = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        const DB = await connectToDb();
        const bookingsData = await DB.userDb?.find({ bookedSlot: { $ne: null } }).toArray();
        return ResponseFormat(200, "All bookings found", bookingsData);

    } catch (error) {
        return ResponseFormat(400, "Something went wrong", error);
    }
}

export const getFilteredData = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid");
        }
        const DB = await connectToDb();
        const age = event.queryStringParameters?.age;
        const pincode = event.queryStringParameters?.pincode;
        const vaccinationStatus = event.queryStringParameters?.vaccinationStatus;
        let query: Search = { age, pincode, vaccinationStatus };
        const filterData = filteredData.validate(query);
        if (filterData.error) {
            return ResponseFormat(400, "Format error", filterData.error.message)
        }
        let finalquery: Search = {};
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
        return ResponseFormat(200, "All filtered data found",data);
    } catch (error) {
        return ResponseFormat(400, "Something went wrong", error);
    }
}