"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHtmlEmail = void 0;
const buildHtmlEmail = (bucketName, objectKey) => {
    return `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
          .container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 20px;
              background: #f4f4f4;
              border-radius: 10px;
              border: 1px solid #ddd;
          }
          .header {
              background: #007bff;
              color: white;
              padding: 15px;
              border-radius: 10px 10px 0 0;
              text-align: center;
          }
          .content {
              background: white;
              padding: 20px;
              border-radius: 0 0 10px 10px;
          }
          .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 12px;
              color: #999;
          }
          .btn {
              display: inline-block;
              padding: 10px 15px;
              margin-top: 15px;
              background: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>New File Uploaded to S3</h2>
          </div>
          <div class="content">
              <p>Hello,</p>
              <p>A new file has been uploaded.</p>

              <p><b>Bucket:</b> ${bucketName}</p>
              <p><b>Object Key:</b> ${objectKey}</p>

              <a href="https://s3.amazonaws.com/${bucketName}/${objectKey}" class="btn">
                  View File
              </a>
          </div>
          <div class="footer">
              AWS S3 Notification – Powered by SES
          </div>
      </div>
  </body>
  </html>
  `;
};
exports.buildHtmlEmail = buildHtmlEmail;
