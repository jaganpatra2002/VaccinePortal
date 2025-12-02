import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-1"});
const newS3 = new S3Client({ region: "ap-south-2"});
const DESTINATION_BUCKET = "newregionbucket12345";
// let value=1;
export const handler = async (event:any) => {
  let value= new Date().getTime();
  for (const msg of event.Records) {
    const s3Event = JSON.parse(msg.body).Records[0].s3;
    const bucket = s3Event.bucket.name;
    const key = decodeURIComponent(s3Event.object.key.replace(/\+/g, " "));
    const original = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    await newS3.send(
      new PutObjectCommand({
        Bucket: DESTINATION_BUCKET,
        Key: `File${value}${key}`,

      })
    );
    // value++;
  }
  return { status: "done" };
};
