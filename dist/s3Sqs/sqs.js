"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sizeReducer = void 0;
const sharp_1 = __importDefault(require("sharp"));
const client_s3_1 = require("@aws-sdk/client-s3");
const client_s3_2 = require("@aws-sdk/client-s3");
const responseFormat_1 = require("../utils/responseFormat");
const s3 = new client_s3_2.S3Client({ region: process.env.AWS_REGION });
const sizeReducer = async (event) => {
    for (const record of event.Records) {
        const message = JSON.parse(record.body);
        const s3Event = message.Records[0].s3;
        const bucket = process.env.BUCKET_NAME;
        const key = decodeURIComponent(s3Event.object.key);
        console.log("Processing:", bucket, key);
        const original = new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: key
        });
        console.log(original.input);
        const resized = (0, sharp_1.default)().resize(300);
        await new client_s3_1.PutObjectCommand({
            Bucket: process.env.BUCKET_NAME_2,
            Key: `resized/${key}`,
            Body: resized,
            ContentType: "image/jpeg"
        });
        console.log("Resized image uploaded!");
    }
    return (0, responseFormat_1.ResponseFormat)(200, "File resized");
};
exports.sizeReducer = sizeReducer;
