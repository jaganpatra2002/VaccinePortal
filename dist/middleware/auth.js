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
    const userDb = await (0, MongoClient_1.dbConnect)();
    const token = event.headers.Authorization?.split(" ")[1];
    if (!token) {
        return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: No token provided");
    }
    let payload;
    try {
        payload = await exports.verifier.verify(token);
    }
    catch (error) {
        if (error.logs) {
            return (0, responseFormat_1.ResponseFormat)(401, "Token Expired");
        }
    }
    if (!payload) {
        return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
    }
    const payLoadSubId = payload.sub;
    const findSUbId = await userDb?.findOne({ "subId": payLoadSubId });
    const DbSubId = await findSUbId.subId;
    if (payLoadSubId === DbSubId) {
        return 1;
    }
};
exports.tokenValidation = tokenValidation;
