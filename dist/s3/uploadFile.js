"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const responseFormat_1 = require("../utils/responseFormat");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const uploadFile = async (event) => {
    try {
        const filename = event.queryStringParameters?.filename;
        console.log("Filename:", filename);
        const storeData = new client_s3_1.PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: filename,
        });
        console.log("Storing data to S3:", storeData);
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, storeData, {
            expiresIn: 300
        });
        return (0, responseFormat_1.ResponseFormat)(200, "File uploaded successfully in Bucket", { signedUrl });
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.uploadFile = uploadFile;
