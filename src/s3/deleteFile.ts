import dotenv from "dotenv";
dotenv.config();
import { ResponseFormat } from "../utils/responseFormat";
import { DeleteObjectCommand, S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
const s3Client = new S3Client({ region: process.env.AWS_REGION });
export const deleteFile = async (event: any) => {
    try {
        const filename = event.queryStringParameters?.filename;
        const storeData = new DeleteObjectCommand(
            {
                Bucket: process.env.BUCKET_NAME,
                Key: filename,
            }
        );
        const info = await s3Client.send(storeData);
        return ResponseFormat(200, "File deleted successfully in Bucket", info);
    }
    catch (error: any) {
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}