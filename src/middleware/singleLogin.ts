

import { CognitoIdentityProviderClient, AdminUserGlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export const SingleLogin = async (event:any) => {
    const userPoolId = event.userPoolId;
    const username = event.userName;

    try {
        await client.send(
            new AdminUserGlobalSignOutCommand({
                UserPoolId: userPoolId,
                Username: username,
            })
        );
    } catch (err) {
        console.error("Error clearing sessions:", err);
    }

    return event;
};
