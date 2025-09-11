'use client'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PenLine, Download, X, Move, ArrowLeft, Maximize2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Document as DocumentType } from '@/types/document';
import { supabase } from '@/lib/supabase';
import SavedSignaturesModal from './SavedSignaturesModal';
import SigningSuccessModal from './SigningSuccessModal';
import '@/lib/pdf-worker'; // Import PDF worker setup
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface SignaturePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signatureData: string;
  page: number;
}

interface PDFSignatureViewerProps {
  document: DocumentType;
  onClose: () => void;
  onSuccess?: () => void; // Callback opcional cuando se firma exitosamente
}

const PDFSignatureViewer: React.FC<PDFSignatureViewerProps> = ({ document, onClose, onSuccess }) => {
  const t = useTranslations('documents.viewer');
  const tButtons = useTranslations('documents.buttons');
  const router = useRouter();
  
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [signatures, setSignatures] = useState<SignaturePosition[]>([]);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Load existing signatures when component mounts (only if document is not yet signed)
  useEffect(() => {
    // Solo cargar firmas temporales si el documento aún no está firmado
    if (document.signature_data && Array.isArray(document.signature_data) && document.signature_status !== 'signed') {
      console.log('Cargando firmas temporales:', document.signature_data);
      setSignatures(document.signature_data);
    } else if (document.signature_status === 'signed') {
      console.log('Documento ya firmado - las firmas están integradas en el PDF');
    }
  }, [document.signature_data, document.signature_status]);

  const addSignatureToDocument = useCallback((signatureData: string, x?: number, y?: number) => {
    const newSignature: SignaturePosition = {
      id: `signature-${Date.now()}-${Math.random()}`,
      x: x || 100,
      y: y || 100,
      width: 150,
      height: 60,
      signatureData,
      page: currentPage
    };

    setSignatures(prev => [...prev, newSignature]);
    setSelectedSignature(newSignature.id);
  }, [currentPage]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (isDragging || isResizing) return;
    setSelectedSignature(null);
  };

  const handleSignatureClick = (e: React.MouseEvent, signatureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle selection
    setSelectedSignature(selectedSignature === signatureId ? null : signatureId);
  };

  const handleSignatureMouseDown = (e: React.MouseEvent, signatureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const signature = signatures.find(s => s.id === signatureId);
    if (!signature || !containerRef.current) return;

    setSelectedSignature(signatureId);
    setIsDragging(signatureId);
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left) / scale;
    const y = (e.clientY - containerRect.top) / scale;
    
    setDragOffset({
      x: x - signature.x,
      y: y - signature.y
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if ((!isDragging && !isResizing) || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (isDragging) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;

      setSignatures(prev => prev.map(sig => 
        sig.id === isDragging 
          ? { ...sig, x: Math.max(0, newX), y: Math.max(0, newY) }
          : sig
      ));
    } else if (isResizing) {
      setSignatures(prev => prev.map(sig => {
        if (sig.id !== isResizing) return sig;

        const currentSig = signatures.find(s => s.id === isResizing);
        if (!currentSig) return sig;

        let newWidth = currentSig.width;
        let newHeight = currentSig.height;
        let newX = currentSig.x;
        let newY = currentSig.y;

        switch (resizeHandle) {
          case 'se': // bottom-right
            newWidth = Math.max(50, x - currentSig.x);
            newHeight = Math.max(30, y - currentSig.y);
            break;
          case 'sw': // bottom-left
            newWidth = Math.max(50, currentSig.x + currentSig.width - x);
            newHeight = Math.max(30, y - currentSig.y);
            newX = Math.min(x, currentSig.x + currentSig.width - 50);
            break;
          case 'ne': // top-right
            newWidth = Math.max(50, x - currentSig.x);
            newHeight = Math.max(30, currentSig.y + currentSig.height - y);
            newY = Math.min(y, currentSig.y + currentSig.height - 30);
            break;
          case 'nw': // top-left
            newWidth = Math.max(50, currentSig.x + currentSig.width - x);
            newHeight = Math.max(30, currentSig.y + currentSig.height - y);
            newX = Math.min(x, currentSig.x + currentSig.width - 50);
            newY = Math.min(y, currentSig.y + currentSig.height - 30);
            break;
        }

        return { ...sig, width: newWidth, height: newHeight, x: newX, y: newY };
      }));
    }
  }, [isDragging, isResizing, dragOffset, scale, signatures, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    setIsResizing(null);
    setResizeHandle(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, signatureId: string, handle: string) => {
    e.stopPropagation();
    setIsResizing(signatureId);
    setResizeHandle(handle);
    setSelectedSignature(signatureId);
  }, []);

  const deleteSignature = (signatureId: string) => {
    setSignatures(prev => prev.filter(sig => sig.id !== signatureId));
    setSelectedSignature(null);
  };

  const handleSaveSignatures = async () => {
    if (signatures.length === 0) {
      alert('No hay firmas para agregar al documento');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Error de autenticación:', authError);
        throw new Error('Error de autenticación: ' + authError.message);
      }
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Usuario autenticado:', user.id);
      console.log('Company ID del documento:', document.company_id);
      console.log('Generando PDF con firmas integradas...');
      console.log('Firmas a agregar:', signatures);

      // 1. Generar PDF con firmas integradas
      const { addSignaturesToPDF, uploadSignedPDF } = await import('@/lib/pdf-signature-utils');
      
      const signedPdfBytes = await addSignaturesToPDF(document.file_url, signatures);
      console.log('PDF generado con firmas integradas');

      // 2. Subir el nuevo PDF al storage
      const signedPdfUrl = await uploadSignedPDF(signedPdfBytes, document.name, document.company_id);
      console.log('PDF firmado subido a:', signedPdfUrl);

      // 3. Actualizar el documento en la base de datos
      const isAlreadySigned = document.signed_by?.includes(user.id);
      const updatedSignedBy = isAlreadySigned 
        ? document.signed_by 
        : [...(document.signed_by || []), user.id];
      
      console.log('Actualizando documento en la base de datos...');
      console.log('Document ID:', document.id);
      console.log('Signed by:', updatedSignedBy);
      
      const { data, error } = await supabase
        .from('documents')
        .update({
          file_url: signedPdfUrl,
          signed_by: updatedSignedBy,
          signature_status: 'signed',
          signed_at: new Date().toISOString(),
          signature_data: null,
          is_signed: true,
          status: 'active' // Cambiar de 'pending_signature' a 'active'
        })
        .eq('id', document.id)
        .eq('company_id', document.company_id)
        .select();

      if (error) {
        console.error('Error actualizando documento en Supabase:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.error('No se pudo actualizar el documento - posible problema de permisos');
        throw new Error('No se pudo actualizar el documento. Verifica que tienes permisos para modificar este documento.');
      }

      console.log('Documento actualizado exitosamente:', data);
      
      // 4. Mostrar modal de éxito
      setShowSuccessModal(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error firmando documento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al firmar el documento:\n${errorMessage}\n\nPor favor, inténtalo de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToDocuments = () => {
    // Use relative path since the app uses [locale] structure
    router.push('/dashboard/documents');
  };

  const currentPageSignatures = signatures.filter(sig => sig.page === currentPage);

  return (
    <>
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-card-border bg-card p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-background rounded-full text-sunset hover:text-primary"
                aria-label={t('back')}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-platinum">{document.name} - {t('signatureMode')}</h1>
                <p className="text-sm text-sunset">
                  📝 Arrastra y posiciona tus firmas. Al firmar, se generará un nuevo PDF con las firmas integradas permanentemente.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowSignatureModal(true)}
                className="btn-primary flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg"
              >
                <PenLine className="w-4 h-4" />
                {t('addSignature')}
              </button>
              {document.signature_status !== 'signed' && (
                <button
                  onClick={handleSaveSignatures}
                  disabled={loading || signatures.length === 0}
                  className="btn-success flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Firmando...</span>
                    </>
                  ) : (
                    <>
                      <PenLine className="w-4 h-4" />
                      <span className="hidden sm:inline">🖋️ Firmar</span>
                      <span className="sm:hidden">🖋️</span>
                      <span className="hidden lg:inline">({signatures.length})</span>
                    </>
                  )}
                </button>
              )}
              {document.signature_status === 'signed' && (
                <div className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-lg">
                  <span className="hidden sm:inline">✅ Firmado</span>
                  <span className="sm:hidden">✅</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="shrink-0 flex items-center justify-between py-2 px-4 border-b border-card-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="btn-secondary px-2 py-1 text-sm rounded disabled:opacity-50"
                >
                  ←
                </button>
                <span className="text-sm text-sunset">
                  {t('pageOf', { current: currentPage, total: numPages })}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage >= numPages}
                  className="btn-secondary px-2 py-1 text-sm rounded disabled:opacity-50"
                >
                  →
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  className="btn-secondary px-2 py-1 text-sm rounded"
                >
                  -
                </button>
                <span className="text-sm text-sunset w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(Math.min(2, scale + 0.1))}
                  className="btn-secondary px-2 py-1 text-sm rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-sm text-sunset">
              {signatures.length > 0 && t('signaturesCount', { count: signatures.length })}
            </div>
          </div>

          {/* Document Viewer */}
          <div className="flex-1 overflow-auto bg-gray-100">
            <div className="flex justify-center p-4">
              <div 
                ref={containerRef}
                className="relative bg-white shadow-lg"
                onClick={handleContainerClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ 
                  cursor: isDragging ? 'grabbing' : isResizing ? 'default' : 'default' 
                }}
              >
                <Document
                  file={document.file_url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="w-[600px] h-[800px] bg-gray-200 flex items-center justify-center">
                      <div className="text-sunset">{tButtons('loading')}</div>
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
                        <div className="text-sunset">{tButtons('loading')}</div>
                      </div>
                    }
                  />
                </Document>

                {/* Render signatures for current page */}
                {currentPageSignatures.map((signature) => (
                  <div
                    key={signature.id}
                    className={`absolute border-2 rounded group ${
                      selectedSignature === signature.id 
                        ? 'border-primary shadow-lg' 
                        : 'border-transparent hover:border-primary/50'
                    }`}
                    style={{
                      left: signature.x * scale,
                      top: signature.y * scale,
                      width: signature.width * scale,
                      height: signature.height * scale,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => handleSignatureClick(e, signature.id)}
                  >
                    <img
                      src={signature.signatureData}
                      alt="Signature"
                      className="w-full h-full object-contain bg-white/90 rounded"
                      draggable={false}
                    />
                    
                    {/* Always show delete button when signature is hovered or selected */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSignature(signature.id);
                      }}
                      className={`absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 transition-all ${
                        selectedSignature === signature.id 
                          ? 'opacity-100' 
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    {selectedSignature === signature.id && (
                      <>
                        <div className="absolute -top-8 left-0 flex items-center gap-1">
                          {isResizing === signature.id ? (
                            <>
                              <Maximize2 className="w-3 h-3 text-primary" />
                              <span className="text-xs text-primary font-medium">{t('resizeSignature')}</span>
                            </>
                          ) : (
                            <>
                              <Move className="w-3 h-3 text-primary" />
                              <span className="text-xs text-primary font-medium">{t('moveSignature')}</span>
                            </>
                          )}
                        </div>
                        
                        {/* Drag handle */}
                        <div 
                          className="absolute top-1 left-1 w-4 h-4 bg-primary/20 hover:bg-primary/40 rounded cursor-grab flex items-center justify-center"
                          onMouseDown={(e) => handleSignatureMouseDown(e, signature.id)}
                        >
                          <Move className="w-2 h-2 text-primary" />
                        </div>
                        
                        {/* Resize handles */}
                        <div 
                          className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleResizeMouseDown(e, signature.id, 'nw')}
                        />
                        <div 
                          className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleResizeMouseDown(e, signature.id, 'ne')}
                        />
                        <div 
                          className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleResizeMouseDown(e, signature.id, 'sw')}
                        />
                        <div 
                          className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleResizeMouseDown(e, signature.id, 'se')}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SavedSignaturesModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSelectSignature={addSignatureToDocument}
      />

      <SigningSuccessModal
        isOpen={showSuccessModal}
        documentName={document.name}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        onRedirectToDocuments={handleRedirectToDocuments}
      />
    </>
  );
};

export default PDFSignatureViewer;
