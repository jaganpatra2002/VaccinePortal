import { ResponseFormat } from "../responseFormat";
import { slotBookingValidator, validateSlot } from "../validator/SlotSchemaValidator";
import { slotdbConnect,dbConnect } from "../utils/MongoClient";
import { DoseType, VaccinationStatus } from "../models/UserModel";
export const viewSlot = async (event: any) => {
    try {
        const db = await slotdbConnect();
        const body = event.queryStringParameters?.date;
        console.log("Body", body);
        const dateToValidate = { date:body };
        console.log("Date", dateToValidate.date);

        const info=dateToValidate.date;
         console.log("info", info);
        const validateDate = validateSlot.validate({date:info});
        console.log("validateDate", validateDate);
        const dat1=validateDate.value.info;
        console.log("$$", dat1);
        if (validateDate.error) {
            return ResponseFormat(400, "Format Error", validateDate.error);
        }
        const slotcheck = validateDate.value;
        console.log("slotcheck", slotcheck);
        const slotData = await db?.find({ dat1 }).toArray();
        return ResponseFormat(200, "All slots", slotData)
    } catch (error) {
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}

export const bookSlot=async(event:any)=>{
    const db=await dbConnect();
    const slotDb=await slotdbConnect();
    const body=typeof event.body =="string"? JSON.parse(event.body) : event.body;
    const { mobile, doseType,slotId}=body;
    const validateUserData=slotBookingValidator.validate(body);
    if(validateUserData.error){
         return ResponseFormat(400, "Format Error", validateUserData.error);
    }
    const existingUser=await db?.findOne({mobile});
    if(!existingUser){
         return ResponseFormat(400, "User not found")
    }
    if(doseType==DoseType.Two){
        if(existingUser.vaccinationStatus!== VaccinationStatus.FirstDose){
             return ResponseFormat(400, "Cannot book 2nd dose before completing 1st dose")
        }
    }
    if(existingUser.bookedSlot!=null){
         return ResponseFormat(400, "You already have an active booking")
    }
    const existingSlotId=await slotDb?.findOne({slotId});
    if(!existingSlotId){
          return ResponseFormat(400, "Slot Id not found")
    }
    const book=await existingSlotId?.aggregate([
        {
            $match:{ availableCapacity: { $gt:0}}
        }
    ])
    if(!book){
        return ResponseFormat(400, "Slots are full for this id",slotId)
    }
    await slotDb?.updateOne({_id: existingSlotId},{
        $inc: {"availableCapacity":-1}
    })
    await slotDb?.updateOne({
        _id:existingSlotId
    },{
        $inc :{"bookedCount": +1}
    })

}