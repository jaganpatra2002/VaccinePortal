import dotenv from "dotenv";
dotenv.config();
import { ResponseFormat } from "../utils/responseFormat";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3Client = new S3Client({ region: process.env.AWS_REGION });
export const uploadFile = async (event: any) => {
    try {
        const filename = event.queryStringParameters?.filename;
        console.log("Filename:", filename);
        const storeData = new PutObjectCommand(
            {
                Bucket: process.env.BUCKET_NAME,
                Key: filename,
            }
        );
        console.log("Storing data to S3:", storeData);
       const signedUrl=await getSignedUrl(s3Client, storeData, {
            expiresIn: 300
       });
        return ResponseFormat(200, "File uploaded successfully in Bucket", { signedUrl });
    }
    catch (error: any) {
        console.log(error);
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}

