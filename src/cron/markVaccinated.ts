import { dbConnect, slotdbConnect } from "../dbConnection/MongoClient";
import { VaccinationStatus, DoseType } from "../models/UserModel";
import { ResponseFormat } from "../utils/responseFormat";

export const UpdateVaccinationStatusCron = async (event: any) => {
    try {
        const userDb = await dbConnect();
        const slotDb = await slotdbConnect();
        const now=new Date();
        const slots = await slotDb?.find({
            "bookedCount": {
                $gt: 0
            }
        }).toArray();
        for(const slot of slots || []){
            const slotStart= new Date(`${slot.date}T${slot.time}:00`);
            if(slotStart<=now){
                const users=await userDb?.find({bookedSlot: slot._id}).toArray();
                for(const user of users || []){
           
                    try {
                        let newStatus = user.vaccinationStatus ?? VaccinationStatus.None;
                        if (user.doseHistory && user.doseHistory.length >= 1) {
                            const lastDose = user.doseHistory[user.doseHistory.length - 1].dose;
                            if (lastDose === DoseType.One) {
                                newStatus = VaccinationStatus.FirstDose;
                            } else if (lastDose === DoseType.Two) {
                                newStatus = VaccinationStatus.AllDose;
                            }
                        }

                        // persist the user's vaccination status and clear bookedSlot
                        await userDb?.updateOne(
                            { _id: user._id },
                            { $set: { vaccinationStatus: newStatus, bookedSlot: null } }
                        );
                    } catch (uErr) {
                        console.error("Error updating user in cron", user?._id, uErr);
                    }
                }
            }
        }
        return ResponseFormat(200,"Vaccine cron is working");
    } catch (error) {
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}