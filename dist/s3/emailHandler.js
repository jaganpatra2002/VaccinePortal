"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailHandler = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
const snsClient = new client_sns_1.SNSClient({ region: process.env.AWS_REGION });
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const emailHandler = async (event) => {
    console.log('Received S3 event:', JSON.stringify(event, null, 2));
    const s3EventRecord = event.Records[0];
    const bucketName = s3EventRecord.s3.bucket.name;
    const objectKey = s3EventRecord.s3.object.key;
    const eventTime = s3EventRecord.eventTime;
    const message = `A new object was created in S3.\n\n` +
        `Bucket: ${bucketName}\n` +
        `Object Key: ${objectKey}\n`;
    const params = {
        Message: message,
        TopicArn: SNS_TOPIC_ARN,
        Subject: `New S3 Object Created: ${objectKey}`
    };
    const command = new client_sns_1.PublishCommand(params);
    try {
        const data = await snsClient.send(command);
        console.log("Message published to SNS:", data.MessageId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "SNS message published successfully" })
        };
    }
    catch (err) {
        console.error("Error publishing to SNS:", err);
        throw new Error("Failed to publish message to SNS");
    }
};
exports.emailHandler = emailHandler;
