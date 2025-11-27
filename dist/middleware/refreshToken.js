"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const responseFormat_1 = require("../utils/responseFormat");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const RefreshToken = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { refreshToken } = body;
        if (!refreshToken) {
            return (0, responseFormat_1.ResponseFormat)(400, "Refresh token is required");
        }
        const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
            AuthFlow: "REFRESH_TOKEN_AUTH",
            ClientId: "gjbn4hji9mkgdc7ofag0n1el5",
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        });
        const response = await client.send(command);
        console.log("Response", response);
        return (0, responseFormat_1.ResponseFormat)(200, "Token refreshed", {
            accessToken: response.AuthenticationResult?.AccessToken,
            idToken: response.AuthenticationResult?.IdToken,
        });
    }
    catch (error) {
        console.log("Error refreshing token:", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Failed to refresh token", error);
    }
};
exports.RefreshToken = RefreshToken;
