-- User Signatures Table
-- This table stores user's saved signatures for document signing

CREATE TABLE IF NOT EXISTS public.user_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    signature_data TEXT NOT NULL, -- base64 encoded signature image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_signatures_updated_at ON public.user_signatures;
CREATE TRIGGER update_user_signatures_updated_at
    BEFORE UPDATE ON public.user_signatures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_signatures_user_id ON public.user_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_user_signatures_created_at ON public.user_signatures(created_at);

-- RLS (Row Level Security)
ALTER TABLE public.user_signatures ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own signatures" ON public.user_signatures;
CREATE POLICY "Users can view their own signatures"
    ON public.user_signatures FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own signatures" ON public.user_signatures;
CREATE POLICY "Users can insert their own signatures"
    ON public.user_signatures FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own signatures" ON public.user_signatures;
CREATE POLICY "Users can update their own signatures"
    ON public.user_signatures FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own signatures" ON public.user_signatures;
CREATE POLICY "Users can delete their own signatures"
    ON public.user_signatures FOR DELETE
    USING (auth.uid() = user_id);

-- Also add signature_data column to documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' 
                   AND column_name = 'signature_data' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.documents ADD COLUMN signature_data TEXT;
    END IF;
END $$;

-- Comment
COMMENT ON TABLE public.user_signatures IS 'Stores user saved signatures for document signing';
COMMENT ON COLUMN public.user_signatures.signature_data IS 'Base64 encoded signature image data';
