"use strict";
// import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
// import {buildHtmlEmail} from './emailTemplate';
// const client = new SESClient({ region: process.env.AWS_REGION });
// export const SESMail = async (event:any) => {
//   console.log("S3 Event:", JSON.stringify(event, null, 2));
//   const s3 = event.Records[0];
//   const bucketName = s3.s3.bucket.name;
//   const objectKey = s3.s3.object.key;
//   const htmlBody = buildHtmlEmail(bucketName, objectKey);
//   const params:any = {
//     Destination: {
//       ToAddresses: [process.env.TO_EMAIL],
//     },
//     Message: {
//       Body: {
//         Html: {
//           Charset: "UTF-8",
//           Data: htmlBody,
//         },
//       },
//       Subject: {
//         Charset: "UTF-8",
//         Data: `New S3 Upload: ${objectKey}`,
//       },
//     },
//     Source: process.env.FROM_EMAIL,
//   };
//   try {
//     const result = await client.send(new SendEmailCommand(params));
//     console.log("Email sent:", result.MessageId);
//   } catch (e) {
//     console.error("SES error:", e);
//     throw e;
//   }
// };
