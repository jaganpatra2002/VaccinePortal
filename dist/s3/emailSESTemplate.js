"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESMail = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const emailTemplate_1 = require("./emailTemplate");
const client = new client_ses_1.SESClient({ region: process.env.AWS_REGION });
const SESMail = async (event) => {
    console.log("S3 Event:", JSON.stringify(event, null, 2));
    const s3 = event.Records[0];
    const bucketName = s3.s3.bucket.name;
    const objectKey = s3.s3.object.key;
    const htmlBody = (0, emailTemplate_1.buildHtmlEmail)(bucketName, objectKey);
    const params = {
        Destination: {
            ToAddresses: [process.env.TO_EMAIL],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: htmlBody,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: `New S3 Upload: ${objectKey}`,
            },
        },
        Source: process.env.FROM_EMAIL,
    };
    try {
        const result = await client.send(new client_ses_1.SendEmailCommand(params));
        console.log("Email sent:", result.MessageId);
    }
    catch (e) {
        console.error("SES error:", e);
        throw e;
    }
};
exports.SESMail = SESMail;
