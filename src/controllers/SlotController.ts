import dotenv from "dotenv";
dotenv.config();
import { ResponseFormat } from "../utils/responseFormat";
import { cancelBooking, mybooking, slotBookingValidator, validateSlot } from "../validator/SlotSchemaValidator";
import { slotdbConnect, dbConnect } from "../dbConnection/MongoClient";
import { DoseType, VaccinationStatus } from "../models/UserModel";
import { ObjectId } from "mongodb";
import { tokenValidation } from "../middleware/auth";
export const connectToDb = async () => {
    const slotDb = await slotdbConnect();
    const userDb = await dbConnect();
    return { slotDb, userDb }
}
export const viewSlot = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        const DB = await connectToDb();
        const body = event.queryStringParameters?.date;
        console.log("Body", body);
        const dateToValidate = { date: body };
        console.log("Date", dateToValidate.date);

        const info = dateToValidate.date;
        console.log("info", info);
        const validateDate = validateSlot.validate({ date: info });
        console.log("validateDate", validateDate);
        const dat1 = validateDate.value.info;
        console.log("$$", dat1);
        if (validateDate.error) {
            return ResponseFormat(400, "Format Error", validateDate.error);
        }
        const slotcheck = validateDate.value;
        console.log("slotcheck", slotcheck);
        const slotData = await DB.slotDb?.find({ dat1 }).toArray();
        return ResponseFormat(200, "All slots", slotData)
    } catch (error) {
        console.log(error);
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}

export const BookSlot = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        const DB = await connectToDb();
        const body = typeof event.body == "string" ? JSON.parse(event.body) : event.body;
        const { mobile, doseType, slotId } = body;
        const validateUserData = slotBookingValidator.validate(body);
        if (validateUserData.error) {
            return ResponseFormat(400, "Format Error", validateUserData.error);
        }
        const existingUser = await DB.userDb?.findOne({ mobile });
        if (!existingUser) {
            return ResponseFormat(400, "User not found")
        }
        if (doseType == DoseType.Two && existingUser.vaccinationStatus !== VaccinationStatus.FirstDose) {
            return ResponseFormat(400, "Cannot book 2nd dose before completing 1st dose")

        }
        // slot not found
        const objectId = new ObjectId(slotId);
        const existingSlotId = await DB.slotDb?.findOne({ _id: objectId });
        console.log(existingSlotId);
        if (!existingSlotId) {
            return ResponseFormat(400, "Slot Id not found")
        }
        // check slot full or not
        if (existingSlotId.availableCapacity <= 0) {
            return ResponseFormat(400, "Slots are full for this id", existingSlotId._id)
        }
        let vaccineStatus: VaccinationStatus = doseType === DoseType.One
            ? VaccinationStatus.FirstDose
            : VaccinationStatus.AllDose;
        // reduce availableCapacity  to 1 of that slot id
        await DB.slotDb?.updateOne({ _id: existingSlotId._id }, {
            $inc: {
                "availableCapacity": -1,
                "bookedCount": +1
            }
        })
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
        } as any)
        return ResponseFormat(200, `Dose ${doseType} slot booked successfully for slot ${existingSlotId._id}`)
    } catch (error) {
        console.log(error);
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}

export const userSlotBooking = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        const DB = await connectToDb();
        const mobile = event.queryStringParameters?.mobile;
        console.log(mobile);
        const obj = { mobile };
        console.log(obj);
        const bookData = mybooking.validate(obj);
        console.log(bookData.error);
        if (bookData.error) {
            console.log(bookData.error);
            return ResponseFormat(400, "Format Error", bookData.error);
        }
        const existingUser = await DB.userDb?.findOne({ mobile: mobile });
        console.log(existingUser);
        if (!existingUser?.mobile) {
            return ResponseFormat(400, "User Not Found in DB");
        }
        if (existingUser.bookedSlot === null) {
            return ResponseFormat(400, "No Bookings for this User", existingUser)
        }
        return ResponseFormat(200, "Data Found", existingUser)
    } catch (error) {
        console.log(error);
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}

export const cancelSlot = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        const DB = await connectToDb();
        const mobile = event.queryStringParameters.mobile;
        const data = { mobile };
        const slotValidate = cancelBooking.validate(data);
        if (slotValidate.error) {
            console.log(slotValidate.error);
            return ResponseFormat(400, "Format Error", slotValidate.error);
        }
        const existingUser = await DB.userDb?.findOne({ mobile });
        if (!existingUser) {
            return ResponseFormat(400, "User Not Exists in Db");
        }
        if (existingUser.bookedSlot === null) {
            return ResponseFormat(400, "No Slots to cancel");
        }
        const slotInfo = existingUser.doseHistory[0].date;
        const slotDateTime = new Date(slotInfo);

        console.log(`Parsed slotDateTime object: ${slotDateTime.toISOString()}`);

        if (isNaN(slotDateTime.getTime())) {
            return ResponseFormat(400, "Invalid slot date or time format in database");
        }
        const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log(twentyFourHoursFromNow);
        if (slotDateTime >= twentyFourHoursFromNow) {
            return ResponseFormat(
                400,
                "Cannot cancel slot within 24 hours of appointment time"
            );
        }
        const slotId = await existingUser.bookedSlot;

        console.log("$$$", slotId);
        const Info = await DB.slotDb?.findOne({ _id: slotId });
       
        if (Info?.bookedCount > 10) {
            return ResponseFormat(
                400,
                "Booked Slot Limit is 10"
            );
        }
         if (Info?.availableCapacity < 0) {
            return ResponseFormat(
                400,
                "Available Capacity Cannot be less than 0"
            );
        }
        await DB.slotDb?.updateOne({ _id: slotId }, {
            $inc: {
                "availableCapacity": +1,
                "bookedCount": -1
            }
        })
        // remove booked SLot from user db
        await DB.userDb?.updateOne({
            _id: existingUser?._id
        }, {
            $set: {
                "bookedSlot": null
            }
        })

        return ResponseFormat(200, "Data Found", existingUser)
    } catch (error) {
        console.log(error);
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}

