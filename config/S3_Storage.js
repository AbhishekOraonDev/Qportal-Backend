import dotenv from 'dotenv';
dotenv.config();

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
});

// let BUCKET = null;

const uploadS3 = async (fileStream, fileName, uploadType) => {
    let BUCKET = null;
    // console.log(fileName, fileStream, uploadType);
    try {
        if (!fileName) {
            throw new Error('File name is missing');
        }

        if (uploadType == "QuestionPaper") {
            BUCKET = process.env.BUCKET;
        } else if (uploadType == "Notes") {
            BUCKET = process.env.BUCKETNotes;
        }

        const uploadParams = {
            Bucket: BUCKET,
            Key: fileName,
            Body: fileStream,
            ACL: 'public-read', // Changed acl to ACL for making it public
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        const fileUrl = `https://${BUCKET}.s3.amazonaws.com/${fileName}`;
        console.log("File uploaded successfully. URL:", fileUrl);
        if (!fileUrl) {
            throw new Error('Upload result or location is missing');
        }
        return fileUrl;
    } catch (error) {
        throw new Error(`Error uploading file to S3: ${error.message}`);
    }
};

export default uploadS3;