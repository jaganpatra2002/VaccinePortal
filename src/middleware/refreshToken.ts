import { InitiateAuthCommand, CognitoIdentityProviderClient, RevokeTokenCommand, AdminUserGlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";
import { ResponseFormat } from "../utils/responseFormat";

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export const RefreshToken = async (event: any) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { refreshToken } = body;
        if (!refreshToken) {
            return ResponseFormat(400, "Refresh token is required");
        }
        const command = new InitiateAuthCommand({
            AuthFlow: "REFRESH_TOKEN_AUTH",
            ClientId: "gjbn4hji9mkgdc7ofag0n1el5",
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        });
        const response = await client.send(command);
        return ResponseFormat(200, "Token refreshed", {
            accessToken: response.AuthenticationResult?.AccessToken,
            idToken: response.AuthenticationResult?.IdToken,
        });

    } catch (error) {
        return ResponseFormat(400, "Failed to refresh token", error);
    }
};
