"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleLogin = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const SingleLogin = async (event) => {
    console.log("Post-Auth Trigger Event:", JSON.stringify(event, null, 2));
    const userPoolId = event.userPoolId;
    const username = event.userName;
    try {
        await client.send(new client_cognito_identity_provider_1.AdminUserGlobalSignOutCommand({
            UserPoolId: userPoolId,
            Username: username,
        }));
        console.log(`Old sessions cleared for ${username}`);
    }
    catch (err) {
        console.error("Error clearing sessions:", err);
    }
    return event;
};
exports.SingleLogin = SingleLogin;
