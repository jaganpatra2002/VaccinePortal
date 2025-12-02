"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({ region: "us-east-1" });
const newS3 = new client_s3_1.S3Client({ region: "ap-south-2" });
const DESTINATION_BUCKET = "newregionbucket12345";
// let value=1;
const handler = async (event) => {
    let value = new Date().getTime();
    for (const msg of event.Records) {
        const s3Event = JSON.parse(msg.body).Records[0].s3;
        const bucket = s3Event.bucket.name;
        const key = decodeURIComponent(s3Event.object.key.replace(/\+/g, " "));
        const original = await s3.send(new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
        await newS3.send(new client_s3_1.PutObjectCommand({
            Bucket: DESTINATION_BUCKET,
            Key: `File${value}${key}`,
        }));
        // value++;
    }
    return { status: "done" };
};
exports.handler = handler;
