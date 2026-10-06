export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
}

/** Local MP4 files in public/videos (the starter embedded YouTube players, TD-11). */
export const videos: Video[] = [
  {
    id: 'portfolio-evolution',
    title: 'This portfolio: version 0 to 1.0',
    description: "The commits that turned the lecturer's starter into this site, played back as a change log.",
    duration: '0:14',
  },
  {
    id: 'ocr-pipeline-walkthrough',
    title: 'How a bank statement becomes data',
    description: 'A step-by-step walk through the OCR pipeline I worked on, from PDF upload to Excel export.',
    duration: '0:14',
  },
  {
    id: 'lehman-laws',
    title: "Lehman's laws in under 30 seconds",
    description: 'The eight laws of software evolution, one card each.',
    duration: '0:28',
  },
];

export const videoFile = (id: string, ext: 'mp4' | 'jpg') => `./videos/${id}.${ext}`;
