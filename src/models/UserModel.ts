export enum DoseType{
    One=1,
    Two=2
}
export enum VaccinationStatus{
    None="none",
    FirstDose="first-dose-completeed",
    SecondDose="second-dose-completed"
}
export interface DoseModel {
    dose:DoseType,
    slotId:number,
    date:Date
}
export interface UserModel {
    name:String,
    mobile:String,
    password:String,
    age:number,
    pincode:number,
    aadharNumber:number,
    isAdmin?:Boolean,
    doseHistory?:DoseModel[],
    vaccinationStatus?:VaccinationStatus,
    bookedSlot?:string | null
}