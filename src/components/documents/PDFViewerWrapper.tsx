'use client'
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface PDFViewerWrapperProps {
  fileUrl: string;
  currentPage: number;
  scale: number;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
  loadingText: string;
}

const PDFViewerWrapper: React.FC<PDFViewerWrapperProps> = ({ 
  fileUrl, 
  currentPage, 
  scale, 
  onLoadSuccess, 
  loadingText 
}) => {
  return (
    <Document
      file={fileUrl}
      onLoadSuccess={onLoadSuccess}
      loading={
        <div className="w-[600px] h-[800px] bg-gray-200 flex items-center justify-center">
          <div className="text-sunset">{loadingText}</div>
        </div>
      }
      error={
        <div className="w-[600px] h-[800px] bg-gray-200 flex items-center justify-center">
          <div className="text-error">Error loading PDF</div>
        </div>
      }
    >
      <Page 
        pageNumber={currentPage} 
        scale={scale}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        loading={
          <div className="w-[600px] h-[800px] bg-gray-200 flex items-center justify-center">
            <div className="text-sunset">{loadingText}</div>
          </div>
        }
      />
    </Document>
  );
};

export default PDFViewerWrapper;
