// Resume types — mirror backend src/resume responses.

/** My uploaded resume (metadata + short preview, never the full text). */
export type ResumeDto = {
  id: string;
  fileName: string;
  updatedAt: string;
  preview: string;
};

/** AI-customized resume for one job — a downloadable PDF (base64 encoded). */
export type CustomizedResumeDto = {
  fileName: string;
  pdfBase64: string;
};
