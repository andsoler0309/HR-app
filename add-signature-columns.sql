-- Agregar columnas de firma a la tabla documents
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS generated_from_template UUID,
ADD COLUMN IF NOT EXISTS signed_by TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signature_status TEXT CHECK (signature_status IN ('pending', 'signed', 'rejected'));

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_documents_requires_signature ON documents(requires_signature);
CREATE INDEX IF NOT EXISTS idx_documents_signature_status ON documents(signature_status);
CREATE INDEX IF NOT EXISTS idx_documents_signed_by ON documents USING GIN(signed_by);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN documents.requires_signature IS 'Indica si el documento requiere firma electrónica';
COMMENT ON COLUMN documents.generated_from_template IS 'ID de la plantilla desde la cual se generó el documento';
COMMENT ON COLUMN documents.signed_by IS 'Array de IDs de usuarios que han firmado el documento';
COMMENT ON COLUMN documents.signed_at IS 'Fecha y hora cuando se completó la firma';
COMMENT ON COLUMN documents.signature_status IS 'Estado de la firma: pending, signed, rejected';
