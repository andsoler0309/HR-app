import { pdfjs } from 'react-pdf';

// Set up PDF.js worker globally with correct version (5.3.93)
if (typeof window !== 'undefined') {
  // Set immediately to prevent errors - use matching version from unpkg
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.mjs';
  
  // Try to use local worker if available
  fetch('/pdf.worker.min.js')
    .then(response => {
      if (response.ok) {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        console.log('PDF worker updated to local file');
      }
    })
    .catch(() => {
      console.log('Using unpkg PDF worker v5.3.93');
    });
} else {
  // For server-side rendering
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.mjs';
}
