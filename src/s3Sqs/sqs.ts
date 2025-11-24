import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-1"});
const DESTINATION_BUCKET = "sizereducer";
// let value=1;
export const handler = async (event:any) => {

  console.log("Received SQS event:", JSON.stringify(event, null, 2));
  let value= new Date().getTime();

  for (const msg of event.Records) {
  
    const s3Event = JSON.parse(msg.body).Records[0].s3;

    const bucket = s3Event.bucket.name;
    const key = decodeURIComponent(s3Event.object.key.replace(/\+/g, " "));

    console.log("Processing:", bucket, key);

    const original = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    await s3.send(
      new PutObjectCommand({
        Bucket: DESTINATION_BUCKET,
        Key: `File${value}${key}`,

      })
    );
    // value++;
  }

  return { status: "done" };
};
