"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFile = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const responseFormat_1 = require("../utils/responseFormat");
const client_s3_1 = require("@aws-sdk/client-s3");
// Helper function to convert the readable stream body to a string
const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8'))); // Assumes UTF-8 content
        stream.on('error', reject);
    });
};
const s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const getFile = async (event) => {
    try {
        const filename = event.queryStringParameters?.filename;
        if (!filename) {
            return (0, responseFormat_1.ResponseFormat)(400, "Bad Request", "Missing filename query parameter");
        }
        const getData = new client_s3_1.GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: filename
        });
        const res = await s3Client.send(getData);
        // Extract the file content from the body stream
        if (res.Body) {
            const fileContent = await streamToString(res.Body);
            // Log file info without the circular references in the body stream
            console.log("File Info (excluding Body):", {
                AcceptRanges: res.AcceptRanges,
                LastModified: res.LastModified,
                ContentLength: res.ContentLength,
                ETag: res.ETag,
                ContentType: res.ContentType,
                Metadata: res.Metadata
            });
            // Return the *actual content* of the file
            // You might want to adjust the ResponseFormat based on your API Gateway setup
            // (e.g., if you need to handle binary data or set headers)
            return (0, responseFormat_1.ResponseFormat)(200, "Fetched File Content", fileContent);
        }
        else {
            return (0, responseFormat_1.ResponseFormat)(404, "Not Found", "File body is empty");
        }
    }
    catch (error) {
        console.error(error);
        // You should return an error response here
        return (0, responseFormat_1.ResponseFormat)(500, "Something Went Wrong", error.message || "Internal Server Error");
    }
};
exports.getFile = getFile;
