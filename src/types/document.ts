export interface DocumentCategory {
    id: string
    company_id: string
    name: string
    description?: string
    created_at: string
    updated_at?: string
  }
  
  export interface Document {
    id: string
    company_id: string
    category_id: string
    employee_id?: string
    name: string
    description?: string
    file_url: string
    file_type: string
    file_size: number
    status: 'active' | 'archived' | 'deleted' | 'pending_signature'
    version: number
    uploaded_by: string
    created_at: string
    updated_at?: string
    category?: DocumentCategory
    employee?: {
      id: string
      first_name: string
      last_name: string
    }
  }
  
  export interface DocumentShare {
    id: string
    company_id: string
    document_id: string
    shared_with: string
    permission_level: 'view' | 'edit' | 'manage'
    created_at: string
    expires_at?: string
  }
  
  export interface DocumentVersion {
    id: string
    company_id: string
    document_id: string
    version_number: number
    file_url: string
    file_size: number
    created_by: string
    created_at: string
    changes_description?: string
  }