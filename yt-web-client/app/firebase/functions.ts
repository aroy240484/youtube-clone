import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrlFunction = httpsCallable(functions, 'generateUploadUrl');

export async function uploadRawVideo(file: File) {
  // Request a signed URL for uploading the file
  const response: any = await generateUploadUrlFunction({
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

