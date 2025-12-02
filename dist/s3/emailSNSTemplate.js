"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailFormat = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
const sns = new client_sns_1.SNSClient({ region: "us-east-1" });
const emailFormat = async (event) => {
    try {
        const record = event.Records[0];
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        const size = record.s3.object.size;
        const time = new Date().toISOString();
        const s3Url = `https://s3.console.aws.amazon.com/s3/object/${bucket}?region=us-east-1&prefix=${key}`;
        const html = `
        <html>
        <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:25px;">
        
            <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:8px; border:1px solid #ddd;">
            
                <h2 style="color:#333; margin-top:0;">🚀 New File Uploaded to S3</h2>
                
                <p style="font-size:14px; color:#555;">
                    A new file was uploaded to your S3 bucket.
                </p>

                <div style="background:#fafafa; padding:15px; border-radius:6px; border:1px solid #ccc; margin-top:15px;">
                    <p style="margin:5px 0;"><b>Bucket:</b> ${bucket}</p>
                    <p style="margin:5px 0;"><b>File:</b> ${key}</p>
                    <p style="margin:5px 0;"><b>Size:</b> ${size} bytes</p>
                    <p style="margin:5px 0;"><b>Uploaded At:</b> ${time}</p>
                </div>

                <a href="${s3Url}" 
                    style="display:inline-block; margin-top:20px; background:#007bff; color:white; padding:10px 18px; text-decoration:none; border-radius:5px;">
                    View File in S3
                </a>

                <p style="margin-top:25px; font-size:12px; color:#888;">
                    If this upload was unexpected, please investigate.
                </p>

            </div>

        </body>
        </html>
        `;
        const resp = await sns.send(new client_sns_1.PublishCommand({
            TopicArn: "arn:aws:sns:us-east-1:856121896257:S3Notification",
            Subject: `New S3 Object Created: ${key}`,
            Message: html,
            MessageAttributes: {
                "MOBILE.HTML": {
                    DataType: "String",
                    StringValue: "true"
                }
            }
        }));
        return {
            statusCode: 200,
            body: "Email sent",
            snsResponse: resp
        };
    }
    catch (err) {
        throw err;
    }
};
exports.emailFormat = emailFormat;
