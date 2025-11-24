import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ResponseFormat } from "../utils/responseFormat";
import { dbConnect } from "../dbConnection/MongoClient";

export const verifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-1_HRKw865aZ",
    tokenUse: "access",
    clientId: "gjbn4hji9mkgdc7ofag0n1el5",
});

export const tokenValidation = async (event: any) => {
    const dbConnectStart = Date.now();
    const userDb = await dbConnect();
    console.log(`[PERF_AUTH] dbConnect took ${Date.now() - dbConnectStart}ms`);

    const token = event.headers.Authorization?.split(" ")[1];
    if (!token) {
        return ResponseFormat(401, "Unauthorized: No token provided");
    }

    const verifyStart = Date.now();
    let payload;
    try {
        payload= await verifier.verify(token);
        return payload;
    } catch (error:any) {
        console.log("Error in token verification", error);
        if(error.logs){
               console.log("Error in token verification", error);
            return ResponseFormat(401, "Token Expired");
        }
    }
    console.log(`[PERF_AUTH] verifier.verify took ${Date.now() - verifyStart}ms`);

    if (!payload) {
        return ResponseFormat(401, "Unauthorized: Invalid token");
    }
    
    const findUserStart = Date.now();
    const payLoadSubId = payload.sub;
    const findSUbId = await userDb?.findOne({ "subId": payLoadSubId });
    console.log(`[PERF_AUTH] userDb.findOne took ${Date.now() - findUserStart}ms`);
    
    const DbSubId = await findSUbId!.subId;

    if (payLoadSubId === DbSubId) {
        console.log("Authentication successful", findSUbId?.name);
        return 1;
    }
}
