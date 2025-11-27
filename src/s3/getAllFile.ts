import dotenv from "dotenv";
dotenv.config();
import { ResponseFormat } from "../utils/responseFormat";
import { S3Client, ListObjectsCommand} from "@aws-sdk/client-s3";
const s3Client = new S3Client({ region: process.env.AWS_REGION });
export const deleteFile = async (event: any) => {
    try { 
        const allData = new ListObjectsCommand(
            {
                Bucket: process.env.BUCKET_NAME
            }
        );
        const allInfo=await s3Client.send(allData);
        return ResponseFormat(200, "All Files Fetched successfully in Bucket",allInfo);
    }
    catch (error: any) {
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}

