"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.loginUser = exports.registerUser = exports.init = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const UserModel_1 = require("../models/UserModel");
const MongoClient_1 = require("../dbConnection/MongoClient");
const UserSchemaValidator_1 = require("../validator/UserSchemaValidator");
const responseFormat_1 = require("../utils/responseFormat");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const auth_1 = require("../middleware/auth");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const init = async () => {
    const db = await (0, MongoClient_1.dbConnect)();
    if (db) {
        console.log("Db collection Connected from UserController");
    }
};
exports.init = init;
(0, exports.init)();
const registerUser = async (event) => {
    try {
        const db = await (0, MongoClient_1.dbConnect)();
        console.log("User is registered");
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Parsed body:", body);
        const { name, mobile, password, aadharNumber, age, pincode, } = body;
        const mobileNumber = mobile.startsWith("+") ? mobile : `+91${mobile}`;
        const existingUser = await db.findOne({ mobile });
        if (existingUser) {
            return (0, responseFormat_1.ResponseFormat)(400, "User already exists with this mobile number");
        }
        const command = new client_cognito_identity_provider_1.SignUpCommand({
            ClientId: process.env.CLIENT_ID,
            Username: mobileNumber,
            Password: password,
            UserAttributes: [
                { Name: "name", Value: name },
                { Name: "phone_number", Value: mobileNumber },
            ],
        });
        await client.send(command);
        await client.send(new client_cognito_identity_provider_1.AdminConfirmSignUpCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: mobileNumber
        }));
        const authCommand = new client_cognito_identity_provider_1.AdminInitiateAuthCommand({
            UserPoolId: process.env.USER_POOL_ID,
            ClientId: process.env.CLIENT_ID,
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: mobileNumber,
                PASSWORD: password,
            },
        });
        const response = await client.send(authCommand);
        const accessToken = response.AuthenticationResult?.AccessToken;
        const payload = await auth_1.verifier.verify(accessToken);
        const subid = payload.sub;
        console.log("Sub ID from token payload:", subid);
        const newUser = {
            name,
            mobile,
            password,
            aadharNumber,
            age,
            pincode,
            isAdmin: false,
            vaccinationStatus: UserModel_1.VaccinationStatus.None,
            bookedSlot: null,
            doseHistory: [],
            subId: subid
        };
        const validateResult = UserSchemaValidator_1.registerValidator.validate(newUser);
        if (validateResult.error) {
            console.error('Validation error:', validateResult.error.message);
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateResult.error.message);
        }
        console.log('Valid data:', validateResult.value);
        await db.insertOne(newUser);
        return (0, responseFormat_1.ResponseFormat)(201, "User Registered Successfully");
    }
    catch (error) {
        console.log("Error in Register Process:", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.registerUser = registerUser;
const loginUser = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Parsed body:", body);
        const { mobile, password } = body;
        const mobileNumber = mobile.startsWith("+") ? mobile : `+91${mobile}`;
        const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.CLIENT_ID,
            AuthParameters: {
                USERNAME: mobileNumber,
                PASSWORD: password,
            },
        });
        const response = await client.send(command);
        const accessToken = response.AuthenticationResult?.AccessToken;
        const db = await (0, MongoClient_1.dbConnect)();
        console.log(mobile, password);
        const validateCred = UserSchemaValidator_1.loginValidator.validate(body);
        console.log(validateCred);
        if (validateCred.error) {
            return (0, responseFormat_1.ResponseFormat)(400, "Validation Format error", validateCred.error.message);
        }
        else {
            const existingUser = await db.findOne({ mobile });
            if (!existingUser) {
                return (0, responseFormat_1.ResponseFormat)(400, "User Not found with this mobile number");
            }
            return (0, responseFormat_1.ResponseFormat)(200, "User Information", {
                accessToken: accessToken,
                _id: existingUser?._id,
                name: existingUser?.name,
                mobile: existingUser?.mobile,
                isAdmin: existingUser?.isAdmin || false,
            });
        }
    }
    catch (error) {
        console.log("Error in LoginUser", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.loginUser = loginUser;
const getProfile = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        const token = event.headers.Authorization?.split(" ")[1];
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid token");
        }
        const payload = await auth_1.verifier.verify(token);
        const payLoadSubId = payload.sub;
        const db = await (0, MongoClient_1.dbConnect)();
        const dbSubId = await db.findOne({ "subId": payLoadSubId });
        console.log("User sub from token payload:", dbSubId?.subId);
        return (0, responseFormat_1.ResponseFormat)(200, "Profile Information", {
            _id: dbSubId?._id,
            name: dbSubId?.name,
            mobile: dbSubId?.mobile,
        });
    }
    catch (error) {
        console.log("Error in profile api", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Internal Server Error", error);
    }
};
exports.getProfile = getProfile;
