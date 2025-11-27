"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({ region: "us-east-1" });
const DESTINATION_BUCKET = "sizereducer";
// let value=1;
const handler = async (event) => {
    console.log("Received SQS event:", JSON.stringify(event, null, 2));
    let value = new Date().getTime();
    for (const msg of event.Records) {
        const s3Event = JSON.parse(msg.body).Records[0].s3;
        const bucket = s3Event.bucket.name;
        const key = decodeURIComponent(s3Event.object.key.replace(/\+/g, " "));
        console.log("Processing:", bucket, key);
        const original = await s3.send(new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
        await s3.send(new client_s3_1.PutObjectCommand({
            Bucket: DESTINATION_BUCKET,
            Key: `File${value}${key}`,
        }));
        // value++;
    }
    return { status: "done" };
};
exports.handler = handler;
