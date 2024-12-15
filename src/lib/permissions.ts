import { supabase } from './supabase'

export const DocumentPermissions = {
  VIEW: 'view',
  EDIT: 'edit',
  MANAGE: 'manage'
} as const

export type DocumentPermission = typeof DocumentPermissions[keyof typeof DocumentPermissions]

export async function getUserDocumentPermission(
  userId: string,
  documentId: string
): Promise<DocumentPermission | null> {
  try {
    // Check if user is document owner
    const { data: document } = await supabase
      .from('documents')
      .select('uploaded_by')
      .eq('id', documentId)
      .single()

    if (document?.uploaded_by === userId) {
      return DocumentPermissions.MANAGE
    }

    // Check shared permissions
    const { data: share } = await supabase
      .from('document_shares')
      .select('permission_level')
      .eq('document_id', documentId)
      .eq('shared_with', userId)
      .single()

    return share?.permission_level || null
  } catch (error) {
    console.error('Error checking document permission:', error)
    return null
  }
}

export function canEditDocument(permission: DocumentPermission | null): boolean {
  return permission === DocumentPermissions.EDIT || permission === DocumentPermissions.MANAGE
}

export function canManageDocument(permission: DocumentPermission | null): boolean {
  return permission === DocumentPermissions.MANAGE
}