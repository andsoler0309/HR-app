import { PDFDocument, rgb } from 'pdf-lib';

interface SignaturePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signatureData: string;
  page: number;
}

export async function addSignaturesToPDF(
  pdfUrl: string, 
  signatures: SignaturePosition[]
): Promise<Uint8Array> {
  try {
    // 1. Fetch the original PDF
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    
    // 2. Load the PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    
    // 3. Process each signature
    for (const signature of signatures) {
      const page = pages[signature.page - 1]; // pages are 0-indexed
      if (!page) continue;
      
      try {
        // Convert base64 signature to bytes
        const base64Data = signature.signatureData.split(',')[1]; // Remove data:image/png;base64, prefix
        const signatureImageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Try to embed as PNG first, then fallback to JPEG
        let signatureImage;
        try {
          signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        } catch {
          signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
        }
        
        // Get page dimensions
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // Calculate position (PDF coordinate system has origin at bottom-left)
        const x = signature.x;
        const y = pageHeight - signature.y - signature.height; // Flip Y coordinate
        
        // Draw the signature on the page
        page.drawImage(signatureImage, {
          x: x,
          y: y,
          width: signature.width,
          height: signature.height,
        });
        
        console.log(`Firma agregada en página ${signature.page} en posición (${x}, ${y})`);
      } catch (imageError) {
        console.error(`Error agregando firma ${signature.id}:`, imageError);
        // Continue with other signatures even if one fails
      }
    }
    
    // 4. Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    console.log('PDF con firmas generado exitosamente');
    return pdfBytes;
    
  } catch (error) {
    console.error('Error adding signatures to PDF:', error);
    throw new Error('Failed to add signatures to PDF');
  }
}

export async function uploadSignedPDF(
  pdfBytes: Uint8Array,
  originalFileName: string,
  companyId: string
): Promise<string> {
  try {
    // Generate a new filename for the signed version
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nameWithoutExtension = originalFileName.replace('.pdf', '');
    const signedFileName = `${nameWithoutExtension}-firmado-${timestamp}.pdf`;
    
    // Fix: Las políticas RLS esperan solo companyId/filename, no documents/companyId/filename
    const filePath = `${companyId}/${signedFileName}`;
    
    console.log('Subiendo PDF firmado a:', filePath);
    
    // Upload to Supabase storage
    const { supabase } = await import('@/lib/supabase');
    
    // Get current user to verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuario no autenticado para subir archivo');
    }
    
    console.log('Usuario subiendo archivo:', user.id);
    console.log('Company ID del archivo:', companyId);
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true // Cambiar a true para permitir sobrescribir
      });
    
    if (error) {
      console.error('Error subiendo a storage:', error);
      console.error('Storage error details:', {
        message: error.message,
        statusCode: (error as any).statusCode,
        error: (error as any).error
      });
      throw error;
    }
    
    console.log('Archivo subido exitosamente:', data);
    
    // Get the signed URL (private bucket) instead of public URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry
    
    if (urlError) {
      console.error('Error generando URL firmada:', urlError);
      throw urlError;
    }
    
    console.log('PDF firmado subido exitosamente:', urlData.signedUrl);
    return urlData.signedUrl;
    
  } catch (error) {
    console.error('Error uploading signed PDF:', error);
    throw new Error('Failed to upload signed PDF');
  }
}
