import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ResponseFormat } from "../utils/responseFormat";
import { dbConnect } from "../dbConnection/MongoClient";

export const verifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-1_HRKw865aZ",
    tokenUse: "access",
    clientId: "gjbn4hji9mkgdc7ofag0n1el5",
});

export const tokenValidation = async (event: any) => {
    const userDb = await dbConnect();
    const token = event.headers.Authorization?.split(" ")[1];
    if (!token) {
        return ResponseFormat(401, "Unauthorized: No token provided");
    }
    let payload;
    try {
        payload= await verifier.verify(token);
    } catch (error:any) {
        if(error.logs){
            return ResponseFormat(401, "Token Expired");
        }
    }
    if (!payload) {
        return ResponseFormat(401, "Unauthorized: Invalid token");
    }
    const payLoadSubId = payload.sub;
    const findSUbId = await userDb?.findOne({ "subId": payLoadSubId });
    const DbSubId = await findSUbId!.subId;
    if (payLoadSubId === DbSubId) {
        return 1;
    }
}
