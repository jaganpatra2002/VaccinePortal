"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenValidation = exports.verifier = void 0;
const aws_jwt_verify_1 = require("aws-jwt-verify");
const responseFormat_1 = require("../utils/responseFormat");
const MongoClient_1 = require("../dbConnection/MongoClient");
exports.verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: "us-east-1_HRKw865aZ",
    tokenUse: "access",
    clientId: "gjbn4hji9mkgdc7ofag0n1el5",
});
const tokenValidation = async (event) => {
    const dbConnectStart = Date.now();
    const userDb = await (0, MongoClient_1.dbConnect)();
    console.log(`[PERF_AUTH] dbConnect took ${Date.now() - dbConnectStart}ms`);
    const token = event.headers.Authorization?.split(" ")[1];
    if (!token) {
        return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: No token provided");
    }
    const verifyStart = Date.now();
    let payload;
    //  = await verifier.verify(token);
    try {
        payload = await exports.verifier.verify(token);
        return payload;
    }
    catch (error) {
        console.log("Error in token verification", error);
        if (error.logs) {
            console.log("Error in token verification", error);
            return (0, responseFormat_1.ResponseFormat)(401, "Token Expired");
        }
    }
    console.log(`[PERF_AUTH] verifier.verify took ${Date.now() - verifyStart}ms`);
    if (!payload) {
        return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
    }
    const findUserStart = Date.now();
    const payLoadSubId = payload.sub;
    const findSUbId = await userDb?.findOne({ "subId": payLoadSubId });
    console.log(`[PERF_AUTH] userDb.findOne took ${Date.now() - findUserStart}ms`);
    const DbSubId = await findSUbId.subId;
    if (payLoadSubId === DbSubId) {
        console.log("Authentication successful", findSUbId?.name);
        return 1;
    }
};
exports.tokenValidation = tokenValidation;
