import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrlApi = httpsCallable(functions, 'generateUploadUrl');
const getVideosApi = httpsCallable(functions, 'getVideos');

export interface VideoInfo {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed',
  title?: string,
  description?: string  
}

export async function uploadRawVideo(file: File) {
  // Request a signed URL for uploading the file
  const response: any = await generateUploadUrlApi({
    fileExtension: file.name.split('.').pop()
  });

  // Upload the file to the signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  return uploadResult;
}

export async function getVideos() {
  const response = await getVideosApi();
  return response.data as VideoInfo[];
}