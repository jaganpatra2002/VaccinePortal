import { VaccinationStatus } from "./UserModel";

export interface Search {
    // age?:number,
    // pincode?:number,
    // vaccinationStatus?:VaccinationStatus,
    score?:number | string,
    status?: string
}