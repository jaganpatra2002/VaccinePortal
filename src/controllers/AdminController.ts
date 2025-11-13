import { Search } from "../models/searchModel";
import { ResponseFormat } from "../responseFormat";
import { slotdbConnect, dbConnect } from "../utils/MongoClient";
import { addSlotValidate, filteredData } from "../validator/AdminSchemaValidator";
export const addSlot = async (event: any) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { date, time, availableCapacity } = body;
        const db = await slotdbConnect();
        const sloValidate = addSlotValidate.validate(body);
        console.log(sloValidate);
        if (sloValidate.error) {
            return ResponseFormat(400, "Format error", sloValidate.error.message)
        }
        const slot = await db?.insertOne({ date, time, availableCapacity });
        return ResponseFormat(200, "Slot added successfully", slot)

    } catch (error) {
        return ResponseFormat(400, "Something Went wrong", error)
    }
}

export const getSlots = async () => {
    try {
        const db = await slotdbConnect();
        const slotData = await db?.find().toArray();
        return ResponseFormat(200, "All slots found", slotData);
    } catch (error) {
        console.log(error);
        return ResponseFormat(400, "Something went wrong", error);
    }
}

export const getAllBookings = async () => {
    try {
        const db = await dbConnect();
        const bookingsData = await db?.find({ bookedSlot: { $ne: null } }).toArray();
        console.log(bookingsData);
        return ResponseFormat(200, "All bookings found", bookingsData);

    } catch (error) {
        return ResponseFormat(400, "Something went wrong", error);
    }
}

export const getFilteredData = async (event: any) => {
    try {
        const age = event.queryStringParameters?.age;
        const pincode = event.queryStringParameters?.pincode;
        const vaccinationStatus = event.queryStringParameters?.vaccinationStatus;
        console.log(age);
        console.log(pincode);
        console.log(vaccinationStatus);
        const db = await dbConnect();
        let query: Search = { age, pincode, vaccinationStatus };
        const filterData = filteredData.validate(query);
        if (filterData.error) {
            return ResponseFormat(400, "Format error", filterData.error.message)
        }
        console.log(filterData.error);
        let finalquery:Search={};
        if(filterData.value.age!==undefined){
            finalquery.age=filterData.value.age;
        }
         if(filterData.value.pincode!==undefined){
            finalquery.pincode=filterData.value.pincode;
        }
         if(filterData.value.vaccinationStatus!==undefined){
            finalquery.vaccinationStatus=filterData.value.vaccinationStatus;
        }
        const data = await db?.find(finalquery).toArray();
        console.log(data);

        return ResponseFormat(200, "All filtered data found", data);

    } catch (error) {
        console.log(error);
        return ResponseFormat(400, "Something went wrong", error);
    }
}