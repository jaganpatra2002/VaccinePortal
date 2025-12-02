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
        const score = event.queryStringParameters?.score;
        const status = event.queryStringParameters?.status;
        let query: Search = { score, status };
        const filterData = filteredData.validate(query);
        if (filterData.error) {
            return ResponseFormat(400, "Format error", filterData.error.message)
        }
        let finalquery: any = {

        };
        if (filterData.value.status === "Analyzed" || filterData.value.status === "UnAnalyzed") {
            finalquery.status = filterData.value.status;          
        }
            console.log("Query", finalquery);
        if (filterData.value.status === "Analyzed" && filterData.value.score && filterData.value.score !== "All") {
            const Scorerangevalues = filterData.value.score.split(',');
            const rangeConditions: any[] = [];
            Scorerangevalues.forEach((i: string) => {
                switch (i) {
                    case '0-30':
                        rangeConditions.push({score :{ $gte:0, $lte:30}});
                        break;
                    case '30-60':
                        rangeConditions.push({score:{ $gt:30, $lte:60}});
                        break;
                    case '60-90':
                        rangeConditions.push({score:{$gt:60, $lte:90}});
                        break;
                    case 'gt90':
                        rangeConditions.push({score:{gt:90}});
                        break;
                }
            })
            if(rangeConditions.length>0){
                finalquery.$or=rangeConditions;
            }
        }
        console.log("Query", finalquery)
        const data = await DB.userDb?.find(finalquery).toArray();
        console.log("Data", data);
        return ResponseFormat(200, "All filtered data found", data);
    } catch (error) {
        console.log("Error", error);
        return ResponseFormat(400, "Something went wrong", error);
    }
}