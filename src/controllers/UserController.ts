import { ObjectId } from "mongodb";
import { UserModel, VaccinationStatus } from "../models/UserModel";
import { dbConnect, slotdbConnect } from "../utils/MongoClient";
import { loginValidator, profileValidator, registerValidator, slotValidator } from '../validator/UserSchemaValidator';
import { ResponseFormat } from "../responseFormat";
export const init = async () => {
    const db = await dbConnect();
    if (db) {
        console.log("Db collection Connected from UserController");
    }
}
init();
export const registerUser = async (event: any) => {
    try {
           const db = await dbConnect();
        console.log("User is registered");
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Parsed body:", body);
        const { name, mobile, password, aadharNumber, age, pincode, } = body;
     
        const existingUser = await db!.findOne({ mobile });
        if (existingUser) {
            return ResponseFormat(400, "User already exists with this mobile number");
        }
        const newUser: UserModel = {
            name,
            mobile,
            password,
            aadharNumber,
            age,
            pincode,
            isAdmin: false,
            vaccinationStatus: VaccinationStatus.None,
            bookedSlot: null,
            doseHistory: [],
        };

        const validateResult = registerValidator.validate(newUser);
        if (validateResult.error) {
            console.error('Validation error:', validateResult.error.message);
            return ResponseFormat(400, "Validation Format error", validateResult.error.message);

        }
        else {
            console.log('Valid data:', validateResult.value);
            await db!.insertOne(newUser);
            return ResponseFormat(201, "User Registered Successfully");
        }
    } catch (error) {
        console.log("Error in Register Process:", error);
        return ResponseFormat(400, "Internal Server Error", error);
    }
}
export const loginUser = async (event: any) => {
    try {
        const body = JSON.parse(event.body);
        const { mobile, password } = body;
        const db = await dbConnect();
        console.log(mobile, password);
        const validateCred = loginValidator.validate(body);
        console.log(validateCred);
        if (validateCred.error) {
            return ResponseFormat(400, "Validation Format error", validateCred.error.message);
        }
        else {
            const existingUser = await db!.findOne({ mobile });
            if (!existingUser) {
                return ResponseFormat(400, "User Not found with this mobile number");
            }

            return ResponseFormat(200, "User Information", {
                _id: existingUser?._id,
                name: existingUser?.name,
                mobile: existingUser?.mobile,
                isAdmin: existingUser?.isAdmin || false,
            });
        }
    } catch (error) {
        console.log("Error in LoginUser", error);
        return ResponseFormat(400, "Internal Server Error", error);
    }
}
export const getProfile = async (event: any) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { mobile } = body;
        const db = await dbConnect();
        const validateProfile = profileValidator.validate(body);
        console.log(validateProfile);
        if (validateProfile.error) {
            return ResponseFormat(400, "Validation Format error", validateProfile.error.message);
        }
        const userProfile = await db!.findOne({ mobile });
        if (!userProfile) {
            console.log("User not exists in db");
            return ResponseFormat(400, "User not found with this mobile number");

        }
        return ResponseFormat(200, "Profile Information", {
            _id: userProfile?._id,
            name: userProfile?.name,
            mobile: userProfile?.mobile,
        });

    } catch (error) {
        console.log("Error in profile api", error);
        return ResponseFormat(400, "Internal Server Error", error);
    }
}

export const bookSlot = async (event: any) => {
    try {

        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { slotId } = body;
        const db = await slotdbConnect();
        console.log("SlotId", slotId);
        const objectId = new ObjectId(slotId);
        console.log("ObjectId", objectId);
        const validateSlotId = slotValidator.validate(body);
        if (validateSlotId.error) {
            return ResponseFormat(400, "Validation Format error", validateSlotId.error.message);
        }
        const checkSLotId = await db?.findOne({ _id: objectId });
        console.log("checkSLotId", checkSLotId);
        if (!checkSLotId) {
            console.log("Slot id is not present in db");
            return ResponseFormat(400, "slot id not exist in db");

        }
        await db?.updateOne({
            _id: objectId
        },
            {
                $inc: {
                    "availableCapacity": -1
                }
            })

         return ResponseFormat(200, "Slot Booked");

    } catch (error) {
        console.log("Error in bookSlot api", error);
        return ResponseFormat(400, "Internal Server Error", error);
    }
}