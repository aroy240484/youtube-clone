import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { LOCAL_PROCESSED_VIDEO_PATH, LOCAL_RAW_VIDEO_PATH, PROCESSED_VIDEO_BUCKET_NAME, RAW_VIDEO_BUCKET_NAME } from './config';

const storage = new Storage();

/**
 * Creates the local directories for raw and processed videos
 */
export function setupDirectories() {
  ensureDirectoryExistence(LOCAL_RAW_VIDEO_PATH);
  ensureDirectoryExistence(LOCAL_PROCESSED_VIDEO_PATH);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${LOCAL_RAW_VIDEO_PATH}/${rawVideoName}`)
    .outputOptions('-vf', 'scale=-1:360') // 360p
    .on('end', function() {
        console.log('Processing finished successfully');
        resolve();
    })
    .on('error', function(err: any) {
        console.log(`An error occurred: ${err.message}`);
        reject(err);
    })
    .save(`${LOCAL_PROCESSED_VIDEO_PATH}/${processedVideoName}`);
  });  
}

/**
 * @param fileName - The name of the file to download from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
  await storage.bucket(RAW_VIDEO_BUCKET_NAME)
    .file(fileName)
    .download({
      destination: `${LOCAL_RAW_VIDEO_PATH}/${fileName}`,
    });

    console.log(
      `gs://${RAW_VIDEO_BUCKET_NAME}/${fileName} downloaded to ${LOCAL_RAW_VIDEO_PATH}/${fileName}.`
    );
}

/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
  const bucket = storage.bucket(PROCESSED_VIDEO_BUCKET_NAME);

  // Upload video to bucket
  await bucket.upload(`${LOCAL_PROCESSED_VIDEO_PATH}/${fileName}`, {
    destination: fileName,
  });

  console.log(
    `${LOCAL_PROCESSED_VIDEO_PATH}/${fileName} uploaded to gs://${PROCESSED_VIDEO_BUCKET_NAME}/${fileName}`
  );

  // Set the video to be public
  await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${LOCAL_RAW_VIDEO_PATH}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${LOCAL_PROCESSED_VIDEO_PATH}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been successfully deleted or not found.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Failed to delete file at ${filePath}`, err);
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping delete.`);
      resolve();
    }
  });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created at ${dirPath}`);
  }
}