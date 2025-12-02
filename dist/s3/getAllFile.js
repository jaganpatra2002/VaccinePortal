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
        const allData = new client_s3_1.ListObjectsCommand({
            Bucket: process.env.BUCKET_NAME
        });
        const allInfo = await s3Client.send(allData);
        return (0, responseFormat_1.ResponseFormat)(200, "All Files Fetched successfully in Bucket", allInfo);
    }
    catch (error) {
        return (0, responseFormat_1.ResponseFormat)(400, "Something Went Wrong", error);
    }
};
exports.deleteFile = deleteFile;
