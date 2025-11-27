import dotenv from "dotenv";
dotenv.config();
import { ResponseFormat } from "../utils/responseFormat";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3Client = new S3Client({ region: process.env.AWS_REGION });
export const getFile = async (event:any) => {
    try {
        const filename=await event.queryStringParameters?.filename;

        const getData = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: filename
        })
          const signedUrl=await getSignedUrl(s3Client, getData, {
                    expiresIn: 300
               });
        return ResponseFormat(200,  "Fetched File Info",signedUrl);
    }
    catch (error: any) {
        return ResponseFormat(400, "Something Went Wrong", error)
    }
}