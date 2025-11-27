import dotenv from "dotenv";
dotenv.config();
import { UserModel, VaccinationStatus } from "../models/UserModel";
import { dbConnect } from "../dbConnection/MongoClient";
import { loginValidator, registerValidator } from '../validator/UserSchemaValidator';
import { ResponseFormat } from "../utils/responseFormat";
import { AdminConfirmSignUpCommand, AdminInitiateAuthCommand, AdminUserGlobalSignOutCommand, CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { tokenValidation, verifier } from "../middleware/auth";

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const userPoolId = "us-east-1_HRKw865aZ";
export const registerUser = async (event: any) => {
    try {
        const db = await dbConnect();
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { name, mobile, password, aadharNumber, age, pincode, } = body;
        const mobileNumber = mobile.startsWith("+") ? mobile : `+91${mobile}`;
        const existingUser = await db!.findOne({ mobile });
        if (existingUser) {
            return ResponseFormat(400, "User already exists with this mobile number");
        }
        const command = new SignUpCommand({
            ClientId: process.env.CLIENT_ID,
            Username: mobileNumber,
            Password: password,
            UserAttributes: [
                { Name: "name", Value: name },
                { Name: "phone_number", Value: mobileNumber },
            ],
        });
        await client.send(command)

        await client.send(new AdminConfirmSignUpCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: mobileNumber
        }));

        const authCommand = new AdminInitiateAuthCommand({
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

        const payload = await verifier.verify(accessToken!);
        const subid = payload.sub;
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
            subId: subid
        };
        const validateResult = registerValidator.validate(newUser);
        if (validateResult.error) {
            return ResponseFormat(400, "Validation Format error", validateResult.error.message);

        }
        await db!.insertOne(newUser);
        return ResponseFormat(201, "User Registered Successfully");
    } catch (error) {
        return ResponseFormat(400, "Internal Server Error", error);
    }
}
export const loginUser = async (event: any) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { mobile, password } = body;
        const mobileNumber = mobile.startsWith("+") ? mobile : `+91${mobile}`;
        try {
            const expireToken = new AdminUserGlobalSignOutCommand({
                UserPoolId: userPoolId,
                Username: mobileNumber
            });
            await client.send(expireToken);
        } catch (error) {
            console.log("ERROR", error);
        }

        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.CLIENT_ID,
            AuthParameters: {
                USERNAME: mobileNumber,
                PASSWORD: password,
            },
        });

        const response = await client.send(command);
        const accessToken = response.AuthenticationResult?.AccessToken;
        const idToken = response.AuthenticationResult?.IdToken;
        const refreshToken = response.AuthenticationResult?.RefreshToken;

        const db = await dbConnect();
        const validateCred = loginValidator.validate(body);
        if (validateCred.error) {
            return ResponseFormat(400, "Validation Format error", validateCred.error.message);
        }
        else {
            const existingUser = await db!.findOne({ mobile });
            if (!existingUser) {
                return ResponseFormat(400, "User Not found with this mobile number");
            }
            return ResponseFormat(200, "User Information", {
                accessToken: accessToken,
                idToken: idToken,
                refreshToken: refreshToken,
                _id: existingUser?._id,
                name: existingUser?.name,
                mobile: existingUser?.mobile,
                isAdmin: existingUser?.isAdmin || false,
            });
        }
    } catch (error) {
        return ResponseFormat(400, "Internal Server Error", error);
    }
}
export const getProfile = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        const token = event.headers.Authorization?.split(" ")[1];
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid token");
        }
        const payload = await verifier.verify(token);
        const payLoadSubId = payload.sub;
        const db = await dbConnect();
        const dbSubId = await db!.findOne({ "subId": payLoadSubId });
        return ResponseFormat(200, "Profile Information", {
            _id: dbSubId?._id,
            name: dbSubId?.name,
            mobile: dbSubId?.mobile,
        });
    } catch (error) {
        return ResponseFormat(400, "Internal Server Error", error);
    }
}