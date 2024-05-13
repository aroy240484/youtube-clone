'use client';

import { Fragment } from "react";
import styles from "./upload.module.css";
import { uploadRawVideo } from "../firebase/functions";

export default function Upload() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      await uploadRawVideo(file);
      alert(`File uploaded successfully.`);
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  };

  return (
    <Fragment>
      <input id="upload" className={styles.uploadInput} type="file" accept="video/*" onChange={handleFileChange} />
      <label htmlFor="upload" className={styles.uploadButton}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
        </svg>
      </label>
    </Fragment>
  );
}