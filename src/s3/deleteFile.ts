import dotenv from "dotenv";
dotenv.config();
import { ResponseFormat } from "../utils/responseFormat";
import { DeleteObjectCommand ,S3Client, ListObjectsCommand} from "@aws-sdk/client-s3";
const s3Client = new S3Client({ region: process.env.AWS_REGION });
export const deleteFile = async (event: any) => {
    try {
        const filename = event.queryStringParameters?.filename;
        console.log("Filename:", filename);
        const storeData = new DeleteObjectCommand(
            {
                Bucket: process.env.BUCKET_NAME,
                Key: filename,
            }
        );
        const info=await s3Client.send(storeData);
        console.log("Deleting data from S3:", info);
        const allData = new ListObjectsCommand(
            {
                Bucket: process.env.BUCKET_NAME
            }
        );
        const allInfo=await s3Client.send(allData);
        console.log("All data from S3:", allInfo);

        return ResponseFormat(200, "File deleted successfully in Bucket",allInfo);
    }
    catch (error: any) {
        console.log(error);
        return ResponseFormat(400, "Something Went Wrong", error);
    }
}

