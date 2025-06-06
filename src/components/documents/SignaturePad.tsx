'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PenLine, Eraser, Save, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types/document';
import { PDFDocument, rgb } from 'pdf-lib';
import { useTranslations } from 'next-intl';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  onSuccess: () => void;
}

const SignaturePad = ({ isOpen, onClose, document, onSuccess }: SignaturePadProps) => {
  const t = useTranslations('documents.signaturePad');
  const tButtons = useTranslations('documents.buttons'); // Assuming you have common button translations
  const tErrors = useTranslations('documents.signaturePad.error');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize canvas when component mounts
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Set drawing style
      ctx!.strokeStyle = '#000';
      ctx!.lineWidth = 2;
      ctx!.lineCap = 'round';
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext('2d');
    const rect = canvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx!.beginPath();
    ctx!.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas!.getContext('2d');
    const rect = canvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx!.lineTo(x, y);
    ctx!.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext('2d');
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
  };

  const saveSignature = async () => {
    if (!canvasRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(tErrors('noAuthenticatedUser'));

      const signatureData = canvasRef.current.toDataURL();

      // Update signature status
      const { error: signatureError } = await supabase
        .from('document_signatures')
        .update({
          signature_date: new Date(),
          signature_status: 'signed'
        })
        .eq('document_id', document.id)
        .eq('signer_id', user.id);

      if (signatureError) throw new Error(tErrors('saveError'));

      // Download the original PDF
      const response = await fetch(document.file_url);
      if (!response.ok) throw new Error(tErrors('unknownError'));

      const existingPdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // A4 dimensions (595x842 points)
      const pageWidth = 595;
      const pageHeight = 842;

      // Original dimensions (unscaled)
      const padding = 24; // p-6 * 4
      const bottomMargin = 112; // bottom-28 * 4
      const signatureHeight = 50;
      const signatureWidth = 150;

      // Add signature image
      if (!signatureData) throw new Error(tErrors('unknownError'));
      const signatureImage = await pdfDoc.embedPng(signatureData);
      firstPage.drawImage(signatureImage, {
        x: (pageWidth / 2) - (signatureWidth / 2), // Center horizontally
        y: bottomMargin,
        width: signatureWidth,
        height: signatureHeight
      });

      // Add signature text
      const dateStr = new Date().toLocaleDateString();
      firstPage.drawText(`${t('signatureDate')}: ${dateStr}`, {
        x: (pageWidth / 2) - 45,
        y: bottomMargin - 20,
        size: 12
      });

      // Add signature line
      firstPage.drawLine({
        start: { x: (pageWidth / 2) - (signatureWidth / 2), y: bottomMargin },
        end: { x: (pageWidth / 2) + (signatureWidth / 2), y: bottomMargin },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

      // Upload new version
      const fileName = `${crypto.randomUUID()}.pdf`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(tErrors('saveError'));

      const { data: publicUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 31536000);

      if (urlError || !publicUrlData?.signedUrl) throw new Error(tErrors('saveError'));

      // Update document status
      const { error: docError } = await supabase
        .from('documents')
        .update({ 
          status: 'signed',
          file_url: publicUrlData.signedUrl,
          version: document.version + 1
        })
        .eq('id', document.id);

      if (docError) throw new Error(tErrors('saveError'));

      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('Error uploading new version:', err);
      setError(err.message || tErrors('unknownError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center gap-2 text-error mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-card-border p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-48 border border-dashed border-card-border rounded cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={clearSignature}
              className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Eraser className="w-4 h-4" />
              {t('clear')}
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                {t('cancel')}
              </button>
              <button
                onClick={saveSignature}
                disabled={loading}
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t('saveSignature')}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignaturePad;
