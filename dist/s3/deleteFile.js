"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const responseFormat_1 = require("../utils/responseFormat");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const deleteFile = async (event) => {
    try {
        const filename = event.queryStringParameters?.filename;
        console.log("Filename:", filename);
        const storeData = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: filename,
        });
        const info = await s3Client.send(storeData);
        console.log("Deleting data from S3:", info);
        const allData = new client_s3_1.ListObjectsCommand({
            Bucket: process.env.BUCKET_NAME
        });
        const allInfo = await s3Client.send(allData);
        console.log("All data from S3:", allInfo);
        return (0, responseFormat_1.ResponseFormat)(200, "File deleted successfully in Bucket", allInfo);
    }
    catch (error) {
        console.log(error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.deleteFile = deleteFile;
